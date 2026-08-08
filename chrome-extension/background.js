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

/**
 * Context-aware fallback prompt builder.
 * Detects the user's domain and crafts a tailored refined prompt — not a generic template.
 */
function generateFallbackAnalysis(userPrompt) {
  const words = (userPrompt || '').split(/\s+/).filter(Boolean);
  const text = (userPrompt || '').trim();
  const lower = text.toLowerCase();

  // If prompt is empty or too short, return 0 score
  if (!text || text.length < 3) {
    return {
      score: 0,
      tags: [
        { label: 'Clear Intent', status: 'fail' },
        { label: 'Good Context', status: 'fail' },
        { label: 'Specific Details', status: 'fail' },
        { label: 'Has Constraints', status: 'fail' },
        { label: 'Output Format', status: 'fail' },
        { label: 'Role/Persona', status: 'fail' }
      ],
      coachAdvice: 'Type a meaningful prompt first — include what you need, who should answer, and how the output should be structured.',
      finalPrompt: text,
      originalPrompt: text
    };
  }

  const hasPersona = /act as|you are|assume the role|as an? (expert|developer|engineer|writer|consultant|specialist|designer|teacher|mentor)/i.test(text);
  const hasContext = /context|background|target audience|for a|i am trying to|we are building|my goal is|scenario:|because|since|currently working on|given that/i.test(text) || words.length > 20;
  const hasFormat = /table|json|bullet|list|markdown|code|numbered|step.?by.?step|sections|headers/i.test(text);
  const hasConstraints = /do not|don't|avoid|limit|under \d+|max \d+|without|no jargon|only include|must contain|strictly|less than|never|keep it/i.test(text);
  const hasSpecificity = /analyze|compare|evaluate|refactor|benchmark|generate|create|summarize|identify|optimize|explain|design|implement|review/i.test(text) && words.length >= 8;

  // Fair score calculation starting from 0
  let score = 0;
  if (words.length >= 3) score += 8;
  if (words.length >= 8) score += 7;
  if (words.length >= 15) score += 5;
  if (hasPersona) score += 20;
  if (hasContext) score += 20;
  if (hasSpecificity) score += 15;
  if (hasConstraints) score += 15;
  if (hasFormat) score += 10;

  // Domain-aware refined prompt generation
  let finalPrompt;
  if (/code|bug|error|function|react|python|script|api|css|html|javascript|typescript|database|sql|backend|frontend|debug|deploy/i.test(lower)) {
    finalPrompt = `Act as a Senior Software Engineer with deep expertise in full-stack development. I need you to ${text}. Please structure your response as: 1) Problem diagnosis and root cause, 2) Solution implementation with clean, production-ready code, 3) Edge cases and error handling considerations. Use concise code comments and avoid unnecessary boilerplate.`;
  } else if (/weight|diet|fitness|workout|gym|health|nutrition|exercise|calories|protein|muscle|cardio/i.test(lower)) {
    finalPrompt = `Act as a Certified Fitness Coach and Sports Nutritionist. I need guidance on: ${text}. Structure your response with: 1) Personalized assessment, 2) Specific actionable plan with measurable targets, 3) Weekly schedule and tracking metrics. Base recommendations on evidence-based practices.`;
  } else if (/email|letter|boss|client|marketing|resume|job|interview|cover letter|professional|business|sales/i.test(lower)) {
    finalPrompt = `Act as a Senior Business Communications Strategist. I need help with: ${text}. Structure your response as: 1) Key messaging strategy, 2) The complete drafted content with professional tone, 3) Alternative phrasing options for impact. Ensure the output is concise, persuasive, and ready to send.`;
  } else if (/essay|write|story|blog|article|content|creative|narrative|report|paper|thesis|research/i.test(lower)) {
    finalPrompt = `Act as a Professional Content Strategist and Writer. I need: ${text}. Structure your response as: 1) Outline with key arguments or narrative beats, 2) Full draft with engaging opening and strong conclusion, 3) Editing notes for further refinement. Maintain a clear, compelling voice throughout.`;
  } else if (/teach|learn|explain|understand|study|course|lesson|tutorial|concept|how does|what is|why does/i.test(lower)) {
    finalPrompt = `Act as an Expert Educator and Subject Matter Specialist. Help me understand: ${text}. Structure your explanation as: 1) Core concept in simple terms with an analogy, 2) Detailed breakdown with real-world examples, 3) Common misconceptions to avoid, 4) Quick self-check questions to test understanding.`;
  } else if (/plan|strategy|roadmap|project|launch|startup|product|feature|milestone|timeline/i.test(lower)) {
    finalPrompt = `Act as a Senior Product Strategist and Project Manager. I need help with: ${text}. Structure your response as: 1) Executive summary of the approach, 2) Phased action plan with clear milestones and deliverables, 3) Risk assessment and mitigation strategies, 4) Success metrics and KPIs to track.`;
  } else if (/data|analysis|chart|graph|metric|statistic|trend|insight|dashboard|visualization/i.test(lower)) {
    finalPrompt = `Act as a Senior Data Analyst and Insights Specialist. I need: ${text}. Structure your response as: 1) Data interpretation framework, 2) Key findings with supporting evidence, 3) Actionable recommendations based on the analysis, 4) Suggested visualizations or next data points to explore.`;
  } else {
    // General — still contextual, NOT a generic template
    const coreIntent = text.length > 80 ? text.substring(0, 80) + '...' : text;
    finalPrompt = `Act as a knowledgeable specialist in the relevant domain. ${text}. Please provide a thorough, well-structured response with: 1) Direct answer to the core question about "${coreIntent}", 2) Supporting details, examples, or step-by-step guidance, 3) Practical next steps or recommendations. Be specific and actionable — avoid generic advice.`;
  }

  return {
    score: Math.min(100, score),
    tags: [
      { label: 'Clear Intent', status: words.length > 2 ? 'pass' : 'fail' },
      { label: 'Good Context', status: hasContext ? 'pass' : 'fail' },
      { label: 'Specific Details', status: hasSpecificity ? 'pass' : 'fail' },
      { label: 'Has Constraints', status: hasConstraints ? 'pass' : 'fail' },
      { label: 'Output Format', status: hasFormat ? 'pass' : 'fail' },
      { label: 'Role/Persona', status: hasPersona ? 'pass' : 'fail' }
    ],
    coachAdvice: generateContextualAdvice(hasPersona, hasContext, hasSpecificity, hasConstraints, hasFormat, words.length),
    finalPrompt,
    originalPrompt: userPrompt
  };
}

