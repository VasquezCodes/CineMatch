"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart3, PieChart, ScatterChart } from "lucide-react";

export type ChartType = "bar" | "pie" | "bubble";

interface ChartSelectorProps {
  value: ChartType;
  onValueChange: (value: ChartType) => void;
}

const CHART_OPTIONS: Array<{ value: ChartType; label: string; icon: React.ReactNode }> = [
  { value: "bar", label: "Barras", icon: <BarChart3 className="h-4 w-4" /> },
  { value: "pie", label: "Torta", icon: <PieChart className="h-4 w-4" /> },
  { value: "bubble", label: "Burbujas", icon: <ScatterChart className="h-4 w-4" /> },
];

export function ChartSelector({ value, onValueChange }: ChartSelectorProps) {
  return (
    <div className="flex items-center justify-between">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onValueChange(v as ChartType)}
        className="bg-muted/50 p-1 rounded-lg"
      >
        {CHART_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            className="gap-2 data-[state=on]:bg-background data-[state=on]:shadow-sm px-3"
          >
            {option.icon}
            <span className="hidden sm:inline text-sm">{option.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
