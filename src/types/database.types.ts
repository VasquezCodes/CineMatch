export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
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
            movies: {
                Row: {
                    created_at: string | null
                    director: string | null
                    extended_data: Json | null
                    genres: Json | null
                    id: string
                    imdb_id: string
                    imdb_rating: number | null
                    poster_url: string | null
                    synopsis: string | null
                    title: string | null
                    year: number | null
                }
                Insert: {
                    created_at?: string | null
                    director?: string | null
                    extended_data?: Json | null
                    genres?: Json | null
                    id?: string
                    imdb_id: string
                    imdb_rating?: number | null
                    poster_url?: string | null
                    synopsis?: string | null
                    title?: string | null
                    year?: number | null
                }
                Update: {
                    created_at?: string | null
                    director?: string | null
                    extended_data?: Json | null
                    genres?: Json | null
                    id?: string
                    imdb_id?: string
                    imdb_rating?: number | null
                    poster_url?: string | null
                    synopsis?: string | null
                    title?: string | null
                    year?: number | null
                }
                Relationships: []
            }
            notifications: {
                Row: {
                    created_at: string | null
                    id: string
                    is_read: boolean | null
                    message: string
                    title: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    is_read?: boolean | null
                    message: string
                    title: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    is_read?: boolean | null
                    message?: string
                    title?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    email: string
                    full_name: string | null
                    id: string
                    stats_status: string
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    email: string
                    full_name?: string | null
                    id: string
                    stats_status?: string
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    email?: string
                    full_name?: string | null
                    id?: string
                    stats_status?: string
                    updated_at?: string | null
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
                Relationships: []
            }
            reviews: {
                Row: {
                    content: string | null
                    created_at: string | null
                    id: string
                    movie_id: string
                    rating: number | null
                    user_id: string
                }
                Insert: {
                    content?: string | null
                    created_at?: string | null
                    id?: string
                    movie_id: string
                    rating?: number | null
                    user_id: string
                }
                Update: {
                    content?: string | null
                    created_at?: string | null
                    id?: string
                    movie_id?: string
                    rating?: number | null
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
                ]
            }
            user_statistics: {
                Row: {
                    count: number | null
                    data: Json | null
                    id: string
                    key: string
                    score: number | null
                    type: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    count?: number | null
                    data?: Json | null
                    id?: string
                    key: string
                    score?: number | null
                    type: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    count?: number | null
                    data?: Json | null
                    id?: string
                    key?: string
                    score?: number | null
                    type?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            watchlists: {
                Row: {
                    created_at: string | null
                    id: string
                    movie_id: string
                    user_id: string
                    user_rating: number | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    movie_id: string
                    user_id: string
                    user_rating?: number | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    movie_id?: string
                    user_id?: string
                    user_rating?: number | null
                    updated_at?: string | null
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
                ]
            }
        }
        Views: {
            user_library_view: {
                Row: {
                    director: string | null
                    extended_data: Json | null
                    genres: Json | null
                    imdb_id: string | null
                    imdb_rating: number | null
                    last_interaction: string | null
                    movie_created_at: string | null
                    movie_id: string | null
                    poster_url: string | null
                    status: string | null
                    synopsis: string | null
                    title: string | null
                    user_id: string | null
                    user_rating: number | null
                    watchlist_id: string | null
                    year: number | null
                }
                Relationships: []
            }
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

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    DefaultSchemaEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {},
    },
} as const
