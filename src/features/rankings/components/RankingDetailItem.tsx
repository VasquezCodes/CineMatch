import * as React from "react";
import { cn } from "@/lib/utils";
import type { RankingStatConfig } from "../actions";
import { calculateItemAverageRating } from "../hooks/useRankingCalculations";

interface RankingDetailItemProps {
  item: RankingStatConfig;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function RankingDetailItem({
  item,
  index,
  isSelected,
  onSelect,
}: RankingDetailItemProps) {
  const itemRef = React.useRef<HTMLButtonElement>(null);
  const avgRating = calculateItemAverageRating(item);

  React.useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isSelected]);

  return (
    <button
      ref={itemRef}
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left",
        "hover:bg-muted/60",
        isSelected
          ? "bg-primary/10 border border-primary/30 shadow-sm"
          : "bg-card/30 border border-transparent"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
          index === 0 && "bg-yellow-500/20 text-yellow-600 dark:text-yellow-500",
          index === 1 && "bg-slate-400/20 text-slate-600 dark:text-slate-400",
          index === 2 && "bg-amber-600/20 text-amber-700 dark:text-amber-600",
          index > 2 && "bg-muted text-muted-foreground"
        )}
      >
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.key}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{item.count}</span>
          <span className="text-star-yellow font-semibold">★ {avgRating}</span>
        </div>
      </div>
    </button>
  );
}
