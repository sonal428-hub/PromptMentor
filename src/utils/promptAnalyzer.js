export const PROMPT_PILLARS = {
  PERSONA: {
    id: 'persona',
    title: 'Persona & Role',
    description: 'Assigns an expert role or perspective to guide the AI\'s tone and depth.',
    icon: 'UserCheck',
    color: '#8b5cf6', // Violet
    examples: ['Act as a Senior React Engineer', 'As a certified nutritionist', 'From the viewpoint of a product manager']
  },
  CONTEXT: {
    id: 'context',
    title: 'Context & Background',
    description: 'Provides background information, audience details, or use-case setting.',
    icon: 'Layers',
    color: '#3b82f6', // Blue
    examples: ['For a non-technical client presentation', 'I am building a SaaS app for small business owners', 'Background: We are migrating from legacy code']
  },
  SPECIFICITY: {
    id: 'specificity',
    title: 'Specificity & Detail',
    description: 'Uses precise verbs, targets, and detailed instructions instead of vague prompts.',
    icon: 'Target',
    color: '#10b981', // Emerald
    examples: ['Analyze performance bottlenecks in LCP', 'Write a 3-paragraph summary covering key metrics', 'Provide 5 distinct design ideas']
  },
  CONSTRAINTS: {
    id: 'constraints',
    title: 'Constraints & Boundaries',
    description: 'Sets rules on what to avoid, length limits, language tone, or forbidden topics.',
    icon: 'ShieldAlert',
    color: '#f59e0b', // Amber
    examples: ['Do not use technical jargon', 'Keep under 200 words', 'Exclude external dependencies']
  },
  FORMAT: {
    id: 'format',
    title: 'Output Format & Structure',
    description: 'Specifies desired output layout (Markdown table, JSON, bullet points, step-by-step).',
    icon: 'Layout',
    color: '#ec4899', // Pink
    examples: ['Format as a 2-column Markdown table', 'Structure answer in numbered steps with code blocks', 'Return valid JSON format']
  }
};

/**
 * [SUBSTRING MATCHING FOR ORIGINAL PROMPT HIGHLIGHTS]
 * Added for live demo: extracts matched substrings from the user's raw prompt
 * for each of the 5 pillars (Persona, Context, Specificity, Constraints, Format).
 * Used by the UI to highlight matched phrases in the Original Prompt card.
 */
export function extractOriginalHighlights(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return [{ text: text || '', highlighted: false }];
  }

  const patterns = [
    {
      pillarKey: 'persona',
      pillarObj: PROMPT_PILLARS.PERSONA,
      regex: /\b(act as|you are|assume the role|as an? (expert|developer|engineer|writer|consultant|specialist|designer|teacher|mentor|architect|nutritionist)|speaking as|role:)[^,.!?\n]*/gi
    },
    {
      pillarKey: 'context',
      pillarObj: PROMPT_PILLARS.CONTEXT,
      regex: /\b(context|background|target audience|for a|i am trying to|we are building|my goal is|scenario:|because|since|currently working on|for beginners|for executives|given that)[^,.!?\n]*/gi
    },
    {
      pillarKey: 'specificity',
      pillarObj: PROMPT_PILLARS.SPECIFICITY,
      regex: /\b(analyze|compare|evaluate|refactor|benchmark|explain step-by-step|generate|create|summarize|list|identify|optimize)[^,.!?\n]*/gi
    },
    {
      pillarKey: 'constraints',
      pillarObj: PROMPT_PILLARS.CONSTRAINTS,
      regex: /\b(do not|don't|avoid|without|limit|under \d+|max \d+|no jargon|only include|must contain|strictly|less than|never|keep it)[^,.!?\n]*/gi
    },
    {
      pillarKey: 'format',
      pillarObj: PROMPT_PILLARS.FORMAT,
      regex: /\b(json|table|bullet points|numbered list|code block|markdown|structured as|format:|sections|headers|summary table|step by step)[^,.!?\n]*/gi
    }
  ];

  const matches = [];
  for (const p of patterns) {
    let match;
    p.regex.lastIndex = 0;
    while ((match = p.regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        matchText: match[0],
        pillarObj: p.pillarObj
      });
    }
  }

  if (matches.length === 0) {
    return [{ text, highlighted: false }];
  }

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);

  // Filter out overlapping matches
  const nonOverlapping = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      nonOverlapping.push(m);
      lastEnd = m.end;
    }
  }

  const chunks = [];
  let currentIdx = 0;
  for (const m of nonOverlapping) {
    if (m.start > currentIdx) {
      chunks.push({
        text: text.slice(currentIdx, m.start),
        highlighted: false
      });
    }
    chunks.push({
      text: text.slice(m.start, m.end),
      highlighted: true,
      pillarObj: m.pillarObj
    });
    currentIdx = m.end;
  }

  if (currentIdx < text.length) {
    chunks.push({
      text: text.slice(currentIdx),
      highlighted: false
    });
  }

  return chunks;
}

