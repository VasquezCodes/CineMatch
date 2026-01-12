"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { WatchlistAnalysisItem } from "../types";

interface AnalysisTableProps {
  data: WatchlistAnalysisItem[];
}

type SortOption = "title" | "year" | "rating" | "recent";

export function AnalysisTable({ data }: AnalysisTableProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("recent");
  const [filterRating, setFilterRating] = React.useState<string>("all");

  // Filtrar y ordenar datos
  const filteredAndSortedData = React.useMemo(() => {
    let filtered = [...data];

    // Filtro de búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.movie.title?.toLowerCase().includes(query) ||
          item.movie.director?.toLowerCase().includes(query) ||
          item.movie.year?.toString().includes(query)
      );
    }

    // Filtro de rating
    if (filterRating !== "all") {
      const minRating = parseFloat(filterRating);
      filtered = filtered.filter(
        (item) =>
          item.watchlist.user_rating !== null &&
          item.watchlist.user_rating >= minRating
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.movie.title || "").localeCompare(b.movie.title || "");
        case "year":
          return (b.movie.year || 0) - (a.movie.year || 0);
        case "rating":
          return (
            (b.watchlist.user_rating || 0) - (a.watchlist.user_rating || 0)
          );
        case "recent":
        default:
          return (
            new Date(b.watchlist.updated_at || 0).getTime() -
            new Date(a.watchlist.updated_at || 0).getTime()
          );
      }
    });

    return filtered;
  }, [data, searchQuery, sortBy, filterRating]);

  return (
    <div className="space-y-4">
      {/* Header con toggle de colapsar */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">Biblioteca de películas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.length} {data.length === 1 ? "película" : "películas"} en tu colección
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="gap-2"
        >
          {isCollapsed ? (
            <>
              Expandir
              <ChevronDown className="h-4 w-4" />
            </>
          ) : (
            <>
              Colapsar
              <ChevronUp className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Contenido colapsable */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out space-y-4",
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[10000px] opacity-100"
        )}
      >
        {/* Filtros */}
        <Card className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, director o año..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2 items-center">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más reciente</SelectItem>
                  <SelectItem value="title">Título A-Z</SelectItem>
                  <SelectItem value="year">Año (desc)</SelectItem>
                  <SelectItem value="rating">Rating (desc)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Rating mín." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="8">8+ ⭐</SelectItem>
                  <SelectItem value="7">7+ ⭐</SelectItem>
                  <SelectItem value="6">6+ ⭐</SelectItem>
                  <SelectItem value="5">5+ ⭐</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Resultados */}
        {filteredAndSortedData.length === 0 ? (
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
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredAndSortedData.length} de {data.length} películas
            </div>

            {/* Grid de películas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedData.map((item) => (
                <MovieCard key={item.watchlist.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MovieCard({ item }: { item: WatchlistAnalysisItem }) {
  const { movie, watchlist } = item;

  return (
    <Link href={`/app/movies/${movie.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-md hover:border-accent transition-all cursor-pointer">
        <div className="flex gap-3 p-4">
          {/* Poster */}
          <div className="relative w-20 h-28 shrink-0 rounded-md overflow-hidden bg-muted">
            {movie.poster_url ? (
              <Image
                src={movie.poster_url}
                alt={movie.title || "Movie poster"}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-xs">Sin poster</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
              {movie.title || "Sin título"}
            </h3>

            {movie.year && (
              <p className="text-xs text-muted-foreground">{movie.year}</p>
            )}

            {movie.director && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                Dir: {movie.director}
              </p>
            )}

            {/* Rating del usuario */}
            {watchlist.user_rating !== null && (
              <div className="flex items-center gap-1 pt-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-sm font-medium">
                  {(item.watchlist.user_rating || 0).toFixed(1)}
                </span>
              </div>
            )}

            {/* Rating IMDb */}
            {movie.imdb_rating && (
              <div className="text-xs text-muted-foreground">
                IMDb: {movie.imdb_rating.toFixed(1)}
              </div>
            )}

            {/* Géneros */}
            {movie.genres && Array.isArray(movie.genres) && (
              <div className="flex flex-wrap gap-1 pt-1">
                {(movie.genres as string[]).slice(0, 2).map((genre) => (
                  <Badge
                    key={genre}
                    variant="accent"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
