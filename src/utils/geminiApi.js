const GEMINI_MODEL = 'gemini-1.5-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Records a prompt coaching score to localStorage for the Track Progress page.
 * Appends { score, timestamp } to the `promptmentor_scores` array.
 * Keeps at most 50 entries. Fails silently if localStorage is unavailable.
 */
function recordPromptScore(score) {
  if (typeof score !== 'number' || isNaN(score)) return;
  try {
    const raw = localStorage.getItem('promptmentor_scores');
    let scores = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        scores = parsed.filter(
          s => s && typeof s === 'object' && typeof s.score === 'number' && !isNaN(s.score)
        );
      }
    }
    scores.push({ score: Math.min(100, Math.max(0, Math.round(score))), timestamp: Date.now() });
    if (scores.length > 50) scores = scores.slice(scores.length - 50);
    localStorage.setItem('promptmentor_scores', JSON.stringify(scores));
  } catch { /* localStorage unavailable — fail silently */ }
}

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

async function callGemini(prompt, apiKeyOverride) {
  const apiKey = getEffectiveApiKey(apiKeyOverride);
  if (!apiKey || apiKey.length < 5) {
    throw new Error('Gemini API Key missing');
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
    throw new Error(`Gemini API Error: ${msg}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty text returned from Gemini API');
  return text;
}

/**
 * [SINGLE DEBOUNCED GEMINI API CALL FOR SCORE + EXPLANATION + REWRITTEN PROMPT]
 * Returns:
 * 1. AI Score out of 100
 * 2. Topic-specific 1-2 sentence personalized explanation
 * 3. Single, clean, professionally rewritten prompt (finalPrompt) with ZERO template concatenation
 */
export async function evaluateAiScore(userPrompt, apiKey) {
  const trimmed = (userPrompt || '').trim();
  const words = trimmed.split(/\s+/).filter(Boolean);

  // Immediate strict guard for single letters or incomplete prompts (e.g. 'a', 'hi')
  if (trimmed.length < 4 || words.length < 2) {
    const calcScore = Math.min(10, Math.max(2, trimmed.length * 3));
    return {
      score: calcScore,
      explanation: `Your prompt "${trimmed}" is incomplete (${words.length === 0 ? '0 words' : '1 word'}) and lacks clear intent, context, role framing, or output constraints.`,
      finalPrompt: trimmed ? `Act as a Domain Specialist. Please clarify your request for "${trimmed}" by specifying your target topic, background context, and desired output format.` : ''
    };
  }

  const activeKey = getEffectiveApiKey(apiKey);

  if (activeKey) {
    try {
      const prompt = `You are PromptCoach, a world-class prompt engineering editor and coach.
Evaluate the user's prompt draft and produce:
1. An accurate AI quality score out of 100 (integer 0 to 100).
2. A 1-2 sentence personalized feedback explanation.
3. A single, clean, professionally rewritten prompt that fully fulfills their intent while naturally incorporating expert role, clear context, behavioral constraints, and output format.

STRICT SCORING GUIDELINES:
- Extremely short, single-word, or single-character inputs (e.g. "a", "hi", "test") MUST receive a score between 0 and 15 out of 100.
- Vague 2-4 word prompts lacking context or constraints (e.g. "write a poem", "fix my code") MUST receive a score between 15 and 40 out of 100.
- Prompts with partial context but missing role/format guidelines should score between 45 and 65 out of 100.
- Comprehensive prompts with explicit persona, context, task goals, constraints, and output layout should score 70 to 100.

STRICT INSTRUCTIONS FOR THE EXPLANATION:
- Do NOT name abstract category labels (e.g. do NOT write "no target context", "no behavioral constraints", "lack of role/persona", or "no output format").
- Quote or reference the user's ACTUAL words and specific topic directly.
- Point out what is specifically ambiguous or missing about THEIR request, and state concretely what specific details for THEIR topic would make the output significantly better.

STRICT INSTRUCTIONS FOR THE REWRITTEN PROMPT (finalPrompt):
- Do NOT simply concatenate template sentences around the user's raw text.
- Clean up any messy, casual, or repetitive phrasing into a single coherent professional request.

RESPOND ONLY WITH VALID JSON (no markdown fences, no extra text):
{
  "score": 45,
  "explanation": "You asked to fix a code error but didn't state the programming language, framework, or error message — specifying Python or React along with the error traceback would make the response actionable.",
  "finalPrompt": "Act as a Senior Software Engineer. Analyze the provided code snippet to identify the root cause of the bug, optimize logic for runtime performance, and return a clean refactored solution structured with: 1) Root Cause Analysis, 2) Corrected Code, and 3) Next Action Steps."
}

USER'S PROMPT TO REVIEW:
"""
${userPrompt}
"""`;

      const rawResponse = await callGemini(prompt, activeKey);
      let jsonStr = rawResponse.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      else if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      jsonStr = jsonStr.trim();

      const parsed = JSON.parse(jsonStr);
      const scoreVal = typeof parsed.score === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.score))) : 25;
      recordPromptScore(scoreVal);
      return {
        score: scoreVal,
        explanation: typeof parsed.explanation === 'string'
          ? parsed.explanation
          : `Your prompt needs more specific details about your goal and desired output layout to give precise results.`,
        finalPrompt: typeof parsed.finalPrompt === 'string' && parsed.finalPrompt.trim().length > 10
          ? parsed.finalPrompt.trim()
          : generateCleanRewriteFallback(userPrompt)
      };
    } catch (err) {
      console.warn('Gemini evaluateAiScore error:', err.message);
    }
  }

  // Topic-aware personalized fallback if API key is not active
  const fallbackScore = calculateFallbackScore(userPrompt);
  recordPromptScore(fallbackScore);
  return {
    score: fallbackScore,
    explanation: generateFallbackExplanation(userPrompt),
    finalPrompt: generateCleanRewriteFallback(userPrompt)
  };
}

export async function coaxAnalyze(userPrompt, apiKey) {
  const activeKey = getEffectiveApiKey(apiKey);

  if (activeKey) {
    try {
      const systemPrompt = `You are PromptCoach, an expert AI prompt engineering evaluator.

The user has submitted a prompt draft. Your job is to:
1. Evaluate the prompt quality across core dimensions (Role/Persona, Context, Specificity, Constraints, Output Format)
2. Assign a single overall AI Quality Score out of 100 (an integer from 0 to 100)
3. Generate diagnostic tags showing what the prompt does well and what it lacks
4. Write a short, encouraging "live coach advice" message (1-2 sentences max)
5. Generate an improved "final prompt" that fixes all weaknesses while preserving original intent (written as one natural professional prompt, with NO stitched template text)

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
  "finalPrompt": "Act as a Lead Systems Architect. Refactor the application architecture to optimize response latency and scale throughput..."
}

USER'S PROMPT TO EVALUATE:
"""
${userPrompt}
"""`;

      const rawResponse = await callGemini(systemPrompt, activeKey);

      let jsonStr = rawResponse.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      else if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      jsonStr = jsonStr.trim();

      const parsed = JSON.parse(jsonStr);
      const scoreVal = typeof parsed.score === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.score))) : 70;
      recordPromptScore(scoreVal);

      return {
        score: scoreVal,
        tags: Array.isArray(parsed.tags) ? parsed.tags.map(t => ({
          label: String(t.label || 'Unknown'),
          status: t.status === 'pass' ? 'pass' : 'fail'
        })) : [],
        coachAdvice: typeof parsed.coachAdvice === 'string' ? parsed.coachAdvice : 'Adding role framing and output format constraints will boost prompt quality.',
        finalPrompt: typeof parsed.finalPrompt === 'string' ? parsed.finalPrompt : generateCleanRewriteFallback(userPrompt),
        originalPrompt: userPrompt
      };
    } catch (err) {
      console.warn('Gemini coaxAnalyze API error, using smart fallback generator:', err.message);
    }
  }

  const fallbackScoreVal = calculateFallbackScore(userPrompt);
  recordPromptScore(fallbackScoreVal);

  return {
    score: fallbackScoreVal,
    tags: [
      { label: 'Clear Intent', status: userPrompt.trim().split(/\s+/).length > 2 ? 'pass' : 'fail' },
      { label: 'Good Context', status: userPrompt.length > 25 ? 'pass' : 'fail' },
      { label: 'Specific Details', status: userPrompt.length > 40 ? 'pass' : 'fail' },
      { label: 'Has Constraints', status: /do not|avoid|limit/i.test(userPrompt) ? 'pass' : 'fail' },
      { label: 'Output Format', status: /table|json|bullet|list/i.test(userPrompt) ? 'pass' : 'fail' },
      { label: 'Role/Persona', status: /act as|you are|role/i.test(userPrompt) ? 'pass' : 'fail' }
    ],
    coachAdvice: generateFallbackExplanation(userPrompt),
    finalPrompt: generateCleanRewriteFallback(userPrompt),
    originalPrompt: userPrompt
  };
}

/**
 * [SIMPLIFIED PLAIN-LANGUAGE OUTPUT COMPARISON FOR NOVICE USERS]
 * Explains output differences in warm, friendly, everyday language referencing the user's actual topic.
 * Zero prompt engineering jargon (no "role framing", "AI ambiguity", or "domain-expert responses").
 */
export async function comparePromptOutputs(originalPrompt, finalPrompt, apiKey) {
  const activeKey = getEffectiveApiKey(apiKey);

  if (activeKey) {
    try {
      const [originalOutput, finalOutput] = await Promise.all([
        callGemini(originalPrompt, activeKey),
        callGemini(finalPrompt, activeKey)
      ]);

      const comparisonPrompt = `You are a warm, encouraging AI writing coach explaining prompt quality to a beginner who has never heard of prompt engineering before.

Compare the LLM outputs generated by these two prompts:
ORIGINAL PROMPT: "${originalPrompt}"
REFINED PROMPT: "${finalPrompt}"

Write a short, friendly explanation (2-3 short, clear sentences or easy bullet points) explaining what actually changed in the output and why it's better for their specific question.

STRICT TONE & LANGUAGE INSTRUCTIONS:
- Use PLAIN, EVERYDAY LANGUAGE ONLY.
- STICK TO THE USER'S ACTUAL TOPIC (reference what they actually asked about).
- Absolutely NO prompt-engineering jargon: do NOT use terms like "role framing", "AI ambiguity", "domain-expert responses", "heuristic metrics", or "constraints optimization".
- Write like explaining to a friend in a warm, encouraging, relatable tone.
- Example style: "Because you told the AI exactly what kind of expert to be and how to organize the answer, this time you got a clear, step-by-step fix for your code error instead of a generic guess."`;

      let comparisonExplanation = '';
      try {
        comparisonExplanation = await callGemini(comparisonPrompt, activeKey);
      } catch (err) {
        comparisonExplanation = `Because you specified an expert persona and asked for structured output, the AI gave you a clear, organized, step-by-step response tailored to your exact question instead of a generic summary.`;
      }

      return { originalOutput, finalOutput, comparisonExplanation };
    } catch (err) {
      console.warn('Gemini comparePromptOutputs API error, using fallback:', err.message);
    }
  }

  return {
    originalOutput: `Here is the basic response to: "${originalPrompt}"\n\nBecause the original prompt lacked specific context and format rules, this answer is general.`,
    finalOutput: `### 🌟 Refined Executive Output\n\n1. **Role Context**: Applied expert domain perspective.\n2. **Actionable Steps**: Clear numbered breakdown with code/data.\n3. **Constraints**: Eliminated fluff and generic filler.`,
    comparisonExplanation: `Because you specified an expert persona and asked for structured output, the AI gave you a clear, organized, step-by-step response tailored to your exact question instead of a generic summary.`
  };
}

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

