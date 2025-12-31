import { getRanking, RankingType } from "@/features/rankings/actions";
import { PageHeader, Section } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * ============================================================================
 * GUÍA DE USO PARA EL  FRONTEND: SISTEMA DE RANKINGS
 * ============================================================================
 * 
 * Esta página sirve como demostración y documentación de cómo obtener y mostrar
 * los rankings generados a partir de los datos del usuario.
 * 
 * 1. FUNCIÓN PRINCIPAL: getRanking
 * ----------------------------------------------------------------------------
 * Importar desde: @/features/rankings/actions
 * Firma: getRanking(userId: string, type: RankingType, options?: RankingOptions)
 * Retorna: Promise<RankingItem[]>
 * 
 * 2. TIPOS DE RANKING DISPONIBLES (RankingType)
 * ----------------------------------------------------------------------------
 * - 'director'     : Ranking por director
 * - 'actor'        : Ranking por actor (incluye lógica de roles/saga)
 * - 'genre'        : Ranking por género
 * - 'year'         : Ranking por año de lanzamiento
 * - 'screenplay'   : Ranking por guionista
 * - 'photography'  : Ranking por director de fotografía
 * - 'music'        : Ranking por compositor
 * 
 * 3. OPCIONES (RankingOptions)
 * ----------------------------------------------------------------------------
 * - minRating: (number) Calificación mínima para incluir una película (defecto: 10)
 * - limit:     (number) Cantidad máxima de items a devolver (defecto: 10)
 * 
 * 4. ESTRUCTURA DE DATOS (RankingItem)
 * ----------------------------------------------------------------------------
 * Cada elemento del array retornado tiene esta forma:
 * {
 *   name: string;        // Nombre del criterio (ej. "Christopher Nolan" o "Action")
 *   count: number;       // Cantidad de películas que cumplen el criterio
 *   movies: Array<{      // Lista de películas asociadas
 *     id: string;
 *     title: string;
 *     year: number;
 *     poster_url: string | null;
 *     user_rating?: number;
 *   }>;
 *   // Solo para tipo 'actor':
 *   roles?: string[];    // Roles interpretados
 *   is_saga?: boolean;   // true si el actor repite roles (menos roles únicos que películas)
 * }
 * 
 * ============================================================================
 */

export const dynamic = 'force-dynamic';

export default async function DevRankingsPage() {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Por favor inicia sesión primero</div>
    }

    const types: RankingType[] = ['director', 'actor', 'genre', 'year', 'screenplay', 'photography', 'music'];

    // Ejemplo de obtención de datos para cada tipo de ranking
    // En una implementación real, probablemente solo llamarás a uno a la vez según lo que el usuario quiera ver.
    const results = await Promise.all(
        types.map(async (type) => {
            // Aquí pedimos: minRating 7 (buenas películas) y Top 5 resultados
            const data = await getRanking(user.id, type, { minRating: 7, limit: 5 });
            return { type, data };
        })
    );

    return (
        <div className="space-y-8 p-8">
            <PageHeader title="Depurador del Sistema de Rankings" description="Verificando lógica de rankings y visualización de datos" />

            {/* Renderizado de ejemplo para cada tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {results.map(({ type, data }) => (
                    <Card key={type}>
                        <CardHeader>
                            <CardTitle className="capitalize">{type} Ranking (Min 7, Top 5)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.length === 0 ? (
                                <p className="text-muted-foreground">No se encontraron datos.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {data.map((item, i) => (
                                        <li key={i} className="border-b pb-2 last:border-0">
                                            {/* Cabecera del Item: Nombre y Cantidad Total */}
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-lg">#{i + 1} {item.name}</span>
                                                <Badge variant="secondary">{item.count} películas</Badge>
                                            </div>

                                            {/* Datos específicos de Actores: Roles y Sagas */}
                                            {item.roles && (
                                                <div className="text-xs text-muted-foreground mb-2">
                                                    Roles: {item.roles.join(', ')} {item.is_saga && <Badge variant="outline" className="ml-2 text-[10px]">Saga / Recurrente</Badge>}
                                                </div>
                                            )}

                                            {/* Lista horizontal de películas asociadas al item */}
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {item.movies.map(m => (
                                                    // Nota valida para frontend: Usar m.id como key siempre
                                                    <div key={m.id} className="w-16 shrink-0 text-xs text-center">
                                                        {m.poster_url && <img src={m.poster_url} alt={m.title} className="w-16 h-24 object-cover rounded mb-1" />}
                                                        <div className="truncate" title={m.title}>{m.title}</div>
                                                        <div className="text-muted-foreground">{m.year}</div>
                                                        {m.user_rating && <div className="font-bold text-amber-500">★ {m.user_rating}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
