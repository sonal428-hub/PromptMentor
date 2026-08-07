import * as React from "react";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils"; // Your shadcn/ui utils file

// CVA for card variants
const cardVariants = cva(
  "relative flex flex-col justify-between w-full p-6 overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ease-in-out group hover:shadow-2xl cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-slate-900/80 text-card-foreground border border-white/10 hover:border-violet-500/40",
        red: "bg-rose-950/70 text-rose-100 border border-rose-500/30 hover:border-rose-500/60",
        blue: "bg-blue-950/70 text-blue-100 border border-blue-500/30 hover:border-blue-500/60",
        gray: "bg-slate-900/80 text-gray-200 border border-white/10 hover:border-white/25",
        purple: "bg-violet-950/80 text-violet-100 border border-violet-500/40 shadow-[0_0_25px_rgba(139,92,246,0.18)] hover:border-violet-500/70",
        emerald: "bg-emerald-950/70 text-emerald-100 border border-emerald-500/40 hover:border-emerald-500/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const ServiceCard = React.forwardRef(
  ({ className, variant, title, href, imgSrc, imgAlt, description, badge, onClick, ...props }, ref) => {
    
    // Animation variants for Framer Motion
    const cardAnimation = {
      hover: {
        scale: 1.025,
        transition: { duration: 0.3 },
      },
    };

    const imageAnimation = {
      hover: {
        scale: 1.15,
        rotate: 4,
        x: -5,
        y: -5,
        transition: { duration: 0.4, ease: "easeInOut" },
      },
    };
    
    const arrowAnimation = {
      hover: {
        x: 5,
        transition: { duration: 0.3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
      }
    };

    return (
      <motion.div
        className={cn(cardVariants({ variant, className }))}
        ref={ref}
        variants={cardAnimation}
        whileHover="hover"
        onClick={onClick}
        {...props}
      >
        <div className="relative z-10 flex flex-col h-full space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-bold tracking-tight font-heading">{title}</h3>
            {badge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-violet-300 border border-white/20">
                {badge}
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs text-gray-300 leading-relaxed max-w-[75%]">{description}</p>
          )}

          <a
            href={href}
            onClick={(e) => {
              if (onClick) {
                e.preventDefault();
                onClick(e);
              }
            }}
            aria-label={`Learn more about ${title}`}
            className="mt-auto flex items-center text-xs font-bold tracking-wider group-hover:underline text-violet-400 group-hover:text-violet-300 pt-3"
          >
            LEARN MORE
            <motion.div variants={arrowAnimation}>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </motion.div>
          </a>
        </div>
        
        {imgSrc && (
          <motion.img
            src={imgSrc}
            alt={imgAlt || title}
            className="absolute -right-4 -bottom-4 w-44 h-44 object-contain mix-blend-screen opacity-90 group-hover:opacity-100 pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
            variants={imageAnimation}
          />
        )}
      </motion.div>
    );
  }
);
ServiceCard.displayName = "ServiceCard";

export { ServiceCard };
