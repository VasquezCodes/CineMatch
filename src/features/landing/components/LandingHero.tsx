"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { TrendingCarousel } from "./TrendingCarousel";

export function LandingHero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 md:min-h-[85vh] md:py-28 lg:px-8">
        {/* H1 Principal - Más grande y prominente */}
        <h1 className="text-5xl font-bold leading-none tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
          <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
            CINEMATCH
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="mt-6 text-balance text-xl font-medium leading-relaxed text-foreground sm:text-2xl md:mt-8 md:text-3xl lg:text-4xl">
          Un paseo por sus gustos. Descubra su cinefilia.
        </p>

        {/* Descripción */}
        <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg md:mt-8 md:text-xl lg:max-w-3xl">
          Revele conexiones y explore sus listas a través de una interfaz visual e intuitiva que transformará la forma en que descubre y analiza películas.
        </p>

        {/* Badge de plataformas */}
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/70 sm:text-sm md:mt-8">
          Compatible con IMDb, TMDb y Letterboxd
        </p>

        {/* CTAs */}
        <div className="mt-10 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 md:mt-12">
          <Button
            size="lg"
            className="w-full gap-2 px-8 text-base sm:w-auto sm:px-10 md:h-12 md:px-12 md:text-lg"
            asChild
          >
            <Link href="/explore">
              <Play className="size-5" />
              Explorar Películas
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2 border-accent px-8 text-base text-accent transition-all duration-300 hover:bg-accent hover:text-accent-foreground sm:w-auto sm:px-10 md:h-12 md:px-12 md:text-lg"
            asChild
          >
            <Link href="/demo">
              Ver Demo
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Carrusel de películas trending */}
      <div className="pb-16 md:pb-24">
        <TrendingCarousel />
      </div>
    </section>
  );
}
