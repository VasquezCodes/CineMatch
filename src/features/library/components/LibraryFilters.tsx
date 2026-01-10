"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface LibraryFiltersProps {
  searchQuery: string;
  sortBy: string;
  filterRating: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onRatingFilterChange: (value: string) => void;
}

/**
 * LibraryFilters
 * Barra de filtros para la biblioteca.
 * Incluye búsqueda, ordenamiento y filtro por rating mínimo.
 */
export function LibraryFilters({
  searchQuery,
  sortBy,
  filterRating,
  onSearchChange,
  onSortChange,
  onRatingFilterChange,
}: LibraryFiltersProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, director o año..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Controles de filtro y orden */}
        <div className="flex gap-2 items-center">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
          
          {/* Ordenamiento */}
          <Select value={sortBy} onValueChange={onSortChange}>
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

          {/* Filtro de rating */}
          <Select value={filterRating} onValueChange={onRatingFilterChange}>
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
  );
}
