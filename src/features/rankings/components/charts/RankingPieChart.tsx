"use client";

import * as React from "react";
import { Pie, PieChart, Cell, Legend, Sector } from "recharts";
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

// Paleta de colores del sistema de diseño (chart-1 a chart-10)
const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
  "hsl(var(--chart-9))",
  "hsl(var(--chart-10))",
];

const chartConfig = {
  count: {
    label: "Películas",
    color: "hsl(var(--chart-1))",
  },
  avgRating: {
    label: "Rating Promedio",
  },
  percentage: {
    label: "Porcentaje",
  },
} satisfies ChartConfig;

export function RankingPieChart({ data, selectedIndex, onSelectItem }: RankingPieChartProps) {
  // Validación de datos
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
        No hay datos disponibles para mostrar
      </div>
    );
  }

  // Ordenar datos de mayor a menor por count (asegurar orden correcto)
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  // Crear mapeo de índices: índice en sortedData -> índice original en data
  const indexMap = sortedData.map((sortedItem) =>
    data.findIndex((originalItem) => originalItem.key === sortedItem.key)
  );

  // Mapear selectedIndex original al índice en sortedData
  const sortedSelectedIndex = selectedIndex !== null 
    ? indexMap.findIndex((originalIdx) => originalIdx === selectedIndex)
    : null;

  const totalCount = sortedData.reduce((sum, item) => sum + item.count, 0);

  const chartData = sortedData.map((item, index) => {
    const avgRating = item.data.movies.length > 0
      ? item.data.movies.reduce((sum, m) => sum + (m.user_rating || 0), 0) / item.data.movies.length
      : 0;

    return {
      name: item.key,
      count: item.count,
      percentage: ((item.count / totalCount) * 100).toFixed(1),
      avgRating: avgRating.toFixed(1),
      index,
      originalIndex: indexMap[index], // Guardar índice original para el click
      fill: PIE_COLORS[index % PIE_COLORS.length],
    };
  });

  // Renderizador personalizado para sector activo
  const renderActiveShape = (props: any) => {
    const {
      cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill
    } = props;

    return (
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
    );
  };

  // Configuración responsive usando CSS en lugar de JS hook para evitar hidratación
  const pieConfig = { cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 120 };
  const legendConfig = { layout: "vertical" as const, align: "right" as const, verticalAlign: "middle" as const };

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full" style={{ minHeight: '400px' }}>
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
          cx={pieConfig.cx}
          cy={pieConfig.cy}
          innerRadius={pieConfig.innerRadius}
          outerRadius={pieConfig.outerRadius}
          paddingAngle={2}
          dataKey="count"
          nameKey="name"
          activeIndex={sortedSelectedIndex !== null ? sortedSelectedIndex : undefined}
          activeShape={renderActiveShape}
          onClick={(clickedData: any) => {
            // Recharts pasa el payload directamente o dentro de un objeto
            const payload = clickedData.payload || clickedData;
            const clickedItem = chartData.find((item) => item.name === payload.name);
            if (clickedItem && clickedItem.originalIndex !== undefined) {
              onSelectItem(clickedItem.originalIndex);
            }
          }}
          cursor="pointer"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill}
              opacity={sortedSelectedIndex === null || sortedSelectedIndex === index ? 1 : 0.5}
            />
          ))}
        </Pie>
        <Legend
          layout={legendConfig.layout}
          align={legendConfig.align}
          verticalAlign={legendConfig.verticalAlign}
          iconType="circle"
          iconSize={8}
          formatter={(value, entry: any) => (
            <span className="text-xs text-muted-foreground">
              {truncateName(value, 18)} ({entry.payload.percentage}%)
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
