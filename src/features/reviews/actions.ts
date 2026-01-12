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

    // Actualizar el rating en la tabla watchlists
    const updateData: TablesUpdate<"watchlists"> = {
      user_rating: rating,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("watchlists")
      .update(updateData)
      .eq("id", watchlistId)
      .eq("user_id", user.id); // Seguridad: asegurar que el usuario solo edite su propio registro

    if (updateError) {
      console.error("Error updating movie rating:", updateError);
      return { success: false, error: "Error al guardar la calificación" };
    }

    // Revalidar páginas relacionadas
    revalidatePath("/app/rate-movies");
    revalidatePath("/app/rate-movies");
    revalidatePath("/app/analysis");

    return { success: true };


  } catch (error) {
    console.error("Unexpected error in updateMovieRating:", error);
    return { success: false, error: "Error inesperado al guardar" };
  }
}

