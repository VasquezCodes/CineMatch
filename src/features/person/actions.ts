'use server';

import { tmdb, TmdbClient } from '@/lib/tmdb';
import { createClient } from '@/lib/supabase/server'; // Use server client
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Helper types for DB return
type DbPerson = {
    id: string;
    name: string;
    biography: string | null;
    birthday: string | null;
    deathday: string | null;
    place_of_birth: string | null;
    photo_url: string | null;
    known_for_department: string | null;
    tmdb_id: number;
    updated_at: string | null;
};

export type PersonProfile = {
    id: number; // TMDB ID for frontend compatibility
    name: string;
    biography: string;
    birthday: string | null;
    deathday: string | null;
    place_of_birth: string | null;
    profile_path: string | null; // For compatibility
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
    source?: 'db' | 'tmdb';
};

export async function getPersonProfile(name: string): Promise<PersonProfile | { error: string }> {
    if (!name) throw new Error('Name is required');

    const supabase = await createClient();

    // Admin client for writes (bypass RLS)
    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

    try {
        // 1. CACHE CHECK: Búsqueda en DB primero
        // Buscamos por nombre (ILIKE) ya que el parámetro de entrada es un nombre (desde la URL).
        // Idealmente usaríamos ID, pero esto permite optimizar sin cambiar las rutas actuales.
        const { data: dbPerson } = await supabase
            .from('people')
            .select('*')
            .ilike('name', decodeURIComponent(name))
            .limit(1)
            .maybeSingle();

        // 1.1 Verificación de Frescura (ej: 30 días)
        let isFresh = false;
        if (dbPerson && dbPerson.updated_at && dbPerson.biography) { // Verificamos 'biography' para asegurar que es un perfil completo
            const lastUpdate = new Date(dbPerson.updated_at);
            const now = new Date();
            const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);
            if (diffDays < 30) {
                isFresh = true;
            }
        }

        // 2. HIT: Retornar desde DB si existe y es reciente
        if (dbPerson && isFresh && dbPerson.biography) {
            // console.log(`[Cache Hit] Serving ${name} from DB`);

            // Obtener créditos desde las relaciones en la DB (`movie_people`)
            const { data: creditsData } = await supabase
                .from('movie_people')
                .select(`
                    role,
                    job,
                    movies (
                        id,
                        title,
                        poster_url,
                        year,
                        imdb_rating,
                        tmdb_id
                        
                    )
                `)
                .eq('person_id', dbPerson.id);

            // Transformar créditos de DB a la estructura estándar de TMDB
            const cast: any[] = [];
            const crew: any[] = [];

            creditsData?.forEach((item: any) => {
                if (!item.movies) return;

                const movie = {
                    id: item.movies.tmdb_id, // Can be null, filtered later
                    title: item.movies.title,
                    poster_path: item.movies.poster_url, // URL completa
                    release_date: item.movies.year ? `${item.movies.year}-01-01` : null,
                    vote_average: item.movies.imdb_rating,
                    character: item.role === 'Actor' ? item.job : undefined,
                    job: item.job
                };

                if (movie.id && movie.id !== 0) {
                    if (item.role === 'Actor') {
                        cast.push(movie);
                    } else {
                        crew.push(movie);
                    }
                }
            });

            // Helpers de filtrado
            const filterJob = (job: string) => crew.filter(c => c.job === job);
            const filterDept = (jobs: string[]) => crew.filter(c => jobs.includes(c.job));

            // Si encontramos créditos en la DB, los retornamos.
            // Si NO hay créditos (ej. se borraron o nunca se linkearon), dejamos pasar al fallback de TMDB.
            if (cast.length > 0 || crew.length > 0) {
                return {
                    id: dbPerson.tmdb_id,
                    name: dbPerson.name,
                    biography: dbPerson.biography || '',
                    birthday: dbPerson.birthday,
                    deathday: dbPerson.deathday,
                    place_of_birth: dbPerson.place_of_birth,
                    profile_path: dbPerson.photo_url,
                    photo_url: dbPerson.photo_url,
                    known_for_department: dbPerson.known_for_department || 'Unknown',
                    credits: {
                        cast: cast,
                        crew: {
                            directing: filterJob('Director'),
                            writing: filterDept(['Screenplay', 'Writer', 'Author', 'Story']),
                            production: filterJob('Producer'),
                            camera: filterDept(['Director of Photography', 'Cinematographer']),
                            sound: filterDept(['Original Music Composer', 'Music']),
                            other: crew.filter(c => !['Director', 'Screenplay', 'Writer', 'Author', 'Story', 'Producer', 'Director of Photography', 'Cinematographer', 'Original Music Composer', 'Music'].includes(c.job || ''))
                        }
                    },
                    source: 'db'
                };
            }
            // console.log(`[Cache Hit] But no credits found for ${name}. Falling back to TMDB.`);
        }

        // 3. MISS or STALE: Fetch desde TMDB
        // console.log(`[Cache Miss] Fetching ${name} from TMDB`);

        // 3.1 Resolver ID: Si teníamos un dato viejo en DB, usamos su tmdb_id. Si no, buscamos.
        let tmdbId = dbPerson?.tmdb_id;
        if (!tmdbId) {
            const people = await tmdb.searchPerson(name);
            const personSummary = people[0];
            if (!personSummary) return { error: 'Person not found' };
            tmdbId = personSummary.id;
        }

        // 3.2 Obtener Detalles Completos
        let [details, credits] = await Promise.all([
            tmdb.getPersonDetails(tmdbId),
            tmdb.getPersonMovieCredits(tmdbId)
        ]);

        // Fallbacks para Biografía (Intento ES -> Fallback EN)
        if (details && !details.biography) {
            const spainDetails = await tmdb.getPersonDetails(tmdbId, 'es-ES');
            if (spainDetails?.biography) details.biography = spainDetails.biography;
            else {
                const englishDetails = await tmdb.getPersonDetails(tmdbId, 'en-US');
                if (englishDetails?.biography) details.biography = englishDetails.biography;
            }
        }

        if (!details) return { error: 'Details not found' };

        // 4. WRITE-THROUGH: Persistir Perfil en DB
        // Guardamos la información completa (biografía, fechas, etc.) para futuros hits.
        const PROFILE_UPSERT = {
            tmdb_id: details.id,
            name: details.name,
            biography: details.biography,
            birthday: details.birthday || null,
            deathday: details.deathday || null,
            place_of_birth: details.place_of_birth,
            known_for_department: details.known_for_department,
            photo_url: TmdbClient.getImageUrl(details.profile_path, 'original'),
            updated_at: new Date().toISOString()
        };

        const { data: savedPerson, error: dbError } = await adminClient
            .from('people')
            .upsert(PROFILE_UPSERT, { onConflict: 'tmdb_id' })
            .select('id')
            .single();

        if (dbError) console.error('Error caching person:', dbError);

        // 5. SEED MOVIES & RELATIONS (Optimizado)
        // Solo sembramos las películas más relevantes para evitar saturar la DB
        // al visitar perfiles con 500+ créditos menores.

        if (savedPerson && credits) {
            const castMovies = credits.cast || [];
            const crewMovies = credits.crew || [];

            // Estrategia: Elegir las 20 películas más populares/votadas para cachear
            const allMovies = [...castMovies, ...crewMovies];
            const uniqueMovies = new Map();
            allMovies.forEach(m => {
                if (m.id && !uniqueMovies.has(m.id)) uniqueMovies.set(m.id, m);
            });

            const sortedMovies = Array.from(uniqueMovies.values())
                .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0))
                .slice(0, 20); // Top 20

            // Insert Movies First
            const moviesToUpsert: any[] = [];
            const movieRelations: { movie_id: string; person_id: string; role: string; job: string }[] = [];

            for (const m of sortedMovies) {
                const releaseDate = m.release_date ? new Date(m.release_date) : null;
                moviesToUpsert.push({
                    tmdb_id: m.id,
                    title: m.title,
                    poster_url: TmdbClient.getImageUrl(m.poster_path, 'w500'),
                    year: releaseDate ? releaseDate.getFullYear() : null,
                    imdb_rating: m.vote_average,
                    synopsis: m.overview,
                    updated_at: new Date().toISOString()
                });
            }

            // 5. Update Movies & Relations (Optimizado)
            // Upsert movies to ensure they exist before linking
            if (moviesToUpsert.length > 0) {
                const { error: moviesError } = await adminClient
                    .from('movies')
                    .upsert(moviesToUpsert, { onConflict: 'tmdb_id', ignoreDuplicates: true });

                if (moviesError) console.error('Error seeding movies:', moviesError);
            }

            // Re-fetch IDs for all related movies (including just inserted ones)
            const tmdbIds = sortedMovies.map(m => m.id);
            const { data: existingMovies } = await adminClient
                .from('movies')
                .select('id, tmdb_id')
                .in('tmdb_id', tmdbIds);

            const existingMovieMap = new Map(existingMovies?.map(m => [m.tmdb_id, m.id]));

            // Create Relations for Existing Movies
            allMovies.forEach(credit => {
                const movieId = existingMovieMap.get(credit.id);
                if (movieId) {
                    movieRelations.push({
                        movie_id: movieId,
                        person_id: savedPerson.id,
                        role: credit.character ? 'Actor' : credit.job || 'Crew',
                        job: credit.character || credit.job
                    });
                }
            });

            if (movieRelations.length > 0) {
                const { error: linkError } = await adminClient
                    .from('movie_people')
                    .upsert(movieRelations, { onConflict: 'movie_id, person_id, role, job' });

                if (linkError) console.error('Error linking movies:', linkError);
            }
        }


        // 6. Return standard response (from TMDB data)
        const castM = credits?.cast || [];
        const crewM = credits?.crew || [];

        // Use same enrich helpers?
        const enrichList = (list: any[]) => {
            return list.map(item => ({
                ...item,
                poster_path: TmdbClient.getImageUrl(item.poster_path, 'w500'),
                release_year: item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'
            })).sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime());
        };

        const directing = crewM.filter((c: any) => c.job === 'Director');
        const writing = crewM.filter((c: any) => ['Screenplay', 'Writer', 'Author', 'Story'].includes(c.job));
        const camera = crewM.filter((c: any) => ['Director of Photography', 'Cinematographer'].includes(c.job));
        const sound = crewM.filter((c: any) => ['Original Music Composer', 'Music'].includes(c.job));
        const production = crewM.filter((c: any) => c.job === 'Producer');
        const other = crewM.filter((c: any) =>
            !directing.includes(c) && !writing.includes(c) && !camera.includes(c) && !sound.includes(c) && !production.includes(c)
        );

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
                cast: enrichList(castM),
                crew: {
                    directing: enrichList(directing),
                    writing: enrichList(writing),
                    production: enrichList(production),
                    camera: enrichList(camera),
                    sound: enrichList(sound),
                    other: enrichList(other)
                }
            },
            source: 'tmdb'
        };

    } catch (error) {
        console.error('Error fetching person profile:', error);
        return { error: 'Internal Server Error' };
    }
}
