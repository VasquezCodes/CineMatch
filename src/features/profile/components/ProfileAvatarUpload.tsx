'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ProfileAvatarUploadProps {
  currentAvatarUrl?: string | null;
  username?: string | null;
  onFileSelect: (file: File) => void;
}

export function ProfileAvatarUpload({
  currentAvatarUrl,
  username,
  onFileSelect,
}: ProfileAvatarUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const displayUrl = preview || currentAvatarUrl;
  const fallbackInitials = username
    ? username.slice(0, 2).toUpperCase()
    : 'U';

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;

    // Validar tipo
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato no válido', {
        description: 'Solo se permiten imágenes PNG, JPG o WEBP',
      });
      return;
    }

    // Validar tamaño (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Archivo muy grande', {
        description: 'El tamaño máximo es 2MB',
      });
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Llamar handler del padre
    onFileSelect(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileSelect(e.dataTransfer.files[0]);
        }}
        className={cn(
          'relative cursor-pointer group',
          'transition-all duration-200'
        )}
      >
        <Avatar
          className={cn(
            'h-32 w-32 border-2 transition-all',
            isDragging
              ? 'border-primary ring-4 ring-primary/20 scale-105'
              : 'border-border/40 group-hover:border-primary/60 group-hover:ring-4 group-hover:ring-primary/10'
          )}
        >
          {displayUrl ? (
            <AvatarImage src={displayUrl} alt={username || 'Avatar'} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
              {fallbackInitials}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Overlay con icono de cámara en hover */}
        <div
          className={cn(
            'absolute inset-0 rounded-full flex items-center justify-center',
            'bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity',
            'backdrop-blur-sm'
          )}
        >
          <Upload className="h-8 w-8 text-white" />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
        className="hidden"
      />

      <div className="text-center space-y-1">
        <p className="text-sm font-medium">Click para cambiar foto</p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG o WEBP (máx. 2MB)
        </p>
      </div>
    </div>
  );
}
