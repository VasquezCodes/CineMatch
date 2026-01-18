/**
 * Película sin calificar que necesita rating del usuario
 */
export type UnratedMovie = {
  watchlistId: string;
  movieId: string;
  imdbId: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
  currentRating: number | null;
};

/**
 * Estado de una película en proceso de calificación
 */
export type MovieRatingState = {
  watchlistId: string;
  rating: number;
  isSaving: boolean;
  isSaved: boolean;
  error: string | null;
};

