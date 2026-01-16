"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { updateRatingSchema, validateInput } from "@/lib/validation";
import { logger } from "@/lib/logger";

/**
 * Actualiza el rating de una película en el watchlist del usuario
 * @param watchlistId - ID del registro en la tabla watchlists
 * @param rating - Calificación del usuario (1-10)
 */
export async function updateMovieRating(
  watchlistId: string,
  rating: number
): Promise<{ success: boolean; error?: string }> {
  // Validación con Zod
  const validation = validateInput(updateRatingSchema, { watchlistId, rating });
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  const log = logger.withContext({ action: "updateMovieRating", watchlistId });

  try {
    const supabase = await createClient();

    // Verificar usuario autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      log.warn("Usuario no autenticado");
      return { success: false, error: "Usuario no autenticado" };
    }

    // Obtener el watchlist para saber el movie_id
    const { data: watchlist, error: fetchError } = await supabase
      .from("watchlists")
      .select("movie_id")
      .eq("id", watchlistId)
      .single();

    if (fetchError || !watchlist) {
      log.error("Watchlist no encontrado", { userId: user.id }, fetchError as Error);
      return { success: false, error: "Elemento no encontrado" };
    }

    const movieId = watchlist.movie_id;

    // Actualizar el rating en la tabla watchlists
    const { error: updateError } = await supabase
      .from("watchlists")
      .update({
        user_rating: rating,
        updated_at: new Date().toISOString(),
      })
      .eq("id", watchlistId)
      .eq("user_id", user.id);

    if (updateError) {
      log.error("Error actualizando rating", { userId: user.id, movieId }, updateError as Error);
      return { success: false, error: "Error al guardar calificación" };
    }

    log.info("Rating actualizado", { userId: user.id, movieId, rating });

    // Revalidar páginas relacionadas
    revalidatePath("/app/rate-movies");
    revalidatePath("/app/analysis");
    revalidatePath(`/app/movies/${movieId}`);

    return { success: true };
  } catch (error) {
    log.error("Error inesperado", {}, error as Error);
    return { success: false, error: "Error inesperado al guardar" };
  }
}

