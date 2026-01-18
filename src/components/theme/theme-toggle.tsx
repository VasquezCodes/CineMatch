"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavbarVariant } from "../layout/app-shell";

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
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9">
        <div
          className={cn(
            "size-4 animate-pulse rounded-full",
            isCinematic ? "bg-white/20" : "bg-muted"
          )}
        />
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
        "relative size-9",
        isCinematic ? "text-white hover:bg-white/10" : ""
      )}
    >
      {isDark ? (
        <Moon
          className={cn(
            "size-4",
            isCinematic ? "text-white" : "text-foreground"
          )}
        />
      ) : (
        <Sun
          className={cn(
            "size-4",
            isCinematic ? "text-white" : "text-foreground"
          )}
        />
      )}
    </Button>
  );
}
