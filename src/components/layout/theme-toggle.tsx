"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavbarVariant } from "./app-shell";

interface ThemeToggleProps {
  variant?: NavbarVariant;
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isCinematic = variant === "cinematic";

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const handleToggleClick = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9">
        <div className={cn(
          "size-4 animate-pulse rounded-full",
          isCinematic ? "bg-white/20" : "bg-muted"
        )} />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleClick}
      aria-label="Toggle theme"
      className={cn(
        "relative z-[10001] size-9 no-theme-transition",
        isCinematic ? "text-white hover:bg-white/10" : ""
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2, ease: "circOut" }}
          >
            <Moon className={cn("size-4", isCinematic ? "text-white" : "text-foreground")} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ scale: 0.5, opacity: 0, rotate: 90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2, ease: "circOut" }}
          >
            <Sun className={cn("size-4", isCinematic ? "text-white" : "text-foreground")} />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
