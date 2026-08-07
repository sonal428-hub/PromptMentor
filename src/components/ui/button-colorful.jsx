import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export function ButtonColorful({
  className,
  label = "Explore Components",
  icon: Icon = ArrowUpRight,
  children,
  active = false,
  ...props
}) {
  return (
    <Button
      className={cn(
        "relative h-9 px-3 text-xs rounded-xl overflow-hidden font-medium",
        "bg-slate-900/80 backdrop-blur-md text-gray-300 hover:text-white",
        "border border-white/10 hover:border-violet-500/40",
        "transition-all duration-300 shadow-sm",
        active && "bg-slate-900 border-violet-500/60 text-white font-semibold shadow-violet-500/20 shadow-md",
        "group",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          active
            ? "bg-gradient-to-r from-violet-600/40 via-indigo-500/40 to-emerald-500/30 opacity-80"
            : "bg-gradient-to-r from-violet-600/20 via-indigo-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-60",
          "blur-sm transition-opacity duration-300"
        )}
      />

      <div className="relative z-10 flex items-center justify-center gap-1.5">
        {children ? (
          children
        ) : (
          <>
            <span className="text-gray-200 group-hover:text-white transition-colors">{label}</span>
            {Icon && <Icon className="w-3.5 h-3.5 text-violet-400 group-hover:text-violet-300 transition-colors" />}
          </>
        )}
      </div>
    </Button>
  );
}

export function ButtonDemo() {
  return <ButtonColorful />;
}

export default ButtonColorful;
