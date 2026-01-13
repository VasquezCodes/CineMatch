"use client";

import * as React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Cell,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { RankingStatConfig } from "../../actions";

interface RankingBubbleChartProps {
  data: RankingStatConfig[];
  selectedIndex: number | null;
  onSelectItem: (index: number) => void;
}

// Colores para las burbujas
const BUBBLE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220, 70%, 50%)",
  "hsl(280, 70%, 50%)",
  "hsl(340, 70%, 50%)",
  "hsl(40, 70%, 50%)",
  "hsl(100, 70%, 50%)",
];

const chartConfig = {
  count: {
    label: "Cantidad de películas",
  },
  avgRating: {
    label: "Rating promedio",
  },
} satisfies ChartConfig;

export function RankingBubbleChart({ data, selectedIndex, onSelectItem }: RankingBubbleChartProps) {
  // Preparar datos: X = count, Y = avgRating, Z (tamaño) = score
  const chartData = data.slice(0, 10).map((item, index) => {
    const avgRating = item.data.movies.length > 0
      ? item.data.movies.reduce((sum, m) => sum + (m.user_rating || 0), 0) / item.data.movies.length
      : 0;

    return {
      name: item.key,
      count: item.count,
      avgRating: Number(avgRating.toFixed(2)),
      score: item.score,
      index,
      fill: BUBBLE_COLORS[index % BUBBLE_COLORS.length],
    };
  });

  // Calcular promedio global para líneas de referencia
  const avgCount = chartData.reduce((sum, d) => sum + d.count, 0) / chartData.length;
  const avgRating = chartData.reduce((sum, d) => sum + d.avgRating, 0) / chartData.length;

  // Rango para el eje Z (tamaño de burbujas)
  const minScore = Math.min(...chartData.map(d => d.score));
  const maxScore = Math.max(...chartData.map(d => d.score));

  return (
    <div className="space-y-4">
      {/* Leyenda de ejes */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground px-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Eje X:</span> Cantidad de películas
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Eje Y:</span> Rating promedio
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Tamaño:</span> Puntuación total
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            type="number"
            dataKey="count"
            name="Películas"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            label={{
              value: "Películas",
              position: "bottom",
              offset: 0,
              style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <YAxis
            type="number"
            dataKey="avgRating"
            name="Rating"
            domain={[0, 10]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            label={{
              value: "Rating",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <ZAxis
            type="number"
            dataKey="score"
            range={[100, 600]}
            domain={[minScore, maxScore]}
          />
          {/* Líneas de referencia para promedios */}
          <ReferenceLine
            x={avgCount}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={avgRating}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{item.payload.name}</span>
                    <span>{item.payload.count} películas</span>
                    <span>Rating: ★ {item.payload.avgRating}</span>
                    <span className="text-muted-foreground">
                      Puntuación: {item.payload.score}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Scatter
            data={chartData}
            cursor="pointer"
            onClick={(data) => onSelectItem(data.index)}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                opacity={selectedIndex === null || selectedIndex === index ? 0.8 : 0.3}
                stroke={selectedIndex === index ? "hsl(var(--primary))" : "transparent"}
                strokeWidth={selectedIndex === index ? 2 : 0}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ChartContainer>

      {/* Cuadrantes explicativos */}
      <div className="grid grid-cols-2 gap-2 text-xs px-4">
        <div className="p-2 rounded bg-green-500/10 text-green-700 dark:text-green-400">
          <span className="font-medium">↗ Superior derecha:</span> Muchas películas con alto rating
        </div>
        <div className="p-2 rounded bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
          <span className="font-medium">↖ Superior izquierda:</span> Pocas películas, alto rating
        </div>
        <div className="p-2 rounded bg-orange-500/10 text-orange-700 dark:text-orange-400">
          <span className="font-medium">↘ Inferior derecha:</span> Muchas películas, bajo rating
        </div>
        <div className="p-2 rounded bg-red-500/10 text-red-700 dark:text-red-400">
          <span className="font-medium">↙ Inferior izquierda:</span> Pocas películas, bajo rating
        </div>
      </div>
    </div>
  );
}