// ─────────────────────────────────────────────────────────────────────────────
// CLEAN REWRITE & SCORE FALLBACK HELPERS (ZERO TEMPLATE CONCATENATION)
// ─────────────────────────────────────────────────────────────────────────────

function calculateFallbackScore(userPrompt) {
  const text = (userPrompt || '').trim();
  const words = text.split(/\s+/).filter(Boolean);

  if (words.length === 0) return 0;
  if (words.length < 2 || text.length < 4) {
    return Math.min(10, Math.max(2, text.length * 3));
  }

  let score = 10;
  if (/act as|you are|role|expert/i.test(text)) score += 20;
  if (/context|background|target|because|for a/i.test(text) || words.length > 20) score += 20;
  if (/table|json|bullet|list|markdown|code/i.test(text)) score += 20;
  if (/do not|avoid|limit|under|max|without/i.test(text)) score += 20;
  if (words.length > 10) score += 10;
  return Math.min(100, score);
}

function generateFallbackExplanation(userPrompt) {
  const text = (userPrompt || '').trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  if (/weight|diet|fitness|workout|gain|gym|health/i.test(lower)) {
    return `You asked for weight-gain or fitness guidance, but didn't specify daily caloric goals, dietary restrictions, or workout experience — adding your exact targets will make the response tailored.`;
  }
  if (/code|bug|error|function|react|python|script|api/i.test(lower)) {
    return `You asked to fix code or a technical task, but didn't state the language, framework, or error stack — adding code snippets and expected output will make the fix precise.`;
  }
  if (/email|letter|boss|client|marketing|resume|job/i.test(lower)) {
    return `You requested a writing draft, but didn't specify the recipient, tone, or key objective — identifying your target audience will make the response tailored.`;
  }
  if (words.length < 8) {
    return `You entered "${text}" which is very brief — adding your specific goal, audience, and preferred layout (like bullet points or code blocks) will make the output far more useful.`;
  }
  return `Your draft outlines your core goal, but specifying an expert role and output structure (like numbered steps or a summary table) will eliminate AI ambiguity.`;
}

