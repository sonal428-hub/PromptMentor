import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function GetStartedButton({ onClick, className = "" }) {
  return (
    <Button
      onClick={onClick}
      className={`group relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/25 ${className}`}
      size="lg"
    >
      <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">
        Get Started
      </span>
      <i className="absolute right-1 top-1 bottom-1 rounded-sm z-10 grid w-1/4 place-items-center transition-all duration-500 bg-white/20 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95 text-white not-italic">
        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
      </i>
    </Button>
  );
}

export function GetStartedButtonDemo() {
  return <GetStartedButton />;
}
