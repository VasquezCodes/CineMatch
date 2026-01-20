"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface MovieBackButtonProps {
  variant?: "dark" | "light";
}

export function MovieBackButton({ variant = "dark" }: MovieBackButtonProps) {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      variant="ghost"
      size="sm"
      className={cn(
        "backdrop-blur-md border transition-all shadow-lg",
        variant === "light"
          ? "text-foreground hover:bg-background/90 border-border/40 bg-background/80"
          : "text-white hover:text-white hover:bg-white/20 border-white/10 bg-black/40"
      )}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Volver
    </Button>
  );
}
