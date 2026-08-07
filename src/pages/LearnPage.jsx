import { useState, useMemo, useCallback } from "react";
import {
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";

const LESSONS = [
  {
    id: 1,
    title: "Role & Persona Framing",
    tagline: "Tell the model who it is before you tell it what to do.",
    summary:
      "Assigning a role (\"You are a senior backend engineer...\") anchors tone, vocabulary, and the assumptions the model brings to your task.",
    questions: [
      {
        prompt:
          "Which system instruction best demonstrates strong role & persona framing?",
        code: null,
        options: [
          "\"Answer the question.\"",
          "\"You are a meticulous senior security auditor reviewing third-party code for vulnerabilities. Flag anything risky and explain why.\"",
          "\"Be helpful and friendly.\"",
          "\"Write some code that works.\"",
        ],
        correctIndex: 1,
        explanation:
          "It defines a specific expertise, a stance (meticulous, security-focused), and the lens to apply — that's what steers the model's behavior, not generic friendliness.",
        hint: "Look for the option that specifies expertise AND a concrete point of view, not just a mood.",
      },
    ],
  },
  {
    id: 2,
    title: "Context & Background Provisioning",
    tagline: "Give the model the world it needs to reason in.",
    summary:
      "Relevant background — audience, prior decisions, constraints — turns a guess into a grounded answer.",
    questions: [
      {
        prompt:
          "You're asking for marketing copy. Which prompt gives the model the context it needs?",
        code: null,
        options: [
          "\"Write a tagline for my app.\"",
          "\"Write a tagline for 'Ledger', a budgeting app aimed at freelancers who hate spreadsheets. Prior taglines felt too corporate; we want something warm and a little funny.\"",
          "\"Make it punchy.\"",
          "\"Give me 10 taglines, any style.\"",
        ],
        correctIndex: 1,
        explanation:
          "It names the product, the audience, the emotional goal, and what to avoid based on prior attempts — all context the model can't invent on its own.",
        hint: "The right answer supplies facts the model has no way of knowing otherwise.",
      },
    ],
  },
  {
    id: 3,
    title: "Specificity & Detail Precision",
    tagline: "Vague asks get vague answers.",
    summary:
      "Precise nouns, numbers, and boundaries shrink the space of plausible responses down to the one you actually want.",
    questions: [
      {
        prompt:
          "Which request is precise enough to reliably get a usable result on the first try?",
        code: null,
        options: [
          "\"Summarize this.\"",
          "\"Make it shorter.\"",
          "\"Summarize the attached report in exactly 3 bullet points, each under 20 words, focused only on financial risk.\"",
          "\"Give me the gist.\"",
        ],
        correctIndex: 2,
        explanation:
          "It fixes the format (bullets), the count (3), the length cap (20 words), and the lens (financial risk) — nothing is left to interpretation.",
        hint: "Count how many concrete constraints each option actually pins down.",
      },
    ],
  },
  {
    id: 4,
    title: "Negative Constraints & Guardrails",
    tagline: "Sometimes what NOT to do matters as much as what to do.",
    summary:
      "Explicit exclusions prevent common failure modes — filler, forbidden topics, unsafe suggestions — before they happen.",
    questions: [
      {
        prompt:
          "You want product descriptions without hype language. Which instruction is the effective guardrail?",
        code: null,
        options: [
          "\"Try not to be too much.\"",
          "\"Don't use superlatives like 'best', 'amazing', or 'revolutionary'. Stick to factual, measurable claims only.\"",
          "\"Keep it professional I guess.\"",
          "\"No bad words.\"",
        ],
        correctIndex: 1,
        explanation:
          "It names the exact words/patterns to avoid and states the positive alternative (factual, measurable claims) — a vague 'don't be too much' gives the model nothing concrete to enforce.",
        hint: "A real guardrail names specific things to avoid, not a general vibe.",
      },
    ],
  },
  {
    id: 5,
    title: "Output Structure Formatting",
    tagline: "Shape the answer before the model writes it.",
    summary:
      "Specifying format — JSON schema, table, headers, code block — makes output predictable and easy to parse or reuse.",
    questions: [
      {
        prompt:
          "You need the model's output to be parsed by another script. What should the prompt specify?",
        code: "{\n  \"name\": string,\n  \"price\": number\n}",
        options: [
          "Nothing — just ask for the data and hope it's consistent.",
          "\"Return only valid JSON matching this schema, no prose, no markdown fences: [schema above]\"",
          "\"List the products.\"",
          "\"Explain the products in a friendly way.\"",
        ],
        correctIndex: 1,
        explanation:
          "Locking the output to a strict, fenceless JSON schema is what makes downstream parsing reliable — anything else risks stray prose breaking the parser.",
        hint: "Think about what a script parsing the response would need to not crash.",
      },
    ],
  },
  {
    id: 6,
    title: "Few-Shot Examples (In-Context Learning)",
    tagline: "Show, don't just tell.",
    summary:
      "A couple of input/output examples teach the model your exact pattern faster and more reliably than instructions alone.",
    questions: [
      {
        prompt:
          "Which approach best uses few-shot examples to teach a custom classification format?",
        code: null,
        options: [
          "Describe the categories in a long paragraph and hope the model infers the format.",
          "Provide 2-3 example inputs paired with the exact labeled output format you want, then ask for the new input in the same form.",
          "Give one example with no explanation of why it's labeled that way.",
          "Skip examples — just say 'classify this' repeatedly.",
        ],
        correctIndex: 1,
        explanation:
          "Multiple paired examples in the exact target format let the model pattern-match your convention directly, which is far more reliable than a prose description alone.",
        hint: "Few-shot means multiple *paired* input→output demonstrations, not a single unexplained example.",
      },
    ],
  },
];

const TOTAL_LESSONS = LESSONS.length;

const LEVELS = [
  { threshold: 0, label: "Level 1", name: "Novice" },
  { threshold: 33, label: "Level 2", name: "Apprentice" },
  { threshold: 67, label: "Level 3", name: "Practitioner" },
  { threshold: 100, label: "Level 4", name: "Prompt Master" },
];

function getLevel(percent) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (percent >= lvl.threshold) current = lvl;
  }
  return current;
}

