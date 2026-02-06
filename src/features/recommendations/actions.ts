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

import type { ConstellationData, ConstellationNode, ConstellationEdge } from "./types/constellationTypes";

/**
 * Fetches constellation data: user's top-rated movies as sources,
 * recommendations as targets, with edges showing connections.
 */
export async function getConstellationData(): Promise<{
    data: ConstellationData | null;
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

        // Fetch user's top-rated movies (4+ stars) as source nodes
        const { data: topRatedMovies, error: topRatedError } = await supabase
            .from("watchlists")
            .select(`
                movie_id,
                user_rating,
                movies!inner (
                    id,
                    title,
                    poster_url,
                    release_date
                )
            `)
            .eq("user_id", user.id)
            .gte("user_rating", 4)
            .order("user_rating", { ascending: false })
            .limit(8);

        if (topRatedError) {
            console.error("Error fetching top rated movies:", topRatedError);
            return { data: null, error: "Error al obtener películas favoritas" };
        }

        // Fetch recommendations
        const { data: recommendations, error: rpcError } = await supabase.rpc(
            "get_recommendations",
            { target_user_id: user.id }
        );

        if (rpcError) {
            console.error("Error fetching recommendations:", rpcError);
            return { data: null, error: "Error al obtener recomendaciones" };
        }

        // Build constellation nodes
        const nodes: ConstellationNode[] = [];
        const edges: ConstellationEdge[] = [];

        // Add source nodes (user's favorites)
        const sourceMovies = (topRatedMovies || []).slice(0, 5);
        for (const item of sourceMovies) {
            const movie = item.movies as any;
            nodes.push({
                id: `source-${movie.id}`,
                type: 'source',
                movie: {
                    id: movie.id,
                    title: movie.title,
                    posterUrl: movie.poster_url,
                    year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
                },
                rating: item.user_rating,
            });
        }

        // Add recommendation nodes and create edges
        const recs = (recommendations as Recommendation[] || []).slice(0, 15);
        for (const rec of recs) {
            nodes.push({
                id: `rec-${rec.rec_movie_id}`,
                type: 'recommendation',
                movie: {
                    id: rec.rec_movie_id,
                    title: rec.rec_title,
                    posterUrl: rec.rec_poster_url,
                    year: rec.rec_year,
                    cluster: rec.rec_cluster_name,
                },
                score: rec.rec_score,
            });

            // Connect recommendation to a random source (in reality, we'd use similarity)
            // For now, distribute recommendations across source movies
            if (sourceMovies.length > 0) {
                const sourceIndex = nodes.filter(n => n.type === 'recommendation').length % sourceMovies.length;
                const sourceMovie = sourceMovies[sourceIndex].movies as any;

                edges.push({
                    id: `edge-${sourceMovie.id}-${rec.rec_movie_id}`,
                    sourceId: `source-${sourceMovie.id}`,
                    targetId: `rec-${rec.rec_movie_id}`,
                    reason: rec.rec_reason,
                    strength: rec.rec_score / 100,
                });
            }
        }

        return { data: { nodes, edges }, error: null };
    } catch (error) {
        console.error("Error in getConstellationData:", error);
        return { data: null, error: "Error inesperado" };
    }
}
