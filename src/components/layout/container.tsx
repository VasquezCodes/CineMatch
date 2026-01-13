import { cn } from "@/lib/utils";

export interface ContainerProps {
  /**
   * Contenido del container
   */
  children: React.ReactNode;
  /**
   * Variante de ancho máximo
   * - "default": max-w-7xl (1280px) - Para contenido principal
   * - "wide": max-w-[1400px] - Para layouts amplios
   * - "narrow": max-w-4xl (896px) - Para contenido centrado (forms, artículos)
   * - "full": sin max-width - Ancho completo
   */
  size?: "default" | "wide" | "narrow" | "full";
  /**
   * Si es true, añade padding vertical (py-6 md:py-8 lg:py-10)
   */
  paddingY?: boolean;
  /**
   * Clases adicionales
   */
  className?: string;
  /**
   * Elemento HTML a renderizar
   */
  as?: "div" | "section" | "main" | "article";
}

const sizeClasses = {
  default: "max-w-7xl", // 1280px
  wide: "max-w-[1400px]",
  narrow: "max-w-4xl", // 896px
  full: "",
} as const;

/**
 * Container
 * Componente wrapper responsive para centrar y limitar ancho del contenido.
 * Usa padding horizontal responsive: px-4 sm:px-6 lg:px-8
 *
 * @example
 * ```tsx
 * <Container>
 *   <h1>Contenido centrado</h1>
 * </Container>
 *
 * <Container size="narrow" paddingY>
 *   <Form>...</Form>
 * </Container>
 * ```
 */
export function Container({
  children,
  size = "default",
  paddingY = false,
  className,
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        paddingY && "py-6 md:py-8 lg:py-10",
        className
      )}
    >
      {children}
    </Component>
  );
}
