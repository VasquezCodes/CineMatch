import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/layout';

/**
 * Skeleton para el Hero section (simula MovieBackdrop)
 * Replica la estructura y gradientes del componente real para consistencia visual
 */
function MovieHeroSkeleton() {
    return (
        <div className="relative w-full min-h-[500px] sm:min-h-[550px] md:min-h-[600px] -mt-14">
            {/* Fondo simulando backdrop con gradientes cinematográficos adaptativos */}
            <div className="absolute inset-0 w-screen left-1/2 -translate-x-1/2 overflow-hidden">
                {/* Fondo base sutil - casi transparente */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-muted/20 via-muted/30 to-muted/40" />

                {/* Bottom fade - fundido hacia el fondo (igual que MovieBackdrop) */}
                <div className="absolute inset-0 z-[1]
                               dark:bg-gradient-to-b dark:from-transparent dark:via-black/40 dark:to-background
                               bg-gradient-to-b from-transparent via-black/20 to-background" />

                {/* Top vignette - oscurecimiento superior para navbar legible */}
                <div className="absolute inset-0 z-[1]
                               bg-gradient-to-t from-transparent via-transparent to-black/40" />

                {/* Lateral vignette - vignette radial para enfoque central */}
                <div
                    className="absolute inset-0 z-[1]"
                    style={{
                        background:
                            "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.5) 100%)",
                    }}
                />

                {/* Overlay sutil para contraste del texto - solo dark mode */}
                <div className="absolute inset-0 z-[1] dark:bg-black/20 bg-transparent" />
            </div>

            {/* Contenido dentro de Container - con padding superior compensado (igual que MovieBackdrop) */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-6 md:pt-22 md:pb-8">
                {/* Botón Volver Skeleton */}
                <div className="mb-6">
                    <Skeleton className="h-9 w-24 bg-white/10" />
                </div>

                {/* Grid con póster e información */}
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-6 lg:gap-8 items-end">
                    {/* Póster Skeleton */}
                    <div className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-none mx-auto md:mx-0">
                        <Skeleton className="aspect-[2/3] w-full rounded-xl bg-white/10" />
                    </div>

                    {/* Información principal Skeleton */}
                    <div className="flex flex-col justify-end space-y-4">
                        {/* Título */}
                        <Skeleton className="h-10 sm:h-12 lg:h-14 w-3/4 bg-white/10" />

                        {/* Año y metadata */}
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-5 w-20 bg-white/10" />
                            <Skeleton className="h-5 w-24 bg-white/10" />
                        </div>

                        {/* Valoraciones */}
                        <div className="flex gap-6">
                            <Skeleton className="h-6 w-32 bg-white/10" />
                            <Skeleton className="h-6 w-28 bg-white/10" />
                        </div>

                        {/* Director y duración */}
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-5 w-40 bg-white/10" />
                            <Skeleton className="h-5 w-24 bg-white/10" />
                        </div>

                        {/* Géneros */}
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-7 w-20 rounded-full bg-white/10" />
                            ))}
                        </div>

                        {/* Tagline */}
                        <Skeleton className="h-5 w-64 bg-white/10" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton para la sección de contenido (sinopsis, reparto, etc.)
 */
function MovieContentSkeleton() {
    return (
        <div className="space-y-8 md:space-y-10">
            {/* Sinopsis Skeleton */}
            <div>
                <Skeleton className="h-8 w-32 mb-4" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </div>
            </div>

            {/* Reparto Skeleton */}
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />

                {/* Tabs Skeleton */}
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>

                {/* Grid de actores */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function MovieLoading() {
    return (
        <div className="space-y-8 md:space-y-10">
            {/* Hero Section con fondo oscuro (coherente con navbar "cinematic") */}
            <MovieHeroSkeleton />

            {/* Contenido debajo del hero */}
            <Container>
                <MovieContentSkeleton />
            </Container>
        </div>
    );
}
