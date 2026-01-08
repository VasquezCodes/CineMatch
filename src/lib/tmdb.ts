import { env } from 'process';

const TMDB_READ_TOKEN = process.env.TMDB_READ_TOKEN;
const TMDB_API_KEY = process.env.TMDB_API_KEY; // Fallback if needed, but preference is Read Token
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export type TmdbImageSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';

export type TmdbMovieDetails = {
    id: number;
    imdb_id: string | null;
    title: string;
    original_title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    runtime: number | null;
    budget: number;
    revenue: number;
    vote_average: number;
    vote_count: number;
    overview: string | null;
    tagline: string | null;
    genres: Array<{ id: number; name: string }>;
    production_companies: Array<{ id: number; name: string; logo_path: string | null; origin_country: string }>;
    spoken_languages: Array<{ iso_639_1: string; name: string }>;
    credits: {
        cast: Array<{
            id: number;
            name: string;
            original_name: string;
            character: string;
            profile_path: string | null;
            order: number;
        }>;
        crew: Array<{
            id: number;
            name: string;
            original_name: string;
            job: string;
            department: string;
            profile_path: string | null;
        }>;
    };
    videos: {
        results: Array<{
            id: string;
            key: string;
            name: string;
            site: string;
            type: string;
            official: boolean;
        }>;
    };
    release_dates: {
        results: Array<{
            iso_3166_1: string;
            release_dates: Array<{
                certification: string;
                type: number;
                note?: string;
            }>;
        }>;
    };
    images: {
        posters: Array<{ file_path: string; iso_639_1: string | null; aspect_ratio: number; width: number; height: number }>;
        backdrops: Array<{ file_path: string; iso_639_1: string | null; aspect_ratio: number; width: number; height: number }>;
    };
    recommendations?: {
        page: number;
        results: Array<{
            id: number;
            title: string;
            poster_path: string | null;
            backdrop_path: string | null;
            release_date: string;
            vote_average: number;
        }>;
        total_pages: number;
        total_results: number;
    };
};

export class TmdbClient {
    private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
        let headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        let queryParams = new URLSearchParams({
            language: 'es-MX', // Predeterminado a Español Latino
            ...params,
        });

        if (TMDB_READ_TOKEN) {
            headers['Authorization'] = `Bearer ${TMDB_READ_TOKEN}`;
        } else if (TMDB_API_KEY) {
            // Fallback a query param si no hay token (aunque desaconsejado)
            queryParams.append('api_key', TMDB_API_KEY);
        } else {
            console.error('TMDB credentials missing (TMDB_READ_TOKEN or TMDB_API_KEY)');
            return null;
        }

        try {
            const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;
            // console.log(`[TMDb] Fetching: ${url}`); // Debug

            const res = await fetch(url, {
                headers,
                next: { revalidate: 3600 }, // Cache 1 hora
            });

            if (!res.ok) {
                console.error(`TMDb Error [${res.status}]: ${res.statusText} for ${url}`);
                // Podríamos manejar rate limits aquí (status 429)
                return null;
            }

            return res.json();
        } catch (error) {
            console.error('TMDb Fetch Exception:', error);
            return null;
        }
    }

    /**
     * Construye la URL completa para una imagen de TMDb.
     */
    static getImageUrl(path: string | null, size: TmdbImageSize = 'w500'): string | null {
        if (!path) return null;
        return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
    }

    /**
     * Buscar película por ID externo (IMDb ID).
     * Endpoint: /find/{external_id}
     */
    async findByImdbId(imdbId: string): Promise<TmdbMovieDetails | null> {
        // 1. Buscar el ID de TMDb usando el ID de IMDb
        const findRes = await this.fetch<{ movie_results: Array<{ id: number }> }>(`/find/${imdbId}`, {
            external_source: 'imdb_id'
        });

        if (!findRes || !findRes.movie_results?.[0]) {
            // console.warn(`Movie not found for IMDb ID: ${imdbId}`);
            return null;
        }

        const tmdbId = findRes.movie_results[0].id;

        // 2. Obtener la ficha completa enriquecida
        return this.getMovieDetails(tmdbId);
    }

    /**
     * Obtener detalles completos de una película por su TMDb ID.
     * Incluye créditos, videos, fechas de estreno (para certificación), imágenes y palabras clave.
     */
    async getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails | null> {
        return this.fetch<TmdbMovieDetails>(`/movie/${tmdbId}`, {
            append_to_response: 'credits,videos,release_dates,images,keywords,recommendations'
        });
    }

    /**
     * Busca una persona (director, actor, etc.) por nombre.
     */
    async searchPerson(query: string): Promise<any[]> {
        const res = await this.fetch<{ results: any[] }>('/search/person', {
            query: query,
            page: '1'
        });
        return res?.results || [];
    }

    /**
     * Obtiene los créditos de películas de una persona.
     */
    async getPersonMovieCredits(personId: number): Promise<any | null> {
        return this.fetch<any>(`/person/${personId}/movie_credits`);
    }

    /**
     * Obtener detalles de una persona (biografía, fecha namicmiento, etc).
     */
    async getPersonDetails(personId: number): Promise<any | null> {
        return this.fetch<any>(`/person/${personId}`);
    }
}

export const tmdb = new TmdbClient();
