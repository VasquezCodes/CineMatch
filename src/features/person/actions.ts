'use server';

import { tmdb, TmdbClient } from '@/lib/tmdb';
import { createClient } from '@/lib/supabase/server'; // Use server client
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Tipos auxiliares para respuestas de DB
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

// Tipo para créditos de filmografía
type FilmCredit = {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string | null;
    vote_average: number | null;
    vote_count?: number;
    character?: string;
    job?: string;
    overview?: string;
};

// Tipo para filas de créditos desde la DB
type CreditsDbRow = {
    role: string;
    job: string;
    movies: {
        id: string;
        title: string;
        poster_url: string | null;
        year: number | null;
        imdb_rating: number | null;
        tmdb_id: number | null;
    } | null;
};

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
        cast: FilmCredit[];
        crew: {
            directing: FilmCredit[];
            writing: FilmCredit[];
            production: FilmCredit[];
            camera: FilmCredit[];
            sound: FilmCredit[];
            other: FilmCredit[];
        };
    };
    error?: string;
    source?: 'db' | 'tmdb';
};

export async function getPersonProfile(name: string): Promise<PersonProfile | { error: string }> {
    if (!name) throw new Error('Name is required');

    const supabase = await createClient();

    // Cliente admin para escrituras (bypass RLS)
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
            const cast: FilmCredit[] = [];
            const crew: FilmCredit[] = [];

            (creditsData as CreditsDbRow[] | null)?.forEach((item) => {
                if (!item.movies) return;

                const movie: FilmCredit = {
                    id: item.movies.tmdb_id ?? 0,
                    title: item.movies.title,
                    poster_path: item.movies.poster_url,
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
            const filterDept = (jobs: string[]) => crew.filter(c => c.job && jobs.includes(c.job));

            // Sin créditos, pasar al fallback de TMDB
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
        }

        // 3. MISS or STALE: Fetch desde TMDB

        // Resolver TMDB ID si no lo tenemos
        let tmdbId = dbPerson?.tmdb_id;
        if (!tmdbId) {
            const people = await tmdb.searchPerson(name);
            const personSummary = people[0];
            if (!personSummary) return { error: 'Person not found' };
            tmdbId = personSummary.id;
        }

        // Obtener detalles completos de TMDB
        let [details, credits] = await Promise.all([
            tmdb.getPersonDetails(tmdbId),
            tmdb.getPersonMovieCredits(tmdbId)
        ]);

        // Fallback de biografía: ES -> EN
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

            // Cachear solo las 20 películas más populares
            const allMovies = [...castMovies, ...crewMovies];
            const uniqueMovies = new Map();
            allMovies.forEach(m => {
                if (m.id && !uniqueMovies.has(m.id)) uniqueMovies.set(m.id, m);
            });

            const sortedMovies = Array.from(uniqueMovies.values()) as FilmCredit[];
            sortedMovies.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
            const top20Movies = sortedMovies.slice(0, 20);

            // Tipo para payload de upsert
            type MovieUpsertPayload = {
                tmdb_id: number;
                title: string;
                poster_url: string | null;
                year: number | null;
                imdb_rating: number | null;
                synopsis: string | null;
                updated_at: string;
            };

            // Insertar películas primero
            const moviesToUpsert: MovieUpsertPayload[] = [];
            const movieRelations: { movie_id: string; person_id: string; role: string; job: string }[] = [];

            for (const m of sortedMovies) {
                const releaseDate = m.release_date ? new Date(m.release_date) : null;
                moviesToUpsert.push({
                    tmdb_id: m.id,
                    title: m.title,
                    poster_url: TmdbClient.getImageUrl(m.poster_path, 'w500'),
                    year: releaseDate ? releaseDate.getFullYear() : null,
                    imdb_rating: m.vote_average,
                    synopsis: m.overview ?? null,
                    updated_at: new Date().toISOString()
                });
            }

            // 5. Actualizar películas y relaciones (Optimizado)
            // Upsert películas para asegurar que existan antes de linkear
            if (moviesToUpsert.length > 0) {
                const { error: moviesError } = await adminClient
                    .from('movies')
                    .upsert(moviesToUpsert, { onConflict: 'tmdb_id', ignoreDuplicates: true });

                if (moviesError) console.error('Error seeding movies:', moviesError);
            }

            // Re-obtener IDs de películas relacionadas (incluyendo las recién insertadas)
            const tmdbIds = sortedMovies.map(m => m.id);
            const { data: existingMovies } = await adminClient
                .from('movies')
                .select('id, tmdb_id')
                .in('tmdb_id', tmdbIds);

            const existingMovieMap = new Map(existingMovies?.map(m => [m.tmdb_id, m.id]));

            // Crear relaciones para películas existentes
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


        // 6. Retornar respuesta estándar (desde datos de TMDB)
        const castM = credits?.cast || [];
        const crewM = credits?.crew || [];

        // Use same enrich helpers?
        const enrichList = (list: FilmCredit[]) => {
            return list.map(item => ({
                ...item,
                poster_path: TmdbClient.getImageUrl(item.poster_path, 'w500'),
                release_year: item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'
            })).sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime());
        };

        const directing = crewM.filter((c: FilmCredit) => c.job === 'Director');
        const writing = crewM.filter((c: FilmCredit) => c.job && ['Screenplay', 'Writer', 'Author', 'Story'].includes(c.job));
        const camera = crewM.filter((c: FilmCredit) => c.job && ['Director of Photography', 'Cinematographer'].includes(c.job));
        const sound = crewM.filter((c: FilmCredit) => c.job && ['Original Music Composer', 'Music'].includes(c.job));
        const production = crewM.filter((c: FilmCredit) => c.job === 'Producer');
        const other = crewM.filter((c: FilmCredit) =>
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
