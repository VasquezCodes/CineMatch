'use server'

import { createClient } from '@/lib/supabase/server'

export type AnalysisData = {
    totalMovies: number
    watchedMovies: number
    planToWatchMovies: number
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
            status,
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

    // 2. Obtener Reseñas para los Ratings
    const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('user_id', user.id)
        .not('rating', 'is', null)

    if (reviewsError) {
        console.error('Error obteniendo reseñas:', reviewsError)
        throw new Error('Error al obtener datos de reseñas')
    }

    // --- Cálculos ---

    // Contadores
    const totalMovies = library?.length || 0
    const watchedMovies = library?.filter(item => item.status === 'watched').length || 0
    const planToWatchMovies = library?.filter(item => item.status === 'plan_to_watch').length || 0

    // Distribución por Géneros
    const genreDistribution: Record<string, number> = {}

    library?.forEach(item => {
        const movieData = item.movies
        // El join de Supabase puede devolver un array o un objeto único según la inferencia de relaciones
        const movie = Array.isArray(movieData) ? movieData[0] : movieData

        if (!movie) return

        let genres: string[] = []

        // Intentar obtener géneros de la columna principal primero (array de strings o JSON)
        if (movie.genres && Array.isArray(movie.genres)) {
            genres = movie.genres.map((g: any) => typeof g === 'string' ? g : '').filter(Boolean)
        }
        // Fallback a extended_data si es necesario (dependiendo de cómo lo guardó el import)
        else if (movie.extended_data && (movie.extended_data as any).technical?.genres) {
            genres = ((movie.extended_data as any).technical.genres as string[]) || []
        }

        genres.forEach(genre => {
            genreDistribution[genre] = (genreDistribution[genre] || 0) + 1
        })
    })

    // Distribución de Ratings y Promedio
    const ratingDistribution: Record<number, number> = {}
    let totalRatingSum = 0
    const totalReviews = reviews?.length || 0

    reviews?.forEach(review => {
        const rating = review.rating
        if (typeof rating === 'number') {
            // Redondear al entero más cercano para el bucket de distribución
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
        watchedMovies,
        planToWatchMovies,
        averageRating,
        genreDistribution,
        ratingDistribution
    }
}
