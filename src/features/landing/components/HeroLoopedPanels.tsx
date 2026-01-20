"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { heroPanels } from "../data/heroPanels";

gsap.registerPlugin(ScrollTrigger);

export function HeroLoopedPanels() {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLElement[]>([]);
  const panelInnersRef = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (prefersReducedMotion || isMobile) return;

    const container = containerRef.current;
    const panels = panelsRef.current.filter(Boolean);
    const panelInners = panelInnersRef.current.filter(Boolean);
    if (!container || panels.length === 0 || panelInners.length === 0) return;

    const ctx = gsap.context(() => {
      const steps = Math.max(1, panels.length - 1);
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${steps * window.innerHeight}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: (value) => Math.round(value * steps) / steps,
            duration: { min: 0.18, max: 0.38 },
            delay: 0.03,
            ease: "power2.out",
          },
        },
      });

      panelInners.forEach((inner, index) => {
        if (index > 0) {
          gsap.set(inner, {
            opacity: 0,
            y: 16,
            scale: 0.98,
          });
        }
      });

      panelInners.forEach((inner, index) => {
        if (index < panelInners.length - 1) {
          const nextInner = panelInners[index + 1];
          const transitionDuration = 0.5;
          const transitionEnd = index + 1;
          const transitionStart = transitionEnd - transitionDuration;

          timeline.to(
            inner,
            {
              opacity: 0,
              y: -16,
              scale: 0.98,
              duration: transitionDuration,
            },
            transitionStart
          );

          timeline.to(
            nextInner,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: transitionDuration,
            },
            transitionStart
          );
        }
      });

      ScrollTrigger.refresh();
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
    <div ref={containerRef} className="relative z-0 h-screen overflow-hidden">
      {heroPanels.map((panel, index) => {
        const Icon = panel.icon;
        return (
          <section
            key={panel.id}
            ref={(el) => {
              if (el) panelsRef.current[index] = el;
            }}
            className={cn(
              "absolute inset-0 h-full w-full flex items-center justify-center overflow-hidden",
              panel.className
            )}
          >
            {/* Background Decorations (Optional per panel) */}
            {index % 2 === 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            )}

            <div
              ref={(el) => {
                if (el) panelInnersRef.current[index] = el;
              }}
              className="max-w-4xl w-full px-6 relative z-10 will-change-transform"
            >
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

                <div className="w-full">
                  {panel.content.type === "cta" && (
                    <div className="mt-8 flex justify-center">
                      <Button
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg hover:shadow-primary/25 transition-all"
                      >
                        <Icon className="w-5 h-5 mr-2" />
                        {panel.content.buttonLabel}
                      </Button>
                    </div>
                  )}
                  {panel.content.type === "insights" && (
                    <div className="mt-8 grid gap-4 w-full max-w-xl mx-auto">
                      <div className="grid grid-cols-2 gap-4">
                        {panel.content.stats.map((stat) => (
                          <div
                            key={stat.label}
                            className="bg-card border border-border/50 p-4 rounded-xl shadow-sm"
                          >
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <div className="mt-2 flex items-baseline justify-between">
                              <span className="text-2xl font-semibold text-foreground">
                                {stat.value}
                              </span>
                              <span className="text-xs font-medium text-emerald-500">
                                {stat.trend}
                              </span>
                            </div>
                            <div className="mt-3 h-1 w-full rounded-full bg-muted">
                              <div className="h-full w-3/5 rounded-full bg-primary/60" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-card border border-border/50 p-5 rounded-xl shadow-sm">
                        <p className="text-sm text-muted-foreground">Resumen semanal</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold">48 películas</p>
                            <p className="text-sm text-muted-foreground">Últimos 30 días</p>
                          </div>
                          <div className="h-10 w-24 rounded-lg bg-primary/10 flex items-end gap-1 p-2">
                            {["h-4", "h-6", "h-3", "h-7", "h-5"].map((height) => (
                              <span
                                key={height}
                                className={cn("w-2 rounded-full bg-primary/60", height)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {panel.content.type === "recommendations" && (
                    <div className="mt-8 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
                      {panel.content.items.map((item) => (
                        <div
                          key={item.title}
                          className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm"
                        >
                          <div className="h-36 bg-gradient-to-br from-primary/20 via-muted to-background" />
                          <div className="p-4 text-left space-y-2">
                            <p className="text-sm text-muted-foreground">{item.genre}</p>
                            <p className="text-lg font-semibold">{item.title}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">CineMatch Score</span>
                              <span className="text-sm font-semibold text-primary">
                                {item.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {panel.content.type === "footer" && (
                    <div className="mt-8 text-sm text-muted-foreground">
                      {panel.content.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
