"use client";

import Link from "next/link";
import Image from "@/components/CloudinaryImage";
import { Star, Sparkles, PlayCircle, Info } from "lucide-react";
import type { Recommendation } from "../types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function RecommendationsGrid({ items }: { items: Recommendation[] }) {
    if (items.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 text-muted-foreground bg-card/50 backdrop-blur-sm rounded-3xl border border-dashed border-border/50"
            >
                <div className="flex justify-center mb-4">
                    <Sparkles className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-2">Aún estamos conociendo tus gustos</h3>
                <p className="max-w-md mx-auto">Califica algunas películas o añade favoritos para que podamos generar recomendaciones personalizadas para ti.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
            {items.map((movie) => (
                <motion.div key={movie.rec_movie_id} variants={item}>
                    <Link
                        href={`/app/movies/${movie.rec_movie_id}`}
                        className="group relative flex flex-col h-full"
                    >
                        {/* Poster Card with Premium Hover Effects */}
                        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-muted shadow-lg shadow-black/10 ring-1 ring-white/10 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-black/20 group-hover:scale-[1.02] group-hover:ring-primary/50">
                            {movie.rec_poster_url ? (
                                <Image
                                    src={movie.rec_poster_url}
                                    alt={movie.rec_title}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, 33vw"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-muted/50 text-muted-foreground/20">
                                    <Sparkles className="h-12 w-12" />
                                </div>
                            )}

                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-70" />

                            {/* Action Overlay (Icon appears on hover) */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                                <div className="rounded-full bg-white/10 p-3 backdrop-blur-lg border border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-110">
                                    <Info className="h-6 w-6 text-white" />
                                </div>
                            </div>

                            {/* Explainability Badge - Floating */}
                            <div className="absolute top-2 right-2">
                                <Badge variant="glassmorphism" className="bg-black/40 border border-white/10 text-xs font-normal text-white px-2 py-0.5 shadow-lg shadow-black/20">
                                    {movie.rec_score ? `${Math.round(movie.rec_score)}% Match` : <Sparkles className="h-3 w-3 text-amber-400" />}
                                </Badge>
                            </div>

                            {/* Bottom Info in Card */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                                <p className="text-xs font-medium text-amber-300 line-clamp-1 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 [text-shadow:_0_1px_8px_rgb(0_0_0_/_60%)]">
                                    {movie.rec_reason}
                                </p>
                            </div>
                        </div>

                        {/* Info Below Card */}
                        <div className="mt-3 space-y-1 px-1">
                            <h3 className="text-base font-bold leading-tight line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                                {movie.rec_title}
                            </h3>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span>{movie.rec_year}</span>
                                    {movie.rec_cluster_name && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                            <span className="uppercase tracking-wider text-[10px] font-medium">
                                                {movie.rec_cluster_name}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}
