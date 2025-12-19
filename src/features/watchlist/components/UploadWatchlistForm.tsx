"use client";

import * as React from "react";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/index";
import type { UploadStatus } from "../types";

interface UploadWatchlistFormProps {
  onUpload?: (file: File) => Promise<void> | void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function UploadWatchlistForm({
  onUpload,
  accept = ".svg",
  maxSizeMB = 10,
  className,
}: UploadWatchlistFormProps) {
  const [status, setStatus] = React.useState<UploadStatus>("idle");
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (fileToValidate: File): string | null => {
    // Validar tipo de archivo
    if (accept && !fileToValidate.name.toLowerCase().endsWith(".svg")) {
      return "Solo se permiten archivos SVG";
    }

    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (fileToValidate.size > maxSizeBytes) {
      return `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`;
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
    setStatus("idle");

    if (onUpload) {
      try {
        setStatus("uploading");
        await onUpload(selectedFile);
        setStatus("success");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al subir el archivo"
        );
        setStatus("error");
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStatus("idle");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardContent className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
              "hover:border-primary/50",
              isDragging && "border-primary bg-primary/5",
              status === "error" && "border-destructive",
              status === "success" && "border-primary",
              status === "uploading" && "border-primary/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
              aria-label="Seleccionar archivo SVG"
            />

            <div className="flex flex-col items-center justify-center gap-4 text-center">
              {status === "uploading" ? (
                <>
                  <div className="relative">
                    <Upload className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Subiendo archivo...</p>
                    <p className="text-xs text-muted-foreground">
                      Por favor espera
                    </p>
                  </div>
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary">
                      Archivo subido correctamente
                    </p>
                    {file && (
                      <p className="text-xs text-muted-foreground">
                        {file.name}
                      </p>
                    )}
                  </div>
                </>
              ) : file ? (
                <>
                  <FileText className="h-12 w-12 text-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Arrastra tu archivo SVG aquí
                    </p>
                    <p className="text-xs text-muted-foreground">
                      o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Tamaño máximo: {maxSizeMB}MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {file && status === "idle" && onUpload && (
        <div className="flex justify-end">
          <Button
            onClick={() => handleFileSelect(file)}
            disabled={status === "uploading"}
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir Watchlist
          </Button>
        </div>
      )}
    </div>
  );
}

