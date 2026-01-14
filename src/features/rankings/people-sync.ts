import { SupabaseClient } from '@supabase/supabase-js';
import { TmdbClient } from '@/lib/tmdb';

type TmdbCreditPerson = {
    id: number;
    name: string;
    profile_path: string | null;
    job?: string; // Para crew
    character?: string; // Para cast
};

/**
 * Sincroniza el cast y crew de una película desde TMDB hacia las tablas `people` y `movie_people`.
 * Esta lógica centraliza la ingesta de datos relacionales para normalización.
 * Es idempotente y eficiente (usa upserts).
 */
export async function syncMoviePeople(
    supabase: SupabaseClient,
    movieId: string,
    tmdbCredits: { cast: TmdbCreditPerson[]; crew: TmdbCreditPerson[] }
) {
    if (!tmdbCredits) return;

    // 1. Preparar datos de Personas (Actores + Crew relevante)
    const relevantCrewJobs = ['Director', 'Screenplay', 'Writer', 'Director of Photography', 'Original Music Composer'];

    // Filtramos crew relevante
    const relevantCrew = tmdbCredits.crew.filter(c => relevantCrewJobs.includes(c.job || ''));

    // Top 50 actores
    const relevantCast = tmdbCredits.cast.slice(0, 50);

    // Unificamos lista de personas para insertar en lote en `people`
    // Usamos Map por ID para eliminar duplicados (e.g. Director que también es Escritor)
    const uniquePeopleMap = new Map<number, { tmdb_id: number; name: string; photo_url: string | null }>();

    [...relevantCrew, ...relevantCast].forEach(p => {
        if (!uniquePeopleMap.has(p.id)) {
            uniquePeopleMap.set(p.id, {
                tmdb_id: p.id,
                name: p.name,
                photo_url: TmdbClient.getImageUrl(p.profile_path, 'w185')
            });
        }
    });

    const peoplePayload = Array.from(uniquePeopleMap.values());

    if (peoplePayload.length === 0) return;

    // 2. Upsert People (Insertar personas nuevas)
    // Upsert masivo. 'tmdb_id' debe ser UNIQUE en la DB.
    const { data: insertedPeople, error: peopleError } = await supabase
        .from('people')
        .upsert(peoplePayload, { onConflict: 'tmdb_id' })
        .select('id, tmdb_id');

    if (peopleError) {
        console.error('Error upserting people:', peopleError);
        return; // Si fallan las personas, no podemos linkear
    }

    if (!insertedPeople) return;

    // Mapa rápido TMDB_ID -> UUID
    const personIdMap = new Map<number, string>();
    insertedPeople.forEach(p => personIdMap.set(p.tmdb_id, p.id));

    // 3. Preparar relaciones (Movie People)
    const relationsPayload: any[] = [];

    // Crew
    relevantCrew.forEach(c => {
        const personId = personIdMap.get(c.id);
        if (personId) {
            relationsPayload.push({
                movie_id: movieId,
                person_id: personId,
                role: c.job, // Director, etc.
                job: c.job   // Redundante pero explícito para structure
            });
        }
    });

    // Cast
    relevantCast.forEach(c => {
        const personId = personIdMap.get(c.id);
        if (personId) {
            relationsPayload.push({
                movie_id: movieId,
                person_id: personId,
                role: 'Actor',
                job: c.character // Guardamos el nombre del personaje en 'job' o podríamos añadir col 'character'
            });
        }
    });

    // 4. Upsert Relations
    // onConflict en (movie_id, person_id, role, job)
    const { error: relError } = await supabase
        .from('movie_people')
        .upsert(relationsPayload, { onConflict: 'movie_id, person_id, role, job' });

    if (relError) {
        console.error('Error linking movie people:', relError);
    }
}
