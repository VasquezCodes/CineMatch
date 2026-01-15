"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Star } from "lucide-react";
import { AccordionMovieCard } from "./AccordionMovieCard";

interface Movie {
  id: string;
  title: string;
  year: number;
  poster_url: string | null;
  user_rating?: number;
  director_name?: string;
}

interface RankingAccordionRowProps {
  rank: number;
  name: string;
  count: number;
  score: number;
  movies: Movie[];
  imageUrl?: string;
  type: string;
}

export function RankingAccordionRow({
  rank,
  name,
  count,
  score,
  movies,
  imageUrl,
  type,
}: RankingAccordionRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const showDirector = type !== "director";

  const averageRating = useMemo(() => {
    const ratingsWithValue = movies.filter(m => m.user_rating && m.user_rating > 0);
    if (ratingsWithValue.length === 0) return 0;
    const sum = ratingsWithValue.reduce((acc, m) => acc + (m.user_rating || 0), 0);
    return sum / ratingsWithValue.length;
  }, [movies]);

  return (
    <div className="border-b border-slate-200/50 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
          {rank}
        </span>

        {imageUrl && (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200/50 bg-slate-100">
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-slate-900">{name}</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{count} {count === 1 ? "película" : "películas"}</span>
            {averageRating > 0 && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1 text-star-yellow">
                  <Star className="h-3 w-3 fill-star-yellow" />
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-200/50 bg-slate-50/50 px-4 py-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {movies.map((movie) => (
                  <AccordionMovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    year={movie.year}
                    posterUrl={movie.poster_url}
                    director={movie.director_name}
                    showDirector={showDirector}
                    userRating={movie.user_rating}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
