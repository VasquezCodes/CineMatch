'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

interface QueryProviderProps {
    children: ReactNode;
}

/**
 * QueryProvider
 * Wrapper de React Query para caching client-side de rankings y otras queries
 * Configura defaults como staleTime y gcTime para optimizar rendimiento
 */
export function QueryProvider({ children }: QueryProviderProps) {
    // Creamos el client en useState para evitar compartir estado entre requests SSR
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000, // 5 minutos: datos se consideran frescos
                        gcTime: 10 * 60 * 1000,   // 10 minutos: mantener en cache tras unmount
                        refetchOnWindowFocus: false, // No refetch automático al volver a la ventana
                        retry: 1, // Solo 1 retry en errores de red
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
