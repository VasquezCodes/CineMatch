
import { Skeleton } from '@/components/ui/skeleton';

function MovieHeaderSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 md:gap-8 pb-8 border-b border-border/50">
            {/* Poster Skeleton */}
            <div className="w-full max-w-[280px] md:max-w-none mx-auto md:mx-0">
                <Skeleton className="aspect-[2/3] w-full rounded-xl" />
            </div>

            {/* Contenido Skeleton */}
            <div className="flex flex-col space-y-4">
                <div>
                    <Skeleton className="h-10 w-3/4 mb-3" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-40" />
                </div>

                <div className="pt-4 space-y-2">
                    <Skeleton className="h-6 w-32 mb-3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/6" />
                </div>
            </div>
        </div>
    );
}

export default function MovieLoading() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
                {/* Botón Volver Skeleton */}
                <div>
                    <Skeleton className="h-9 w-24" />
                </div>

                {/* Header Skeleton */}
                <MovieHeaderSkeleton />

                {/* Reparto Skeleton */}
                <div className="space-y-6">
                    <Skeleton className="h-8 w-48" />

                    {/* Tabs Skeleton - kept for structural similarity if user wants exactness, 
              though simpler apps might skip tabs. keeping implies 'exact' match. */}
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>

                    {/* Grid Skeleton */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
