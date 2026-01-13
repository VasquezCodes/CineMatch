import type { Tables } from "@/types/database.types";

/**
 * Datos completos del análisis: watchlist + movie data (JOIN)
 * Usado para mostrar la tabla/grid de películas con detalles completos
 */
export type WatchlistAnalysisItem = {
  watchlist: Tables<"watchlists"> & { user_rating?: number | null };
  movie: Tables<"movies">;
};

