"use server";

import { createClient } from "@/lib/supabase/server";
import type { WatchlistAnalysisItem } from "./types";

/**
 * Obtiene el análisis completo del watchlist del usuario actual
 * Hace JOIN entre watchlists y movies
 */
export async function getWatchlistAnalysis(): Promise<{
  data: WatchlistAnalysisItem[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // Obtener usuario actual
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        data: null,
        error: "Usuario no autenticado",
      };
    }

    // Consultar watchlists con JOIN a movies y reviews en paralelo para eficiencia
    const [watchlistsResponse, reviewsResponse] = await Promise.all([
      supabase
        .from("watchlists")
        .select(
          `
        *,
        movie:movies (*)
      `
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("reviews")
        .select("movie_id, rating")
        .eq("user_id", user.id),
    ]);

    const { data: watchlists, error: watchlistsError } = watchlistsResponse;
    const { data: reviews } = reviewsResponse;

    if (watchlistsError) {
      console.error("Error fetching watchlists:", watchlistsError);
      return {
        data: null,
        error: "Error al obtener el watchlist",
      };
    }

    if (!watchlists || watchlists.length === 0) {
      return {
        data: [],
        error: null,
      };
    }

    // Mapa de ratings para acceso O(1)
    const ratingsMap = new Map<string, number>();
    reviews?.forEach((r) => {
      if (r.rating) ratingsMap.set(r.movie_id, r.rating);
    });

    // Transformar los datos para cumplir con el tipo WatchlistAnalysisItem
    const analysisData: WatchlistAnalysisItem[] = watchlists
      .map((item) => {
        // Extraemos la película y dejamos el resto como watchlist
        const { movie, ...watchlistData } = item;

        // Verificación de seguridad por si la relación no trae datos (integridad referencial rota)
        if (!movie) return null;

        const rating = ratingsMap.get(movie.id);
        const watchlistWithRating: WatchlistAnalysisItem["watchlist"] = {
          ...(watchlistData as unknown as WatchlistAnalysisItem["watchlist"]),
          user_rating: rating ?? null,
        };

        return {
          watchlist: watchlistWithRating,
          movie: movie as unknown as WatchlistAnalysisItem["movie"],
        };
      })
      .filter((item): item is WatchlistAnalysisItem => item !== null);

    return {
      data: analysisData,
      error: null,
    };
  } catch (error) {
    console.error("Error in getWatchlistAnalysis:", error);
    return {
      data: null,
      error: "Error inesperado al obtener el análisis",
    };
  }
}

