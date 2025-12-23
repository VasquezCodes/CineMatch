"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { login, signup, forgotPassword } from "../actions";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthView = "login" | "register" | "forgot-password";

export function AuthCard() {
  const [view, setView] = React.useState<AuthView>("login");
  const [isLoading, setIsLoading] = React.useState(false);

  // Manejo del formulario usando Server Actions
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    let result;

    try {
      if (view === "login") {
        result = await login(formData);
      } else if (view === "register") {
        // Validación simple de coincidencia de contraseñas
        const password = formData.get("password") as string;
        const confirm = formData.get("confirm_password") as string;
        if (password !== confirm) {
          toast.error("Las contraseñas no coinciden");
          setIsLoading(false);
          return;
        }
        result = await signup(formData);
      } else if (view === "forgot-password") {
        result = await forgotPassword(formData);
        if (result?.success) {
          toast.success(result.success);
          setView("login");
        }
      }

      if (result?.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden border-border bg-card/50 shadow-2xl backdrop-blur-xl transition-all duration-300">
        <AnimatePresence mode="wait">
          {view === "forgot-password" ? (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CardHeader>
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="mb-2 flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesión
                </button>
                <CardTitle className="text-2xl font-bold tracking-tight text-card-foreground">
                  Recuperar contraseña
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Introduce tu email y te enviaremos las instrucciones para
                  restablecer tu cuenta.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        name="email"
                        placeholder="tu@email.com"
                        type="email"
                        className="border-border bg-input/50 pl-10 text-foreground placeholder:text-muted-foreground focus:ring-ring"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full font-semibold shadow-lg shadow-primary/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar instrucciones"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="auth-tabs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Tabs
                defaultValue={view}
                onValueChange={(v) => setView(v as "login" | "register")}
                className="w-full"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold tracking-tight text-center text-card-foreground mb-6 font-heading">
                    CineMatch
                  </CardTitle>
                  <TabsList className="grid w-full grid-cols-2 bg-muted/80 h-11 p-1.5 border border-border gap-1">
                    <TabsTrigger
                      value="login"
                      className="h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4"
                    >
                      Iniciar Sesión
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4"
                    >
                      Registro
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="login">
                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="login-email"
                          className="text-foreground"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            name="email"
                            placeholder="tu@email.com"
                            type="email"
                            className="border-border bg-input/50 pl-10 text-foreground placeholder:text-muted-foreground focus:ring-ring"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="login-password"
                            className="text-foreground"
                          >
                            Contraseña
                          </Label>
                          <button
                            type="button"
                            onClick={() => setView("forgot-password")}
                            className="text-xs text-primary hover:underline underline-offset-4"
                          >
                            ¿Olvidaste tu contraseña?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="border-border bg-input/50 pl-10 text-foreground placeholder:text-muted-foreground focus:ring-ring"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-6">
                      <Button
                        className="w-full font-semibold shadow-lg shadow-primary/20"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          "Iniciar Sesión"
                        )}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        Al continuar, aceptas nuestros términos y condiciones.
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full text-sm"
                      >
                        <Link href="/">Volver al inicio</Link>
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-name" className="text-foreground">
                          Nombre completo
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-name"
                            name="full_name"
                            placeholder="Juan Pérez"
                            className="border-border bg-input/50 pl-10 text-foreground placeholder:text-muted-foreground focus:ring-ring"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email" className="text-foreground">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-email"
                            name="email"
                            placeholder="tu@email.com"
                            type="email"
                            className="border-border bg-input/50 pl-10 text-foreground placeholder:text-muted-foreground focus:ring-ring"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="reg-password"
                          className="text-foreground"
                        >
                          Contraseña
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="border-border bg-input/50 pl-10 text-foreground placeholder:text-muted-foreground focus:ring-ring"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="reg-confirm"
                          className="text-foreground"
                        >
                          Confirmar Contraseña
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-confirm"
                            name="confirm_password"
                            type="password"
                            placeholder="••••••••"
                            className="border-border bg-input/50 pl-10 text-foreground placeholder:text-muted-foreground focus:ring-ring"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-6">
                      <Button
                        className="w-full font-semibold shadow-lg shadow-primary/20"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creando cuenta...
                          </>
                        ) : (
                          "Crear Cuenta"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
