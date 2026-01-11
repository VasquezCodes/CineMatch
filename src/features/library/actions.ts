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
    // Usamos !inner para asegurar que el filtrado en 'movies' afecte a 'watchlists'
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
          genres
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id);

    // 1. Filtros de Rating
    if (filters.minRating !== undefined && filters.minRating > 0) {
      query = query.gte("user_rating", filters.minRating);
    }

    // 2. Filtros de Búsqueda (Search Query)
    if (filters.searchQuery) {
      // Buscamos en el título de la película relacionado
      // Nota: Para buscar en múltiples columnas de una relación, la sintaxis puede ser compleja.
      // Aquí priorizamos búsqueda por título.
      // Ojo: ilike en relación requiere sintaxis embebida o uso de filtros específicos.
      // La forma más robusta con JS client en relaciones es usar el modificador en el select o filtro directo.
      // Pero 'movies' ya está joineada con !inner.
      query = query.ilike("movies.title", `%${filters.searchQuery}%`);
    }

    // 3. Ordenamiento
    switch (filters.sortBy) {
      case "title":
        // Ordenar por título de la película
        query = query.order("title", { foreignTable: "movies", ascending: true });
        break;
      case "year":
        // Ordenar por año de estreno (descendente por defecto para "más recientes")
        query = query.order("year", { foreignTable: "movies", ascending: false });
        break;
      case "rating":
        // Ordenar por rating de usuario
        query = query.order("user_rating", { ascending: false, nullsFirst: false });
        break;
      case "recent":
      default:
        // Ordenar por fecha de agregado a la watchlist
        query = query.order("updated_at", { ascending: false });
        break;
    }

    // Paginación
    const from = (page - 1) * DEFAULT_PAGE_SIZE;
    const to = from + DEFAULT_PAGE_SIZE - 1;

    // Ejecutar paginación
    query = query.range(from, to);

    const { data: watchlists, error: watchlistsError, count } = await query;

    if (watchlistsError) {
      console.error("Error fetching library:", JSON.stringify(watchlistsError, null, 2));
      return {
        data: null,
        error: "Error al obtener la biblioteca",
      };
    }

    // Si no hay resultados, retornar vacío
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
    // Ya no filtramos en memoria, confiamos en la DB
    const items: LibraryItem[] = watchlists
      .map((item) => {
        const { movie, ...watchlistData } = item;
        if (!movie) return null; // Should not happen with inner join

        return {
          watchlist: watchlistData as unknown as LibraryItem["watchlist"],
          movie: movie as unknown as LibraryItem["movie"],
        };
      })
      .filter((item): item is LibraryItem => item !== null);

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
