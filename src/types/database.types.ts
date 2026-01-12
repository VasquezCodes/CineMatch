export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            import_queue: {
                Row: {
                    created_at: string | null
                    error_message: string | null
                    id: string
                    payload: Json
                    status: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    error_message?: string | null
                    id?: string
                    payload: Json
                    status?: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    error_message?: string | null
                    id?: string
                    payload?: Json
                    status?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            movie_people: {
                Row: {
                    created_at: string | null
                    id: string
                    job: string | null
                    movie_id: string | null
                    person_id: string | null
                    role: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    job?: string | null
                    movie_id?: string | null
                    person_id?: string | null
                    role: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    job?: string | null
                    movie_id?: string | null
                    person_id?: string | null
                    role?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "movie_people_movie_id_fkey"
                        columns: ["movie_id"]
                        isOneToOne: false
                        referencedRelation: "movies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "movie_people_person_id_fkey"
                        columns: ["person_id"]
                        isOneToOne: false
                        referencedRelation: "people"
                        referencedColumns: ["id"]
                    },
                ]
            }
            movies: {
                Row: {
                    created_at: string
                    director: string | null
                    extended_data: Json | null
                    genres: Json | null
                    id: string
                    imdb_id: string | null
                    imdb_rating: number | null
                    plot: string | null
                    poster_url: string | null
                    runtime: number | null
                    title: string
                    tmdb_id: number | null
                    updated_at: string
                    year: number | null
                }
                Insert: {
                    created_at?: string
                    director?: string | null
                    extended_data?: Json | null
                    genres?: Json | null
                    id?: string
                    imdb_id?: string | null
                    plot?: string | null
                    poster_url?: string | null
                    runtime?: number | null
                    title: string
                    tmdb_id?: number | null
                    updated_at?: string
                    year?: number | null
                }
                Update: {
                    created_at?: string
                    director?: string | null
                    extended_data?: Json | null
                    genres?: Json | null
                    id?: string
                    imdb_id?: string | null
                    plot?: string | null
                    poster_url?: string | null
                    runtime?: number | null
                    title?: string
                    tmdb_id?: number | null
                    updated_at?: string
                    year?: number | null
                }
                Relationships: []
            }
            people: {
                Row: {
                    created_at: string | null
                    id: string
                    name: string
                    photo_url: string | null
                    tmdb_id: number
                    biography: string | null
                    birthday: string | null
                    deathday: string | null
                    place_of_birth: string | null
                    known_for_department: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    name: string
                    photo_url?: string | null
                    tmdb_id: number
                    biography?: string | null
                    birthday?: string | null
                    deathday?: string | null
                    place_of_birth?: string | null
                    known_for_department?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    name?: string
                    photo_url?: string | null
                    tmdb_id?: number
                    biography?: string | null
                    birthday?: string | null
                    deathday?: string | null
                    place_of_birth?: string | null
                    known_for_department?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    id: string
                    push_subscription: Json | null
                    updated_at: string | null
                    username: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    id: string
                    push_subscription?: Json | null
                    updated_at?: string | null
                    username?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    id?: string
                    push_subscription?: Json | null
                    updated_at?: string | null
                    username?: string | null
                }
                Relationships: []
            }
            push_subscriptions: {
                Row: {
                    auth: string
                    created_at: string | null
                    endpoint: string
                    id: string
                    p256dh: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    auth: string
                    created_at?: string | null
                    endpoint: string
                    id?: string
                    p256dh: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    auth?: string
                    created_at?: string | null
                    endpoint?: string
                    id?: string
                    p256dh?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            reviews: {
                Row: {
                    content: string | null
                    created_at: string
                    id: string
                    movie_id: string
                    rating: number | null
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    content?: string | null
                    created_at?: string
                    id?: string
                    movie_id: string
                    rating?: number | null
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    content?: string | null
                    created_at?: string
                    id?: string
                    movie_id?: string
                    rating?: number | null
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "reviews_movie_id_fkey"
                        columns: ["movie_id"]
                        isOneToOne: false
                        referencedRelation: "movies"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_movie_qualities: {
                Row: {
                    audio_quality: string | null
                    created_at: string
                    id: string
                    movie_id: string
                    updated_at: string
                    user_id: string
                    video_quality: string | null
                }
                Insert: {
                    audio_quality?: string | null
                    created_at?: string
                    id?: string
                    movie_id: string
                    updated_at?: string
                    user_id: string
                    video_quality?: string | null
                }
                Update: {
                    audio_quality?: string | null
                    created_at?: string
                    id?: string
                    movie_id?: string
                    updated_at?: string
                    user_id?: string
                    video_quality?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_movie_qualities_movie_id_fkey"
                        columns: ["movie_id"]
                        isOneToOne: false
                        referencedRelation: "movies"
                        referencedColumns: ["id"]
                    },
                ]
            }
            watchlists: {
                Row: {
                    created_at: string
                    id: string
                    movie_id: string
                    status: string
                    updated_at: string
                    user_id: string
                    user_rating: number | null
                }
                Insert: {
                    created_at?: string
                    id?: string
                    movie_id: string
                    status?: string
                    updated_at?: string
                    user_id: string
                    user_rating?: number | null
                }
                Update: {
                    created_at?: string
                    id?: string
                    movie_id?: string
                    status?: string
                    updated_at?: string
                    user_id?: string
                    user_rating?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "watchlists_movie_id_fkey"
                        columns: ["movie_id"]
                        isOneToOne: false
                        referencedRelation: "movies"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<T extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])> = (PublicSchema['Tables'] & PublicSchema['Views'])[T] extends { Row: infer R } ? R : never;
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T] extends { Insert: infer I } ? I : never;
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T] extends { Update: infer U } ? U : never;
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
