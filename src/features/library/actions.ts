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

    // Construir query base
    // Consulta inicial: obtener watchlists del usuario con datos de películas relacionados
    let query = supabase
      .from("watchlists")
      .select(
        `
        *,
        movie:movies!inner (
          id,
          title,
          year,
          poster_url,
          genres,
          runtime,
          overview
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id);

    // Aplicar filtros de rating (mayor o igual al valor seleccionado)
    if (filters.minRating !== undefined && filters.minRating > 0) {
      query = query.gte("rating", filters.minRating);
    }

    // Aplicar ordenamiento dinámico
    switch (filters.sortBy) {
      case "title":
        // Para ordenar por título necesitamos hacer el join y ordenar
        query = query.order("added_at", { ascending: false });
        break;
      case "year":
        query = query.order("added_at", { ascending: false });
        break;
      case "rating":
        query = query.order("rating", { ascending: false, nullsFirst: false });
        break;
      case "recent":
      default:
        query = query.order("added_at", { ascending: false });
        break;
    }

    // Obtener total primero (sin paginación) para contar
    const { count } = await query;

    // Aplicar paginación
    const from = (page - 1) * DEFAULT_PAGE_SIZE;
    const to = from + DEFAULT_PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data: watchlists, error: watchlistsError } = await query;

    if (watchlistsError) {
      console.error("Error fetching library:", watchlistsError);
      return {
        data: null,
        error: "Error al obtener la biblioteca",
      };
    }

    if (!watchlists || watchlists.length === 0) {
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

    // Transformar los datos
    let items: LibraryItem[] = watchlists
      .map((item) => {
        const { movie, ...watchlistData } = item;
        if (!movie) return null;

        return {
          watchlist: watchlistData as unknown as LibraryItem["watchlist"],
          movie: movie as unknown as LibraryItem["movie"],
        };
      })
      .filter((item): item is LibraryItem => item !== null);

    // Aplicar filtros client-side que no podemos hacer en la query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.movie.title?.toLowerCase().includes(query) ||
          item.movie.director?.toLowerCase().includes(query) ||
          item.movie.year?.toString().includes(query)
      );
    }

    // Ordenar por título o año si es necesario (client-side porque Supabase no permite ordenar por campos de join fácilmente)
    if (filters.sortBy === "title") {
      items.sort((a, b) => (a.movie.title || "").localeCompare(b.movie.title || ""));
    } else if (filters.sortBy === "year") {
      items.sort((a, b) => (b.movie.year || 0) - (a.movie.year || 0));
    }

    const totalCount = count ?? items.length;
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
      .not("rating", "is", null)
      .order("rating", { ascending: false })
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
