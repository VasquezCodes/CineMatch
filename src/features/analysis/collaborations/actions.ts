'use server';

import { createClient } from '@/lib/supabase/server';

export type Collaboration = {
    person1: {
        name: string;
        role: string;
        photo_url: string | null;
    };
    person2: {
        name: string;
        role: string;
        photo_url: string | null;
    };
    count: number;
    movies: Array<{
        title: string;
        year: number;
        poster_url: string | null;
        user_rating: number;
    }>;
};

export async function getCollaborations(
    userId: string,
    minRating: number = 0
): Promise<Collaboration[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_collaborations', {
        p_user_id: userId,
        p_min_rating: minRating,
        p_limit: 10
    });

    if (error) {
        console.error('Error fetching collaborations:', error);
        throw new Error('Failed to fetch collaborations');
    }

    if (!data) return [];

    return data.map((row: any) => ({
        person1: {
            name: row.person1_name,
            role: row.person1_role,
            photo_url: row.person1_photo
        },
        person2: {
            name: row.person2_name,
            role: row.person2_role,
            photo_url: row.person2_photo
        },
        count: Number(row.collaboration_count),
        movies: row.movies || []
    }));
}
