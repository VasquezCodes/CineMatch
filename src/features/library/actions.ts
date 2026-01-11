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

    // 2. Filtros de Búsqueda (Multicolumna: Title OR Director OR Year)
    if (filters.searchQuery) {
      const q = filters.searchQuery;
      // Nota: Para buscar por año (numérico) como texto, idealmente Casteamos.
      // Pero PostgREST 'ilike' espera texto. Si 'year' es int, puede fallar si no casteamos.
      // Supabase PostgREST permite casting con ::text.
      // Sintaxis: columna.ilike.val

      // Si el query parece un año (4 dígitos), añadimos filtro exacto de año o cast
      if (/^\d{4}$/.test(q)) {
        // Si es un número, podríamos añadir OR year.eq.Numero
        // Pero para hacerlo en un solo OR con el título:
        // query = query.or(`title.ilike.%${q}%,director.ilike.%${q}%,year.eq.${q}`)
        // Esto funciona si la columna year soporta eq con el valor.
        // Al recargar el query object, concatenamos conditions.
        // Mejor estrategia: Todo en un solo OR string.
        query = query.or(`title.ilike.%${q}%,director.ilike.%${q}%,year.eq.${q}`);
      } else {
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
        updated_at: row.last_interaction,
        created_at: row.last_interaction, // Fallback
        status: row.status,
      },
      movie: {
        id: row.movie_id,
        title: row.title,
        year: row.year,
        poster_url: row.poster_url,
        genres: row.genres,
        director: row.director,
        extended_data: row.extended_data,
        imdb_id: row.imdb_id,
        imdb_rating: row.imdb_rating,
        synopsis: row.synopsis,
        created_at: row.movie_created_at,
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
