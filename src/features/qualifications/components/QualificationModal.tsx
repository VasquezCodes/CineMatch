"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QualificationSelector } from "./QualificationSelector";
import { getUserMovieQualitiesGrouped } from "../actions";
import type { QualityCategoryWithSelection } from "../types";
import { Loader2, Film, AlertCircle } from "lucide-react";

interface QualificationModalProps {
  movieId: string;
  movieTitle: string;
  children: React.ReactNode;
}

export function QualificationModal({
  movieId,
  movieTitle,
  children,
}: QualificationModalProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<QualityCategoryWithSelection[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadCategories();
    } else {
      // Reset state when closing to ensure fresh data on next open
      setCategories(null);
    }
  }, [open]);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);

    const result = await getUserMovieQualitiesGrouped(movieId);

    if (result.error || !result.data) {
      setError(result.error || "Error al cargar las cualificaciones");
    } else {
      setCategories(result.data);
    }

    setLoading(false);
  };

  const totalSelected = categories?.reduce(
    (acc, cat) => acc + cat.qualities.filter((q) => q.selected).length,
    0
  ) || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl">
        {/* Header Orgánico */}
        <div className="shrink-0 relative px-6 pt-8 pb-4 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
          <DialogHeader className="items-center sm:items-center">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4 animate-bounce-slow">
              <Film className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-balance">
              ¿Qué te dejó esta película?
            </DialogTitle>
            <DialogDescription className="text-base text-foreground/60 font-medium">
              Explora y elige lo que más te resonó de <span className="text-primary font-bold">{movieTitle}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-8 flex flex-col">
          {loading && (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
                <div className="absolute inset-0 h-12 w-12 animate-ping text-primary/10">
                  <Loader2 className="h-12 w-12" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium tracking-widest uppercase">
                Invocando sensaciones...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="p-4 rounded-3xl bg-destructive/5 border border-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive/50" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-destructive">Algo no salió como esperábamos</p>
                <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && categories && (
            <div className="flex-1 flex flex-col">
              <QualificationSelector
                movieId={movieId}
                categories={categories}
                onComplete={() => {
                  setOpen(false);
                  toast.success("Tu visión ha sido guardada", {
                    description: "Tus impresiones son ahora parte de tu historia."
                  });
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
