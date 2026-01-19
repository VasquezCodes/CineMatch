"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Upload, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface Panel {
  id: number;
  className: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

const testPanels: Panel[] = [
  {
    id: 1,
    className: "bg-background text-foreground",
    title: "Importa tu historial",
    description: "Sube tu archivo CSV de Letterboxd y comienza tu viaje.",
    icon: Upload,
    content: (
      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg hover:shadow-primary/25 transition-all"
        >
          <Upload className="w-5 h-5 mr-2" />
          Comenzar Importación
        </Button>
      </div>
    ),
  },
  {
    id: 2,
    className: "bg-muted text-foreground",
    title: "Analiza tus gustos",
    description: "Descubre patrones ocultos en tus hábitos de visualización.",
    icon: BarChart3,
    content: (
      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm mx-auto opacity-80">
        <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm">
          <div className="h-2 w-12 bg-primary/20 rounded mb-2" />
          <div className="h-16 w-full bg-muted rounded-md animate-pulse" />
        </div>
        <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm">
          <div className="h-2 w-12 bg-chart-2/20 rounded mb-2" />
          <div className="h-16 w-full bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    ),
  },
  {
    id: 3,
    className: "bg-background text-foreground",
    title: "Descubre joyas ocultas",
    description: "Recomendaciones personalizadas basadas en lo que amas.",
    icon: Sparkles,
    content: (
      <div className="mt-8 flex gap-4 overflow-hidden justify-center opacity-80">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-24 h-36 bg-muted rounded-lg border border-border/50 shadow-sm relative overflow-hidden"
          >
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 4,
    className: "bg-card text-card-foreground border-t border-border",
    title: "Únete a CineMatch",
    description: "Tu compañero definitivo para el descubrimiento de películas.",
    icon: Sparkles,
    content: (
        <div className="mt-8 text-sm text-muted-foreground">
            © 2026 CineMatch. Todos los derechos reservados.
        </div>
    ),
  },
];

export function HeroLoopedPanels() {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLElement[]>([]);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const panels = panelsRef.current.filter(Boolean);
    if (!container || panels.length === 0) return;

    const ctx = gsap.context(() => {
      panels.forEach((panel) => {
        ScrollTrigger.create({
          trigger: panel,
          start: "top top",
          pin: true,
          pinSpacing: false,
        });
      });
    }, container);

    const onResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative z-0">
      {testPanels.map((panel, index) => {
        const Icon = panel.icon;
        return (
          <section
            key={panel.id}
            ref={(el) => {
              if (el) panelsRef.current[index] = el;
            }}
            className={cn(
              "h-[calc(100svh-56px)] w-full flex items-center justify-center relative overflow-hidden",
              panel.className
            )}
          >
            {/* Background Decorations (Optional per panel) */}
            {index % 2 === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            )}

            <div className="max-w-4xl w-full px-6 relative z-10">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-full ring-1 ring-primary/20 backdrop-blur-sm">
                  <Icon className="w-10 h-10 text-primary" />
                </div>
                
                <div className="space-y-4 max-w-2xl">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    {panel.title}
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                    {panel.description}
                    </p>
                </div>

                {panel.content}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
