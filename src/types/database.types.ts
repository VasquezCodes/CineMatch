export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      movies: {
        Row: {
          imdb_rating: number | null;
          created_at: string | null;
          director: string | null;
          genres: Json | null;
          id: string;
          imdb_id: string;
          poster_url: string | null;
          synopsis: string | null;
          title: string | null;
          year: number | null;
          extended_data: Json | null;
        };
        Insert: {
          imdb_rating?: number | null;
          created_at?: string | null;
          director?: string | null;
          genres?: Json | null;
          id?: string;
          imdb_id: string;
          poster_url?: string | null;
          synopsis?: string | null;
          title?: string | null;
          year?: number | null;
          extended_data?: Json | null;
        };
        Update: {
          imdb_rating?: number | null;
          created_at?: string | null;
          director?: string | null;
          genres?: Json | null;
          id?: string;
          imdb_id?: string;
          poster_url?: string | null;
          synopsis?: string | null;
          title?: string | null;
          year?: number | null;
          extended_data?: Json | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          id: string;
          location_coords: unknown | null;
          location_text: string | null;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          id: string;
          location_coords?: unknown | null;
          location_text?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          id?: string;
          location_coords?: unknown | null;
          location_text?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
      qualities: {
        Row: {
          category_id: number;
          id: number;
          name: string;
        };
        Insert: {
          category_id: number;
          id?: number;
          name: string;
        };
        Update: {
          category_id?: number;
          id?: number;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "qualities_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "quality_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      quality_categories: {
        Row: {
          description: string | null;
          id: number;
          name: string;
        };
        Insert: {
          description?: string | null;
          id?: number;
          name: string;
        };
        Update: {
          description?: string | null;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string | null;
          id: string;
          movie_id: string;
          rating: number | null;
          user_id: string;
          user_name: string | null;
          movie_name: string | null;
        };
        Insert: {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          movie_id: string;
          rating?: number | null;
          user_id: string;
          user_name?: string | null;
          movie_name?: string | null;
        };
        Update: {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          movie_id?: string;
          rating?: number | null;
          user_id?: string;
          user_name?: string | null;
          movie_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_movie_id_fkey";
            columns: ["movie_id"];
            isOneToOne: false;
            referencedRelation: "movies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_movie_qualities: {
        Row: {
          created_at: string | null;
          id: string;
          movie_id: string;
          quality_id: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          movie_id: string;
          quality_id: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          movie_id?: string;
          quality_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_movie_qualities_movie_id_fkey";
            columns: ["movie_id"];
            isOneToOne: false;
            referencedRelation: "movies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_movie_qualities_quality_id_fkey";
            columns: ["quality_id"];
            isOneToOne: false;
            referencedRelation: "qualities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_movie_qualities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      watchlists: {
        Row: {
          id: string;
          movie_id: string;

          updated_at: string | null;
          user_id: string;
          position: number | null;
          user_name: string | null;
          movie_title: string | null;
          user_rating: number | null;
        };
        Insert: {
          id?: string;
          movie_id: string;

          updated_at?: string | null;
          user_id: string;
          position?: number | null;
          user_name?: string | null;
          movie_title?: string | null;
          user_rating?: number | null;
        };
        Update: {
          id?: string;
          movie_id?: string;

          updated_at?: string | null;
          user_id?: string;
          position?: number | null;
          user_name?: string | null;
          movie_title?: string | null;
          user_rating?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "watchlists_movie_id_fkey";
            columns: ["movie_id"];
            isOneToOne: false;
            referencedRelation: "movies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "watchlists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
  ? R
  : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I;
  }
  ? I
  : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U;
  }
  ? U
  : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
