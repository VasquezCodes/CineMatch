'use client';

import { useQuery } from '@tanstack/react-query';
import { getRanking, type RankingType, type RankingStatConfig } from '@/features/rankings/actions';

/**
 * Hook para obtener rankings con caching client-side via React Query.
 * Implementa lazy-loading (solo carga cuando enabled=true) y caching de 5 minutos.
 */
export function useRankings(
    userId: string,
    type: RankingType,
    options: { minRating?: number; limit?: number } = {},
    enabled: boolean = true
) {
    return useQuery<RankingStatConfig[], Error>({
        queryKey: ['rankings', userId, type, options],
        queryFn: () => getRanking(userId, type, options),
        enabled, // Solo fetch cuando está habilitado
        staleTime: 5 * 60 * 1000, // 5 minutos fresh
    });
}

/**
 * Hook para prefetch múltiples rankings en paralelo
 */
export function useRankingsPreload(
    userId: string,
    types: RankingType[],
    options: { minRating?: number; limit?: number } = {}
) {
    // Usamos múltiples queries en paralelo
    return types.map(type =>
        useRankings(userId, type, options, true)
    );
}
