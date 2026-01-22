"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toggleUserMovieQuality } from "../actions";
import type { QualityCategoryWithSelection } from "../types";
import { ChevronDown, ChevronUp } from "lucide-react";

// Iconos y colores por categoría
const CATEGORY_STYLES: Record<number, { icon: string; color: string; bgColor: string }> = {
    1: { icon: "👁️", color: "text-pink-500", bgColor: "bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20" },
    2: { icon: "❤️", color: "text-red-500", bgColor: "bg-red-500/10 border-red-500/30 hover:bg-red-500/20" },
    3: { icon: "🧠", color: "text-purple-500", bgColor: "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20" },
    4: { icon: "🎬", color: "text-green-500", bgColor: "bg-green-500/10 border-green-500/30 hover:bg-green-500/20" },
};

const SELECTED_STYLES: Record<number, string> = {
    1: "bg-pink-500 text-white border-pink-500",
    2: "bg-red-500 text-white border-red-500",
    3: "bg-purple-500 text-white border-purple-500",
    4: "bg-green-500 text-white border-green-500",
};

type Props = {
    movieId: string;
    categories: QualityCategoryWithSelection[];
};

export function QualificationSelector({ movieId, categories }: Props) {
    const [isPending, startTransition] = useTransition();
    const [localCategories, setLocalCategories] = useState(categories);
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set([1])); // Primera expandida por defecto

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };

    const handleToggleQuality = (categoryId: number, qualityId: number) => {
        // Optimistic update
        setLocalCategories((prev) =>
            prev.map((cat) =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        qualities: cat.qualities.map((q) =>
                            q.id === qualityId ? { ...q, selected: !q.selected } : q
                        ),
                    }
                    : cat
            )
        );

        startTransition(async () => {
            const result = await toggleUserMovieQuality(movieId, qualityId);
            if (!result.success) {
                // Revertir en caso de error
                setLocalCategories((prev) =>
                    prev.map((cat) =>
                        cat.id === categoryId
                            ? {
                                ...cat,
                                qualities: cat.qualities.map((q) =>
                                    q.id === qualityId ? { ...q, selected: !q.selected } : q
                                ),
                            }
                            : cat
                    )
                );
            }
        });
    };

    const totalSelected = localCategories.reduce(
        (acc, cat) => acc + cat.qualities.filter((q) => q.selected).length,
        0
    );

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    ¿Qué destacarías?
                </h3>
                {totalSelected > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {totalSelected} seleccionadas
                    </span>
                )}
            </div>

            {/* Categorías */}
            <div className="space-y-2">
                {localCategories.map((category) => {
                    const style = CATEGORY_STYLES[category.id] || CATEGORY_STYLES[1];
                    const isExpanded = expandedCategories.has(category.id);
                    const selectedCount = category.qualities.filter((q) => q.selected).length;

                    return (
                        <div
                            key={category.id}
                            className="border border-border/50 rounded-lg overflow-hidden"
                        >
                            {/* Category Header - Clickeable */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5",
                                    "bg-card/50 hover:bg-card transition-colors",
                                    "text-left"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{style.icon}</span>
                                    <span className="text-sm font-medium">{category.name}</span>
                                    {selectedCount > 0 && (
                                        <span
                                            className={cn(
                                                "text-xs px-1.5 py-0.5 rounded-full",
                                                style.color,
                                                "bg-current/10"
                                            )}
                                        >
                                            {selectedCount}
                                        </span>
                                    )}
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                            </button>

                            {/* Qualities Grid */}
                            {isExpanded && (
                                <div className="px-3 pb-3 pt-2 flex flex-wrap gap-2">
                                    {category.qualities.map((quality) => (
                                        <button
                                            key={quality.id}
                                            onClick={() => handleToggleQuality(category.id, quality.id)}
                                            disabled={isPending}
                                            className={cn(
                                                "px-2.5 py-1.5 text-xs rounded-full border transition-all",
                                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                                quality.selected
                                                    ? SELECTED_STYLES[category.id]
                                                    : style.bgColor
                                            )}
                                        >
                                            {quality.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
