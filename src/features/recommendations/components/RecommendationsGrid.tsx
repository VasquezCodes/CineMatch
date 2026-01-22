import Link from "next/link";
import Image from "@/components/CloudinaryImage";
import { Star, Sparkles } from "lucide-react";
import type { Recommendation } from "../types";

export function RecommendationsGrid({ items }: { items: Recommendation[] }) {
    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No tenemos suficientes datos para generarte recomendaciones personalizadas aún.</p>
                <p className="text-sm mt-2">Prueba calificando algunas películas o añadiendo cualificaciones.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((movie) => (
                <Link
                    key={movie.rec_movie_id}
                    href={`/app/movies/${movie.rec_movie_id}`}
                    className="group relative flex flex-col gap-2 transition-transform hover:scale-[1.02]"
                >
                    {/* Poster Card */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted shadow-sm border border-border/50">
                        {movie.rec_poster_url ? (
                            <Image
                                src={movie.rec_poster_url}
                                alt={movie.rec_title}
                                fill
                                className="object-cover transition-all duration-300 group-hover:brightness-110"
                                sizes="(max-width: 768px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground/20">
                                <Sparkles className="h-10 w-10" />
                            </div>
                        )}

                        {/* Overlay con Razón */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-xs font-medium text-amber-300 line-clamp-2">
                                {movie.rec_reason}
                            </p>
                        </div>
                    </div>

                    {/* Info Debajo */}
                    <div className="flex flex-col px-1 gap-1">
                        <h3 className="text-sm font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {movie.rec_title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{movie.rec_year}</span>
                            {movie.rec_cluster_name && (
                                <span className="px-1.5 py-0.5 rounded-full bg-secondary/50 text-[10px] uppercase font-medium">
                                    {movie.rec_cluster_name}
                                </span>
                            )}
                        </div>

                        {/* Razón Explícita */}
                        <div className="flex items-start gap-1.5 mt-1 text-[11px] leading-tight text-amber-600/90 dark:text-amber-400">
                            <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="font-medium">{movie.rec_reason}</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
