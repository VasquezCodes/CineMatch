import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-primary/35 focus-visible:ring-[3px] transition-all duration-300 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-accent text-accent-foreground [a&]:hover:bg-accent/90",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90",
        outline:
          "border-border text-foreground [a&]:hover:bg-muted",
        accent:
          "border-transparent bg-accent text-accent-foreground [a&]:hover:bg-accent/90",
        // Modern Cinema Variants
        glassmorphism:
          "backdrop-blur-md bg-background/80 border-0 ring-1 ring-border/40 text-foreground shadow-sm [a&]:hover:ring-border/60 [a&]:hover:shadow-md",
        "glassmorphism-accent":
          "backdrop-blur-md bg-accent/10 border-0 ring-1 ring-accent/20 text-accent shadow-sm [a&]:hover:ring-accent/40 [a&]:hover:bg-accent/15",
        "glassmorphism-primary":
          "backdrop-blur-md bg-primary/10 border-0 ring-1 ring-primary/20 text-primary shadow-sm [a&]:hover:ring-primary/40 [a&]:hover:bg-primary/15",
        ring:
          "backdrop-blur-sm bg-background/50 border-0 ring-1 ring-border/30 text-foreground [a&]:hover:ring-primary/50 [a&]:hover:bg-background/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
