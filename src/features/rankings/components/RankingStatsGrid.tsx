import type { RankingType } from "../actions";

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  prefix?: string;
}

function StatCard({ label, value, suffix, prefix }: StatCardProps) {
  return (
    <div className="p-3 rounded-lg border border-border/50 bg-card/30">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold truncate">
        {prefix && <span className="text-star-yellow mr-1">{prefix}</span>}
        {value}
      </p>
      {suffix && <p className="text-xs text-muted-foreground">{suffix}</p>}
    </div>
  );
}

interface RankingStatsGridProps {
  totalMoviesInTop10: number;
  leaderKey: string;
  leaderCount: number;
  averageRating: string;
  totalUniqueItems: number;
  typeLabel: string;
}

const TYPE_LABELS: Record<RankingType, string> = {
  director: "Directores",
  actor: "Actores",
  genre: "Géneros",
  year: "Años",
  screenplay: "Guionistas",
  photography: "Fotografía",
  music: "Música",
};

export function RankingStatsGrid({
  totalMoviesInTop10,
  leaderKey,
  leaderCount,
  averageRating,
  totalUniqueItems,
  typeLabel,
}: RankingStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      <StatCard
        label="Total en Top 10"
        value={totalMoviesInTop10}
        suffix="películas"
      />
      <StatCard
        label="Líder"
        value={leaderKey}
        suffix={`${leaderCount} películas`}
      />
      <StatCard
        label="Promedio"
        value={averageRating}
        suffix="rating"
        prefix="★"
      />
      <StatCard
        label={typeLabel}
        value={totalUniqueItems}
        suffix="únicos"
      />
    </div>
  );
}
