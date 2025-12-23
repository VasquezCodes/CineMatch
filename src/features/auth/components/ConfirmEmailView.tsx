"use client";

import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, RefreshCw, ExternalLink, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Tipado estricto para las props
interface ConfirmEmailViewProps {
  email?: string;
  onResend?: () => Promise<void>;
  onBackToLogin: () => void;
}

export const ConfirmEmailView: React.FC<ConfirmEmailViewProps> = ({
  email = "robertojesusvasquez2@gmail.com",
  onResend,
  onBackToLogin,
}) => {
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendAction = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    try {
      if (onResend) await onResend();
      setCountdown(60);
    } catch (error) {
      console.error("Error al reenviar email:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleOpenEmailProvider = () => {
    try {
      const emailDomain = email.split("@")[1];
      if (emailDomain) {
        window.open(`https://${emailDomain}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error al abrir el proveedor de email:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6">
      {/* Contenedor Principal - Wizard Layout */}
      <div className="relative w-full max-w-[440px]">
        {/* Efecto de Gradiente Sutil de Fondo (Brand Tone) */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative bg-card border border-border rounded-xl p-6 sm:p-8 shadow-2xl overflow-hidden">
          {/* Header del Wizard */}
          <header className="flex flex-col items-center text-center space-y-4 mb-6 sm:mb-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-500" />
              <div className="relative w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center shadow-inner">
                <Mail className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Confirma tu email
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2 sm:px-4">
                Para garantizar la seguridad en <span className="text-foreground font-semibold">CineMatch</span>, 
                hemos enviado un código a:
                <span className="block text-foreground font-medium mt-1 select-all break-all">{email}</span>
              </p>
            </div>
          </header>

          {/* Cuerpo de Acción */}
          <main className="space-y-3 sm:space-y-4">
            <Button 
              onClick={handleOpenEmailProvider}
              className="w-full h-12 font-bold rounded-xl shadow-lg shadow-primary/20"
              size="lg"
            >
              Ir a mi bandeja de entrada
              <ExternalLink className="w-4 h-4" />
            </Button>

            <Button 
              onClick={handleResendAction}
              disabled={countdown > 0 || isResending}
              variant="secondary"
              className="w-full h-12 font-medium rounded-xl"
              size="lg"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Reenviando...
                </>
              ) : countdown > 0 ? (
                `Reenviar en ${countdown}s`
              ) : (
                "No recibí nada, reenviar"
              )}
            </Button>
          </main>

          {/* Footer Informativo (Explainability Principle) */}
          <footer className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border flex flex-col items-center gap-4 sm:gap-6">
            <div className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg border border-border/50 w-full">
              <ShieldCheck className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[12px] text-muted-foreground leading-snug">
                ¿No está en Recibidos? Revisa tu carpeta de <strong>Spam</strong> o Promociones.
              </p>
            </div>

            <Button 
              onClick={onBackToLogin}
              variant="ghost"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground group"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver al inicio de sesión
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
};

