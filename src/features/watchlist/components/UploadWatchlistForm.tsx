"use client";

import * as React from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Search,
  BarChart3,
  HelpCircle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Importamos Framer Motion
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/index";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { UploadStatus } from "../types";

interface UploadWatchlistFormProps {
  onUpload?: (file: File) => Promise<void> | void;
  maxSizeMB?: number;
  className?: string;
}

export function UploadWatchlistForm({
  onUpload,
  maxSizeMB = 10,
  className,
}: UploadWatchlistFormProps) {
  // Forzar que solo se acepten archivos CSV
  const accept = ".csv";
  const [status, setStatus] = React.useState<UploadStatus>("idle");
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Simular progreso cuando está en estado uploading
  React.useEffect(() => {
    if (status === "uploading") {
      setProgress(0);

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return 100;
          }
          // Incremento no lineal para hacerlo más realista
          const increment = prev < 50 ? 2 : prev < 90 ? 1.5 : 0.5;
          return Math.min(prev + increment, 100);
        });
      }, 30); // Aproximadamente 30ms por actualización (3 segundos total)
    } else {
      // Limpiar intervalo cuando sale del estado uploading
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (status === "idle" || status === "error") {
        setProgress(0);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [status]);

  // --- Lógica de validación y handlers ---
  const validateFile = (fileToValidate: File): string | null => {
    const fileName = fileToValidate.name.toLowerCase();
    // Validación estricta: debe terminar en .csv
    if (!fileName.endsWith(".csv")) {
      return "Solo se permiten archivos CSV (.csv)";
    }
    // Validación adicional: verificar que no tenga múltiples extensiones
    const parts = fileName.split(".");
    if (parts.length < 2 || parts[parts.length - 1] !== "csv") {
      return "Solo se permiten archivos CSV (.csv)";
    }
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (fileToValidate.size > maxSizeBytes) {
      return `El archivo es demasiado grande. Máximo: ${maxSizeMB}MB`;
    }
    return null;
  };

  const handleFileSelect = async (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      setStatus("error");
      setFile(null);
      return;
    }
    setError(null);
    setFile(selectedFile);

    if (onUpload) {
      try {
        setStatus("uploading");
        await onUpload(selectedFile);

        // Asegurar que llegue al 100% antes de completar
        setProgress(100);
        setTimeout(() => {
          setStatus("success");
        }, 100);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir");
        setStatus("error");
      }
    }
  };

  // Handlers de Drag & Drop (Se mantienen iguales)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleClick = () => fileInputRef.current?.click();

  const handleReset = () => {
    setStatus("idle");
    setFile(null);
    setProgress(0);
    setError(null);
    // Resetear el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-8", className)}>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={status !== "uploading" ? handleClick : undefined}
            className={cn(
              "relative min-h-[300px] flex flex-col items-center justify-center transition-all duration-300 p-8",
              status !== "uploading" && "cursor-pointer hover:bg-muted/50",
              isDragging && "bg-primary/5 ring-2 ring-primary ring-inset"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {status === "uploading" ? (
                // PANTALLA DE CARGA / ANÁLISIS CON BARRA DE PROGRESO
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center space-y-6 text-center w-full max-w-md"
                >
                  <div className="space-y-4 w-full">
                    <h3 className="text-xl font-bold text-foreground">
                      Analizando gustos, películas...
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Estamos procesando tu historial para generar tu perfil.
                    </p>
                    <Progress value={progress} className="w-full h-2" />
                  </div>
                </motion.div>
              ) : (
                // PANTALLA INICIAL / ARCHIVO SELECCIONADO
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center gap-4 text-center"
                >
                  {file && status !== "error" ? (
                    <div className="bg-primary/10 p-4 rounded-full">
                      <FileText className="h-10 w-10 text-primary" />
                    </div>
                  ) : (
                    <div className="bg-muted p-4 rounded-full text-muted-foreground">
                      <Upload className="h-10 w-10" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-lg font-medium">
                      {file ? file.name : "Arrastra tu archivo CSV aquí"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {file
                        ? "Listo para procesar"
                        : "o haz clic para seleccionar"}
                    </p>
                  </div>

                  {!file && (
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4">
                      Formato permitido: {accept} • Máximo: {maxSizeMB}MB
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN DE INSTRUCCIONES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Paso 1: Exportar</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Exporta tu lista desde IMDB en formato CSV desde tu configuración
              de perfil.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Paso 2: Subir</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Arrastra el archivo aquí arriba. Analizaremos géneros, años y
              directores.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Paso 3: Analizar</h4>
            <p className="text-xs text-muted-foreground mt-1">
              ¡Listo! Ve a la sección de Análisis para ver tu resumen visual.
            </p>
          </div>
        </div>
      </div>

      {/* DIÁLOGO DE ÉXITO */}
      <AlertDialog open={status === "success"}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              ¡Análisis completado!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Tu resumen de visualización ya está disponible. Hemos identificado
              tus géneros favoritos y tendencias de cine.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:justify-center">
            <AlertDialogAction
              onClick={() => (window.location.href = "/app/insights")}
              className="w-full sm:w-auto"
            >
              Ver mi resumen ahora
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={handleReset}
              className="w-full sm:w-auto !bg-destructive !text-destructive-foreground hover:!bg-destructive/90 !border-0 shadow-sm"
            >
              Eliminar y subir otro
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manejo de Error Mejorado */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive"
        >
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8 text-destructive"
            onClick={() => setError(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