/**
 * Generate context-specific coaching advice based on what the prompt is missing.
 */
function generateContextualAdvice(hasPersona, hasContext, hasSpecificity, hasConstraints, hasFormat, wordCount) {
  const missing = [];
  if (!hasPersona) missing.push('an expert persona (e.g., "Act as a Senior Engineer")');
  if (!hasContext) missing.push('background context or target audience');
  if (!hasSpecificity) missing.push('specific action verbs and detailed requirements');
  if (!hasConstraints) missing.push('boundaries or constraints (e.g., "under 300 words", "avoid jargon")');
  if (!hasFormat) missing.push('output format instructions (e.g., "as a bullet list", "in JSON")');

  if (missing.length === 0) return 'Excellent prompt structure! All 5 engineering pillars are covered.';
  if (missing.length === 1) return `Almost there! Try adding ${missing[0]} to push your score above 90.`;
  if (missing.length === 2) return `Good start! Strengthen your prompt by adding ${missing[0]} and ${missing[1]}.`;
  return `To significantly improve, add ${missing.slice(0, 2).join(' and ')}. ${missing.length > 2 ? `Also consider: ${missing[2]}.` : ''}`;
}

async function analyzePrompt(userPrompt, apiKey) {
  if (apiKey && apiKey.length > 5) {
    try {
      const systemPrompt = `You are PromptCoach, an expert AI prompt engineering evaluator built into the PromptMentor Chrome extension.

The user has typed a prompt draft into an AI chat interface (ChatGPT, Claude, or Gemini). Your job is to:

1. **Evaluate** the prompt across 6 dimensions: Clear Intent, Good Context, Specific Details, Has Constraints, Output Format, Role/Persona
2. **Score** the prompt from 0 to 100 as an integer. Be strict and fair:
   - Single words or vague 2-3 word prompts: 0-15
   - Basic questions without structure: 15-35
   - Decent prompts with some structure: 35-65
   - Well-structured prompts with role, context, and format: 65-85
   - Expert-level prompts covering all 6 dimensions: 85-100
3. **Diagnose** each tag as "pass" or "fail"
4. **Coach** — write 1-2 sentences of specific, actionable advice (not generic)
5. **Rewrite** — generate an improved "finalPrompt" that:
   - Preserves the user's EXACT original intent and topic
   - Adds missing structural elements (persona, context, constraints, output format)
   - Is tailored to the user's specific domain/topic — NOT a generic template
   - Feels natural and purposeful, not bloated with unnecessary filler

CRITICAL RULE: The finalPrompt must be SPECIFIC to what the user asked about. Do NOT produce a generic boilerplate prompt. The refined version should feel like a thoughtful expert wrote it specifically for this task.

RESPOND ONLY WITH VALID JSON (no markdown fences, no extra text) in this exact schema:

{
  "score": 52,
  "tags": [
    { "label": "Clear Intent", "status": "pass" },
    { "label": "Good Context", "status": "fail" },
    { "label": "Specific Details", "status": "fail" },
    { "label": "Has Constraints", "status": "fail" },
    { "label": "Output Format", "status": "pass" },
    { "label": "Role/Persona", "status": "fail" }
  ],
  "coachAdvice": "Your prompt has a clear goal but lacks role framing and constraints. Add 'Act as a [relevant expert]' and specify output length/format to score 80+.",
  "finalPrompt": "The improved, domain-specific version of the user's prompt goes here."
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
      const scoreVal = typeof parsed.score === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.score))) : 50;

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
