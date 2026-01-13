"use server";

import { createClient } from "@/lib/supabase/server";
import type { LibraryItem, LibraryFiltersState, PaginatedLibraryResult } from "./types";

const DEFAULT_PAGE_SIZE = 12;

/**
 * Obtiene la biblioteca paginada del usuario actual con filtros
 */
export async function getLibraryPaginated(
  page: number = 1,
  filters: LibraryFiltersState = {}
): Promise<{
  data: PaginatedLibraryResult | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // Obtener usuario actual
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        data: null,
        error: "Usuario no autenticado",
      };
    }

    // Usamos la VISTA 'user_library_view' para simplificar búsqueda y ordenamiento
    let query = supabase
      .from("user_library_view")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    // 1. Filtros de Rating
    if (filters.minRating !== undefined && filters.minRating > 0) {
      query = query.gte("user_rating", filters.minRating);
    }

    // 2. Filtros de Búsqueda (Multicolumna: Título OR Director OR Año)
    if (filters.searchQuery) {
      const q = filters.searchQuery;
      // Nota: Para buscar por año (columna numérica) usando búsqueda de texto,
      // necesitamos una estrategia ya que ilike es para texto.
      // Sin embargo, PostgREST y la librería de Supabase manejan cierta magia,
      // pero mezclar tipos (texto vs int) en un query `or` puede ser delicado.

      // Estrategia: "Todo en un solo string OR"
      // Construimos una cadena de condiciones OR.

      if (/^\d{4}$/.test(q)) {
        // CASO ESPECIAL: Si el query son exactamente 4 dígitos, asumimos que puede ser un año.
        // Añadimos una condición exacta para la columna `year` (que es int) o búsqueda parcial en texto.
        // Nota: `year.eq.${q}` funcionará porque Supabase casteará el valor al tipo de la columna si es compatible.
        query = query.or(`title.ilike.%${q}%,director.ilike.%${q}%,year.eq.${q}`);
      } else {
        // Búsqueda estándar solo en campos de texto
        query = query.or(`title.ilike.%${q}%,director.ilike.%${q}%`);
      }
    }

    // 3. Ordenamiento (Columnas planas de la vista)
    switch (filters.sortBy) {
      case "title":
        query = query.order("title", { ascending: true });
        break;
      case "year":
        query = query.order("year", { ascending: false });
        break;
      case "rating":
        query = query.order("user_rating", { ascending: false, nullsFirst: false });
        break;
      case "recent":
      default:
        query = query.order("last_interaction", { ascending: false });
        break;
    }

    // Paginación
    const from = (page - 1) * DEFAULT_PAGE_SIZE;
    const to = from + DEFAULT_PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data: viewData, error: viewError, count } = await query;

    if (viewError) {
      console.error("Error fetching library view:", JSON.stringify(viewError, null, 2));
      return {
        data: null,
        error: "Error al obtener la biblioteca",
      };
    }

    if (!viewData || viewData.length === 0) {
      return {
        data: {
          items: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: page,
          pageSize: DEFAULT_PAGE_SIZE,
        },
        error: null,
      };
    }

    // Transformar datos planos a la estructura anidada que espera el frontend (LibraryItem)
    const items: LibraryItem[] = viewData.map((row: any) => ({
      watchlist: {
        id: row.watchlist_id,
        user_id: row.user_id,
        movie_id: row.movie_id,
        user_rating: row.user_rating,
        added_at: row.last_interaction,
        created_at: row.last_interaction, // Fallback
        status: row.status,
      },
      movie: {
        id: row.movie_id,
        title: row.title,
        year: row.year,
        poster_url: row.poster_url,
        genres: row.genres,
        extended_data: row.extended_data,
        imdb_id: row.imdb_id,
        imdb_rating: row.imdb_rating,
        synopsis: row.synopsis,
        created_at: row.movie_created_at,
        plot: row.plot || null,
        runtime: row.runtime || null,
        tmdb_id: row.tmdb_id || null,

        updated_at: row.movie_updated_at || new Date().toISOString(),
        backdrop_url: row.backdrop_url || null,
        original_title: row.original_title || row.title,
        overview: row.overview || row.synopsis || null,
        popularity: row.popularity || 0,
        release_date: row.release_date || null,
        runtime_minutes: row.runtime_minutes || row.runtime || null,
        tagline: null,
        vote_average: row.vote_average || 0,
        vote_count: row.vote_count || 0,
        tmdb_data: null,
        video: false,
      },
    }));

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / DEFAULT_PAGE_SIZE);

    return {
      data: {
        items,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize: DEFAULT_PAGE_SIZE,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error in getLibraryPaginated:", error);
    return {
      data: null,
      error: "Error inesperado al obtener la biblioteca",
    };
  }
}

/**
 * Obtiene las películas mejor calificadas del usuario (top N)
 */
export async function getTopRatedMovies(
  limit: number = 6
): Promise<{
  data: LibraryItem[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        data: null,
        error: "Usuario no autenticado",
      };
    }

    const { data: watchlists, error: watchlistsError } = await supabase
      .from("watchlists")
      .select(
        `
        *,
        movie:movies (*)
      `
      )
      .eq("user_id", user.id)
      .not("user_rating", "is", null)
      .order("user_rating", { ascending: false })
      .limit(limit);

    if (watchlistsError) {
      console.error("Error fetching top rated movies:", watchlistsError);
      return {
        data: null,
        error: "Error al obtener películas destacadas",
      };
    }

    if (!watchlists || watchlists.length === 0) {
      return {
        data: [],
        error: null,
      };
    }

    const items: LibraryItem[] = watchlists
      .map((item) => {
        const { movie, ...watchlistData } = item;
        if (!movie) return null;

        return {
          watchlist: watchlistData as unknown as LibraryItem["watchlist"],
          movie: movie as unknown as LibraryItem["movie"],
        };
      })
      .filter((item): item is LibraryItem => item !== null);

    return {
      data: items,
      error: null,
    };
  } catch (error) {
    console.error("Error in getTopRatedMovies:", error);
    return {
      data: null,
      error: "Error inesperado al obtener películas destacadas",
    };
  }
}
