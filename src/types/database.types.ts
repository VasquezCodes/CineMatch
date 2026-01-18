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
            import_items: {
                Row: {
                    id: string
                    import_id: string
                    movie_id: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    import_id: string
                    movie_id: string
                    user_id: string
                }
                Update: {
                    id?: string
                    import_id?: string
                    movie_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "import_items_import_id_fkey"
                        columns: ["import_id"]
                        isOneToOne: false
                        referencedRelation: "user_imports"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "import_items_movie_id_fkey"
                        columns: ["movie_id"]
                        isOneToOne: false
                        referencedRelation: "movies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "import_items_movie_id_fkey"
                        columns: ["movie_id"]
                        isOneToOne: false
                        referencedRelation: "user_library_view"
                        referencedColumns: ["movie_id"]
                    },
                    {
                        foreignKeyName: "import_items_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            import_queue: {
                Row: {
                    created_at: string | null
                    error_message: string | null
                    id: string
                    payload: Json
                    status: string
                    updated_at: string | null
                    user_id: string
                    worker_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    error_message?: string | null
                    id?: string
                    payload: Json
                    status?: string
                    updated_at?: string | null
                    user_id: string
                    worker_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    error_message?: string | null
                    id?: string
                    payload?: Json
                    status?: string
                    updated_at?: string | null
                    user_id?: string
                    worker_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "import_queue_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            likes: {
                Row: {
                    created_at: string
                    id: string
                    review_id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    review_id: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    review_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "likes_review_id_fkey"
                        columns: ["review_id"]
                        isOneToOne: false
                        referencedRelation: "reviews"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "likes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            movie_people: {
                Row: {
                    count: number | null
                    department: string
                    id: string
                    job: string | null
                    movie_id: string
                    person_id: string
                    role: string | null
                    updated_at: string | null
                }
                Insert: {
                    count?: number | null
                    department: string
                    id?: string
                    job?: string | null
                    movie_id: string
                    person_id: string
                    role?: string | null
                    updated_at?: string | null
                }
                Update: {
                    count?: number | null
                    department?: string
                    id?: string
                    job?: string | null
                    movie_id?: string
                    person_id?: string
                    role?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "movie_people_movie_idx"
                        columns: ["movie_id"]
                        isOneToOne: false
                        referencedRelation: "movies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "movie_people_movie_idx"
                        columns: ["movie_id"]
                        isOneToOne: false
                        referencedRelation: "user_library_view"
                        referencedColumns: ["movie_id"]
                    },
                    {
                        foreignKeyName: "movie_people_person_idx"
                        columns: ["person_id"]
                        isOneToOne: false
                        referencedRelation: "people"
                        referencedColumns: ["id"]
                    },
                ]
            }
            movies: {
                Row: {
                    backdrop_url: string | null
                    created_at: string | null
                    genres: Json | null
                    id: string
                    imdb_id: string | null
                    imdb_rating: number | null
                    original_title: string | null
                    overview: string | null
                    popularity: number | null
                    poster_url: string | null
                    release_date: string | null
                    runtime_minutes: number | null
                    title: string
                    tmdb_data: Json | null
                    tmdb_id: number | null
                    updated_at: string | null
                    vote_average: number | null
                    vote_count: number | null
                    year: number | null
                    extended_data: Json | null
                    synopsis: string | null
                    plot: string | null
                    runtime: number | null
                    director: string | null
                    tagline: string | null
                    video: boolean | null
                }
                Insert: {
                    backdrop_url?: string | null
                    created_at?: string | null
                    genres?: Json | null
                    id?: string
                    imdb_id?: string | null
                    imdb_rating?: number | null
                    original_title?: string | null
                    overview?: string | null
                    popularity?: number | null
                    poster_url?: string | null
                    release_date?: string | null
                    runtime_minutes?: number | null
                    title: string
                    tmdb_data?: Json | null
                    tmdb_id?: number | null
                    updated_at?: string | null
                    vote_average?: number | null
                    vote_count?: number | null
                    year?: number | null
                    extended_data?: Json | null
                    synopsis?: string | null
                    plot?: string | null
                    runtime?: number | null
                    director?: string | null
                    tagline?: string | null
                    video?: boolean | null
                }
                Update: {
                    backdrop_url?: string | null
                    created_at?: string | null
                    genres?: Json | null
                    id?: string
                    imdb_id?: string | null
                    imdb_rating?: number | null
                    original_title?: string | null
                    overview?: string | null
                    popularity?: number | null
                    poster_url?: string | null
                    release_date?: string | null
                    runtime_minutes?: number | null
                    title?: string
                    tmdb_data?: Json | null
                    tmdb_id?: number | null
                    updated_at?: string | null
                    vote_average?: number | null
                    vote_count?: number | null
                    year?: number | null
                    extended_data?: Json | null
                    synopsis?: string | null
                    plot?: string | null
                    runtime?: number | null
                    director?: string | null
                    tagline?: string | null
                    video?: boolean | null
                }
                Relationships: []
            }
            people: {
                Row: {
                    biography: string | null
                    birthday: string | null
                    created_at: string | null
                    deathday: string | null
                    gender: number | null
                    id: string
                    imdb_id: string | null
                    known_for_department: string | null
                    name: string
                    place_of_birth: string | null
                    popularity: number | null
                    profile_path: string | null
                    tmdb_id: number | null
                    updated_at: string | null
                }
                Insert: {
                    biography?: string | null
                    birthday?: string | null
                    created_at?: string | null
                    deathday?: string | null
                    gender?: number | null
                    id?: string
                    imdb_id?: string | null
                    known_for_department?: string | null
                    name: string
                    place_of_birth?: string | null
                    popularity?: number | null
                    profile_path?: string | null
                    tmdb_id?: number | null
                    updated_at?: string | null
                }
                Update: {
                    biography?: string | null
                    birthday?: string | null
                    created_at?: string | null
                    deathday?: string | null
                    gender?: number | null
                    id?: string
                    imdb_id?: string | null
                    known_for_department?: string | null
                    name?: string
                    place_of_birth?: string | null
                    popularity?: number | null
                    profile_path?: string | null
                    tmdb_id?: number | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    email: string | null
                    id: string
                    ranking_status: string | null
                    updated_at: string | null
                    username: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string | null
                    id: string
                    ranking_status?: string | null
                    updated_at?: string | null
                    username?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    ranking_status?: string | null
                    updated_at?: string | null
                    username?: string | null
                }
                Relationships: []
            }
            push_subscriptions: {
                Row: {
                    created_at: string | null
                    endpoint: string
                    id: string
                    keys: Json
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    endpoint: string
                    id?: string
                    keys: Json
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    endpoint?: string
                    id?: string
                    keys?: Json
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "push_subscriptions_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            reviews: {
                Row: {
                    content: string | null
                    created_at: string | null
                    id: string
                    movie_id: string
                    rating: number | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    content?: string | null
                    created_at?: string | null
                    id?: string
                    movie_id: string
                    rating?: number | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    content?: string | null
                    created_at?: string | null
                    id?: string
                    movie_id?: string
                    rating?: number | null
                    updated_at?: string | null
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
                    {
                        foreignKeyName: "reviews_movie_id_fkey"
                        columns: ["movie_id"]
                        isOneToOne: false
                        referencedRelation: "user_library_view"
                        referencedColumns: ["movie_id"]
                    },
                    {
                        foreignKeyName: "reviews_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_imports: {
                Row: {
                    counts: Json
                    filename: string
                    id: string
                    imported_at: string
                    status: string
                    user_id: string
                }
                Insert: {
                    counts?: Json
                    filename: string
                    id?: string
                    imported_at?: string
                    status?: string
                    user_id: string
                }
                Update: {
                    counts?: Json
                    filename?: string
                    id?: string
                    imported_at?: string
                    status?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_imports_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            watchlists: {
                Row: {
                    added_at: string | null
                    id: string
                    movie_id: string
                    user_id: string
                    created_at: string | null
                    status: string | null
                }
                Insert: {
                    added_at?: string | null
                    id?: string
                    movie_id: string
                    user_id: string
                    created_at?: string | null
                    status?: string | null
                }
                Update: {
                    added_at?: string | null
                    id?: string
                    movie_id?: string
                    user_id?: string
                    created_at?: string | null
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "watchlists_movie_id_fkey"
                        columns: ["movie_id"]
                        isOneToOne: false
                        referencedRelation: "movies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "watchlists_movie_id_fkey"
                        columns: ["movie_id"]
                        isOneToOne: false
                        referencedRelation: "user_library_view"
                        referencedColumns: ["movie_id"]
                    },
                    {
                        foreignKeyName: "watchlists_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            user_library_view: {
                Row: {
                    backdrop_url: string | null
                    genres: Json | null
                    imdb_rating: number | null
                    movie_id: string | null
                    overview: string | null
                    poster_url: string | null
                    release_date: string | null
                    runtime_minutes: number | null
                    title: string | null
                    user_id: string | null
                    user_rating: number | null
                    vote_average: number | null
                    watch_date: string | null
                    year: number | null
                    extended_data: Json | null
                }
                Insert: {
                    backdrop_url?: string | null
                    genres?: Json | null
                    imdb_rating?: number | null
                    movie_id?: string | null
                    overview?: string | null
                    poster_url?: string | null
                    release_date?: string | null
                    runtime_minutes?: number | null
                    title?: string | null
                    user_id?: string | null
                    user_rating?: number | null
                    vote_average?: number | null
                    watch_date?: string | null
                    year?: number | null
                    extended_data?: Json | null
                }
                Update: {
                    backdrop_url?: string | null
                    genres?: Json | null
                    imdb_rating?: number | null
                    movie_id?: string | null
                    overview?: string | null
                    poster_url?: string | null
                    release_date?: string | null
                    runtime_minutes?: number | null
                    title?: string | null
                    user_id?: string | null
                    user_rating?: number | null
                    vote_average?: number | null
                    watch_date?: string | null
                    year?: number | null
                    extended_data?: Json | null
                }
                Relationships: [
                    {
                        foreignKeyName: "reviews_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Functions: {
            clean_duplicate_movies: {
                Args: Record<PropertyKey, never>
                Returns: undefined
            }
            get_dashboard_stats: {
                Args: {
                    p_user_id: string
                }
                Returns: Json
            }
            get_person_rankings: {
                Args: {
                    p_user_id: string
                    p_role: string
                    p_limit?: number
                    p_min_rating?: number
                }
                Returns: {
                    id: string
                    name: string
                    photo_url: string
                    total_movies: number
                    average_rating: number
                    score: number
                    top_movies: Json
                }[]
            }
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
type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? (DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
