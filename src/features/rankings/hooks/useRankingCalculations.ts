import { useMemo } from "react";
import type { RankingStatConfig } from "../actions";

interface RankingCalculations {
  totalMoviesInTop10: number;
  averageRating: string;
  leaderKey: string;
  leaderCount: number;
  totalUniqueItems: number;
  top10Data: RankingStatConfig[];
}

export function useRankingCalculations(
  data: RankingStatConfig[]
): RankingCalculations {
  return useMemo(() => {
    const top10 = data.slice(0, 10);

    const totalMoviesInTop10 = top10.reduce((sum, item) => sum + item.count, 0);

    const allMovies = top10.flatMap((item) => item.data.movies);
    const avgRating = allMovies.length > 0
      ? allMovies.reduce((sum, m) => sum + (m.user_rating || 0), 0) / allMovies.length
      : 0;

    const leaderKey = data[0]?.key || "-";
    const leaderCount = data[0]?.count || 0;

    return {
      totalMoviesInTop10,
      averageRating: avgRating.toFixed(1),
      leaderKey,
      leaderCount,
      totalUniqueItems: data.length,
      top10Data: top10,
    };
  }, [data]);
}

export function calculateItemAverageRating(item: RankingStatConfig): string {
  const movies = item.data.movies;
  if (movies.length === 0) return "N/A";

  const sum = movies.reduce((acc, m) => acc + (m.user_rating || 0), 0);
  return (sum / movies.length).toFixed(1);
}
