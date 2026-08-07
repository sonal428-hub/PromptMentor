import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Zap, Layers } from 'lucide-react';
import { ServiceCard } from '@/components/ui/service-card';
import { GetStartedButton } from '@/components/ui/get-started-button';
import AnimatedGradientBackground from '@/components/ui/animated-gradient-background';

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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AnimatedGradientBackground
          Breathing={true}
          animationSpeed={0.03}
          breathingRange={4}
          startingGap={120}
          topOffset={-20}
          gradientColors={[
            '#020617',
            '#1e1b4b',
            '#4c1d95',
            '#7c3aed',
            '#6366f1',
            '#0ea5e9',
            '#020617'
          ]}
          gradientStops={[20, 35, 50, 60, 70, 80, 100]}
          containerClassName="pointer-events-none"
        />
      </div>

      <div className="relative z-10 text-gray-100 p-6 lg:p-12 space-y-12 max-w-7xl mx-auto">
        
        {/* Animated Hero Section without the tag */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto pt-6 pb-2 flex flex-col items-center space-y-6"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight font-heading leading-[1.1] bg-gradient-to-r from-white via-violet-200 via-indigo-200 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_10px_25px_rgba(124,58,237,0.3)]"
          >
            Write Better Prompts with Live AI Coaching
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-slate-300 text-base sm:text-xl font-normal leading-relaxed max-w-2xl font-sans tracking-wide opacity-90"
          >
            PromptMentor teaches specificity, context, constraints, and roles in real time — leaving you skilled at prompt engineering on your own over time.
          </motion.p>

          <motion.div variants={itemVariants} className="pt-4">
            <GetStartedButton onClick={() => navigate('/improve')} />
          </motion.div>
        </motion.div>

        {/* 4 Main Service Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
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
          transition={{ duration: 0.8, delay: 0.6 }}
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
              Resizable Split View
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Draggable divider handle between coach panel and score panel for custom workspace layout.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
