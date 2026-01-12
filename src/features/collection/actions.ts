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
    // Usamos el alias 'movie' para la relación con la tabla movies
    const { data: watchlists, error: watchlistsError } = await supabase
      .from("watchlists")
      .select(
        `
        *,
        movie:movies (*)
      `
      )
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

    // Transformar los datos para cumplir con el tipo WatchlistAnalysisItem
    const analysisData: WatchlistAnalysisItem[] = watchlists
      .map((item) => {
        // Extraemos la película y dejamos el resto como watchlist
        const { movie, ...watchlistData } = item;

        // Verificación de seguridad por si la relación no trae datos (integridad referencial rota)
        if (!movie) return null;

        return {
          watchlist: watchlistData as unknown as WatchlistAnalysisItem["watchlist"],
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

