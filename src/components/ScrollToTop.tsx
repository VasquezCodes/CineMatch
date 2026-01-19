'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Componente que maneja el scroll de forma inteligente:
 * - Navegación hacia adelante: resetea scroll al top
 * - Navegación hacia atrás (back button): preserva la posición anterior
 */
export function ScrollToTop() {
    const pathname = usePathname();
    const isBackNavigation = useRef(false);
    const scrollPositions = useRef<Record<string, number>>({});

    useEffect(() => {
        // Guardar posición actual antes de navegar
        const handleBeforeUnload = () => {
            scrollPositions.current[pathname] = window.scrollY;
        };

        // Detectar navegación hacia atrás
        const handlePopState = () => {
            isBackNavigation.current = true;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            // Guardar posición al desmontar (antes de cambiar de ruta)
            scrollPositions.current[pathname] = window.scrollY;
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [pathname]);

    useEffect(() => {
        if (isBackNavigation.current) {
            // Si es navegación hacia atrás, restaurar posición guardada
            const savedPosition = scrollPositions.current[pathname];
            if (savedPosition !== undefined) {
                // Pequeño delay para asegurar que el contenido esté renderizado
                setTimeout(() => {
                    window.scrollTo(0, savedPosition);
                }, 0);
            }
            isBackNavigation.current = false;
        } else {
            // Navegación hacia adelante: scroll al top
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
}
