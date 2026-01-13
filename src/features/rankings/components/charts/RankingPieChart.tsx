"use client";

import * as React from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Sector } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { RankingStatConfig } from "../../actions";

interface RankingPieChartProps {
  data: RankingStatConfig[];
  selectedIndex: number | null;
  onSelectItem: (index: number) => void;
}

// Paleta de colores para el pie chart
const PIE_COLORS = [
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
    label: "Películas",
  },
} satisfies ChartConfig;

export function RankingPieChart({ data, selectedIndex, onSelectItem }: RankingPieChartProps) {
  // Preparar datos para el gráfico
  const totalCount = data.slice(0, 10).reduce((sum, item) => sum + item.count, 0);

  const chartData = data.slice(0, 10).map((item, index) => {
    const avgRating = item.data.movies.length > 0
      ? item.data.movies.reduce((sum, m) => sum + (m.user_rating || 0), 0) / item.data.movies.length
      : 0;

    return {
      name: item.key,
      count: item.count,
      percentage: ((item.count / totalCount) * 100).toFixed(1),
      avgRating: avgRating.toFixed(1),
      index,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    };
  });

  // Renderizador personalizado para sector activo
  const renderActiveShape = (props: any) => {
    const {
      cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent
    } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fill="hsl(var(--foreground))"
          className="text-sm font-medium"
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          className="text-xs"
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      </g>
    );
  };

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => (
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{item.payload.name}</span>
                  <span>{value} películas ({item.payload.percentage}%)</span>
                  <span className="text-muted-foreground">
                    Promedio: ★ {item.payload.avgRating}
                  </span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="count"
          nameKey="name"
          activeIndex={selectedIndex ?? undefined}
          activeShape={renderActiveShape}
          onClick={(data) => onSelectItem(data.index)}
          cursor="pointer"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill}
              opacity={selectedIndex === null || selectedIndex === index ? 1 : 0.5}
            />
          ))}
        </Pie>
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={8}
          formatter={(value, entry: any) => (
            <span className="text-xs text-muted-foreground">
              {truncateName(value, 15)} ({entry.payload.percentage}%)
            </span>
          )}
        />
      </PieChart>
    </ChartContainer>
  );
}

function truncateName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 1) + "…";
}
