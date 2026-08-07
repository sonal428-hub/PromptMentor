import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  X,
  BookOpen,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Award,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

/* ============================================================================
 * STORAGE
 * ==========================================================================*/

const STORAGE_KEYS = {
  COMPLETED_LESSONS: "learnpage_completed_lessons",
  SOLVED_QUESTIONS_COUNT: "learnpage_solved_questions_count",
  SOLVED_QUESTION_KEYS: "learnpage_solved_question_keys",
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* localStorage unavailable (private mode, quota, etc.) — fail silently */
  }
}

/* ============================================================================
 * LESSON DATA
 * ==========================================================================*/

export const LESSONS = [
  {
    id: "specificity",
    level: 1,
    title: "Be Specific & Clear",
    subtitle: "Vague prompts get vague answers",
    icon: "🎯",
    learnMore: {
      context:
        "Large language models can't read your mind — they respond to the words on the page. When a prompt is vague, the model has to guess at scope, format, and intent, and it will often guess wrong. Specificity removes ambiguity: the more precisely you describe the desired outcome, the less room there is for the model to drift off target.",
      keyTakeaways: [
        "Name the exact deliverable (a list, a table, a paragraph, a function) instead of describing it abstractly.",
        "Include concrete constraints: length, tone, audience, and format.",
        "Replace vague adjectives like 'good' or 'better' with measurable criteria.",
        "If a number matters (word count, number of items), say the number.",
      ],
      examples: [
        {
          before: "Write something about marketing.",
          after:
            "Write a 150-word LinkedIn post for a B2B SaaS founder announcing a new pricing tier, in a confident but not salesy tone.",
        },
        {
          before: "Make this code better.",
          after:
            "Refactor this function to reduce time complexity from O(n²) to O(n log n) and add inline comments explaining each step.",
        },
      ],
    },
    questions: [
      {
        prompt:
          "Which revision best improves the specificity of the prompt below?",
        code: '"Write a description for my product."',
        options: [
          "\"Write a description for my product that people will like.\"",
          "\"Write a 3-sentence product description for a wireless noise-cancelling headphone, targeting remote workers, in an upbeat tone.\"",
          "\"Write something short about my product, thanks.\"",
          "\"Describe my product in a way that sounds professional.\"",
        ],
        correctIndex: 1,
        explanation:
          "Option 2 defines length (3 sentences), the product, the target audience, and the tone — leaving almost no ambiguity for the model to guess at.",
        hint: "Look for the option that names a length, an audience, and a tone.",
      },
      {
        prompt:
          "A prompt says: \"Summarize this article.\" What is the biggest risk with this instruction?",
        code: null,
        options: [
          "The model might refuse to summarize articles at all.",
          "The model has to guess the desired length, format, and focus, which may not match what you actually need.",
          "The model will always produce a summary that is too long.",
          "There is no risk — summarization prompts don't need detail.",
        ],
        correctIndex: 1,
        explanation:
          "Without constraints like length or focus, the model fills in the gaps itself, which frequently produces a summary that doesn't match your actual need.",
        hint: "Think about what decisions the model is forced to make on its own.",
      },
      {
        prompt:
          "You want exactly 5 bullet points of actionable advice, no more, no less. What should you add to your prompt?",
        code: '"Give me advice on public speaking."',
        options: [
          "Nothing — the model will naturally infer a reasonable number.",
          "Add \"in exactly 5 bullet points, each starting with an action verb.\"",
          "Add \"please\" to make the request more polite.",
          "Ask the question twice for emphasis.",
        ],
        correctIndex: 1,
        explanation:
          "Stating the exact count and structural constraint (\"5 bullet points, each starting with an action verb\") directly targets the ambiguity that causes inconsistent output.",
        hint: "The fix should state a number and a structural rule.",
      },
    ],
  },
  {
    id: "context",
    level: 2,
    title: "Provide Context",
    subtitle: "Give the model the background it needs",
    icon: "🧩",
    learnMore: {
      context:
        "A model only knows what's in the conversation (plus its training data) — it has no access to your inbox, your codebase, or your intentions. Providing relevant context — who the audience is, what's already been tried, what constraints exist — lets the model reason with the same information you have, instead of filling gaps with generic assumptions.",
      keyTakeaways: [
        "State the audience and purpose before the ask.",
        "Share relevant background facts, not just the final question.",
        "Mention constraints that aren't obvious (budget, deadline, prior attempts).",
        "Context should be relevant and concise — dumping everything can bury the actual ask.",
      ],
      examples: [
        {
          before: "How do I fix this error?",
          after:
            "I'm running a Node.js Express API on Node 18. When a POST request hits /users, I get this error: [error]. Here's the relevant route handler: [code]. How do I fix it?",
        },
        {
          before: "Write a follow-up email.",
          after:
            "Write a follow-up email to a client who went quiet after we sent a proposal 2 weeks ago. We previously discussed a 6-month contract. Keep it warm, not pushy.",
        },
      ],
    },
    questions: [
      {
        prompt:
          "Which piece of context is most important to include when asking for debugging help?",
        code: null,
        options: [
          "Your favorite programming language overall.",
          "The exact error message and the relevant code snippet.",
          "How long you've been coding.",
          "The name of your code editor.",
        ],
        correctIndex: 1,
        explanation:
          "The exact error text and relevant code give the model something concrete to diagnose, rather than guessing at symptoms.",
        hint: "What would a human developer ask you for first?",
      },
      {
        prompt:
          "You're asking for help writing a cover letter. Which added context would most improve the response?",
        code: '"Write me a cover letter."',
        options: [
          "The weather in your city today.",
          "The job title, company, and 2-3 relevant past achievements.",
          "A list of unrelated hobbies.",
          "Nothing — cover letters are generic by nature.",
        ],
        correctIndex: 1,
        explanation:
          "The job title, company, and specific achievements let the model tailor the letter instead of producing a generic template.",
        hint: "Think about what a hiring manager would want the letter to reference.",
      },
      {
        prompt:
          "What's a risk of providing too much irrelevant context in a prompt?",
        code: null,
        options: [
          "The model will always ignore the prompt entirely.",
          "It can bury the actual request, making it harder for the model to identify what matters.",
          "There is no risk — more context is always strictly better.",
          "The model will ask you to shorten it before responding.",
        ],
        correctIndex: 1,
        explanation:
          "Context should be relevant and concise. Irrelevant detail can dilute the signal and make the core ask harder to isolate.",
        hint: "Consider how a wall of unrelated detail affects focus.",
      },
    ],
  },
  {
    id: "persona",
    level: 3,
    title: "Assign a Role",
    subtitle: "Personas shape tone, depth, and vocabulary",
    icon: "🎭",
    learnMore: {
      context:
        "Assigning a persona (\"You are a senior security engineer...\") primes the model to adopt a consistent voice, vocabulary, and level of depth associated with that role. It's a lightweight way to steer tone and expertise without writing paragraphs of instructions.",
      keyTakeaways: [
        "Roles set expectations for vocabulary and depth (e.g. 'senior' vs 'beginner-friendly').",
        "Combine a role with an audience for sharper tone control (\"Explain as a doctor would to a worried patient\").",
        "Roles are a steering tool, not a guarantee — pair them with explicit constraints for best results.",
        "Avoid roles that ask the model to impersonate a real, identifiable individual.",
      ],
      examples: [
        {
          before: "Explain how vaccines work.",
          after:
            "You are a pediatrician explaining vaccines to a nervous new parent. Use simple, reassuring language and avoid jargon.",
        },
        {
          before: "Review my resume.",
          after:
            "You are a hiring manager at a Fortune 500 tech company. Review this resume and flag anything that would make you skip to the next candidate.",
        },
      ],
    },
    questions: [
      {
        prompt:
          "Why does assigning a role like \"You are a senior copy editor\" help a prompt?",
        code: null,
        options: [
          "It guarantees factual accuracy in the response.",
          "It primes the model toward a consistent tone, vocabulary, and depth associated with that role.",
          "It makes the model respond faster.",
          "It is required for the model to respond at all.",
        ],
        correctIndex: 1,
        explanation:
          "Roles act as a steering signal for tone and expertise level, not a guarantee of accuracy — that still requires explicit constraints and verification.",
        hint: "Think about what a role actually controls: correctness, or style?",
      },
      {
        prompt:
          "Which prompt best combines a role with an audience for sharper tone control?",
        code: null,
        options: [
          '"Explain photosynthesis."',
          '"You are a biology teacher explaining photosynthesis to 10-year-olds using a simple analogy."',
          '"Tell me about plants."',
          '"You are smart, explain photosynthesis."',
        ],
        correctIndex: 1,
        explanation:
          "This option pairs a specific role (biology teacher) with a specific audience (10-year-olds) and a stylistic device (analogy), giving clear tone guidance.",
        hint: "Look for both a role AND a named audience.",
      },
      {
        prompt: "What is a good practice to pair with a persona instruction?",
        code: null,
        options: [
          "Nothing — the persona alone is always sufficient.",
          "Explicit constraints, such as tone, length, or format, alongside the role.",
          "Asking the model to invent a fake credential to sound more convincing.",
          "Removing all other instructions so the persona isn't diluted.",
        ],
        correctIndex: 1,
        explanation:
          "Roles steer tone but work best combined with explicit constraints (length, format, tone) rather than being relied on alone.",
        hint: "Roles are a steering tool — what should they be paired with?",
      },
    ],
  },
  {
    id: "examples",
    level: 4,
    title: "Use Few-Shot Examples",
    subtitle: "Show, don't just tell",
    icon: "📚",
    learnMore: {
      context:
        "Few-shot prompting means showing the model one or more examples of the input/output pattern you want before asking it to do the real task. Examples communicate format, tone, and edge-case handling far more precisely than a written description alone — especially for structured or stylistically specific output.",
      keyTakeaways: [
        "One well-chosen example (one-shot) can outperform a paragraph of instructions.",
        "Multiple examples (few-shot) help the model generalize a pattern, especially for edge cases.",
        "Keep examples consistent in format with what you want back.",
        "Examples are especially powerful for structured output like JSON, tables, or code style.",
      ],
      examples: [
        {
          before: "Turn these notes into tweets.",
          after:
            'Turn these notes into tweets. Example — Note: "Team shipped v2 today, huge relief." Tweet: "v2 is live 🎉 Weeks of work, one very relieved team. Try it now →" Now do the same for: [notes]',
        },
        {
          before: "Extract the name and price from this text.",
          after:
            'Extract name and price as JSON. Example — Text: "Blue Mug - $12" → {"name": "Blue Mug", "price": 12}. Now extract from: "Red Notebook - $8"',
        },
      ],
    },
    questions: [
      {
        prompt: "What is the core idea behind few-shot prompting?",
        code: null,
        options: [
          "Asking the model the same question multiple times.",
          "Showing the model example input/output pairs so it can infer the desired pattern.",
          "Giving the model as few instructions as possible.",
          "Limiting the model to five total responses.",
        ],
        correctIndex: 1,
        explanation:
          "Few-shot prompting provides example pairs so the model can learn the pattern by demonstration rather than description alone.",
        hint: "The word 'shot' refers to an example, not an attempt count.",
      },
      {
        prompt:
          "You need the model to output JSON in a very specific shape every time. What's the most reliable technique?",
        code: null,
        options: [
          "Describe the JSON shape in a single sentence and hope for consistency.",
          "Provide one or two example input/output JSON pairs matching the exact shape you want.",
          "Ask for JSON without specifying any structure.",
          "Avoid mentioning JSON and let the model decide the format.",
        ],
        correctIndex: 1,
        explanation:
          "Concrete examples of the exact JSON shape are far more reliable than a text description for structured, format-sensitive output.",
        hint: "Structured output benefits most from being demonstrated, not just described.",
      },
      {
        prompt: "Why might multiple examples (rather than just one) help?",
        code: null,
        options: [
          "They don't help — one example is always enough.",
          "Multiple examples help the model generalize the pattern, especially across edge cases.",
          "Multiple examples slow the model down unnecessarily.",
          "They are only useful for creative writing tasks.",
        ],
        correctIndex: 1,
        explanation:
          "Several varied examples help the model infer the general rule rather than overfitting to one specific case, which matters most when edge cases exist.",
        hint: "Think about generalization versus a single fixed case.",
      },
    ],
  },
  {
    id: "chain-of-thought",
    level: 5,
    title: "Break Down Complex Tasks",
    subtitle: "Step-by-step reasoning beats one big ask",
    icon: "🧠",
    learnMore: {
      context:
        "Complex tasks — multi-step reasoning, math, planning — are more reliable when you either break them into smaller sub-prompts or explicitly ask the model to reason step by step before giving a final answer. This is often called chain-of-thought prompting: it reduces the chance the model jumps to a plausible-sounding but wrong conclusion.",
      keyTakeaways: [
        "For multi-step problems, ask the model to work through steps before the final answer.",
        "Alternatively, split the task yourself into a sequence of smaller prompts.",
        "Chain-of-thought is especially useful for math, logic, planning, and multi-constraint tasks.",
        "For simple factual questions, forcing extra steps can be unnecessary overhead.",
      ],
      examples: [
        {
          before:
            "If a train leaves at 3pm going 60mph and another leaves at 4pm going 90mph in the same direction, when does the second catch the first?",
          after:
            "Solve this step by step, showing your work for each stage before giving the final answer: If a train leaves at 3pm going 60mph and another leaves at 4pm going 90mph in the same direction, when does the second catch the first?",
        },
        {
          before: "Plan my product launch.",
          after:
            "Let's plan my product launch in stages. First, just list the major phases (e.g. pre-launch, launch week, post-launch). I'll confirm before we detail each phase.",
        },
      ],
    },
    questions: [
      {
        prompt:
          "What is the main benefit of asking a model to \"think step by step\" for a multi-step math problem?",
        code: null,
        options: [
          "It makes the response noticeably shorter.",
          "It reduces the chance of jumping to a plausible-sounding but incorrect final answer.",
          "It guarantees a perfect answer every time.",
          "It has no measurable effect on accuracy.",
        ],
        correctIndex: 1,
        explanation:
          "Explicit step-by-step reasoning reduces (but doesn't eliminate) the chance of the model skipping straight to an unverified conclusion.",
        hint: "Think about what tends to go wrong when a model answers a hard question in one leap.",
      },
      {
        prompt:
          "You need a large task (\"plan my product launch\") handled reliably. What's a good strategy?",
        code: null,
        options: [
          "Ask for the entire detailed plan in a single massive prompt.",
          "Break it into stages — first a high-level outline, then detail each phase in follow-up prompts.",
          "Give no structure and let the model decide everything at once.",
          "Repeat the same prompt three times and pick the best answer.",
        ],
        correctIndex: 1,
        explanation:
          "Splitting a large task into a sequence of smaller, confirmable steps produces more reliable and reviewable results than one giant prompt.",
        hint: "Consider how you'd manage a complex project with a human collaborator.",
      },
      {
        prompt:
          "When is chain-of-thought prompting LEAST likely to be necessary?",
        code: null,
        options: [
          "When solving a multi-step logic puzzle.",
          "When answering a simple, direct factual question like \"What's the capital of France?\"",
          "When planning a multi-phase project.",
          "When debugging a tricky multi-condition bug.",
        ],
        correctIndex: 1,
        explanation:
          "Simple, single-step factual questions don't benefit much from forced step-by-step reasoning — the technique shines on multi-step or ambiguous tasks.",
        hint: "Which task here has no real intermediate steps?",
      },
    ],
  },
  {
    id: "format-constraints",
    level: 6,
    title: "Set Format & Constraints",
    subtitle: "Control exactly how the output looks",
    icon: "📐",
    learnMore: {
      context:
        "Even a well-specified, well-contextualized prompt can produce output in the wrong shape if you don't state the format. Explicit constraints — output format, length limits, things to avoid — turn a good prompt into a production-ready one, especially when the output feeds into another system or a strict template.",
      keyTakeaways: [
        "State the output format explicitly: JSON, markdown table, numbered list, plain prose.",
        "Set hard limits: word count, character count, number of items.",
        "State what to exclude, not just what to include (e.g. 'no emojis', 'no headers').",
        "For machine-readable output, specify the exact schema and forbid extra commentary.",
      ],
      examples: [
        {
          before: "List some good books.",
          after:
            "List exactly 5 books as a markdown table with columns Title, Author, and One-Line Reason. No commentary outside the table.",
        },
        {
          before: "Give me tags for this blog post.",
          after:
            'Return ONLY a JSON array of 3-5 lowercase tag strings, no explanation, e.g. ["prompting","ai","productivity"]',
        },
      ],
    },
    questions: [
      {
        prompt:
          "You need output that feeds directly into another program. What should your prompt specify?",
        code: null,
        options: [
          "Nothing extra — the model will pick a sensible format.",
          "The exact schema/format (e.g. JSON with specific keys) and an instruction to exclude extra commentary.",
          "Just ask for 'clean' output.",
          "Ask the model to make it 'as detailed as possible'.",
        ],
        correctIndex: 1,
        explanation:
          "Machine-readable output needs an explicit schema and an instruction against extra commentary, or downstream parsing will break.",
        hint: "Think about what a parser needs versus what a human reader needs.",
      },
      {
        prompt:
          "Which instruction most effectively constrains output length and structure?",
        code: null,
        options: [
          '"Keep it short."',
          '"Respond in exactly 3 bullet points, each under 15 words."',
          '"Don\'t make it too long."',
          '"Try to be concise if possible."',
        ],
        correctIndex: 1,
        explanation:
          "Exact counts (3 bullet points, under 15 words each) are unambiguous constraints, unlike vague terms like 'short' or 'concise'.",
        hint: "Look for concrete numbers rather than subjective words.",
      },
      {
        prompt: "Why is it useful to state what to EXCLUDE, not just include?",
        code: null,
        options: [
          "It isn't useful — inclusion rules are always sufficient.",
          "Because default model behavior (e.g. adding headers, emojis, or disclaimers) may not fit your use case unless explicitly turned off.",
          "Exclusion rules make prompts shorter.",
          "Models ignore inclusion rules unless exclusions are also given.",
        ],
        correctIndex: 1,
        explanation:
          "Models have default stylistic tendencies (headers, emojis, caveats); explicitly excluding what you don't want prevents those defaults from leaking into strict-format output.",
        hint: "Think about default habits a model might have that you didn't ask for.",
      },
    ],
  },
];

