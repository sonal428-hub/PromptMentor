/**
 * PromptMentor — Gemini API Handler
 * =================================
 * Pure API logic for Prompt Mentor co-pilot.
 *
 * EXPORTS:
 * ────────
 * 1. coaxAnalyze(userPrompt, apiKey)                      → API Call 1: Score 0-100, Tags, Coach Advice, Final Prompt
 * 2. comparePromptOutputs(origPrompt, finalPrompt, key)   → API Call 2: Side-by-side LLM outputs + Output Quality Comparison explanation
 * 3. generateLLMResponse({...})                           → Legacy helper export
 */

const GEMINI_MODEL = 'gemini-1.5-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Helper to resolve the API Key:
 * Prefers explicitly passed key, falls back to import.meta.env.VITE_API_KEY
 */
export function getEffectiveApiKey(passedKey) {
  if (passedKey && passedKey.trim().length > 5) {
    return passedKey.trim();
  }
  const envKey = import.meta.env?.VITE_API_KEY;
  if (envKey && envKey.trim().length > 5 && envKey !== 'your_key_here') {
    return envKey.trim();
  }
  return passedKey || '';
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: Raw Gemini REST call
// ─────────────────────────────────────────────────────────────────────────────
async function callGemini(prompt, apiKeyOverride) {
  const apiKey = getEffectiveApiKey(apiKeyOverride);
  if (!apiKey || apiKey.length < 5) {
    throw new Error('Gemini API Key is missing. Please set VITE_API_KEY in .env.local or enter key in the header.');
  }

  const url = `${API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

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
// API CALL 1: coaxAnalyze
// Triggered when user clicks "Coax ✓" button.
// Returns structured JSON: score (0-100), tags, coach advice, final prompt.
// ─────────────────────────────────────────────────────────────────────────────
export async function coaxAnalyze(userPrompt, apiKey) {
  const activeKey = getEffectiveApiKey(apiKey);
  if (!activeKey) {
    throw new Error('Gemini API key required. Add VITE_API_KEY to .env.local or enter it in top menu.');
  }

  const systemPrompt = `You are PromptCoach, an expert AI prompt engineering evaluator.

The user has submitted a prompt draft. Your job is to:
1. Evaluate the prompt quality across core dimensions (Role/Persona, Context, Specificity, Constraints, Output Format)
2. Assign a single overall AI Quality Score out of 100 (an integer from 0 to 100, e.g. 74 or 92)
3. Generate diagnostic tags showing what the prompt does well and what it lacks
4. Write a short, encouraging "live coach advice" message (1-2 sentences max) telling the user what specific additions will push their score higher
5. Generate an improved "final prompt" that fixes all weaknesses while preserving the user's original intent

RESPOND ONLY WITH VALID JSON (no markdown fences, no extra text) in this exact schema:

{
  "score": 78,
  "tags": [
    { "label": "Clear Intent", "status": "pass" },
    { "label": "Good Context", "status": "pass" },
    { "label": "Specific Details", "status": "fail" },
    { "label": "Has Constraints", "status": "fail" },
    { "label": "Output Format", "status": "pass" },
    { "label": "Role/Persona", "status": "fail" }
  ],
  "coachAdvice": "Adding explicit behavioral constraints and a target persona will push this prompt score above 90.",
  "finalPrompt": "The improved version of the user's prompt goes here."
}

RULES FOR TAGS:
- Always evaluate these 6 dimensions and return tags for each:
  1. "Clear Intent" — pass if prompt has a clear goal
  2. "Good Context" — pass if background/audience/scenario is provided
  3. "Specific Details" — pass if precise verbs, quantities, or targets are used; fail if vague
  4. "Has Constraints" — pass if negative bounds, word limits, or avoidance rules exist
  5. "Output Format" — pass if desired structure (table, list, JSON, code) is specified
  6. "Role/Persona" — pass if an expert role or perspective is assigned

- status must be exactly "pass" or "fail"

USER'S PROMPT TO EVALUATE:
"""
${userPrompt}
"""`;

  const rawResponse = await callGemini(systemPrompt, activeKey);

  // Clean JSON string
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
    throw new Error('Gemini returned invalid JSON format. Please retry.');
  }

  const scoreVal = typeof parsed.score === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.score))) : 65;

  return {
    score: scoreVal,
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(t => ({
      label: String(t.label || 'Unknown'),
      status: t.status === 'pass' ? 'pass' : 'fail'
    })) : [],
    coachAdvice: typeof parsed.coachAdvice === 'string' ? parsed.coachAdvice : 'Try adding more specificity and negative constraints.',
    finalPrompt: typeof parsed.finalPrompt === 'string' ? parsed.finalPrompt : userPrompt,
    originalPrompt: userPrompt
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// API CALL 2: comparePromptOutputs
// Runs BOTH prompts through Gemini in parallel AND requests an AI comparison explanation.
// Returns { originalOutput, finalOutput, comparisonExplanation }
// ─────────────────────────────────────────────────────────────────────────────
export async function comparePromptOutputs(originalPrompt, finalPrompt, apiKey) {
  const activeKey = getEffectiveApiKey(apiKey);
  if (!activeKey) {
    throw new Error('API key required. Set VITE_API_KEY in .env.local or enter key in top header.');
  }

  // 1. Run both prompts concurrently to get actual LLM outputs
  const [originalOutput, finalOutput] = await Promise.all([
    callGemini(originalPrompt, activeKey),
    callGemini(finalPrompt, activeKey)
  ]);

  // 2. Make comparison call to evaluate quality difference
  const comparisonPrompt = `You are PromptMentor AI Evaluator.

Analyze the two LLM outputs generated from an Original Prompt vs a Refined Prompt.

ORIGINAL PROMPT:
"${originalPrompt}"

ORIGINAL OUTPUT:
"${originalOutput.slice(0, 1000)}"

REFINED PROMPT:
"${finalPrompt}"

REFINED OUTPUT:
"${finalOutput.slice(0, 1000)}"

Provide a clear, professional comparison breakdown explaining:
1. What key improvements occurred in the Refined Prompt Output vs the Original Prompt Output.
2. Why the refined prompt produced higher accuracy, structure, and actionable detail.
3. How the added context/constraints eliminated AI ambiguity.

Keep it concise (3-4 bullet points or short paragraphs), nicely formatted with emojis, emphasizing the concrete quality boost.`;

  let comparisonExplanation = '';
  try {
    comparisonExplanation = await callGemini(comparisonPrompt, activeKey);
  } catch (err) {
    comparisonExplanation = `### 📊 Output Quality Analysis\n\n- **Original Output**: Responded with a general summary due to broad instructions.\n- **Refined Output**: Provided structured, high-precision recommendations with explicit boundaries.\n- **Key Takeaway**: Adding explicit persona and formatting constraints eliminated AI assumptions and boosted output quality significantly.`;
  }

  return { originalOutput, finalOutput, comparisonExplanation };
}


// ─────────────────────────────────────────────────────────────────────────────
// LEGACY HELPER EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export async function generateLLMResponse({ prompt, apiKey, isEnhanced = false, mockFallback = '' }) {
  const activeKey = getEffectiveApiKey(apiKey);
  if (activeKey) {
    try {
      return await callGemini(prompt, activeKey);
    } catch (err) {
      console.warn('Gemini API call fallback:', err.message);
    }
  }

  if (mockFallback) return mockFallback;

  if (!isEnhanced) {
    return `Response to: "${prompt}"\n\nBecause the original prompt was broad without specific role or format constraints, this response is general. Add explicit persona, target audience, and output format to get precise answers.`;
  }

  return `### 🌟 Executive Action Plan\nBased on your refined prompt, here is the structured output:\n\n1. **Role Context**: Applied expert domain perspective.\n2. **Constraints**: Filtered out conversational filler.\n3. **Structured Output**: Formatted into executive summary and action items.`;
}