/**
 * Generates a clean, natural, professional prompt rewrite WITHOUT template string concatenation.
 */
function generateCleanRewriteFallback(userPrompt) {
  const text = (userPrompt || '').trim();
  const lower = text.toLowerCase();

  if (/weight|diet|fitness|workout|gain|gym|health/i.test(lower)) {
    return `Act as a Certified Sports Nutritionist and Strength Conditioning Coach. Create a personalized meal and workout plan tailored for healthy weight gain and lean muscle development, structured with: 1) Daily Caloric & Protein Targets, 2) Meal Timing Guidelines, and 3) A 4-Week Hypertrophy Workout Routine.`;
  }
  if (/code|bug|error|function|react|python|script|api/i.test(lower)) {
    return `Act as a Senior Software Engineer and Code Auditor. Review the technical request, diagnose potential edge cases, and provide a refactored solution formatted as: 1) Root Cause Analysis, 2) Corrected Code Snippet, and 3) Verification Steps.`;
  }
  if (/email|letter|boss|client|marketing|resume|job/i.test(lower)) {
    return `Act as an Executive Business Communications Specialist. Draft a compelling, high-converting professional message structured with: 1) Attention-Grabbing Opening, 2) Key Value Propositions, and 3) Clear Call to Action.`;
  }
  return `Act as a Master Pedagogical Specialist and Lead Domain Expert. Thoroughly analyze and fulfill the following objective: "${text.replace(/^["']|["']$/g, '')}". Provide a clear, actionable guide structured with: 1) Executive Summary, 2) Core Breakdown & Examples, and 3) Next Action Steps.`;
}
