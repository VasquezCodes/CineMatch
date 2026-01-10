"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MovieCard } from "./MovieCard";
import { LibraryFilters } from "./LibraryFilters";
import type { PaginatedLibraryResult } from "../types";

interface LibraryGridProps {
  initialData: PaginatedLibraryResult;
  totalMovies: number;
}

/**
 * LibraryGrid
 * Grid de películas con filtros y paginación.
 * Client Component que maneja el estado de filtros y navegación.
 */
export function LibraryGrid({ initialData, totalMovies }: LibraryGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Estado de filtros
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recent");
  const [filterRating, setFilterRating] = useState(searchParams.get("rating") || "all");

  // Función para actualizar URL con nuevos parámetros
  const updateFilters = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "all") {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Reset a página 1 cuando cambian filtros
    newParams.set("page", "1");

    startTransition(() => {
      router.push(`?${newParams.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateFilters({ search: value, sort: sortBy, rating: filterRating });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateFilters({ search: searchQuery, sort: value, rating: filterRating });
  };

  const handleRatingFilterChange = (value: string) => {
    setFilterRating(value);
    updateFilters({ search: searchQuery, sort: sortBy, rating: value });
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", page.toString());
    
    startTransition(() => {
      router.push(`?${newParams.toString()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const { items, totalCount, totalPages, currentPage } = initialData;

  // Generar páginas visibles
  const generatePageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showPages = 5; // Número de páginas a mostrar

    if (totalPages <= showPages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica de paginación con ellipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <LibraryFilters
        searchQuery={searchQuery}
        sortBy={sortBy}
        filterRating={filterRating}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onRatingFilterChange={handleRatingFilterChange}
      />

      {/* Contador de resultados */}
      {items.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {items.length} de {totalCount} películas
            {totalMovies !== totalCount && ` (${totalMovies} en total)`}
          </p>
          <p>
            Página {currentPage} de {totalPages}
          </p>
        </div>
      )}

      {/* Grid de películas */}
      {items.length === 0 ? (
        <EmptyState
          icon={<Search className="h-12 w-12" />}
          title="No se encontraron películas"
          description={
            searchQuery || filterRating !== "all"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Aún no has importado películas"
          }
        />
      ) : (
        <>
          <div 
            className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${
              isPending ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {items.map((item) => (
              <MovieCard key={item.watchlist.id} item={item} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  {/* Botón anterior */}
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {/* Números de página */}
                  {generatePageNumbers().map((page, idx) => (
                    <PaginationItem key={idx}>
                      {page === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  {/* Botón siguiente */}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          handlePageChange(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
