"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function MovieBackButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      variant="ghost"
      size="sm"
      className="text-white hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/10 bg-black/30 transition-all"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Volver
    </Button>
  );
}
