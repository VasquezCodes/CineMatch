import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Si "next" está en los params, usarlo como URL de redirección
  const next = searchParams.get("next") ?? "/app";

  if (code) {
    const cookieStore = await import("next/headers").then((mod) =>
      mod.cookies()
    );

    // Crear cliente Supabase con manejo simple de cookies para el callback
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // `setAll` fue llamado desde un Server Component.
              // Se puede ignorar si tienes middleware refrescando sesiones.
            }
          },
        },
      }
    );

    // Intercambiar el código por una sesión
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Create response to clean up URL
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // En entorno local no hay load balancer, no es necesario revisar X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Redirigir al usuario a una página de error con instrucciones
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
