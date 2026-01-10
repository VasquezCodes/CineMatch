'use server';

import { tmdb, TmdbClient } from '@/lib/tmdb';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        }
    }
);

export type PersonProfile = {
    id: number;
    name: string;
    biography: string;
    birthday: string | null;
    deathday: string | null;
    place_of_birth: string | null;
    profile_path: string | null;
    photo_url: string | null;
    known_for_department: string;
    credits: {
        cast: any[];
        crew: {
            directing: any[];
            writing: any[];
            production: any[];
            camera: any[];
            sound: any[];
            other: any[];
        };
    };
    error?: string;
};

export async function getPersonProfile(name: string): Promise<PersonProfile | { error: string }> {
    if (!name) throw new Error('Name is required');

    try {
        // 1. Buscar Persona
        const people = await tmdb.searchPerson(name);
        const personSummary = people[0]; // Tomamos el primer resultado (el más relevante)

        if (!personSummary) return { error: 'Person not found' };

        // 2. Obtener Detalles Completos (Bio, etc) y Créditos en paralelo
        let [details, credits] = await Promise.all([
            tmdb.getPersonDetails(personSummary.id),
            tmdb.getPersonMovieCredits(personSummary.id)
        ]);

        // FALLBACK BIOGRAFÍA: Si no hay biografía en español, intentar en inglés
        // FALLBACK BIOGRAFÍA: Water Fall Strategy (MX -> ES -> US)
        // Muchas veces la bio está en 'es-ES' pero vacía en 'es-MX'.
        if (details && !details.biography) {
            // 1. Intentar Español España
            const spainDetails = await tmdb.getPersonDetails(personSummary.id, 'es-ES');
            if (spainDetails?.biography) {
                // console.log(`[Person] Found bio in es-ES for ${personSummary.name}`);
                details.biography = spainDetails.biography;
            } else {
                // 2. Si falla, Inglés (Último recurso)
                // console.log(`[Person] Bio missing (es-ES) for ${personSummary.name}, fetching English fallback...`);
                const englishDetails = await tmdb.getPersonDetails(personSummary.id, 'en-US');
                if (englishDetails?.biography) {
                    details.biography = englishDetails.biography;
                }
            }
        }

        if (!details) return { error: 'Details not found' };

        // 3. Organizar Créditos y Seleccionar Películas para Persistir
        const castMovies = credits?.cast || [];
        const crewMovies = credits?.crew || [];

        // Agrupar crew por departamentos relevantes
        const directing = crewMovies.filter((c: any) => c.job === 'Director');
        const writing = crewMovies.filter((c: any) => ['Screenplay', 'Writer', 'Author', 'Story'].includes(c.job));
        const camera = crewMovies.filter((c: any) => ['Director of Photography', 'Cinematographer'].includes(c.job));
        const sound = crewMovies.filter((c: any) => ['Original Music Composer', 'Music'].includes(c.job));
        const production = crewMovies.filter((c: any) => c.job === 'Producer'); // Opcional, por si interesa

        const other = crewMovies.filter((c: any) =>
            !directing.includes(c) && !writing.includes(c) && !camera.includes(c) && !sound.includes(c) && !production.includes(c)
        );

        // 4. Seeding On-Demand Inteligente
        // Seleccionamos un subconjunto de películas para persistir y asegurar que existen en la DB.
        // Priorizamos las más recientes y populares.
        // Unimos todas las películas únicas relevantes para procesar.

        const allRelevantMoviesMap = new Map();

        const addToMap = (list: any[]) => {
            list.forEach(movie => {
                // Usamos ID de TMDB como clave
                if (movie.id && movie.release_date) {
                    allRelevantMoviesMap.set(movie.id, movie);
                }
            });
        };

        // Tomamos top 20 de cada categoría relevante para no saturar
        // MEJORA: Combinamos "Más Recientes" con "Más Populares" (por votos) para asegurar que clásicos
        // como Titanic o Wolf of Wall Street se guarden aunque haya muchos créditos recientes menores (documentales, etc).
        const sortNewest = (a: any, b: any) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
        const sortMostVoted = (a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0);

        const addCandidates = (list: any[], dateLimit: number, voteLimit: number) => {
            // 1. Por Fecha
            const newest = list.sort(sortNewest).slice(0, dateLimit);
            addToMap(newest);

            // 2. Por Votos (Popularidad histórica)
            const popular = list.sort(sortMostVoted).slice(0, voteLimit);
            addToMap(popular);
        };

        addCandidates(castMovies, 15, 15); // Top 15 recientes + Top 15 hits
        addCandidates(directing, 10, 10);
        addCandidates(writing, 5, 5);
        addCandidates(camera, 5, 5);
        addCandidates(sound, 5, 5);

        const moviesToPersist = Array.from(allRelevantMoviesMap.values());

        // Procesamos la persistencia (esto podría optimizarse con Promise.all pero hacemos batch secuencial por seguridad de rate limit tmdb)
        // Nota: Para mejorar la velocidad de respuesta, idealmente esto debería ir a una cola en background,
        // pero por ahora lo hacemos inline para asegurar consistencia inmediata.

        const persistedMoviesMap = new Map(); // Mapa para enriquecer la respuesta con datos de nuestra DB (id, poster, etc)

        // 5. Batch Persistence Strategy
        // Instead of processing one by one, we:
        // A. Batch fetch potential existing movies from DB by title
        // B. Filter out what we already have
        // C. Parallel fetch TMDB details for missing movies
        // D. Batch insert/upsert new movies into DB

        // variable `persistedMoviesMap` is already declared above

        // A. Optimistic Check: Fetch potentially existing movies by Title
        const candidateTitles = moviesToPersist.map(m => m.title).filter(t => t);

        let existingCandidates: any[] = [];
        if (candidateTitles.length > 0) {
            // Helper to batch large IN queries if necessary, though <100 titles should be fine in one go for Postgres
            const { data } = await supabase
                .from('movies')
                .select('id, poster_url, title, year, imdb_id')
                .in('title', candidateTitles);
            if (data) existingCandidates = data;
        }

        // B. Match TMDB candidates with DB results (Client-side filtering for Year precision)
        const missingFromDb: any[] = [];

        for (const tmdbMovie of moviesToPersist) {
            // Try to find in fetched DB candidates
            const tmdbYear = tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null;

            const match = existingCandidates.find(dbMovie =>
                dbMovie.title === tmdbMovie.title &&
                (!tmdbYear || !dbMovie.year || dbMovie.year === tmdbYear)
            );

            if (match) {
                persistedMoviesMap.set(tmdbMovie.id, match);
            } else {
                missingFromDb.push(tmdbMovie);
            }
        }

        // C. Parallel Fetch TMDB Details for missing movies
        // We limit concurrency to avoid aggressive rate limiting, though 20-30 is usually safe.
        const BATCH_SIZE = 10;
        const moviesToUpsert: any[] = [];

        // This mapping allows us to map the inserted DB result back to the original TMDB ID
        // Key: imdb_id, Value: tmdb_id
        const imdbToTmdbIdMap = new Map<string, number>();

        for (let i = 0; i < missingFromDb.length; i += BATCH_SIZE) {
            const chunk = missingFromDb.slice(i, i + BATCH_SIZE);

            const chunkDetails = await Promise.all(
                chunk.map(async (m) => {
                    try {
                        return await tmdb.getMovieDetails(m.id);
                    } catch (e) {
                        console.error(`Failed to fetch details for movie ${m.id}`, e);
                        return null;
                    }
                })
            );

            // Prepare for DB Upsert
            for (const fullMovie of chunkDetails) {
                if (!fullMovie || !fullMovie.imdb_id) continue;

                // Create upsert object
                const releaseDate = fullMovie.release_date ? new Date(fullMovie.release_date) : null;
                const certification = fullMovie.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates[0]?.certification;
                const trailer = fullMovie.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')?.key;

                const dbObject = {
                    imdb_id: fullMovie.imdb_id,
                    title: fullMovie.title,
                    year: releaseDate ? releaseDate.getFullYear() : null,
                    poster_url: TmdbClient.getImageUrl(fullMovie.poster_path, 'w500'),
                    director: fullMovie.credits.crew.filter((c: any) => c.job === 'Director').map((c: any) => c.name).join(', '),
                    synopsis: fullMovie.overview,
                    imdb_rating: fullMovie.vote_average,
                    genres: fullMovie.genres.map((g: any) => g.name),
                    extended_data: {
                        cast: fullMovie.credits.cast.slice(0, 50).map((c: any) => ({
                            name: c.name,
                            role: c.character,
                            photo: TmdbClient.getImageUrl(c.profile_path, 'w185')
                        })),
                        crew: {
                            director: fullMovie.credits.crew.filter((c: any) => c.job === 'Director').map((c: any) => c.name).join(', '),
                            screenplay: fullMovie.credits.crew.find((c: any) => c.job === 'Screenplay' || c.job === 'Writer')?.name,
                            photography: fullMovie.credits.crew.find((c: any) => c.job === 'Director of Photography')?.name,
                            music: fullMovie.credits.crew.find((c: any) => c.job === 'Original Music Composer')?.name
                        },
                        crew_details: fullMovie.credits.crew
                            .filter((c: any) => ['Director', 'Screenplay', 'Writer', 'Director of Photography', 'Original Music Composer'].includes(c.job))
                            .map((c: any) => ({
                                name: c.name,
                                job: c.job,
                                photo: TmdbClient.getImageUrl(c.profile_path, 'w185')
                            })),
                        technical: {
                            runtime: fullMovie.runtime,
                            genres: fullMovie.genres.map((g: any) => g.name),
                            certification: certification,
                            trailer_key: trailer
                        }
                    }
                };

                moviesToUpsert.push(dbObject);
                // Also track which TMDB ID this belongs to, using IMDB ID as the bridge
                // We need to find the original TMDB movie that led to this fullMovie
                // Since we are iterating chunk results which map 1:1 to chunk (missingFromDb), we can find it.
                // But wait, chunkDetails is array of results. We can pair them up.
                // Let's rely on finding the original request in the loop below or just Map it here.
            }

            // Map the TMDB ID for the upcoming upserted rows
            chunk.forEach((m, idx) => {
                const detail = chunkDetails[idx];
                if (detail && detail.imdb_id) {
                    imdbToTmdbIdMap.set(detail.imdb_id, m.id);
                }
            });
        }

        // D. Batch Upsert
        if (moviesToUpsert.length > 0) {
            const { data: upsertedData, error: upsertError } = await supabase
                .from('movies')
                .upsert(moviesToUpsert, { onConflict: 'imdb_id' })
                .select();

            if (upsertError) {
                console.error('Batch upsert failed', upsertError);
            } else if (upsertedData) {
                // Add upserted movies to persistedMoviesMap
                upsertedData.forEach((savedMovie: any) => {
                    const tmdbId = imdbToTmdbIdMap.get(savedMovie.imdb_id);
                    if (tmdbId) {
                        persistedMoviesMap.set(tmdbId, savedMovie);
                    }
                });
            }
        }

        // 5. Enriquecer los créditos originales con la info persistida (poster local, id local)
        // Esto permite que el frontend use las imágenes optimizadas o tenga links a la DB interna
        const enrichList = (list: any[]) => {
            return list.map(item => {
                const persisted = persistedMoviesMap.get(item.id);
                return {
                    ...item,
                    poster_path: persisted ? persisted.poster_url : TmdbClient.getImageUrl(item.poster_path, 'w500'),
                    db_id: persisted?.id || null, // ID interno en nuestra DB
                    release_year: item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'
                };
            }).sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime());
        };

        return {
            id: details.id,
            name: details.name,
            biography: details.biography,
            birthday: details.birthday,
            deathday: details.deathday,
            place_of_birth: details.place_of_birth,
            profile_path: details.profile_path,
            photo_url: TmdbClient.getImageUrl(details.profile_path, 'original'),
            known_for_department: details.known_for_department,
            credits: {
                cast: enrichList(castMovies),
                crew: {
                    directing: enrichList(directing),
                    writing: enrichList(writing),
                    production: enrichList(production),
                    camera: enrichList(camera),
                    sound: enrichList(sound),
                    other: enrichList(other)
                }
            }
        };

    } catch (error) {
        console.error('Error fetching person profile:', error);
        return { error: 'Internal Server Error' };
    }
}
