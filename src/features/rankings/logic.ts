
import { createClient } from '@/lib/supabase/server';

export type RankingStatConfig = {
    type: 'actor' | 'director' | 'genre' | 'year' | 'screenplay' | 'photography' | 'music';
    key: string;
    count: number;
    score: number;
    data: {
        image_url?: string;
        roles?: { role: string; movies: string[] }[];
        movies: {
            id: string;
            title: string;
            year: number;
            poster_url: string | null;
            user_rating?: number;
        }[];
    };
};

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Calculates all ranking statistics for a given user.
 * This function allows processing in background (Worker) or on-demand.
 * @param userId - The user to calculate stats for
 * @param client - Optional Supabase client (e.g. admin client for workers). Defaults to standard SSR client.
 */
export async function calculateRankings(userId: string, client?: SupabaseClient): Promise<RankingStatConfig[]> {
    const supabase = client || await createClient();

    // 1. Fetch entire user library with relevant details
    // We fetch EVERYTHING qualified. Pagination not needed for stats calculation (we need global stats)
    const { data: watchlistItems, error } = await supabase
        .from('watchlists')
        .select(`
            rating,
            movies (
                id,
                title,
                year,
                poster_url,
                director, 
                genres,
                extended_data
            )
        `)
        .eq('user_id', userId)
        .gte('rating', 1); // Only rated movies count for rankings? Or just watched? Usually rated.

    if (error || !watchlistItems) {
        console.error('Error fetching data for stats:', error);
        throw new Error('Failed to fetch user library');
    }

    // 2. Agregación de datos en memoria (Iteración sobre la biblioteca del usuario)
    // Nota: Dado que esto corre en un worker, tenemos margen para procesar < 5k items en memoria.

    const aggregates: Record<string, Record<string, RankingStatConfig>> = {
        director: {}, actor: {}, genre: {}, year: {}, screenplay: {}, photography: {}, music: {}
    };

    const initStat = (type: any, key: string): RankingStatConfig => ({
        type, key, count: 0, score: 0, data: { movies: [] }
    });

    const getStat = (type: any, key: string) => {
        if (!aggregates[type][key]) aggregates[type][key] = initStat(type, key);
        return aggregates[type][key];
    };

    for (const item of watchlistItems) {
        const m = Array.isArray(item.movies) ? item.movies[0] : item.movies;
        if (!m) continue;

        const ext = m.extended_data as any || {};
        const rating = item.rating || 0;

        // --- Helpers ---
        const processPerson = (type: any, name?: string, role?: string, photo?: string) => {
            if (!name) return;
            const cleanName = name.trim();
            const stat = getStat(type, cleanName);

            stat.count++;
            stat.score += 10; // Puntuación base por película. (Se podría ponderar por rating)
            const movieData = {
                id: m.id,
                title: m.title,
                year: m.year,
                poster_url: m.poster_url,
                user_rating: rating
            };
            stat.data.movies.push(movieData);
            if (photo && !stat.data.image_url) stat.data.image_url = photo;

            if (role) {
                if (!stat.data.roles) stat.data.roles = [];
                stat.data.roles.push({ role, movies: [m.title || ''] });
            }
        };

        // Helper para buscar foto en crew_details
        const getPhoto = (name: string, job?: string) => {
            if (!ext?.crew_details || !Array.isArray(ext.crew_details)) return undefined;
            const person = ext.crew_details.find((c: any) => c.name === name && (!job || c.job === job));
            return person?.photo;
        };

        // Directores
        if (m.director) {
            m.director.split(',').forEach((d: string) => {
                const cleanName = d.trim();
                const photo = getPhoto(cleanName, 'Director');
                processPerson('director', cleanName, undefined, photo);
            });
        }

        // Géneros
        const genres = Array.isArray(m.genres) ? m.genres : ext?.technical?.genres;
        if (Array.isArray(genres)) {
            genres.forEach((g: any) => {
                const stat = getStat('genre', String(g));
                stat.count++;
                stat.score += 10;
                stat.data.movies.push({
                    id: m.id,
                    title: m.title,
                    year: m.year,
                    poster_url: m.poster_url,
                    user_rating: rating
                });
            });
        }

        // Año de lanzamiento (Year)
        if (m.year) {
            const stat = getStat('year', String(m.year));
            stat.count++;
            stat.score += 10;
            stat.data.movies.push({
                id: m.id,
                title: m.title,
                year: m.year,
                poster_url: m.poster_url,
                user_rating: rating
            });
        }

        // --- Crew Específico (Guion, Foto, Música) ---

        // Guion (Screenplay/Writer)
        if (ext?.crew?.screenplay) {
            processPerson('screenplay', ext.crew.screenplay, undefined, getPhoto(ext.crew.screenplay));
        }

        // Fotografía (Cinematography)
        if (ext?.crew?.photography) {
            processPerson('photography', ext.crew.photography, undefined, getPhoto(ext.crew.photography, 'Director of Photography'));
        }

        // Música Original
        if (ext?.crew?.music) {
            processPerson('music', ext.crew.music, undefined, getPhoto(ext.crew.music, 'Original Music Composer'));
        }

        // Actores (Top 20Billing)
        if (Array.isArray(ext?.cast)) {
            const seenInMovie = new Set<string>();
            ext.cast.slice(0, 20).forEach((c: any) => {
                if (c.name && !seenInMovie.has(c.name)) {
                    processPerson('actor', c.name, c.role, c.photo);
                    seenInMovie.add(c.name);
                }
            });
        }
    }

    // 3. Post-Procesamiento de Scores (Lógica de Sagas para Actores)
    const flatResults: RankingStatConfig[] = [];

    Object.keys(aggregates).forEach(type => {
        Object.values(aggregates[type]).forEach(stat => {
            if (stat.type === 'actor' && stat.data.roles) {
                // Recalcular Score basado en Roles Únicos (Saga Logic)
                // Evitamos que un actor que sale en 8 pelis de Harry Potter domine solo por volumen.
                const uniqueRoles = new Set(stat.data.roles.map(r => r.role));
                const base = uniqueRoles.size * 10;
                const bonus = (stat.count - uniqueRoles.size) * 2; // +2 puntos por repetición del mismo rol
                stat.score = base + bonus;
            }

            flatResults.push(stat);
        });
    });

    return flatResults;
}
