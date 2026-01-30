"use client";

import { useQuery } from "@tanstack/react-query";
import { getCollaborations } from "@/features/analysis/collaborations/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { type RankingType } from "@/features/rankings/actions";
import { BentoGrid } from "@/components/ui/bento-grid";
import { CollaborationBentoItem } from "./CollaborationBentoItem";

export function CollaborationsSection({ userId, rankingType }: { userId: string; rankingType?: RankingType }) {
    const { data: collaborations, isLoading } = useQuery({
        queryKey: ['collaborations', userId, rankingType],
        queryFn: () => getCollaborations(userId, 0, rankingType),
        staleTime: 1000 * 60 * 10
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <BentoGrid className="max-w-7xl mx-auto">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-48 rounded-xl" />
                    ))}
                </BentoGrid>
            </div>
        );
    }

    if (!collaborations || collaborations.length === 0) return null;

    // Límite: Solo 6 colaboraciones para Bento Grid
    const limitedCollaborations = collaborations.slice(0, 6);

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Colaboraciones Frecuentes</CardTitle>
                        <CardDescription>Duplas que repiten escenario en tu colección</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <BentoGrid className="max-w-7xl mx-auto">
                    {limitedCollaborations.map((collab, idx) => (
                        <CollaborationBentoItem key={idx} collab={collab} index={idx} />
                    ))}
                </BentoGrid>
            </CardContent>
        </Card>
    );
}
