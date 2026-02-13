"use client";

import * as React from "react";
import { RankingsExpandedView } from "@/features/rankings/components/RankingsExpandedView";
import { CollaborationsSection } from "@/features/analysis/components/CollaborationsSection";
import { type RankingType } from "@/features/rankings/actions";
import { Section } from "@/components/layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

const MIN = 1;
const MAX = 50;

interface AnalysisClientWrapperProps {
    userId: string;
}

const RANKING_TYPES: Array<{ value: RankingType; label: string }> = [
    { value: "director", label: "Directores" },
    { value: "actor", label: "Actores" },
    { value: "screenplay", label: "Guionistas" },
    { value: "photography", label: "Fotografía" },
    { value: "music", label: "Música" },
    { value: "genre", label: "Géneros" },
    { value: "year", label: "Años" },
];

export function AnalysisClientWrapper({ userId }: AnalysisClientWrapperProps) {
    const [activeTab, setActiveTab] = React.useState<RankingType>("director");

    // draft: valor en tiempo real (slider + input)
    // committed: valor que dispara la carga de datos (debounced)
    const [draft, setDraft] = React.useState(20);
    const [committed, setCommitted] = React.useState(20);
    const [inputStr, setInputStr] = React.useState("20");

    // Debounce: cuando el slider se mueve, esperar 600 ms antes de recargar
    React.useEffect(() => {
        const timer = setTimeout(() => setCommitted(draft), 600);
        return () => clearTimeout(timer);
    }, [draft]);

    const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));

    const applyValue = (v: number) => {
        const safe = clamp(v);
        setDraft(safe);
        setInputStr(String(safe));
    };

    const handleSlider = (val: number[]) => applyValue(val[0]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputStr(e.target.value);
    };

    const handleInputBlur = () => {
        const parsed = parseInt(inputStr, 10);
        if (!isNaN(parsed)) {
            applyValue(parsed);
        } else {
            setInputStr(String(draft));
        }
    };

    const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
    };

    const step = (delta: number) => applyValue(draft + delta);

    return (
        <div className="space-y-10">
            <Section>
                <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Rankings</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Descubre tus preferencias cinematográficas
                            </p>
                        </div>

                        {/* Filtro de cantidad */}
                        <div className="flex flex-col gap-2 min-w-[220px] max-w-[280px] w-full sm:w-auto">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Cantidad a mostrar</span>
                                <span className="text-xs font-semibold text-foreground tabular-nums">
                                    Top {committed}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 shrink-0 rounded-md border-border/40"
                                    onClick={() => step(-1)}
                                    disabled={draft <= MIN}
                                    aria-label="Reducir cantidad"
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>

                                <Slider
                                    min={MIN}
                                    max={MAX}
                                    step={1}
                                    value={[draft]}
                                    onValueChange={handleSlider}
                                    className="flex-1"
                                    aria-label="Número de resultados"
                                />

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 shrink-0 rounded-md border-border/40"
                                    onClick={() => step(1)}
                                    disabled={draft >= MAX}
                                    aria-label="Aumentar cantidad"
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>

                                <input
                                    type="number"
                                    min={MIN}
                                    max={MAX}
                                    value={inputStr}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    onKeyDown={handleInputKey}
                                    className="h-7 w-12 shrink-0 rounded-md border border-border/40 bg-card/10 text-center text-xs font-semibold tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    aria-label="Número exacto de resultados"
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground/60 px-0.5">
                                <span>{MIN}</span>
                                <span>{MAX}</span>
                            </div>
                        </div>
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as RankingType)}
                    >
                        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-card/10 backdrop-blur-md border border-border/30">
                            {RANKING_TYPES.map((type) => (
                                <TabsTrigger
                                    key={type.value}
                                    value={type.value}
                                    className="shrink-0 data-[state=active]:bg-background/80 data-[state=active]:backdrop-blur-sm text-xs md:text-sm transition-all duration-200"
                                >
                                    {type.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    <RankingsExpandedView
                        key={`${activeTab}-${committed}`}
                        userId={userId}
                        type={activeTab}
                        limit={committed}
                    />
                </div>
            </Section>

            {/* Colaboraciones con Bento Grid */}
            <Section>
                <CollaborationsSection
                    userId={userId}
                    rankingType={activeTab}
                />
            </Section>
        </div>
    );
}
