"use client";

import { Button } from "@/components/ui/button";
import { BackgroundBlurs } from "@/components/layout/background-blurs";
import Link from "next/link";

export function MainPanel() {
    return (
        <>
            <BackgroundBlurs />
            <div className="relative flex flex-col items-start gap-8 max-w-3xl">
                {/* Título principal */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-[40px] leading-[44px] md:text-[56px] md:leading-[60px] font-bold tracking-tight text-foreground">
                        ENCONTRÁ PELICULAS
                    </h1>
                    <h1 className="text-[40px] leading-[44px] md:text-[56px] md:leading-[60px] font-bold tracking-tight text-accent">
                        QUE ENCAJEN CON VOS
                    </h1>
                </div>

                {/* Descripción */}
                <p className="text-base leading-6 text-muted-foreground">
                    Menos busquedas, mejores elecciones
                </p>

                {/* Línea animada */}
                <div className="w-full h-0.5 bg-accent rounded-full animate-slide-in-line" />

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg">
                        <Link href="/app/import">
                            Subir CSV
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/app/insights">
                            Ver Analisis
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
