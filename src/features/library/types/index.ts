import type { Tables } from "@/types/database.types";

/**
 * Item de la biblioteca (película con datos del watchlist)
 */
export type LibraryItem = {
  watchlist: Tables<"watchlists">;
  movie: Tables<"movies">;
};

/**
 * Opciones de filtro para la biblioteca
 */
export type LibraryFiltersState = {
  searchQuery?: string;
  minRating?: number;
  sortBy?: "recent" | "title" | "year" | "rating";
};

/**
 * Resultado paginado de la biblioteca
 */
export type PaginatedLibraryResult = {
  items: LibraryItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};