/**
 * Analyzes a user prompt and returns detailed scores, breakdown, suggestions, and diffs.
 */
export function analyzePrompt(userPrompt) {
  const text = (userPrompt || '').trim();
  const lower = text.toLowerCase();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];

  if (words.length < 2 || text.length < 4) {
    const calcScore = text.length === 0 ? 0 : Math.min(10, Math.max(1, text.length * 3));
    return {
      userPrompt: text,
      wordCount: words.length,
      overallScore: calcScore,
      tier: { label: 'Incomplete Prompt', color: '#ef4444', badge: 'Too Short' },
      scores: { persona: 0, context: 0, specificity: 0, constraints: 0, format: 0 },
      statusFlags: {
        hasPersona: false,
        hasContext: false,
        hasSpecificity: false,
        hasConstraints: false,
        hasFormat: false
      },
      missingPillars: Object.values(PROMPT_PILLARS),
      suggestedPrompt: text ? `Act as a Domain Specialist. Please clarify your request for "${text}" by specifying your target topic, background context, and desired output format.` : ''
    };
  }

  // 1. Persona Detection
  const personaPatterns = [
    /\b(act as|you are|assume the role|as an? (expert|developer|engineer|writer|consultant|specialist|designer|teacher|mentor))\b/i,
    /\b(from the (perspective|viewpoint) of|speaking as|role:)\b/i
  ];
  const hasPersona = personaPatterns.some(p => p.test(text));

  // 2. Context Detection
  const contextPatterns = [
    /\b(context|background|target audience|for a|i am trying to|we are building|my goal is|scenario:)\b/i,
    /\b(because|since|currently working on|for beginners|for executives|given that)\b/i
  ];
  const hasContext = contextPatterns.some(p => p.test(text)) || words.length > 25;

  // 3. Specificity Detection
  const specificVerbs = /\b(analyze|compare|evaluate|refactor|benchmark|explain step-by-step|generate|create|summarize|list|identify|optimize)\b/i;
  const hasSpecificVerbs = specificVerbs.test(text);
  const isDetailedLength = words.length >= 15;
  const hasSpecificity = isDetailedLength && hasSpecificVerbs;

  // 4. Constraints Detection
  const constraintPatterns = [
    /\b(do not|don't|avoid|without|limit|under \d+|max \d+|no jargon|only include|must contain|strictly)\b/i,
    /\b(in under|less than|never|ensure that|keep it)\b/i
  ];
  const hasConstraints = constraintPatterns.some(p => p.test(text));

  // 5. Output Format Detection
  const formatPatterns = [
    /\b(json|table|bullet points|numbered list|code block|markdown|structured as|format:|sections|headers|summary table)\b/i,
    /\b(step by step|in a table|as a list|with code snippets)\b/i
  ];
  const hasFormat = formatPatterns.some(p => p.test(text));

  // Calculate pillar scores (0 - 100) — Strict & Fair evaluation
  const scorePersona = hasPersona ? 100 : 0;
  const scoreContext = hasContext ? 100 : (words.length > 15 ? 40 : words.length > 6 ? 15 : 0);
  const scoreSpecificity = hasSpecificity ? 100 : (words.length > 12 ? 50 : words.length > 5 ? 15 : 0);
  const scoreConstraints = hasConstraints ? 100 : 0;
  const scoreFormat = hasFormat ? 100 : 0;

  // Overall Score (Weighted)
  const overallScore = Math.round(
    scorePersona * 0.20 +
    scoreContext * 0.25 +
    scoreSpecificity * 0.25 +
    scoreConstraints * 0.15 +
    scoreFormat * 0.15
  );

  // Grade Tier
  let tier = { label: 'Needs Refinement', color: '#ef4444', badge: 'Novice Prompt' };
  if (overallScore >= 85) {
    tier = { label: 'Master Prompt', color: '#10b981', badge: 'Expert Quality' };
  } else if (overallScore >= 65) {
    tier = { label: 'Strong Prompt', color: '#3b82f6', badge: 'Intermediate Quality' };
  } else if (overallScore >= 45) {
    tier = { label: 'Fair Attempt', color: '#f59e0b', badge: 'Developing Prompt' };
  }

  // Missing Pillars
  const missingPillars = [];
  if (!hasPersona) missingPillars.push(PROMPT_PILLARS.PERSONA);
  if (!hasContext) missingPillars.push(PROMPT_PILLARS.CONTEXT);
  if (!hasSpecificity) missingPillars.push(PROMPT_PILLARS.SPECIFICITY);
  if (!hasConstraints) missingPillars.push(PROMPT_PILLARS.CONSTRAINTS);
  if (!hasFormat) missingPillars.push(PROMPT_PILLARS.FORMAT);

  // Generate Suggested Enhanced Prompt
  const { suggestedPrompt } = generateSuggestedPrompt({ text });

  return {
    userPrompt: text,
    wordCount: words.length,
    overallScore,
    tier,
    scores: {
      persona: scorePersona,
      context: scoreContext,
      specificity: scoreSpecificity,
      constraints: scoreConstraints,
      format: scoreFormat
    },
    statusFlags: {
      hasPersona,
      hasContext,
      hasSpecificity,
      hasConstraints,
      hasFormat
    },
    missingPillars,
    suggestedPrompt
  };
}

