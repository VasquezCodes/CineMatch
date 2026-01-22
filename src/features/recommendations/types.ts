export interface Recommendation {
    rec_movie_id: string;
    rec_title: string;
    rec_poster_url: string | null;
    rec_year: number | null;
    rec_score: number;
    rec_reason: string;
    rec_cluster_name: string | null;
}
