import React, { useState, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

export default function ResizablePanel({ leftChild, rightChild, initialLeftWidth = 52 }) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      // Clamp between 25% and 75%
      setLeftWidth(Math.min(75, Math.max(25, newWidth)));
    };

    const handleTouchMove = (e) => {
      if (!isDragging || !containerRef.current || !e.touches[0]) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.touches[0].clientX - containerRect.left) / containerRect.width) * 100;
      setLeftWidth(Math.min(75, Math.max(25, newWidth)));
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleResetWidth = () => {
    setLeftWidth(50);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col md:flex-row h-[calc(100vh-65px)] overflow-hidden select-none ${
        isDragging ? 'cursor-col-resize' : ''
      }`}
    >
      {/* Left Panel: Prompt & Coaching */}
      <div
        className="w-full md:h-full flex flex-col transition-none overflow-hidden"
        style={{ width: window.innerWidth >= 768 ? `${leftWidth}%` : '100%' }}
      >
        {leftChild}
      </div>

      {/* Vertical Resizable Divider Bar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleResetWidth}
        title="Drag left/right to resize panels (Double click to reset)"
        className={`hidden md:flex w-2.5 hover:w-3 bg-slate-900/90 border-x border-white/10 hover:border-violet-500/50 cursor-col-resize items-center justify-center transition-all group relative z-20 flex-shrink-0 ${
          isDragging ? 'bg-violet-600/30 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : ''
        }`}
      >
        <div className="h-10 w-full flex items-center justify-center opacity-60 group-hover:opacity-100 text-violet-400">
          <GripVertical className="w-4 h-4" />
        </div>
        {/* Glow indicator line on hover/drag */}
        <div
          className={`absolute inset-y-0 w-0.5 bg-gradient-to-b from-violet-500 via-indigo-400 to-emerald-400 transition-opacity ${
            isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        />
      </div>

      {/* Right Panel: AI Score & Comparison */}
      <div
        className="w-full md:h-full flex flex-col transition-none overflow-hidden"
        style={{ width: window.innerWidth >= 768 ? `${100 - leftWidth}%` : '100%' }}
      >
        {rightChild}
      </div>
    </div>
  );
}
