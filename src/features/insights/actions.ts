'use server'

import { createClient } from '@/lib/supabase/server'

export type AnalysisData = {
    totalMovies: number
    averageRating: number
    genreDistribution: Record<string, number>
    ratingDistribution: Record<number, number>
}

// NOTA: No podemos usar unstable_cache aquí porque createClient() usa cookies()
// internamente. Para caching, usar React Query en el cliente.
export async function getAnalysisData(): Promise<AnalysisData> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Usuario no autenticado')
    }

    // Obtener Watchlist con géneros
    const { data: library, error: libraryError } = await supabase
        .from('watchlists')
        .select(`
            user_rating,
            movies (
                genres
            )
        `)
        .eq('user_id', user.id)

    if (libraryError) {
        console.error('Error obteniendo la biblioteca:', libraryError)
        throw new Error('Error al obtener datos de la biblioteca')
    }

    const totalMovies = library?.length || 0
    const genreDistribution: Record<string, number> = {}
    const ratingDistribution: Record<number, number> = {}
    let totalRatingSum = 0
    let totalRatedMovies = 0

    library?.forEach((item: { user_rating: number | null; movies: { genres: string[] | null } | { genres: string[] | null }[] | null }) => {
        const movieData = item.movies
        const movie = Array.isArray(movieData) ? movieData[0] : movieData

        if (movie) {
            let genres: string[] = []
            if (movie.genres && Array.isArray(movie.genres)) {
                genres = movie.genres.map((g: unknown) => typeof g === 'string' ? g : '').filter(Boolean)
            }
            genres.forEach(genre => {
                genreDistribution[genre] = (genreDistribution[genre] || 0) + 1
            })
        }

        const rating = item.user_rating
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
