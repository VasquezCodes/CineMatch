import { TmdbClient, type TmdbMovieDetails } from '@/lib/tmdb';


// Tipos auxiliares para mappings de TMDB
type TmdbCrew = {
    id: number;
    name: string;
    job: string;
    profile_path: string | null
};

type TmdbCast = {
    id: number;
    name: string;
    character: string;
    profile_path: string | null
};

type TmdbGenre = { id: number; name: string };

type TmdbRecommendation = {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string
};

// Tipo para el payload de película que se guarda en la DB
export type MoviePayload = {
    title: string;
    year: number | null;
    imdb_id: string | null;
    tmdb_id: number;
    poster_url: string | null;
    backdrop_url: string | null;
    director: string | null;
    synopsis: string | null;
    imdb_rating: number | null;
    genres: string[];
    extended_data: {
        technical: {
            runtime: number | null;
            tagline: string | null;
        };
        cast: Array<{
            name: string;
            role: string;
            photo: string | null;
        }>;
        crew_details: Array<{
            name: string;
            job: string;
            photo: string | null;
        }>;
        recommendations: Array<{
            id: number;
            tmdb_id: number;
            title: string;
            year: number;
            poster: string | null;
        }>;
    };
};

/**
 * Mapea el cast de TMDB al formato de extended_data
 */
export function mapTmdbCast(cast: TmdbCast[] | undefined, limit: number = 50) {
    if (!cast) return [];

    return cast.slice(0, limit).map((c) => ({
        name: c.name,
        role: c.character,
        photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
    }));
}

/**
 * Mapea el crew de TMDB al formato de extended_data
 */
export function mapTmdbCrew(crew: TmdbCrew[] | undefined, limit: number = 20) {
    if (!crew) return [];

    return crew.slice(0, limit).map((c) => ({
        name: c.name,
        job: c.job,
        photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
    }));
}

/**
 * Mapea las recomendaciones de TMDB al formato de extended_data
 */
export function mapTmdbRecommendations(recommendations: TmdbRecommendation[] | undefined, limit: number = 12) {
    if (!recommendations) return [];

    return recommendations.slice(0, limit).map((r) => ({
        id: r.id,
        tmdb_id: r.id,
        title: r.title,
        year: r.release_date ? parseInt(r.release_date.split('-')[0]) : 0,
        poster: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null
    }));
}

/**
 * Encuentra el director en el crew de TMDB
 */
export function findDirector(crew: TmdbCrew[] | undefined): string | null {
    if (!crew) return null;
    return crew.find((c) => c.job === 'Director')?.name || null;
}

/**
 * Mapea una respuesta completa de TMDB al payload de película para la DB.
 * Esta función centraliza la lógica que antes estaba duplicada en movie/actions.ts
 */
export function mapTmdbMovieToPayload(
    tmdbMovie: TmdbMovieDetails,
    recommendations: TmdbRecommendation[] = []
): MoviePayload {
    return {
        title: tmdbMovie.title,
        year: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.split('-')[0]) : null,
        imdb_id: tmdbMovie.imdb_id,
        tmdb_id: tmdbMovie.id,
        poster_url: tmdbMovie.poster_path
            ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
            : null,
        backdrop_url: TmdbClient.getBestBackdropUrl(tmdbMovie.images, tmdbMovie.backdrop_path),
        director: findDirector(tmdbMovie.credits?.crew as TmdbCrew[]),
        synopsis: tmdbMovie.overview,
        imdb_rating: tmdbMovie.vote_average,
        genres: tmdbMovie.genres?.map((g: TmdbGenre) => g.name) || [],
        extended_data: {
            technical: {
                runtime: tmdbMovie.runtime,
                tagline: tmdbMovie.tagline,
            },
            cast: mapTmdbCast(tmdbMovie.credits?.cast as TmdbCast[]),
            crew_details: mapTmdbCrew(tmdbMovie.credits?.crew as TmdbCrew[]),
            recommendations: mapTmdbRecommendations(recommendations)
        }
    };
}