function createEmptyAnalysis() {
  return {
    userPrompt: '',
    wordCount: 0,
    overallScore: 0,
    tier: { label: 'Empty Prompt', color: '#9ca3af', badge: 'Awaiting Input' },
    scores: { persona: 0, context: 0, specificity: 0, constraints: 0, format: 0 },
    statusFlags: { hasPersona: false, hasContext: false, hasSpecificity: false, hasConstraints: false, hasFormat: false },
    missingPillars: Object.values(PROMPT_PILLARS),
    suggestedPrompt: ''
  };
}

/**
 * [CLEAN REWRITE GENERATOR WITHOUT TEMPLATE STRING CONCATENATION]
 * Rewrites the user's intent into a single natural expert prompt.
 */
function generateSuggestedPrompt({ text }) {
  const lower = (text || '').toLowerCase();

  let suggestedPrompt = '';
  if (/weight|diet|fitness|workout|gain|gym|health/i.test(lower)) {
    suggestedPrompt = `Act as a Certified Sports Nutritionist and Strength Conditioning Coach. Create a personalized meal and workout plan tailored for healthy weight gain and lean muscle development, structured with: 1) Daily Caloric & Protein Targets, 2) Meal Timing Guidelines, and 3) A 4-Week Hypertrophy Workout Routine.`;
  } else if (/code|bug|error|function|react|python|script|api/i.test(lower)) {
    suggestedPrompt = `Act as a Senior Software Engineer and Code Auditor. Review the technical request, diagnose potential edge cases, and provide a refactored solution formatted as: 1) Root Cause Analysis, 2) Corrected Code Snippet, and 3) Verification Steps.`;
  } else if (/email|letter|boss|client|marketing|resume|job/i.test(lower)) {
    suggestedPrompt = `Act as an Executive Business Communications Specialist. Draft a compelling, high-converting professional message structured with: 1) Attention-Grabbing Opening, 2) Key Value Propositions, and 3) Clear Call to Action.`;
  } else {
    suggestedPrompt = `Act as a Master Pedagogical Specialist and Lead Domain Expert. Thoroughly analyze and fulfill the following objective: "${text.replace(/^["']|["']$/g, '')}". Provide a clear, actionable guide structured with: 1) Executive Summary, 2) Core Breakdown & Examples, and 3) Next Action Steps.`;
  }

  return { suggestedPrompt };
}
