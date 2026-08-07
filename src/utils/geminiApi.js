/**
 * PromptMentor — Gemini API Handler
 * =================================
 * Pure API logic. No UI concerns.
 *
 * EXPORTS:
 * ────────
 * 1. coaxAnalyze(userPrompt, apiKey)        → API Call 1+2 (Coax button + Grade + Coach)
 * 2. comparePromptOutputs(orig, final, key) → API Call 3 (Side-by-side LLM output comparison)
 * 3. generateLLMResponse({...})             → Legacy export for UI team's existing components
 *
 * THREE API CALL POINTS:
 *
 * 1. coaxAnalyze — Triggered by "Coax" button press. Sends user's raw prompt to Gemini.
 *    Returns structured JSON: { score, grade, tags, coachAdvice, finalPrompt, originalPrompt }
 *
 * 2. Grade + Coach Advice come FROM the same coaxAnalyze call (no separate call).
 *
 * 3. comparePromptOutputs — Runs both original and final prompts through Gemini in parallel.
 *    Returns { originalOutput, finalOutput }.
 */

const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: Raw Gemini REST call
// ─────────────────────────────────────────────────────────────────────────────
async function callGemini(prompt, apiKey) {
  const url = `${API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey.trim()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.error?.message || `HTTP ${response.status}`;
    throw new Error(`Gemini API error: ${msg}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}


