import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Award, Zap, Layers } from 'lucide-react';
import { ServiceCard } from '@/components/ui/service-card';
import { GetStartedButton } from '@/components/ui/get-started-button';

export default function HomePage() {
  const navigate = useNavigate();

  const services = [
    {
      title: "Prompt Improve",
      href: "/improve",
      imgSrc: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=320&q=75",
      imgAlt: "AI Prompt Workbench Illustration",
      variant: "purple",
      badge: "Main Feature",
      description: "Collaborative AI prompt coach with draggable split panels, live AI quality score (0–100), specificity meter, and dual LLM output comparison."
    },
    {
      title: "Learn Prompting",
      href: "/learn",
      imgSrc: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=320&q=75",
      imgAlt: "Interactive learning illustration",
      variant: "blue",
      badge: "Interactive Modules",
      description: "Master prompt engineering fundamentals through step-by-step interactive flashcards, progressive disclosure cards, and real-world prompt examples."
    },
    {
      title: "Leaderboard",
      href: "/leaderboard",
      imgSrc: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=320&q=75",
      imgAlt: "Community showcase illustration",
      variant: "gray",
      badge: "Community",
      description: "Explore high-scoring prompts crafted by the community, categorized by domain, quality score, and precision benchmarks."
    },
    {
      title: "Track Progress",
      href: "/progress",
      imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=320&q=75",
      imgAlt: "Analytics dashboard illustration",
      variant: "emerald",
      badge: "Analytics",
      description: "Review your personal prompt improvement radar, historical score deltas, specificity metrics, and shareable prompt glow-up cards."
    },
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-gray-100 p-6 lg:p-12 space-y-10 max-w-7xl mx-auto">

      {/* Hero Section */}
      <div className="text-center space-y-5 max-w-3xl mx-auto pt-4 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
          <span>Real-Time Collaborative Prompt Engineering</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient font-heading leading-tight">
          Write Better Prompts with Live AI Coaching
        </h1>

        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          PromptMentor teaches specificity, context, constraints, and roles in real time — leaving you skilled at prompt engineering on your own over time, rather than hiding fixes behind the scenes.
        </p>

        <div className="pt-3">
          <GetStartedButton onClick={() => navigate('/improve')} />
        </div>
      </div>

      {/* 4 Main Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        {services.map((service) => (
          <ServiceCard
            key={service.title}
            title={service.title}
            href={service.href}
            imgSrc={service.imgSrc}
            imgAlt={service.imgAlt}
            variant={service.variant}
            badge={service.badge}
            description={service.description}
            onClick={() => navigate(service.href)}
            className="min-h-[200px]"
          />
        ))}
      </div>

      {/* Highlights / Features Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-violet-400 font-bold text-xs">
            <Award className="w-4 h-4" />
            AI Score (0–100)
          </div>
          <p className="text-xs text-gray-400">
            Real-time score judged by Gemini AI across persona, context, specificity, and constraints.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Zap className="w-4 h-4" />
            Dual LLM Output Compare
          </div>
          <p className="text-xs text-gray-400">
            Run original vs refined prompts simultaneously and get an AI comparison of quality differences.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
            <Layers className="w-4 h-4" />
            Resizable Split View
          </div>
          <p className="text-xs text-gray-400">
            Draggable divider handle between coach panel and score panel for custom workspace layout.
          </p>
        </div>
      </div>

    </div>
  );
}
