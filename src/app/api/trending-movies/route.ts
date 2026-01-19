import { NextRequest, NextResponse } from 'next/server';
import { tmdb, TmdbClient } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '8');

    try {
        const response = await tmdb.getTrendingMovies(1);

        if (!response || !response.results) {
            return NextResponse.json({ movies: [] }, { status: 200 });
        }

        const movies = response.results
            .slice(0, limit)
            .filter(m => m.poster_path) // Solo películas con poster
            .map(m => ({
                id: m.id,
                title: m.title,
                posterUrl: TmdbClient.getImageUrl(m.poster_path, 'w500')
            }));

        return NextResponse.json(
            { movies },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
                }
            }
        );
    } catch (error) {
        console.error('Error in trending-movies API:', error);
        return NextResponse.json({ movies: [] }, { status: 500 });
    }
}
