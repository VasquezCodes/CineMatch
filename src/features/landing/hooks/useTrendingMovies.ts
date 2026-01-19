'use client';

import { useState, useEffect } from 'react';

type TrendingMovie = {
    id: number;
    title: string;
    posterUrl: string;
};

export function useTrendingMovies(limit: number = 8) {
    const [movies, setMovies] = useState<TrendingMovie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrending() {
            try {
                // Llamar a un API route que internamente use tmdb.getTrendingMovies()
                const res = await fetch('/api/trending-movies?limit=' + limit);
                const data = await res.json();

                setMovies(data.movies || []);
            } catch (error) {
                console.error('Error fetching trending movies:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchTrending();
    }, [limit]);

    return { movies, loading };
}
