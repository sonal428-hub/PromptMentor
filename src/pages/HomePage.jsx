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
        <div className="absolute top-[10%] left-[25%] w-[700px] h-[700px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute top-[15%] right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/8 blur-[110px]" />
        {/* Orbital ring decoration (right side) */}
        <div className="absolute top-[10%] right-[3%] w-[520px] h-[520px] rounded-full border border-white/[0.04] hidden lg:block" />
        <div className="absolute top-[14%] right-[6%] w-[450px] h-[450px] rounded-full border border-white/[0.03] hidden lg:block" />
      </div>

      <div className="relative z-10 text-gray-100 p-4 sm:p-6 lg:p-10 space-y-12 max-w-7xl mx-auto">

        {/* Hero Section: Text Left + Penguin Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-2 items-center pt-4 lg:pt-8 pb-2">

          {/* Left: Text content (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-7 space-y-5 relative pr-0 lg:pr-2"
          >
            {/* Sparkle decorations */}
            <Sparkle className="absolute -top-6 -left-2 text-violet-400/80" size={20} delay={0} />
            <Sparkle className="absolute top-20 -left-8 text-indigo-300/60" size={28} delay={0.5} />
            <Sparkle className="absolute bottom-16 left-[70%] text-violet-300/50" size={18} delay={1.2} />

            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-violet-400 mb-1"
            >
              Main Feature
            </motion.span>

            {/* Hero Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl sm:text-6xl lg:text-[4.6rem] xl:text-[5.2rem] font-black tracking-tight font-heading leading-[1.05] text-white"
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
              className="text-slate-300 text-lg sm:text-xl font-medium leading-relaxed max-w-xl font-sans"
            >
              PromptMentor teaches you to ask AI better questions,
              <br className="hidden sm:block" />
              one prompt at a time.
            </motion.p>

            {/* Get Started Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="pt-2"
            >
              <button
                onClick={() => navigate('/improve')}
                className="group relative px-9 py-4 rounded-xl font-bold text-base text-white bg-transparent border-2 border-violet-500/70 hover:border-violet-400 hover:bg-violet-500/15 transition-all duration-300 shadow-xl shadow-violet-500/15 hover:shadow-violet-500/30 active:scale-95"
              >
                <span className="relative z-10 tracking-wide">Get Started</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/25 to-indigo-600/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right: Penguin Mascot (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-5 flex justify-center lg:justify-center relative mt-6 lg:mt-0"
          >
            {/* Sparkles around penguin */}
            <Sparkle className="absolute -top-4 right-[15%] text-white/90" size={22} delay={0.3} />
            <Sparkle className="absolute top-[20%] -right-2 text-cyan-300/70" size={16} delay={0.8} />
            <Sparkle className="absolute bottom-[20%] right-[80%] text-violet-300/60" size={20} delay={1.5} />

            {/* Penguin circle frame */}
            <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px] xl:w-[480px] xl:h-[480px]">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-700/50 via-slate-800/70 to-slate-900/90 border border-white/15 shadow-2xl shadow-violet-950/40" />
              {/* Penguin image */}
              <img
                src="/images/penguin_mascot.png"
                alt="PromptMentor Penguin Mascot"
                className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-contain rounded-full drop-shadow-2xl"
                onError={(e) => {
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
