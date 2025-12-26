import type { Tables } from "@/types/database.types";

/**
 * Datos completos del análisis: watchlist + movie data (JOIN)
 */
export type WatchlistAnalysisItem = {
  watchlist: Tables<"watchlists">;
  movie: Tables<"movies">;
};

/**
 * Estadísticas calculadas del análisis
 */
export type AnalysisStats = {
  totalMovies: number;
  averageRating: number;
  topGenres: { name: string; count: number }[];
  moviesByYear: { year: number; count: number }[];
  moviesByStatus: { status: string; count: number }[];
};

