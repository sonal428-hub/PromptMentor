import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Zap, Layers } from 'lucide-react';
import { ServiceCard } from '@/components/ui/service-card';

export default function HomePage() {
  const navigate = useNavigate();

  const services = [
    {
      title: "Prompt Improve",
      href: "/improve",
      imgSrc: "/images/card_improve.png",
      imgAlt: "3D glass lightbulb with blue liquid splash",
      variant: "purple",
      badge: "Main Feature",
      description: "Collaborative AI prompt coach with live AI quality score (0–100), specificity meter, and dual LLM output comparison."
    },
    {
      title: "Learn Prompting",
      href: "/learn",
      imgSrc: "/images/card_learn.png",
      imgAlt: "3D floating book and graduation cap",
      variant: "blue",
      badge: "Interactive Modules",
      description: "Master prompt engineering fundamentals through step-by-step interactive flashcards and real-world prompt examples."
    },
    {
      title: "Develop",
      href: "/develop",
      imgSrc: "/images/card_leaderboard.png",
      imgAlt: "3D metallic gold trophy cup",
      variant: "gray",
      badge: "Community",
      description: "Explore high-scoring prompts crafted by the community, categorized by domain, quality score, and precision benchmarks."
    },
    {
      title: "Track Progress",
      href: "/progress",
      imgSrc: "/images/card_progress.png",
      imgAlt: "3D futuristic glass bar chart",
      variant: "emerald",
      badge: "Analytics",
      description: "Review your personal prompt improvement radar, historical score deltas, specificity metrics, and shareable cards."
    },
  ];

  // Sparkle star SVG component
  const Sparkle = ({ className, size = 20, delay = 0 }) => (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0.6, 1], scale: [0.5, 1, 0.9, 1] }}
      transition={{ duration: 2, delay, repeat: Infinity, repeatType: "reverse" }}
    >
      <path
        d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z"
        fill="currentColor"
      />
    </motion.svg>
  );

  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-[#0a0e1a]">

      {/* Deep dark gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#131838] to-[#0a0e1a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a] via-[#1a1040]/40 to-[#0a0e1a]" />
        {/* Subtle radial glow behind hero */}
        <div className="absolute top-[10%] left-[30%] w-[600px] h-[600px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-indigo-500/6 blur-[100px]" />
        {/* Orbital ring decoration (right side) */}
        <div className="absolute top-[15%] right-[5%] w-[420px] h-[420px] rounded-full border border-white/[0.04] hidden lg:block" />
        <div className="absolute top-[18%] right-[8%] w-[360px] h-[360px] rounded-full border border-white/[0.03] hidden lg:block" />
      </div>

      <div className="relative z-10 text-gray-100 p-6 lg:p-12 space-y-14 max-w-7xl mx-auto">

        {/* Hero Section: Text Left + Penguin Right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center pt-8 lg:pt-14 pb-4">

          {/* Left: Text content (3 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-3 space-y-6 relative"
          >
            {/* Sparkle decorations */}
            <Sparkle className="absolute -top-4 -left-2 text-violet-400/70" size={16} delay={0} />
            <Sparkle className="absolute top-16 -left-10 text-indigo-300/50" size={24} delay={0.5} />
            <Sparkle className="absolute bottom-20 left-[60%] text-violet-300/40" size={14} delay={1.2} />

            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-violet-400 mb-2"
            >
              Main Feature
            </motion.span>

            {/* Hero Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-[3.8rem] font-black tracking-tight font-heading leading-[1.08] text-white"
            >
              Write Better{' '}
              <br className="hidden sm:block" />
              Prompts with{' '}
              <br className="hidden sm:block" />
              Live AI Coaching
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-slate-400 text-base sm:text-lg font-normal leading-relaxed max-w-lg font-sans"
            >
              PromptMentor teaches you to ask AI better questions,
              <br className="hidden sm:block" />
              one prompt at a time.
            </motion.p>

            {/* Get Started Button - matching screenshot style */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="pt-2"
            >
              <button
                onClick={() => navigate('/improve')}
                className="group relative px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-transparent border-2 border-violet-500/60 hover:border-violet-400 hover:bg-violet-500/10 transition-all duration-300 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/25 active:scale-95"
              >
                <span className="relative z-10 tracking-wide">Get Started</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right: Penguin Mascot (2 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-2 flex justify-center lg:justify-end relative"
          >
            {/* Sparkles around penguin */}
            <Sparkle className="absolute -top-2 right-[20%] text-white/80" size={18} delay={0.3} />
            <Sparkle className="absolute top-[15%] -right-4 text-cyan-300/60" size={12} delay={0.8} />
            <Sparkle className="absolute bottom-[25%] right-[85%] text-violet-300/50" size={16} delay={1.5} />

            {/* Penguin circle frame */}
            <div className="relative w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] lg:w-[360px] lg:h-[360px]">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-700/40 via-slate-800/60 to-slate-900/80 border border-white/10 shadow-2xl shadow-violet-950/30" />
              {/* Penguin image */}
              <img
                src="/images/penguin_mascot.png"
                alt="PromptMentor Penguin Mascot"
                className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-contain rounded-full drop-shadow-2xl"
                onError={(e) => {
                  // Fallback to emoji if image is missing
                  e.target.style.display = 'none';
                  e.target.parentElement.querySelector('.fallback-emoji').style.display = 'flex';
                }}
              />
              <div className="fallback-emoji absolute inset-0 rounded-full flex items-center justify-center text-8xl" style={{ display: 'none' }}>
                🐧
              </div>
            </div>
          </motion.div>
        </div>

        {/* 4 Main Service Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2"
        >
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
        </motion.div>

        {/* Highlights / Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10"
        >
          <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/5 space-y-2 hover:border-violet-500/30 transition-all">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4" />
              AI Score (0–100)
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Real-time score judged by Gemini AI across persona, context, specificity, and constraints.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/5 space-y-2 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              Dual LLM Output Compare
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Run original vs refined prompts simultaneously and get an AI comparison of quality differences.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/5 space-y-2 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              Interactive Learning
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Master prompt engineering with flashcards, progressive modules, and real-world prompt examples.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
