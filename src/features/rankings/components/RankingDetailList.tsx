import { RankingDetailItem } from "./RankingDetailItem";
import type { RankingStatConfig, RankingType } from "../actions";

interface RankingDetailListProps {
  data: RankingStatConfig[];
  type: RankingType;
  selectedIndex: number | null;
  onSelectItem: (index: number) => void;
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

export function RankingDetailList({
  data,
  type,
  selectedIndex,
  onSelectItem,
}: RankingDetailListProps) {
  const handleSelectItem = (index: number) => {
    onSelectItem(selectedIndex === index ? -1 : index);
  };

  return (
    <section className="space-y-3">
      <header>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Top 10 {TYPE_LABELS[type]}
        </h3>
      </header>

      <div className="space-y-1.5">
        {data.map((item, index) => (
          <RankingDetailItem
            key={item.key}
            item={item}
            index={index}
            isSelected={selectedIndex === index}
            onSelect={() => handleSelectItem(index)}
          />
        ))}
      </div>
    </section>
  );
}