/* ============================================================================
 * HOOKS
 * ==========================================================================*/

/** Closes a modal on Escape key while it's open. */
function useEscapeKey(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);
}

/** Traps Tab focus inside a container while open, and restores focus on close. */
function useFocusTrap(containerRef, isOpen) {
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement;

    const container = containerRef.current;
    const getFocusable = () =>
      container
        ? Array.from(
            container.querySelectorAll(
              'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            )
          )
        : [];

    const focusables = getFocusable();
    if (focusables.length) focusables[0].focus();
    else container?.focus();

    const handleKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, containerRef]);
}

/* ============================================================================
 * CONFETTI (lightweight, dependency-free)
 * ==========================================================================*/

const CONFETTI_COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#f472b6"];

function ConfettiBurst({ active }) {
  const pieces = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 1.6 + Math.random() * 1.2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 6,
    }));
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: "-10px",
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rotate}deg)`,
            animation: `learnpage-confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes learnpage-confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ============================================================================
 * LEARN MORE MODAL
 * ==========================================================================*/

function LearnMoreModal({ lesson, onClose, onStartQuiz }) {
  const containerRef = useRef(null);
  useEscapeKey(true, onClose);
  useFocusTrap(containerRef, true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="learn-more-title"
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-purple-950/40 animate-[learnpage-modal-in_0.2s_ease-out]"
      >
        <style>{`
          @keyframes learnpage-modal-in {
            from { opacity: 0; transform: translateY(8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-white/10 bg-slate-900/90 px-6 py-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              {lesson.icon}
            </span>
            <div>
              <h2
                id="learn-more-title"
                className="text-lg font-semibold text-white"
              >
                {lesson.title}
              </h2>
              <p className="text-sm text-slate-400">{lesson.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close learn more panel"
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-purple-300">
              <BookOpen size={15} aria-hidden="true" /> Context
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              {lesson.learnMore.context}
            </p>
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-purple-300">
              <Sparkles size={15} aria-hidden="true" /> Key Takeaways
            </h3>
            <ul className="space-y-2">
              {lesson.learnMore.keyTakeaways.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm leading-relaxed text-slate-300"
                >
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-purple-300">
              Before &amp; After
            </h3>
            <div className="space-y-4">
              {lesson.learnMore.examples.map((ex, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div>
                    <span className="mb-1 inline-block rounded bg-rose-500/15 px-2 py-0.5 text-[11px] font-medium text-rose-300">
                      Before
                    </span>
                    <p className="text-sm text-slate-400 line-through decoration-rose-500/40">
                      {ex.before}
                    </p>
                  </div>
                  <div>
                    <span className="mb-1 inline-block rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                      After
                    </span>
                    <p className="text-sm text-slate-200">{ex.after}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 border-t border-white/10 bg-slate-900/90 px-6 py-4 backdrop-blur-xl">
          <button
            type="button"
            onClick={onStartQuiz}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-300 active:scale-[0.99]"
          >
            Take the Quiz <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * QUIZ MODAL (sequential, 3 questions)
 * ==========================================================================*/

function QuizModal({ lesson, onClose, onLessonCompleted, onQuestionSolved }) {
  const containerRef = useRef(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEscapeKey(true, onClose);
  useFocusTrap(containerRef, true);

  const totalQuestions = lesson.questions.length;
  const question = lesson.questions[questionIndex];
  const isLastQuestion = questionIndex === totalQuestions - 1;
  const isCorrect = submitted && selected === question.correctIndex;

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === question.correctIndex) {
      onQuestionSolved(lesson.id, questionIndex);
    }
  };

  const handleNext = () => {
    if (!isCorrect) return; // must answer correctly to advance
    if (isLastQuestion) {
      onLessonCompleted(lesson.id);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2200);
      return;
    }
    setQuestionIndex((i) => i + 1);
    setSelected(null);
    setSubmitted(false);
  };

  const handleRetry = () => {
    setSelected(null);
    setSubmitted(false);
  };

  const lessonJustFinished = isLastQuestion && isCorrect;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <ConfettiBurst active={showConfetti} />

      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-title"
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-purple-950/40 animate-[learnpage-modal-in_0.2s_ease-out]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <h2 id="quiz-title" className="text-lg font-semibold text-white">
              {lesson.title} Quiz
            </h2>
            <p className="text-sm text-slate-400">
              Question {questionIndex + 1} of {totalQuestions}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quiz"
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* progress bar */}
        <div
          className="h-1.5 w-full bg-white/5"
          role="progressbar"
          aria-valuenow={questionIndex + (lessonJustFinished ? 1 : 0)}
          aria-valuemin={0}
          aria-valuemax={totalQuestions}
          aria-label={`Quiz progress: question ${questionIndex + 1} of ${totalQuestions}`}
        >
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500 ease-out"
            style={{
              width: `${
                ((questionIndex + (lessonJustFinished ? 1 : 0)) /
                  totalQuestions) *
                100
              }%`,
            }}
          />
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <p className="text-sm font-medium text-slate-100">
              {question.prompt}
            </p>
            {question.code && (
              <pre className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-purple-200">
                <code>{question.code}</code>
              </pre>
            )}
          </div>

          <fieldset>
            <legend className="sr-only">Answer options</legend>
            <div className="space-y-2">
              {question.options.map((opt, i) => {
                const isSelected = selected === i;
                const isRight = submitted && i === question.correctIndex;
                const isWrongPick =
                  submitted && isSelected && i !== question.correctIndex;

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={submitted}
                    onClick={() => setSelected(i)}
                    aria-pressed={isSelected}
                    className={[
                      "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400",
                      isRight
                        ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100"
                        : isWrongPick
                        ? "border-rose-400/60 bg-rose-500/15 text-rose-100"
                        : isSelected
                        ? "border-purple-400/60 bg-purple-500/15 text-white"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10",
                      submitted ? "cursor-default" : "cursor-pointer",
                    ].join(" ")}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {submitted && (
            <div
              role="status"
              className={`rounded-xl border p-3 text-sm ${
                isCorrect
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                  : "border-amber-400/30 bg-amber-500/10 text-amber-100"
              }`}
            >
              <p className="mb-1 font-semibold">
                {isCorrect ? "Correct!" : "Not quite."}
              </p>
              <p className="text-slate-200/90">{question.explanation}</p>
              {!isCorrect && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-200/80">
                  <HelpCircle
                    size={13}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  Hint: {question.hint}
                </p>
              )}
            </div>
          )}

          {lessonJustFinished && (
            <div className="flex items-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/10 p-3 text-sm text-purple-100">
              <Award size={16} className="shrink-0" aria-hidden="true" />
              Lesson complete! Great work.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-slate-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {lessonJustFinished ? "Done" : "Exit quiz"}
          </button>

          {!submitted && (
            <button
              type="button"
              disabled={selected === null}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-transform enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              Submit
            </button>
          )}

          {submitted && !isCorrect && (
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              Try Again
            </button>
          )}

          {submitted && isCorrect && !lessonJustFinished && (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              Next Question <ChevronRight size={16} aria-hidden="true" />
            </button>
          )}

          {lessonJustFinished && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              Finish <CheckCircle2 size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * LESSON CARD
 * ==========================================================================*/

function LessonCard({ lesson, isUnlocked, isCompleted, onLearnMore, onQuiz }) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300",
        isUnlocked
          ? "border-white/10 bg-white/5 hover:border-purple-400/30 hover:bg-white/[0.07]"
          : "border-white/5 bg-white/[0.02] opacity-60",
      ].join(" ")}
    >
      {isCompleted && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
          <CheckCircle2 size={12} aria-hidden="true" /> Completed
        </div>
      )}

      <div className="mb-3 flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-xl"
          aria-hidden="true"
        >
          {isUnlocked ? lesson.icon : <Lock size={18} className="text-slate-500" />}
        </span>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-purple-300">
            Level {lesson.level}
          </span>
          <h3 className="text-base font-semibold text-white">
            {lesson.title}
          </h3>
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-400">{lesson.subtitle}</p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!isUnlocked}
          onClick={() => onLearnMore(lesson)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <BookOpen size={14} aria-hidden="true" /> Learn More
        </button>
        <button
          type="button"
          disabled={!isUnlocked}
          onClick={() => onQuiz(lesson)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-purple-900/30 transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          {isCompleted ? "Review Quiz" : "Take Mini-Test"}
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
 * MAIN PAGE
 * ==========================================================================*/

export default function LearnPage() {
  const [completedLessons, setCompletedLessons] = useState(() =>
    readJSON(STORAGE_KEYS.COMPLETED_LESSONS, [])
  );
  const [solvedQuestionsCount, setSolvedQuestionsCount] = useState(() =>
    readJSON(STORAGE_KEYS.SOLVED_QUESTIONS_COUNT, 0)
  );
  const [solvedQuestionKeys, setSolvedQuestionKeys] = useState(() =>
    readJSON(STORAGE_KEYS.SOLVED_QUESTION_KEYS, [])
  );

  const [learnMoreLesson, setLearnMoreLesson] = useState(null);
  const [quizLesson, setQuizLesson] = useState(null);

  // Persist on change
  useEffect(() => {
    writeJSON(STORAGE_KEYS.COMPLETED_LESSONS, completedLessons);
  }, [completedLessons]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.SOLVED_QUESTIONS_COUNT, solvedQuestionsCount);
  }, [solvedQuestionsCount]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.SOLVED_QUESTION_KEYS, solvedQuestionKeys);
  }, [solvedQuestionKeys]);

  const isLessonUnlocked = useCallback(
    (index) => {
      if (index === 0) return true;
      const prevLesson = LESSONS[index - 1];
      return completedLessons.includes(prevLesson.id);
    },
    [completedLessons]
  );

  const handleQuestionSolved = useCallback(
    (lessonId, questionIndex) => {
      const key = `${lessonId}-${questionIndex}`;
      setSolvedQuestionKeys((prev) => {
        if (prev.includes(key)) return prev;
        setSolvedQuestionsCount((count) => count + 1);
        return [...prev, key];
      });
    },
    []
  );

  const handleLessonCompleted = useCallback((lessonId) => {
    setCompletedLessons((prev) =>
      prev.includes(lessonId) ? prev : [...prev, lessonId]
    );
  }, []);

  const totalQuestions = useMemo(
    () => LESSONS.reduce((sum, l) => sum + l.questions.length, 0),
    []
  );

  const progressPct = Math.round(
    (completedLessons.length / LESSONS.length) * 100
  );

  const openLearnMore = (lesson) => setLearnMoreLesson(lesson);
  const openQuiz = (lesson) => {
    setLearnMoreLesson(null);
    setQuizLesson(lesson);
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_20%_-10%,rgba(139,92,246,0.15),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_40%)] px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="mb-1 text-2xl font-bold sm:text-3xl">
            Prompt Mentor — Learning Path
          </h1>
          <p className="text-sm text-slate-400">
            Six lessons, three questions each. Complete a lesson to unlock the
            next.
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <Award size={15} className="text-purple-300" aria-hidden="true" />
                {completedLessons.length} / {LESSONS.length} lessons complete
              </span>
              <span className="text-slate-400">
                {solvedQuestionsCount} / {totalQuestions} questions solved
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall course progress"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {LESSONS.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isUnlocked={isLessonUnlocked(index)}
              isCompleted={completedLessons.includes(lesson.id)}
              onLearnMore={openLearnMore}
              onQuiz={openQuiz}
            />
          ))}
        </div>
      </div>

      {learnMoreLesson && (
        <LearnMoreModal
          lesson={learnMoreLesson}
          onClose={() => setLearnMoreLesson(null)}
          onStartQuiz={() => openQuiz(learnMoreLesson)}
        />
      )}

      {quizLesson && (
        <QuizModal
          lesson={quizLesson}
          onClose={() => setQuizLesson(null)}
          onLessonCompleted={handleLessonCompleted}
          onQuestionSolved={handleQuestionSolved}
        />
      )}
    </div>
  );
}