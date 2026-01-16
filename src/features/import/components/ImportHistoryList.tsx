'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, FileText, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteImport, UserImport } from '@/features/import/actions';
import { cn } from '@/lib/utils';

interface ImportHistoryListProps {
    imports: UserImport[];
}

function getStatusConfig(status: string) {
    switch (status) {
        case 'completed':
            return {
                label: 'Completado',
                icon: CheckCircle2,
                className: 'text-primary',
            };
        case 'processing':
            return {
                label: 'Procesando',
                icon: Loader2,
                className: 'text-amber-500 animate-spin',
            };
        case 'error':
            return {
                label: 'Error',
                icon: AlertCircle,
                className: 'text-destructive',
            };
        default:
            return {
                label: 'Pendiente',
                icon: Clock,
                className: 'text-muted-foreground',
            };
    }
}

export function ImportHistoryList({ imports }: ImportHistoryListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = (importId: string) => {
        startTransition(async () => {
            await deleteImport(importId);
            router.refresh();
        });
    };

    return (
        <div className="space-y-3">
            {imports.map((item) => {
                const statusConfig = getStatusConfig(item.status);
                const StatusIcon = statusConfig.icon;
                const importDate = new Date(item.imported_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });

                return (
                    <Card key={item.id} className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                {/* Left: File info */}
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        <FileText className="size-5 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{item.filename}</p>
                                        <p className="text-sm text-muted-foreground">{importDate}</p>
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                            <span className="rounded-full bg-muted px-2 py-0.5">
                                                {item.counts?.total ?? 0} películas
                                            </span>
                                            {(item.counts?.new ?? 0) > 0 && (
                                                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5">
                                                    +{item.counts.new} nuevas
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Status & Actions */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="flex items-center gap-1.5">
                                        <StatusIcon className={cn('size-4', statusConfig.className)} />
                                        <span className="text-sm text-muted-foreground hidden sm:inline">
                                            {statusConfig.label}
                                        </span>
                                    </div>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                disabled={isPending}
                                                aria-label="Eliminar importación"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar esta importación?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Se eliminarán las películas que no estén en otras importaciones.
                                                    Esta acción no se puede deshacer.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(item.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Eliminar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
