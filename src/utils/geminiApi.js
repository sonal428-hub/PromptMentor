const GEMINI_MODEL = 'gemini-2.5-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

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
5. Generate an improved "final prompt" that fixes all weaknesses while preserving original intent

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

      return {
        score: scoreVal,
        tags: Array.isArray(parsed.tags) ? parsed.tags.map(t => ({
          label: String(t.label || 'Unknown'),
          status: t.status === 'pass' ? 'pass' : 'fail'
        })) : [],
        coachAdvice: typeof parsed.coachAdvice === 'string' ? parsed.coachAdvice : 'Adding role framing and output format constraints will boost prompt quality.',
        finalPrompt: typeof parsed.finalPrompt === 'string' ? parsed.finalPrompt : userPrompt,
        originalPrompt: userPrompt
      };
    } catch (err) {
      console.warn('Gemini coaxAnalyze API error, using smart fallback generator:', err.message);
    }
  }

  return generateFallbackCoaxAnalysis(userPrompt);
}

export async function comparePromptOutputs(originalPrompt, finalPrompt, apiKey) {
  const activeKey = getEffectiveApiKey(apiKey);

  if (activeKey) {
    try {
      const [originalOutput, finalOutput] = await Promise.all([
        callGemini(originalPrompt, activeKey),
        callGemini(finalPrompt, activeKey)
      ]);

      const comparisonPrompt = `You are PromptMentor AI Evaluator.
Analyze the LLM output from Original Prompt vs Refined Prompt.
ORIGINAL: "${originalPrompt}"
REFINED: "${finalPrompt}"

Provide a 3-bullet breakdown explaining why the refined output is superior in clarity, structure, and accuracy.`;

      let comparisonExplanation = '';
      try {
        comparisonExplanation = await callGemini(comparisonPrompt, activeKey);
      } catch (err) {
        comparisonExplanation = `### 📊 Output Comparison Insight\n- **Original**: Gave general information due to unconstrained prompt.\n- **Refined**: Provided structured, actionable output with explicit formatting rules.\n- **Quality Gain**: High precision & 0 guesswork.`;
      }

      return { originalOutput, finalOutput, comparisonExplanation };
    } catch (err) {
      console.warn('Gemini comparePromptOutputs API error, using fallback:', err.message);
    }
  }

  return {
    originalOutput: `Here is the basic response to: "${originalPrompt}"\n\nBecause the original prompt lacked specific context and format rules, this answer is general.`,
    finalOutput: `### 🌟 Refined Executive Output\n\n1. **Role Context**: Applied expert domain perspective.\n2. **Actionable Steps**: Clear numbered breakdown with code/data.\n3. **Constraints**: Eliminated fluff and generic filler.`,
    comparisonExplanation: `### 📊 Output Quality Analysis\n\n- **Original Output**: Responded with generic summaries.\n- **Refined Output**: Delivered structured, domain-expert responses.\n- **Takeaway**: Explicit role framing and output format rules eliminated AI ambiguity.`
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

function generateFallbackCoaxAnalysis(userPrompt) {
  const words = (userPrompt || '').split(/\s+/).filter(Boolean);
  const text = userPrompt || '';

  const hasPersona = /act as|you are|role|expert/i.test(text);
  const hasContext = /context|background|target|because|for a/i.test(text) || words.length > 20;
  const hasFormat = /table|json|bullet|list|markdown|code/i.test(text);
  const hasConstraints = /do not|avoid|limit|under|max|without/i.test(text);

  let score = 35;
  if (hasPersona) score += 15;
  if (hasContext) score += 20;
  if (hasFormat) score += 15;
  if (hasConstraints) score += 15;

  const finalPrompt = `Act as an Expert Domain Specialist. ${text}. Provide a clear, practical solution structured with: 1) Executive Summary, 2) Key Takeaways, and 3) Next Action Steps. Keep response concise and avoid unnecessary fluff.`;

  return {
    score: Math.min(100, score),
    tags: [
      { label: 'Clear Intent', status: words.length > 2 ? 'pass' : 'fail' },
      { label: 'Good Context', status: hasContext ? 'pass' : 'fail' },
      { label: 'Specific Details', status: words.length > 12 ? 'pass' : 'fail' },
      { label: 'Has Constraints', status: hasConstraints ? 'pass' : 'fail' },
      { label: 'Output Format', status: hasFormat ? 'pass' : 'fail' },
      { label: 'Role/Persona', status: hasPersona ? 'pass' : 'fail' }
    ],
    coachAdvice: 'Adding an explicit expert persona and clear output formatting rules will push your prompt quality above 85.',
    finalPrompt,
    originalPrompt: userPrompt
  };
}
