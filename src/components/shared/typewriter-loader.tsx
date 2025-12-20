"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TypewriterLoaderProps {
  messages: string[];
  speed?: number;
  duration?: number;
  onFinished?: () => void;
  className?: string;
}

export const TypewriterLoader = ({
  messages,
  speed = 20,
  duration = 3000,
  onFinished,
  className,
}: TypewriterLoaderProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const val = Math.min((elapsed / duration) * 100, 100);
      setProgress(val);
      if (val >= 100) {
        if (progressIntervalRef.current)
          clearInterval(progressIntervalRef.current);
        onFinished?.();
      }
    }, 16);
    return () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, [duration, onFinished]);

  useEffect(() => {
    if (messages.length > 1) {
      const timer = setTimeout(() => setCurrentMessageIndex(1), 1500);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  useEffect(() => {
    let charIndex = 0;
    const fullText = messages[currentMessageIndex];
    setDisplayText("");
    const typingInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayText(fullText.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);
    return () => clearInterval(typingInterval);
  }, [currentMessageIndex, messages, speed]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 space-y-8 font-body",
        className
      )}
    >
      <div className="h-16 flex items-center justify-center w-full overflow-hidden text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-lg font-medium text-foreground tracking-tight italic font-body">
              {displayText}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="w-full space-y-3">
        <Progress value={progress} className="h-1.5 transition-none" />
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold font-body">
            Procesando archivo
          </span>
          <span className="text-xs tabular-nums font-medium text-primary font-body">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
};
