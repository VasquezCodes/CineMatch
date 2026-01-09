"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function MovieBackButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} variant="secondary" size="sm">
      <ArrowLeft className="h-4 w-4 mr-2" />
      Volver
    </Button>
  );
}