// ─────────────────────────────────────────────────────────────────────────────
// API CALL 1+2: coaxAnalyze
// Triggered when user clicks "Coax ✓" button.
// Returns structured analysis: score, grade, tags, coach advice, final prompt.
// ─────────────────────────────────────────────────────────────────────────────
export async function coaxAnalyze(userPrompt, apiKey) {
  if (!apiKey || apiKey.trim().length < 5) {
    throw new Error('API key is required. Please set your Gemini API key.');
  }

  const systemPrompt = `You are PromptCoach, an expert AI prompt engineering evaluator.

The user has submitted a prompt draft. Your job is to:
1. Evaluate the prompt quality across multiple dimensions
2. Assign a heuristic quality score (0.0 to 10.0, one decimal)
3. Assign an overall letter grade (A+, A, A-, B+, B, B-, C+, C, D, F)
4. Generate diagnostic tags showing what the prompt does well and what it lacks
5. Write a short, encouraging "live coach advice" message (1-2 sentences max) that tells the user exactly what to improve to push their grade higher — like a helpful collaborator, NOT a lecturer
6. Generate an improved "final prompt" that fixes all the weaknesses while preserving the user's original intent

RESPOND ONLY WITH VALID JSON (no markdown fences, no extra text) in this exact schema:

{
  "score": 7.2,
  "grade": "B+",
  "tags": [
    { "label": "Clear Intent", "status": "pass" },
    { "label": "Good Context", "status": "pass" },
    { "label": "Too Vague", "status": "fail" },
    { "label": "Missing Constraints", "status": "fail" }
  ],
  "coachAdvice": "Adding explicit behavioral negative constraints will push this score into the A range.",
  "finalPrompt": "The improved version of the user's prompt goes here."
}

RULES FOR TAGS:
- Always evaluate these 6 dimensions and return tags for each:
  1. "Clear Intent" — pass if the prompt has an understandable goal
  2. "Good Context" — pass if background/audience/scenario is provided
  3. "Specific Details" — pass if precise verbs, quantities, or targets are used; fail if vague
  4. "Has Constraints" — pass if negative bounds, word limits, or avoidance rules exist
  5. "Output Format" — pass if the user specifies desired structure (table, list, JSON, etc.)
  6. "Role/Persona" — pass if the user assigns an expert role or perspective

- status must be exactly "pass" or "fail"

RULES FOR GRADE:
- A+ (9.5-10): Prompt covers all 6 dimensions perfectly
- A  (8.5-9.4): Missing at most 1 minor dimension
- A- (8.0-8.4): Minor gaps in 1-2 areas
- B+ (7.0-7.9): Decent but missing 2-3 dimensions
- B  (6.0-6.9): Basic prompt with clear gaps
- B- (5.0-5.9): Usable but quite weak
- C+ (4.0-4.9): Very vague, needs major improvement
- C  (3.0-3.9): Barely functional prompt
- D  (2.0-2.9): Almost unusable
- F  (0-1.9): Empty or nonsensical

RULES FOR FINAL PROMPT:
- Preserve the user's original intent and domain
- Add missing role/persona, context, specificity, constraints, and format instructions
- Make it sound natural, not robotic — like a skilled colleague rewrote it
- It should be substantially better than the original

USER'S PROMPT TO EVALUATE:
"""
${userPrompt}
"""`;

  const rawResponse = await callGemini(systemPrompt, apiKey);

  // Parse JSON — handle cases where Gemini wraps in markdown code fences
  let jsonStr = rawResponse.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }
  jsonStr = jsonStr.trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (parseErr) {
    console.error('Failed to parse Gemini JSON response:', rawResponse);
    throw new Error('Gemini returned invalid JSON. Please try again.');
  }

  // Validate and normalize the response shape
  return {
    score: typeof parsed.score === 'number' ? parsed.score : 5.0,
    grade: typeof parsed.grade === 'string' ? parsed.grade : 'C',
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(t => ({
      label: String(t.label || 'Unknown'),
      status: t.status === 'pass' ? 'pass' : 'fail'
    })) : [],
    coachAdvice: typeof parsed.coachAdvice === 'string' ? parsed.coachAdvice : 'Try adding more specificity and constraints.',
    finalPrompt: typeof parsed.finalPrompt === 'string' ? parsed.finalPrompt : userPrompt,
    originalPrompt: userPrompt
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// API CALL 3: comparePromptOutputs
// Runs BOTH prompts through Gemini concurrently and returns both responses.
// ─────────────────────────────────────────────────────────────────────────────
export async function comparePromptOutputs(originalPrompt, finalPrompt, apiKey) {
  if (!apiKey || apiKey.trim().length < 5) {
    throw new Error('API key is required. Please set your Gemini API key.');
  }

  const [originalOutput, finalOutput] = await Promise.all([
    callGemini(originalPrompt, apiKey),
    callGemini(finalPrompt, apiKey)
  ]);

  return { originalOutput, finalOutput };
}


// ─────────────────────────────────────────────────────────────────────────────
// LEGACY EXPORT: generateLLMResponse
// Kept for backward compatibility with the UI team's existing components
// (PromptEditor, OutputComparison, etc. that import this function)
// ─────────────────────────────────────────────────────────────────────────────
export async function generateLLMResponse({ prompt, apiKey, isEnhanced = false, mockFallback = '' }) {
  if (apiKey && apiKey.trim().length > 5) {
    try {
      return await callGemini(prompt, apiKey);
    } catch (err) {
      console.warn('Gemini API call failed, falling back:', err.message);
    }
  }

  if (mockFallback) {
    return mockFallback;
  }

  if (!isEnhanced) {
    return `Here is the response to your request: "${prompt}"\n\nI have processed your prompt. However, because the instructions were broad, this response is general. Please specify your target role, context, or required format to get a tailored answer.`;
  }

  return `### 🌟 Executive Summary\nBased on your refined prompt, here is the structured, high-precision output.\n\n### 🎯 Key Insights & Analysis\n1. **Core Concept**: Refined prompts provide strict bounds, removing AI guesswork.\n2. **Contextual Alignment**: Directly addresses your specific goal with domain-level accuracy.\n3. **Structured Breakdown**:\n   - **Phase 1**: Initial setup and requirements gathering.\n   - **Phase 2**: Execution with explicit constraints.\n   - **Phase 3**: Final validation and review against objectives.\n\n### 📋 Recommended Action Plan\n- Utilize the output structure above for immediate integration.\n- Further refine parameters if specific edge-cases arise.`;
}
