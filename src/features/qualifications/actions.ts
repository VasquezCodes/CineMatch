"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { QualityCategory, QualityCategoryWithSelection } from "./types";

/**
 * Obtiene todas las categorías con sus cualidades
 */
export async function getQualityCategories(): Promise<{
    data: QualityCategory[] | null;
    error: string | null;
}> {
    try {
        const supabase = await createClient();

        // Obtener categorías
        const { data: categories, error: catError } = await supabase
            .from("quality_categories")
            .select("*")
            .order("id");

        if (catError) {
            console.error("Error fetching quality_categories:", catError);
            return { data: null, error: "Error al obtener categorías" };
        }

        // Obtener cualidades
        const { data: qualities, error: qualError } = await supabase
            .from("qualities")
            .select("*")
            .order("id");

        if (qualError) {
            console.error("Error fetching qualities:", qualError);
            return { data: null, error: "Error al obtener cualidades" };
        }

        // Agrupar cualidades por categoría
        const result: QualityCategory[] = (categories || []).map((cat) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            qualities: (qualities || []).filter((q) => q.category_id === cat.id),
        }));

        return { data: result, error: null };
    } catch (error) {
        console.error("Error in getQualityCategories:", error);
        return { data: null, error: "Error inesperado" };
    }
}

/**
 * Obtiene las cualidades seleccionadas por el usuario para una película específica,
 * agrupadas por categoría con estado de selección
 */
export async function getUserMovieQualitiesGrouped(
    movieId: string
): Promise<{
    data: QualityCategoryWithSelection[] | null;
    error: string | null;
}> {
    try {
        const supabase = await createClient();

        // Verificar autenticación
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return { data: null, error: "Usuario no autenticado" };
        }

        // Obtener categorías y cualidades
        const { data: categoriesData, error: catError } = await getQualityCategories();
        if (catError || !categoriesData) {
            return { data: null, error: catError || "Error al obtener categorías" };
        }

        // Obtener cualidades seleccionadas por el usuario para esta película
        const { data: userQualities, error: uqError } = await supabase
            .from("user_movie_qualities")
            .select("quality_id")
            .eq("user_id", user.id)
            .eq("movie_id", movieId);

        if (uqError) {
            console.error("Error fetching user_movie_qualities:", uqError);
            return { data: null, error: "Error al obtener cualidades del usuario" };
        }

        const selectedIds = new Set((userQualities || []).map((uq) => uq.quality_id));

        // Marcar como seleccionadas
        const result: QualityCategoryWithSelection[] = categoriesData.map((cat) => ({
            ...cat,
            qualities: cat.qualities.map((q) => ({
                ...q,
                selected: selectedIds.has(q.id),
            })),
        }));

        return { data: result, error: null };
    } catch (error) {
        console.error("Error in getUserMovieQualitiesGrouped:", error);
        return { data: null, error: "Error inesperado" };
    }
}

/**
 * Toggle de una cualidad para una película (agregar o quitar)
 */
export async function toggleUserMovieQuality(
    movieId: string,
    qualityId: number
): Promise<{ success: boolean; selected: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        // Verificar autenticación
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return { success: false, selected: false, error: "Usuario no autenticado" };
        }

        // Verificar si ya existe
        const { data: existing, error: existError } = await supabase
            .from("user_movie_qualities")
            .select("id")
            .eq("user_id", user.id)
            .eq("movie_id", movieId)
            .eq("quality_id", qualityId)
            .maybeSingle();

        if (existError) {
            console.error("Error checking existing quality:", existError);
            return { success: false, selected: false, error: "Error al verificar cualidad" };
        }

        if (existing) {
            // Ya existe, eliminar
            const { error: deleteError } = await supabase
                .from("user_movie_qualities")
                .delete()
                .eq("id", existing.id);

            if (deleteError) {
                console.error("Error deleting quality:", deleteError);
                return { success: false, selected: true, error: "Error al eliminar cualidad" };
            }

            // Evitamos revalidatePath para no causar renderizado completo de la página
            // El estado visual se maneja con optimistic updates en el cliente
            // revalidatePath(`/movie/${movieId}`);
            return { success: true, selected: false };
        } else {
            // No existe, insertar
            const { error: insertError } = await supabase
                .from("user_movie_qualities")
                .insert({
                    user_id: user.id,
                    movie_id: movieId,
                    quality_id: qualityId,
                });

            if (insertError) {
                console.error("Error inserting quality:", insertError);
                return { success: false, selected: false, error: "Error al guardar cualidad" };
            }

            // revalidatePath(`/movie/${movieId}`);
            return { success: true, selected: true };
        }
    } catch (error) {
        console.error("Error in toggleUserMovieQuality:", error);
        return { success: false, selected: false, error: "Error inesperado" };
    }
}
