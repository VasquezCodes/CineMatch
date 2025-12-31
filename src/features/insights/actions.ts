'use server'

import { createClient } from '@/lib/supabase/server'

export type AnalysisData = {
    totalMovies: number
    averageRating: number
    genreDistribution: Record<string, number>
    ratingDistribution: Record<number, number>
}

export async function getAnalysisData(): Promise<AnalysisData> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Usuario no autenticado')
    }

    // 1. Obtener Watchlist (Biblioteca) con detalles de las películas
    const { data: library, error: libraryError } = await supabase
        .from('watchlists')
        .select(`

            movies (
                genres,
                extended_data
            )
        `)
        .eq('user_id', user.id)

    if (libraryError) {
        console.error('Error obteniendo la biblioteca:', libraryError)
        throw new Error('Error al obtener datos de la biblioteca')
    }

    // --- Cálculos Básicos (No dependen de reviews) ---
    const totalMovies = library?.length || 0

    // Distribución por Géneros
    const genreDistribution: Record<string, number> = {}

    library?.forEach(item => {
        const movieData = item.movies
        const movie = Array.isArray(movieData) ? movieData[0] : movieData

        if (!movie) return

        let genres: string[] = []

        if (movie.genres && Array.isArray(movie.genres)) {
            genres = movie.genres.map((g: any) => typeof g === 'string' ? g : '').filter(Boolean)
        }
        else if (movie.extended_data && (movie.extended_data as any).technical?.genres) {
            genres = ((movie.extended_data as any).technical.genres as string[]) || []
        }

        genres.forEach(genre => {
            genreDistribution[genre] = (genreDistribution[genre] || 0) + 1
        })
    })

    // 2. Obtener Reseñas para los Ratings (Robustez ante errores)
    let reviews = null;
    try {
        const { data, error: reviewsError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('user_id', user.id)
            .not('rating', 'is', null)

        if (reviewsError) {
            console.error('Error obteniendo reseñas:', reviewsError)
            // Retornamos datos parciales si fallan las reviews
            return {
                totalMovies,
                averageRating: 0,
                genreDistribution,
                ratingDistribution: {}
            }
        }
        reviews = data;
    } catch (e) {
        console.error("Unexpected error fetching reviews", e);
        // Retorno seguro en caso de error inesperado
        return {
            totalMovies,
            averageRating: 0,
            genreDistribution,
            ratingDistribution: {}
        }
    }

    // Distribución de Ratings y Promedio
    const ratingDistribution: Record<number, number> = {}
    let totalRatingSum = 0
    const totalReviews = reviews?.length || 0

    reviews?.forEach(review => {
        const rating = review.rating
        if (typeof rating === 'number') {
            const bucket = Math.round(rating)
            ratingDistribution[bucket] = (ratingDistribution[bucket] || 0) + 1
            totalRatingSum += rating
        }
    })

    const averageRating = totalReviews > 0
        ? parseFloat((totalRatingSum / totalReviews).toFixed(1))
        : 0

    return {
        totalMovies,
        averageRating,
        genreDistribution,
        ratingDistribution
    }
}
