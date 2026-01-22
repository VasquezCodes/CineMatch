"use server";

import { createClient } from "@/lib/supabase/server";
import { Recommendation } from "./types";

export async function getRecommendations(): Promise<{
    data: Recommendation[] | null;
    error: string | null;
}> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return { data: null, error: "Usuario no autenticado" };
        }

        const { data: recommendations, error: rpcError } = await supabase.rpc(
            "get_recommendations",
            {
                target_user_id: user.id,
            }
        );

        if (rpcError) {
            console.error("Error fetching recommendations:", JSON.stringify(rpcError, null, 2));
            return { data: null, error: rpcError.message || "Error al generar recomendaciones" };
        }

        return { data: recommendations as Recommendation[], error: null };
    } catch (error) {
        console.error("Error in getRecommendations:", error);
        return { data: null, error: "Error inesperado" };
    }
}
