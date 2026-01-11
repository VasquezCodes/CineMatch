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

    // 1. Obtener Watchlist (Biblioteca) con detalles de las películas y user_rating
    const { data: library, error: libraryError } = await supabase
        .from('watchlists')
        .select(`
            rating,
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

    // --- Cálculos Básicos ---
    const totalMovies = library?.length || 0

    // Distribución por Géneros
    const genreDistribution: Record<string, number> = {}

    // Distribución de Ratings y Promedio
    const ratingDistribution: Record<number, number> = {}
    let totalRatingSum = 0
    let totalRatedMovies = 0

    library?.forEach(item => {
        // 1. Procesar Géneros
        const movieData = item.movies
        const movie = Array.isArray(movieData) ? movieData[0] : movieData

        if (movie) {
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
        }

        // 2. Procesar Ratings (usando user_rating del watchlist)
        const rating = item.rating
        if (typeof rating === 'number' && rating > 0) {
            const bucket = Math.round(rating)
            ratingDistribution[bucket] = (ratingDistribution[bucket] || 0) + 1
            totalRatingSum += rating
            totalRatedMovies++
        }
    })

    const averageRating = totalRatedMovies > 0
        ? parseFloat((totalRatingSum / totalRatedMovies).toFixed(1))
        : 0

    return {
        totalMovies,
        averageRating,
        genreDistribution,
        ratingDistribution
    }
}
