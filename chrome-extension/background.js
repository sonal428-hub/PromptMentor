const GEMINI_MODEL = 'gemini-2.5-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGemini(prompt, apiKey) {
  const url = `${API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

function generateFallbackAnalysis(userPrompt) {
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

async function analyzePrompt(userPrompt, apiKey) {
  if (apiKey && apiKey.length > 5) {
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

      const rawResponse = await callGemini(systemPrompt, apiKey);
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
      console.warn('[PromptMentor] Gemini API error, using fallback:', err.message);
    }
  }

  return generateFallbackAnalysis(userPrompt);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzePrompt') {
    chrome.storage.sync.get(['pm_api_key'], async (result) => {
      const apiKey = result.pm_api_key || '';
      try {
        const analysis = await analyzePrompt(message.prompt, apiKey);
        sendResponse({ success: true, data: analysis });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    });
    return true;
  }

  if (message.action === 'getApiKeyStatus') {
    chrome.storage.sync.get(['pm_api_key'], (result) => {
      sendResponse({ hasKey: !!(result.pm_api_key && result.pm_api_key.length > 5) });
    });
    return true;
  }
});
