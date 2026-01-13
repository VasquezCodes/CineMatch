"use server";

import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/types/database.types";
import { revalidatePath } from "next/cache";

/**
 * Actualiza el rating de una película en el watchlist del usuario
 * @param watchlistId - ID del registro en la tabla watchlists
 * @param rating - Calificación del usuario (1-10)
 */
export async function updateMovieRating(
  watchlistId: string,
  rating: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validación básica
    if (rating < 1 || rating > 10) {
      return { success: false, error: "La calificación debe estar entre 1 y 10" };
    }

    const supabase = await createClient();

    // Verificar usuario autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // 1. Obtener el watchlist para saber el movie_id
    const { data: watchlist, error: fetchError } = await supabase
      .from("watchlists")
      .select("movie_id")
      .eq("id", watchlistId)
      .single();

    if (fetchError || !watchlist) {
      console.error("Error fetching watchlist item:", fetchError);
      return { success: false, error: "Elemento no encontrado" };
    }

    const movieId = watchlist.movie_id;

    // 2. Actualizar el rating en la tabla watchlists
    const updateWatchlistPromise = supabase
      .from("watchlists")
      .update({
        user_rating: rating,
        updated_at: new Date().toISOString(),
      })
      .eq("id", watchlistId)
      .eq("user_id", user.id);

    // 3. Sincronizar rating en la tabla reviews
    const upsertReviewPromise = supabase
      .from("reviews")
      .upsert(
        {
          user_id: user.id,
          movie_id: movieId,
          rating: rating,
          created_at: new Date().toISOString(), // Actualizamos timestamp
        },
        { onConflict: "user_id, movie_id" }
      );

    const [watchlistResult, reviewResult] = await Promise.all([
      updateWatchlistPromise,
      upsertReviewPromise,
    ]);

    if (watchlistResult.error) {
      console.error("Error updating watchlist:", watchlistResult.error);
      return { success: false, error: "Error al guardar en watchlist" };
    }

    if (reviewResult.error) {
      console.error("Error updating review:", reviewResult.error);
      // No fallamos toda la operación si falla el review, pero logueamos
    }

    // Revalidar páginas relacionadas
    revalidatePath("/app/rate-movies");
    revalidatePath("/app/analysis");
    revalidatePath(`/app/movies/${movieId}`); // Revalidar la página de la película específica

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in updateMovieRating:", error);
    return { success: false, error: "Error inesperado al guardar" };
  }
}

