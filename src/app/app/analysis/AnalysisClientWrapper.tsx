"use client";

import * as React from "react";
import { RankingsSection } from "@/features/collection/components/RankingsSection";
import { CollaborationsSection } from "@/features/analysis/components/CollaborationsSection";
import { type RankingType } from "@/features/rankings/actions";
import { Section } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalysisClientWrapperProps {
    userId: string;
}

export function AnalysisClientWrapper({ userId }: AnalysisClientWrapperProps) {
    const [activeTab, setActiveTab] = React.useState<RankingType>("director");

    return (
        <div className="space-y-10">
            {/* Rankings - ahora controla el estado activo */}
            <Section>
                <RankingsSection
                    userId={userId}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </Section>

            {/* Colaboraciones - recibe el tipo de ranking activo para filtrar */}
            <Section>
                <CollaborationsSection
                    userId={userId}
                    rankingType={activeTab}
                />
            </Section>
        </div>
    );
}
