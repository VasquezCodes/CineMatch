"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart3, PieChart } from "lucide-react";

export type ChartType = "bar" | "pie";

interface ChartSelectorProps {
  value: ChartType;
  onValueChange: (value: ChartType) => void;
}

const CHART_OPTIONS: Array<{ value: ChartType; label: string; icon: React.ReactNode }> = [
  { value: "bar", label: "Barras", icon: <BarChart3 className="h-4 w-4" /> },
  { value: "pie", label: "Torta", icon: <PieChart className="h-4 w-4" /> },
];

export function ChartSelector({ value, onValueChange }: ChartSelectorProps) {
  return (
    <div className="flex items-center justify-between">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onValueChange(v as ChartType)}
        className="bg-card/10 backdrop-blur-md border border-border/30 p-1 rounded-lg transition-[background-color,border-color] duration-200"
      >
        {CHART_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            className="gap-2 data-[state=on]:bg-background/80 data-[state=on]:backdrop-blur-sm data-[state=on]:shadow-sm px-3 transition-all duration-200"
          >
            {option.icon}
            <span className="hidden sm:inline text-sm">{option.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
