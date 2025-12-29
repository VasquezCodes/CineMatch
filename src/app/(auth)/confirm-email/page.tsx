"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConfirmEmailView } from "@/features/auth/components/ConfirmEmailView";
import { ThemeToggle } from "@/components/layout/theme-toggle";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email") || "";

  const handleResend = async () => {
    // Simulación de carga de 1.5s
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Email de confirmación reenviado correctamente");
  };

  const handleBack = () => {
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Elementos decorativos de fondo para resaltar el Glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />

      {/* Theme Toggle en esquina superior derecha */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <ConfirmEmailView
          email={email}
          onResend={handleResend}
          onBackToLogin={handleBack}
        />
      </div>
    </main>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-muted-foreground">Cargando...</div>
        </main>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
