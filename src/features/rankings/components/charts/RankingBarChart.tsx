"use client";

import * as React from "react";
import { Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { RankingStatConfig } from "../../actions";

interface RankingBarChartProps {
  data: RankingStatConfig[];
  selectedIndex: number | null;
  onSelectItem: (index: number) => void;
}

// Colores para las barras (gradiente del primario al secundario)
const BAR_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const chartConfig = {
  count: {
    label: "Películas",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function RankingBarChart({ data, selectedIndex, onSelectItem }: RankingBarChartProps) {
  // Preparar datos para el gráfico (máximo 10)
  const chartData = data.slice(0, 10).map((item, index) => {
    const avgRating = item.data.movies.length > 0
      ? item.data.movies.reduce((sum, m) => sum + (m.user_rating || 0), 0) / item.data.movies.length
      : 0;

    return {
      name: truncateName(item.key, 12),
      fullName: item.key,
      count: item.count,
      avgRating: avgRating.toFixed(1),
      index,
    };
  });

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
      >
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={100}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => (
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{item.payload.fullName}</span>
                  <span>{value} películas</span>
                  <span className="text-muted-foreground">
                    Promedio: ★ {item.payload.avgRating}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey="count"
          radius={[0, 4, 4, 0]}
          cursor="pointer"
          onClick={(data) => onSelectItem(data.index)}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={BAR_COLORS[index % BAR_COLORS.length]}
              opacity={selectedIndex === null || selectedIndex === index ? 1 : 0.4}
              stroke={selectedIndex === index ? "hsl(var(--primary))" : "transparent"}
              strokeWidth={selectedIndex === index ? 2 : 0}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function truncateName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 1) + "…";
}
