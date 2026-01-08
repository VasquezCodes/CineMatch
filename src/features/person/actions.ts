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
        const [details, credits] = await Promise.all([
            tmdb.getPersonDetails(personSummary.id),
            tmdb.getPersonMovieCredits(personSummary.id)
        ]);

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

        for (const tmdbMovie of moviesToPersist) {
            // Verificar existencia en DB (Optimista por Título y Año)
            const { data: existingOptimistic } = await supabase
                .from('movies')
                .select('id, poster_url, title, year, imdb_id')
                .eq('title', tmdbMovie.title)
                .eq('year', new Date(tmdbMovie.release_date).getFullYear())
                .maybeSingle();

            if (existingOptimistic) {
                persistedMoviesMap.set(tmdbMovie.id, existingOptimistic);
            } else {
                const fullMovie = await tmdb.getMovieDetails(tmdbMovie.id);
                if (fullMovie && fullMovie.imdb_id) {
                    // Check Real por IMDB ID
                    const { data: existingReal } = await supabase
                        .from('movies')
                        .select('id, poster_url, title, year, imdb_id')
                        .eq('imdb_id', fullMovie.imdb_id)
                        .maybeSingle();

                    if (existingReal) {
                        persistedMoviesMap.set(tmdbMovie.id, existingReal);
                    } else {
                        // Insertar
                        const certification = fullMovie.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates[0]?.certification;
                        const trailer = fullMovie.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')?.key;

                        const { data: newSaved } = await supabase.from('movies').upsert({
                            imdb_id: fullMovie.imdb_id,
                            title: fullMovie.title,
                            year: fullMovie.release_date ? new Date(fullMovie.release_date).getFullYear() : null,
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
                        }, { onConflict: 'imdb_id' }).select().single();

                        if (newSaved) persistedMoviesMap.set(tmdbMovie.id, newSaved);
                    }
                }
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
