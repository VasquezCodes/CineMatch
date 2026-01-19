'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout';
import { APP_ROUTES } from '@/config/routes';

interface Movie {
    id: number;
    title: string;
    posterUrl: string;
}

export function LandingHero() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchTrendingMovies() {
            try {
                const response = await fetch('/api/trending-movies?limit=12');
                const data = await response.json();
                setMovies(data.movies || []);
            } catch (error) {
                console.error('Error fetching trending movies:', error);
            }
        }

        fetchTrendingMovies();
    }, []);

    useEffect(() => {
        if (movies.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 4) % movies.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [movies.length]);

    const visibleMovies = movies.slice(currentIndex, currentIndex + 4);

    return (
        <section className="relative w-full min-h-[calc(100vh-80px)] overflow-hidden flex items-center">
            <Container size="wide" className="relative z-10 py-12 md:py-16">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                    {/* Contenido izquierdo */}
                    <div className="flex-1 max-w-2xl space-y-6">
                        <div className="space-y-4">
                            {/* Título con accent en 3 líneas */}
                            <h1 className="font-heading font-bold tracking-tight leading-[1.1]">
                                <span className="block text-foreground text-[2rem] sm:text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] uppercase">Encontrá películas</span>
                                <span className="block text-primary text-[2rem] sm:text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] uppercase">que encajen con vos</span>
                                <span className="block text-muted-foreground text-base sm:text-lg lg:text-xl font-normal mt-3">
                                    Menos búsqueda, mejores elecciones.
                                </span>
                            </h1>

                            {/* Línea verde decorativa que ocupa todo el ancho */}
                            <div className="h-1 w-full bg-primary rounded-full mt-4" aria-hidden="true" />
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center justify-start gap-4 pt-2">
                            <Button
                                size="default"
                                asChild
                                aria-label="Subir archivo CSV de películas"
                            >
                                <Link href={APP_ROUTES.UPLOAD}>
                                    Subir CSV
                                </Link>
                            </Button>
                            <Button
                                size="default"
                                variant="outline"
                                asChild
                                aria-label="Ver análisis de películas"
                            >
                                <Link href={APP_ROUTES.ANALYSIS}>
                                    Ver análisis
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Posters a la derecha */}
                    <div className="hidden lg:grid grid-cols-2 gap-4 w-[380px] flex-shrink-0">
                        {visibleMovies.map((movie, index) => (
                            <div
                                key={`${movie.id}-${currentIndex}-${index}`}
                                className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl animate-fade-in"
                            >
                                <Image
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                    sizes="190px"
                                    priority={index < 4}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
