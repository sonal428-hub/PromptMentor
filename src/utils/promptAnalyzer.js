/**
 * Prompt Analyzer Utility for Collaborative Prompting (PS05)
 * Analyzes prompt text across 5 prompt engineering pillars:
 * 1. Persona / Role
 * 2. Context & Background
 * 3. Specificity & Clarity
 * 4. Constraints & Boundaries
 * 5. Output Format & Structure
 */

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
 * Analyzes a user prompt and returns detailed scores, breakdown, suggestions, and diffs.
 */
export function analyzePrompt(userPrompt) {
  const text = (userPrompt || '').trim();
  const lower = text.toLowerCase();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];

  if (words.length === 0) {
    return createEmptyAnalysis();
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

  // Calculate pillar scores (0 - 100)
  const scorePersona = hasPersona ? 100 : 15;
  const scoreContext = hasContext ? 100 : (words.length > 10 ? 45 : 20);
  const scoreSpecificity = hasSpecificity ? 100 : (words.length > 8 ? 60 : 25);
  const scoreConstraints = hasConstraints ? 100 : 20;
  const scoreFormat = hasFormat ? 100 : 25;

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

  // Generate Suggested Enhanced Prompt & Diff
  const { suggestedPrompt, diffs, addedKeywords } = generateSuggestedPrompt({
    text,
    hasPersona,
    hasContext,
    hasSpecificity,
    hasConstraints,
    hasFormat
  });

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
    suggestedPrompt,
    diffs,
    addedKeywords
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
    suggestedPrompt: '',
    diffs: [],
    addedKeywords: []
  };
}

/**
 * Intelligent prompt refiner that constructs a enhanced prompt & returns color-coded diff chunks.
 */
function generateSuggestedPrompt({ text, hasPersona, hasContext, hasSpecificity, hasConstraints, hasFormat }) {
  const diffs = [];
  const addedKeywords = [];

  let personaPrefix = '';
  if (!hasPersona) {
    // Detect domain to pick expert persona
    const domainPersona = inferDomainPersona(text);
    personaPrefix = `Act as an ${domainPersona}. `;
    diffs.push({ text: personaPrefix, added: true, pillar: 'persona', label: '+ Expert Role' });
    addedKeywords.push({ keyword: personaPrefix.trim(), pillar: 'persona', explanation: 'Gives the LLM domain expertise and authoritative tone.' });
  }

  // Original prompt content
  diffs.push({ text: text + (text.endsWith('.') ? ' ' : '. '), added: false });

  let contextAddition = '';
  if (!hasContext) {
    contextAddition = `Provide a clear, practical explanation tailored for immediate real-world application. `;
    diffs.push({ text: contextAddition, added: true, pillar: 'context', label: '+ Context' });
    addedKeywords.push({ keyword: 'tailored for immediate real-world application', pillar: 'context', explanation: 'Establishes target audience and goal.' });
  }

  let constraintAddition = '';
  if (!hasConstraints) {
    constraintAddition = `Keep the response concise, avoid unnecessary jargon, and highlight key takeaways. `;
    diffs.push({ text: constraintAddition, added: true, pillar: 'constraints', label: '+ Constraints' });
    addedKeywords.push({ keyword: 'concise, avoid unnecessary jargon', pillar: 'constraints', explanation: 'Prevents fluff and maintains high signal-to-noise ratio.' });
  }

  let formatAddition = '';
  if (!hasFormat) {
    formatAddition = `Structure your answer with: 1) Executive Summary, 2) Key Points/Code, and 3) Next Action Steps.`;
    diffs.push({ text: formatAddition, added: true, pillar: 'format', label: '+ Structured Format' });
    addedKeywords.push({ keyword: 'Structured with Executive Summary, Key Points, and Action Steps', pillar: 'format', explanation: 'Forces easy-to-read layout.' });
  }

  const suggestedPrompt = diffs.map(d => d.text).join('');

  return { suggestedPrompt, diffs, addedKeywords };
}

function inferDomainPersona(text) {
  const lower = text.toLowerCase();
  if (/code|python|react|javascript|bug|function|algorithm|sql|database|api/i.test(lower)) {
    return 'Expert Senior Software Engineer and Architect';
  }
  if (/email|boss|client|business|marketing|strategy|sales|resume|job/i.test(lower)) {
    return 'Executive Business Communication Strategist';
  }
  if (/workout|diet|fitness|exercise|health|gym|meal/i.test(lower)) {
    return 'Certified Fitness & Exercise Science Specialist';
  }
  if (/physics|math|science|history|learn|study|explain|concept/i.test(lower)) {
    return 'Master Educator and Pedagogical Specialist';
  }
  return 'Expert Domain Specialist';
}
