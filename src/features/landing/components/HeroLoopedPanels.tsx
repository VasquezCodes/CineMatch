"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { heroPanels } from "../data/heroPanels";
import { MainPanel } from "./panels/MainPanel";
import { ImportPanel } from "./panels/ImportPanel";
import { AnalysisPanel } from "./panels/AnalysisPanel";
import { RecsPanel } from "./panels/RecsPanel";

const PANEL_COMPONENTS = [MainPanel, ImportPanel, AnalysisPanel, RecsPanel];

export function HeroLoopedPanels() {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelInnersRef = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const panelInners = panelInnersRef.current.filter(Boolean);
    if (!container || panelInners.length < 2) return;

    let disposed = false;
    let rafId = 0;
    let cleanup: (() => void) | null = null;

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();
      const ctx = gsap.context(() => {
        mm.add("(min-width: 769px)", () => {
          const steps = Math.max(1, panelInners.length - 1);

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
            if (index > 0) gsap.set(inner, { opacity: 0, y: 16, scale: 0.98 });
          });

          panelInners.forEach((inner, index) => {
            if (index >= panelInners.length - 1) return;

            const nextInner = panelInners[index + 1];
            const d = 0.5;
            const at = index + 1 - d;

            timeline.to(inner, { opacity: 0, y: -16, scale: 0.98, duration: d }, at);
            timeline.to(nextInner, { opacity: 1, y: 0, scale: 1, duration: d }, at);
          });

          ScrollTrigger.refresh();

          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
          };
        });
      }, container);

      const onResize = () => {
        cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      };

      window.addEventListener("resize", onResize);

      cleanup = () => {
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(rafId);
        mm.revert();
        ctx.revert();
      };
    };

    void run();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative z-0 md:h-screen md:overflow-hidden">
      {PANEL_COMPONENTS.map((Panel, index) => {
        const panelData = heroPanels[index % heroPanels.length];

        return (
          <section
            key={`${panelData.id}-${index}`}
            className={cn(
              "relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden md:absolute md:inset-0 md:min-h-0 md:h-full",
              panelData.className
            )}
          >

            <div
              ref={(el) => {
                if (el) panelInnersRef.current[index] = el;
              }}
              className="relative z-10 w-full max-w-6xl px-6 py-14 md:py-0 will-change-transform"
            >
              <Panel />
            </div>
          </section>
        );
      })}
    </div>
  );
}