// ---------------------------------------------------------------------------
// Quiz Modal
// ---------------------------------------------------------------------------

function QuizModal({ lesson, onClose, onPass }) {
  const question = lesson.questions[0];
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selected === question.correctIndex;
  const isWrong = submitted && selected !== null && !isCorrect;

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === question.correctIndex) {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#34d399"],
      });
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setSubmitted(false);
  };

  const handleContinue = () => {
    onPass(lesson.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-300/80 font-semibold">
              Mini-Test &middot; Lesson {lesson.id}
            </p>
            <h3 className="font-heading text-xl text-white mt-1">
              {lesson.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Close quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-white/90 mb-3">{question.prompt}</p>

        {question.code && (
          <pre className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-emerald-300 overflow-x-auto mb-4">
            <code>{question.code}</code>
          </pre>
        )}

        <div className="space-y-2 mb-4">
          {question.options.map((option, idx) => {
            const isSelected = selected === idx;
            const showCorrect = submitted && idx === question.correctIndex;
            const showIncorrectPick =
              submitted && isSelected && idx !== question.correctIndex;

            return (
              <button
                key={idx}
                disabled={submitted}
                onClick={() => setSelected(idx)}
                className={[
                  "w-full text-left rounded-xl border px-4 py-3 text-sm transition-all",
                  "flex items-center gap-3",
                  showCorrect
                    ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-200"
                    : showIncorrectPick
                    ? "border-red-400/70 bg-red-400/10 text-red-200"
                    : isSelected
                    ? "border-indigo-400/70 bg-indigo-400/10 text-white"
                    : "border-white/10 bg-white/5 text-white/80 hover:border-indigo-300/50 hover:bg-white/10",
                  submitted ? "cursor-default" : "cursor-pointer",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    isSelected || showCorrect
                      ? "border-current"
                      : "border-white/30",
                  ].join(" ")}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {submitted && (
          <div
            className={[
              "rounded-xl border p-4 mb-4 flex gap-3 text-sm",
              isCorrect
                ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100"
                : "border-red-400/50 bg-red-400/10 text-red-100",
            ].join(" ")}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-300" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-300" />
            )}
            <div>
              <p className="font-semibold mb-1">
                {isCorrect ? "Correct!" : "Not quite."}
              </p>
              <p className="text-white/80">
                {isCorrect ? question.explanation : question.hint}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          )}

          {isWrong && (
            <button
              onClick={handleRetry}
              className="btn-primary flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          )}

          {isCorrect && (
            <button
              onClick={handleContinue}
              className="btn-primary flex items-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson Card
// ---------------------------------------------------------------------------

function LessonCard({ lesson, index, isCompleted, isUnlocked, onOpenQuiz }) {
  const state = isCompleted ? "completed" : isUnlocked ? "unlocked" : "locked";

  const cardClasses = {
    completed:
      "glass-panel border border-emerald-400/40 bg-emerald-400/5",
    unlocked: "glass-panel-glow border border-indigo-400/50",
    locked: "glass-panel border border-white/5 opacity-50",
  }[state];

  return (
    <div className={`rounded-2xl p-5 sm:p-6 transition-all duration-300 ${cardClasses}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Lesson {index + 1} / {TOTAL_LESSONS}
        </span>
        {state === "completed" && (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        )}
        {state === "locked" && <Lock className="w-5 h-5 text-white/40" />}
        {state === "unlocked" && (
          <Sparkles className="w-5 h-5 text-indigo-300" />
        )}
      </div>

      <h3 className="font-heading text-lg text-white mb-1">{lesson.title}</h3>
      <p className="text-sm text-white/60 mb-4">{lesson.tagline}</p>

      {state !== "locked" ? (
        <button
          onClick={() => onOpenQuiz(lesson.id)}
          className={
            state === "completed"
              ? "w-full rounded-lg border border-emerald-400/40 bg-emerald-400/10 text-emerald-200 text-sm font-medium py-2 hover:bg-emerald-400/20 transition-colors"
              : "btn-primary w-full justify-center"
          }
        >
          {state === "completed" ? "Review Quiz" : "Take Mini-Test"}
        </button>
      ) : (
        <button
          disabled
          className="w-full rounded-lg border border-white/10 bg-white/5 text-white/40 text-sm font-medium py-2 cursor-not-allowed"
        >
          Locked
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LearnPage
// ---------------------------------------------------------------------------

export default function LearnPage({ onOpenFlashcards }) {
  const [completedLessons, setCompletedLessons] = useState([1]);
  const [activeQuizModal, setActiveQuizModal] = useState(null);

  const percent = useMemo(
    () => Math.round((completedLessons.length / TOTAL_LESSONS) * 100),
    [completedLessons]
  );

  const level = useMemo(() => getLevel(percent), [percent]);

  const isUnlocked = useCallback(
    (lesson, index) =>
      index === 0 || completedLessons.includes(lesson.id - 1),
    [completedLessons]
  );

  const handleOpenQuiz = (lessonId) => setActiveQuizModal(lessonId);
  const handleCloseQuiz = () => setActiveQuizModal(null);

  const handlePass = (lessonId) => {
    setCompletedLessons((prev) =>
      prev.includes(lessonId) ? prev : [...prev, lessonId]
    );
  };

  const activeLesson = LESSONS.find((l) => l.id === activeQuizModal) || null;

  return (
    <div className="min-h-screen w-full px-4 sm:px-8 py-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-indigo-300/80 font-semibold mb-2">
          Prompt Mentor &middot; Learning Path
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl text-white mb-2">
          <span className="text-gradient">Master Prompt Engineering</span>
        </h1>
        <p className="text-white/60 max-w-xl">
          Work through each lesson in order. Pass the mini-test to unlock the
          next one.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-heading text-white text-lg">
              {level.label}
            </span>
            <span className="text-white/50 text-sm ml-2">{level.name}</span>
          </div>
          <span className="text-2xl font-bold text-gradient">{percent}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(129,140,248,0.6)]"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-white/40 mt-2">
          {completedLessons.length} / {TOTAL_LESSONS} lessons completed
        </p>
      </div>

      {/* Lesson Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {LESSONS.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={index}
            isCompleted={completedLessons.includes(lesson.id)}
            isUnlocked={isUnlocked(lesson, index)}
            onOpenQuiz={handleOpenQuiz}
          />
        ))}
      </div>

      {/* Optional entry point into existing flashcards flow */}
      {onOpenFlashcards && (
        <div className="mt-10 text-center">
          <button
            onClick={onOpenFlashcards}
            className="text-sm text-white/50 hover:text-white underline underline-offset-4 transition-colors"
          >
            Prefer flashcards? Switch to flashcard practice
          </button>
        </div>
      )}

      {/* Quiz Modal */}
      {activeLesson && (
        <QuizModal
          lesson={activeLesson}
          onClose={handleCloseQuiz}
          onPass={handlePass}
        />
      )}
    </div>
  );
}