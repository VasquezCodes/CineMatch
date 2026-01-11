
import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

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

export type RankingCategory = RankingStatConfig['type'];

/**
 * Calculates ranking statistics for a given user, optionally filtered by category.
 * @param userId - The user to calculate stats for
 * @param client - Optional Supabase client
 * @param category - Optional specific category to calculate (optimizes fetch)
 */
export async function calculateRankings(
    userId: string,
    client?: SupabaseClient,
    category?: RankingCategory
): Promise<RankingStatConfig[]> {
    const supabase = client || await createClient();

    // Mapping of category to necessary fields to optimize Query Size
    // If no category is provided (legacy mode), we fetch everything.
    let selectQuery = `
        user_rating,
        movies (
            id,
            title,
            year,
            poster_url,
            director, 
            genres,
            extended_data
        )
    `;

    // Optimization: Select only what's needed for the specific category
    if (category) {
        switch (category) {
            case 'director':
                selectQuery = `user_rating, movies (id, title, year, poster_url, director, extended_data)`; // extended_data needed for photo logic
                break;
            case 'genre':
                selectQuery = `user_rating, movies (id, title, year, poster_url, genres, extended_data)`; // extended derived from tech
                break;
            case 'year':
                selectQuery = `user_rating, movies (id, title, year, poster_url)`;
                break;
            case 'actor':
            case 'screenplay':
            case 'photography':
            case 'music':
                // These live in extended_data
                selectQuery = `user_rating, movies (id, title, year, poster_url, extended_data)`;
                break;
        }
    }

    const { data: watchlistItems, error } = await supabase
        .from('watchlists')
        .select(selectQuery)
        .eq('user_id', userId)
        .gte('user_rating', 1);

    if (error || !watchlistItems) {
        console.error('Error fetching data for stats:', error);
        throw new Error('Failed to fetch user library');
    }

    // Cast to any[] because dynamic select query breaks automatic type inference
    const items = watchlistItems as any[];

    // Initialize aggregates structure
    const aggregates: Record<string, Record<string, RankingStatConfig>> = {};
    if (category) {
        aggregates[category] = {};
    } else {
        // Legacy: All categories
        ['director', 'actor', 'genre', 'year', 'screenplay', 'photography', 'music'].forEach(c => aggregates[c] = {});
    }

    const initStat = (type: any, key: string): RankingStatConfig => ({
        type, key, count: 0, score: 0, data: { movies: [] }
    });

    const getStat = (type: string, key: string) => {
        if (!aggregates[type]) aggregates[type] = {};
        if (!aggregates[type][key]) aggregates[type][key] = initStat(type, key);
        return aggregates[type][key];
    };

    for (const item of items) {
        const m = Array.isArray(item.movies) ? item.movies[0] : item.movies;
        if (!m) continue;

        const ext = m.extended_data as any || {};
        const rating = item.user_rating || 0;

        // --- Helpers ---
        const processPerson = (type: string, name?: string, role?: string, photo?: string) => {
            if (!name || (category && category !== type)) return;

            const cleanName = name.trim();
            const stat = getStat(type, cleanName);

            stat.count++;
            stat.score += 10;
            stat.data.movies.push({
                id: m.id,
                title: m.title,
                year: m.year,
                poster_url: m.poster_url,
                user_rating: rating
            });
            if (photo && !stat.data.image_url) stat.data.image_url = photo;

            if (role) {
                if (!stat.data.roles) stat.data.roles = [];
                stat.data.roles.push({ role, movies: [m.title || ''] });
            }
        };

        const getPhoto = (name: string, job?: string) => {
            if (!ext?.crew_details || !Array.isArray(ext.crew_details)) return undefined;
            const person = ext.crew_details.find((c: any) => c.name === name && (!job || c.job === job));
            return person?.photo;
        };

        // 1. Directores
        if (!category || category === 'director') {
            if (m.director) {
                m.director.split(',').forEach((d: string) => {
                    const cleanName = d.trim();
                    processPerson('director', cleanName, undefined, getPhoto(cleanName, 'Director'));
                });
            }
        }

        // 2. Géneros
        if (!category || category === 'genre') {
            const genres = Array.isArray(m.genres) ? m.genres : ext?.technical?.genres;
            if (Array.isArray(genres)) {
                genres.forEach((g: any) => {
                    if (g) {
                        const stat = getStat('genre', String(g));
                        stat.count++;
                        stat.score += 10; // Simple score for genres
                        stat.data.movies.push({
                            id: m.id, title: m.title, year: m.year, poster_url: m.poster_url, user_rating: rating
                        });
                    }
                });
            }
        }

        // 3. Año
        if (!category || category === 'year') {
            if (m.year) {
                const stat = getStat('year', String(m.year));
                stat.count++;
                stat.score += 10;
                stat.data.movies.push({
                    id: m.id, title: m.title, year: m.year, poster_url: m.poster_url, user_rating: rating
                });
            }
        }

        // 4. Crew Específico
        if (!category || category === 'screenplay') {
            if (ext?.crew?.screenplay) processPerson('screenplay', ext.crew.screenplay, undefined, getPhoto(ext.crew.screenplay));
        }
        if (!category || category === 'photography') {
            if (ext?.crew?.photography) processPerson('photography', ext.crew.photography, undefined, getPhoto(ext.crew.photography, 'Director of Photography'));
        }
        if (!category || category === 'music') {
            if (ext?.crew?.music) processPerson('music', ext.crew.music, undefined, getPhoto(ext.crew.music, 'Original Music Composer'));
        }

        // 5. Actores
        if (!category || category === 'actor') {
            if (Array.isArray(ext?.cast)) {
                const seenInMovie = new Set<string>();
                // Solo procesamos Top 20 para no saturar rankings con extras
                ext.cast.slice(0, 20).forEach((c: any) => {
                    if (c.name && !seenInMovie.has(c.name)) {
                        processPerson('actor', c.name, c.role, c.photo);
                        seenInMovie.add(c.name);
                    }
                });
            }
        }
    }

    // Post-Procesamiento (Scores ponderados para Actores)
    const flatResults: RankingStatConfig[] = [];

    Object.keys(aggregates).forEach(type => {
        Object.values(aggregates[type]).forEach(stat => {
            if (stat.type === 'actor' && stat.data.roles) {
                // Lógica de Saga: Premiar roles únicos, bonificar repeticiones pero menos
                const uniqueRoles = new Set(stat.data.roles.map(r => r.role));
                const base = uniqueRoles.size * 10;
                const bonus = (stat.count - uniqueRoles.size) * 2;
                stat.score = base + bonus;
            }
            flatResults.push(stat);
        });
    });

    return flatResults;
}
