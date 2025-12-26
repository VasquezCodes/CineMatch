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

    // Consultar watchlists con JOIN a movies
    const { data: watchlists, error: watchlistsError } = await supabase
      .from("watchlists")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

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

    // Obtener movie_ids únicos
    const movieIds = [...new Set(watchlists.map((w) => w.movie_id))];

    // Consultar movies
    const { data: movies, error: moviesError } = await supabase
      .from("movies")
      .select("*")
      .in("id", movieIds);

    if (moviesError) {
      console.error("Error fetching movies:", moviesError);
      return {
        data: null,
        error: "Error al obtener información de películas",
      };
    }

    // Crear mapa de películas para fácil lookup
    const moviesMap = new Map(movies?.map((m) => [m.id, m]) || []);

    // Combinar watchlists con movies
    const analysisData: WatchlistAnalysisItem[] = watchlists
      .map((watchlist) => {
        const movie = moviesMap.get(watchlist.movie_id);
        if (!movie) return null;

        return {
          watchlist,
          movie,
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

