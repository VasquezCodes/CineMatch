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
    if (open && !categories) {
      loadCategories();
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
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header Cinematográfico */}
        <div className="shrink-0 relative bg-gradient-to-br from-primary/5 to-transparent px-6 pt-6 pb-4 border-b border-border/30">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Cualificar Película
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-foreground/80 font-medium">
              {movieTitle}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content Area - Flex Grow para ocupar espacio disponible */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 flex flex-col">
          {loading && (
            <div className="h-full flex flex-col items-center justify-center gap-4 animate-fadeIn">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 h-10 w-10 animate-ping text-primary/20">
                  <Loader2 className="h-10 w-10" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Cargando cualificaciones...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fadeIn">
              <div className="p-3 rounded-full bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-destructive">Error al cargar</p>
                <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && categories && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <QualificationSelector
                movieId={movieId}
                categories={categories}
                onComplete={() => {
                  setOpen(false);
                  toast.success("Cualificaciones guardadas", {
                    description: "Tus preferencias se han actualizado correctamente"
                  });
                }}
              />
              <p className="mt-4 text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1.5 opacity-70">
                <span className="h-1 w-1 rounded-full bg-primary/50" />
                Tus selecciones se guardan automáticamente
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
