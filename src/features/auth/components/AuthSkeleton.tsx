import { Skeleton } from "@/components/ui/skeleton";

type AuthSkeletonVariant = "login" | "register" | "forgot-password";

interface AuthSkeletonProps {
  variant?: AuthSkeletonVariant;
}

export function AuthSkeleton({ variant = "login" }: AuthSkeletonProps) {
  if (variant === "forgot-password") {
    return (
      <div className="space-y-4 pt-4 w-full">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12 bg-muted" />
          <Skeleton className="h-10 w-full rounded-md bg-muted/60" />
        </div>
      </div>
    );
  }

  if (variant === "register") {
    return (
      <div className="space-y-6 pt-4 w-full">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-muted" />
          <Skeleton className="h-10 w-full rounded-md bg-muted/60" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12 bg-muted" />
          <Skeleton className="h-10 w-full rounded-md bg-muted/60" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 bg-muted" />
          <Skeleton className="h-10 w-full rounded-md bg-muted/60" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-muted" />
          <Skeleton className="h-10 w-full rounded-md bg-muted/60" />
        </div>
        <div className="space-y-4 pt-4">
          <Skeleton className="h-11 w-full rounded-xl bg-primary/20" />
          <Skeleton className="h-4 w-3/4 mx-auto bg-muted/40" />
          <Skeleton className="h-11 w-full rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  // Variante "login" (default)
  return (
    <div className="space-y-6 pt-4 w-full">
      <div className="space-y-2">
        <Skeleton className="h-4 w-12 bg-muted" />
        <Skeleton className="h-10 w-full rounded-md bg-muted/60" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20 bg-muted" />
          <Skeleton className="h-3 w-24 bg-muted" />
        </div>
        <Skeleton className="h-10 w-full rounded-md bg-muted/60" />
      </div>
      <div className="space-y-4 pt-4">
        <Skeleton className="h-11 w-full rounded-xl bg-primary/20" />
        <Skeleton className="h-4 w-3/4 mx-auto bg-muted/40" />
        <Skeleton className="h-11 w-full rounded-xl bg-muted" />
      </div>
    </div>
  );
}

