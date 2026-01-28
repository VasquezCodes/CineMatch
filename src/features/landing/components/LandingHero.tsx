"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 md:min-h-[80vh] md:py-24 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Plataforma de análisis de listas de IMDb, TMDb y Letterboxd
        </p>
<h1 className="mt-5 text-balance text-4xl font-bold leading-tight text-foreground md:text-7xl md:leading-[1.05]">
          <span className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent uppercase">CINEMATCH</span>
        </h1>
        
        <p className="mt-3 text-balance text-2xl font-medium leading-relaxed text-foreground md:text-4xl md:leading-[1.2]">
          Un paseo por sus gustos. Descubra su cinefilia.
        </p>
        
        <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground md:text-xl">
          Revele conexiones y explore sus listas a través de una interfaz visual e intuitiva que transformará la forma en que descubre y analiza películas.
        </p>
        
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
          <Button size="lg" className="gap-2 text-base px-8" asChild>
            <Link href="/explore">
              <Play className="size-5" />
              Explorar Películas
            </Link>
          </Button>
          
          <Button size="lg" variant="outline" className="gap-2 text-base px-8 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300" asChild>
            <Link href="/demo">
              Ver Demo
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
