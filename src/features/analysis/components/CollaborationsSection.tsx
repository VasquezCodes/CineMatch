"use client";

import { useQuery } from "@tanstack/react-query";
import { getCollaborations, type Collaboration } from "@/features/analysis/collaborations/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function CollaborationCard({ collab }: { collab: Collaboration }) {
    return (
        <Card className="overflow-hidden hover:bg-muted/20 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center -space-x-3">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Avatar className="h-12 w-12 border-2 border-background">
                                        <AvatarImage src={`https://image.tmdb.org/t/p/w200${collab.person1.photo_url}`} />
                                        <AvatarFallback>{collab.person1.name[0]}</AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{collab.person1.name} ({collab.person1.role})</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Avatar className="h-12 w-12 border-2 border-background">
                                        <AvatarImage src={`https://image.tmdb.org/t/p/w200${collab.person2.photo_url}`} />
                                        <AvatarFallback>{collab.person2.name[0]}</AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{collab.person2.name} ({collab.person2.role})</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {collab.count} películas juntas
                    </Badge>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                        <h4 className="font-medium text-sm line-clamp-1">
                            {collab.person1.name} & {collab.person2.name}
                        </h4>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                        {collab.person1.role} • {collab.person2.role}
                    </p>
                </div>

                <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Películas destacadas:</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {collab.movies.map((movie, i) => (
                            <div key={i} className="flex-shrink-0 w-12 space-y-1 text-center" title={movie.title}>
                                <div className="relative aspect-[2/3] rounded overflow-hidden bg-muted">
                                    {movie.poster_url && (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w92${movie.poster_url}`}
                                            alt={movie.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex items-center justify-center text-[10px] gap-0.5">
                                    <Star className="h-2 w-2 fill-primary text-primary" />
                                    <span>{movie.user_rating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

import { type RankingType } from "@/features/rankings/actions";

export function CollaborationsSection({ userId, rankingType }: { userId: string; rankingType?: RankingType }) {
    // Búsqueda predeterminada para minRating = 0 (todas las joyas)
    // El queryKey incluye rankingType para refetch automático al cambiar
    const { data: collaborations, isLoading } = useQuery({
        queryKey: ['collaborations', userId, rankingType],
        queryFn: () => getCollaborations(userId, 0, rankingType),
        staleTime: 1000 * 60 * 10 // caché de 10 minutos
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-48 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!collaborations || collaborations.length === 0) return null;

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collaborations.map((collab, idx) => (
                        <CollaborationCard key={idx} collab={collab} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
