# Documentación de Arquitectura - CineMatch

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Frontend](#arquitectura-del-frontend)
3. [Integración con Supabase/Backend](#integración-con-supabasebackend)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Patrones y Métodos](#patrones-y-métodos)
6. [Sistema de Tipos](#sistema-de-tipos)
7. [Autenticación y Seguridad](#autenticación-y-seguridad)
8. [Estados de UI](#estados-de-ui)
9. [Sistema de Diseño](#sistema-de-diseño)

---

## Introducción

CineMatch es una aplicación web construida con **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS**, **shadcn/ui** y **Supabase** como backend. Este documento explica en detalle cómo funciona tanto el frontend/UI como la integración con Supabase/Backend.

---

## Arquitectura del Frontend

### Stack Tecnológico

- **Framework**: Next.js 16.0.10 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4 (con CSS variables)
- **Componentes UI**: shadcn/ui (basado en Radix UI)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: React Server Components (por defecto) + Client Components cuando es necesario
- **Fuentes**: Inter (body) + Fraunces (headings)

### Principios Arquitectónicos

1. **Server Components por defecto**: Todas las páginas y componentes son Server Components a menos que necesiten interactividad del cliente.
2. **Separación de responsabilidades**: 
   - `app/` solo contiene routing y composición
   - `features/` contiene toda la lógica de negocio y componentes específicos
   - `components/ui/` contiene componentes base reutilizables
   - `lib/` contiene utilidades técnicas e integraciones
3. **Feature-based organization**: Cada feature es autocontenida con sus propios componentes, hooks, tipos y utilidades.

---

## Estructura del Proyecto

### Estructura de Carpetas

```
src/
├── app/                    # Next.js App Router (solo routing)
│   ├── (auth)/            # Grupo de rutas de autenticación
│   ├── (marketing)/       # Grupo de rutas de marketing
│   ├── app/               # Área principal de la aplicación
│   │   ├── analysis/      # Página de análisis
│   │   ├── library/      # Página de biblioteca
│   │   ├── profile/      # Página de perfil
│   │   └── ...
│   ├── auth/              # Callback de autenticación
│   ├── layout.tsx         # Layout raíz
│   └── ...
│
├── components/
│   ├── ui/                # Componentes shadcn/ui base
│   ├── layout/            # Componentes de layout (Header, Nav, Shell)
│   ├── shared/            # Componentes compartidos entre features
│   └── animations/       # Componentes de animación
│
├── features/              # Features autocontenidas
│   ├── analysis/
│   │   ├── actions.ts     # Server Actions
│   │   ├── components/   # Componentes específicos del feature
│   │   ├── types/        # Tipos específicos del feature
│   │   └── index.ts      # Barrel exports
│   ├── auth/
│   ├── reviews/
│   └── ...
│
├── lib/
│   ├── supabase/         # Clientes de Supabase
│   │   ├── client.ts     # Cliente para browser
│   │   ├── server.ts     # Cliente para Server Components/Actions
│   │   └── middleware.ts # Middleware de autenticación
│   ├── providers/        # Context providers (Auth, Theme)
│   ├── utils/            # Utilidades puras
│   └── fetchers/         # Clientes HTTP (TMDb, etc.)
│
├── types/
│   ├── database.types.ts # Tipos generados de Supabase (SINGLE SOURCE OF TRUTH)
│   ├── domain/           # Tipos de dominio compartidos
│   └── ui/               # Tipos de UI compartidos
│
├── config/
│   ├── routes.ts         # Configuración de rutas
│   ├── nav.ts            # Configuración de navegación
│   └── constants.ts      # Constantes globales
│
└── styles/
    └── globals.css       # Estilos globales y design tokens
```

### Reglas de Organización

#### `src/app/**` - Solo Routing
- **NO** debe contener lógica de negocio
- Solo archivos de routing: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`
- Las páginas deben componer componentes de features, no implementar lógica directamente

**Ejemplo**:
```typescript
// ✅ CORRECTO: src/app/app/analysis/page.tsx
import { getWatchlistAnalysis } from "@/features/analysis/actions";
import { AnalysisStats } from "@/features/analysis/components/AnalysisStats";

export default async function AnalysisPage() {
  const result = await getWatchlistAnalysis();
  return <AnalysisStats data={result.data} />;
}

// ❌ INCORRECTO: Lógica de negocio en la página
export default async function AnalysisPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("watchlists").select("*");
  // ... lógica de negocio aquí
}
```

#### `src/features/<feature>/` - Feature Completa
Cada feature debe contener:
- `actions.ts`: Server Actions para operaciones de datos
- `components/`: Componentes UI específicos del feature
- `hooks/`: Hooks de React (si se necesitan)
- `types/`: Tipos específicos del feature
- `utils/`: Utilidades específicas del feature
- `index.ts`: Barrel exports (API pública del feature)

**Ejemplo de estructura**:
```
features/analysis/
├── actions.ts
├── components/
│   ├── AnalysisStats.tsx
│   ├── AnalysisTable.tsx
│   └── AnalysisStatsSkeleton.tsx
├── types/
│   └── index.ts
└── index.ts
```

#### `src/components/ui/` - Componentes Base
- Componentes de shadcn/ui generados
- **NO** debe contener lógica de features
- Son primitivos reutilizables (Button, Card, Dialog, etc.)

#### `src/components/layout/` - Layout Components
- Componentes de estructura: `AppShell`, `AppHeader`, `AppNav`, `MobileTabs`
- Son Server Components por defecto
- Componen la estructura visual de la aplicación

#### `src/lib/` - Utilidades Técnicas
- `supabase/`: Clientes de Supabase (client, server, middleware)
- `providers/`: Context providers (AuthProvider, ThemeProvider)
- `utils/`: Funciones puras (`cn`, formatters, etc.)
- `fetchers/`: Clientes HTTP externos (TMDb API, etc.)

---

## Integración con Supabase/Backend

### Clientes de Supabase

El proyecto utiliza **tres tipos de clientes de Supabase** según el contexto:

#### 1. Cliente para Browser (`src/lib/supabase/client.ts`)

**Uso**: Componentes cliente que necesitan autenticación o realtime.

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
```

**Características**:
- Permite autenticación en el cliente
- Soporta suscripciones realtime
- Se usa en Client Components y hooks

**Ejemplo de uso**:
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = createClient()
  // Usar supabase para operaciones del cliente
}
```

#### 2. Cliente para Server (`src/lib/supabase/server.ts`)

**Uso**: Server Components y Server Actions.

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignorar error en Server Components (solo lectura)
                    }
                },
            },
        }
    )
}
```

**Características**:
- Maneja cookies automáticamente para mantener la sesión
- Se usa en Server Components y Server Actions
- Acceso seguro a datos del usuario autenticado

**Ejemplo de uso**:
```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('movies').select('*')
  return <div>{/* render data */}</div>
}
```

#### 3. Middleware (`src/lib/supabase/middleware.ts`)

**Uso**: Protección de rutas y refresco de sesión.

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Validar usuario
    const { data: { user } } = await supabase.auth.getUser();

    // Proteger rutas: redirigir a login si no hay usuario
    if (
        !user &&
        !request.nextUrl.pathname.startsWith("/login") &&
        !request.nextUrl.pathname.startsWith("/auth") &&
        !request.nextUrl.pathname.startsWith("/confirm-email")
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Redirección raíz: si hay usuario y está en home, mandar a /app
    if (user && request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/app'
        return NextResponse.redirect(url)
    }

    return supabaseResponse;
}
```

**Características**:
- Refresca automáticamente la sesión en cada request
- Protege rutas que requieren autenticación
- Redirige usuarios no autenticados a `/login`
- Redirige usuarios autenticados desde `/` a `/app`

**Configuración en `src/middleware.ts`**:
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
```

### Esquema de Base de Datos

El proyecto utiliza las siguientes tablas definidas en `src/types/database.types.ts`:

#### Tablas Principales

1. **`movies`**
   - Campos: `id`, `imdb_id`, `title`, `year`, `director`, `synopsis`, `genres` (JSON), `poster_url`, `imdb_rating`, `extended_data` (JSON), `created_at`
   - Relaciones: Ninguna directa

2. **`profiles`**
   - Campos: `id` (FK a auth.users), `username`, `bio`, `avatar_url`, `location_text`, `location_coords`, `updated_at`
   - Relaciones: Uno a uno con `auth.users`

3. **`watchlists`**
   - Campos: `id`, `user_id` (FK a profiles), `movie_id` (FK a movies), `status`, `position`, `user_rating`, `updated_at`, `user_name`, `movie_title`
   - Relaciones: Muchos a uno con `profiles` y `movies`

4. **`reviews`**
   - Campos: `id`, `user_id` (FK a profiles), `movie_id` (FK a movies), `rating`, `comment`, `created_at`, `user_name`, `movie_name`
   - Relaciones: Muchos a uno con `profiles` y `movies`

5. **`qualities`**
   - Campos: `id`, `name`, `category_id` (FK a quality_categories)
   - Relaciones: Muchos a uno con `quality_categories`

6. **`quality_categories`**
   - Campos: `id`, `name`, `description`
   - Relaciones: Uno a muchos con `qualities`

7. **`user_movie_qualities`**
   - Campos: `id`, `user_id` (FK a profiles), `movie_id` (FK a movies), `quality_id` (FK a qualities), `created_at`
   - Relaciones: Muchos a uno con `profiles`, `movies`, y `qualities`

### Reglas de Seguridad (RLS - Row Level Security)

**IMPORTANTE**: Las políticas RLS deben estar configuradas en Supabase. El frontend asume que:

1. **`profiles`**: Los usuarios solo pueden leer/actualizar su propio perfil
2. **`watchlists`**: Los usuarios solo pueden leer/crear/actualizar/eliminar sus propios watchlists
3. **`reviews`**: Los usuarios pueden leer todas las reviews pero solo crear/actualizar/eliminar las propias
4. **`movies`**: Lectura pública, inserción/actualización restringida
5. **`user_movie_qualities`**: Los usuarios solo pueden gestionar sus propias cualidades

**Nota**: El frontend valida la autenticación antes de hacer queries, pero la seguridad real depende de las políticas RLS en Supabase.

---

## Patrones y Métodos

### Server Actions

Los **Server Actions** son funciones asíncronas marcadas con `"use server"` que se ejecutan en el servidor. Se usan para todas las operaciones de datos.

#### Estructura de un Server Action

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database.types";

export async function myAction(
  param1: string,
  param2: number
): Promise<{ data: SomeType[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // 1. Verificar autenticación
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        data: null,
        error: "Usuario no autenticado",
      };
    }

    // 2. Operación de datos
    const { data, error } = await supabase
      .from("table_name")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error:", error);
      return {
        data: null,
        error: "Error al obtener datos",
      };
    }

    // 3. Retornar resultado
    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      data: null,
      error: "Error inesperado",
    };
  }
}
```

#### Patrón de Retorno

Todas las Server Actions retornan un objeto con esta estructura:
```typescript
{
  data: T | null;
  error: string | null;
}
```

#### Ejemplos Reales

**1. Obtener datos con JOIN** (`src/features/analysis/actions.ts`):
```typescript
export async function getWatchlistAnalysis(): Promise<{
  data: WatchlistAnalysisItem[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "Usuario no autenticado" };
    }

    // Consultar watchlists
    const { data: watchlists, error: watchlistsError } = await supabase
      .from("watchlists")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (watchlistsError) {
      return { data: null, error: "Error al obtener el watchlist" };
    }

    // Obtener movies relacionadas
    const movieIds = [...new Set(watchlists.map((w) => w.movie_id))];
    const { data: movies } = await supabase
      .from("movies")
      .select("*")
      .in("id", movieIds);

    // Combinar datos
    const moviesMap = new Map(movies?.map((m) => [m.id, m]) || []);
    const analysisData = watchlists
      .map((watchlist) => {
        const movie = moviesMap.get(watchlist.movie_id);
        return movie ? { watchlist, movie } : null;
      })
      .filter((item): item is WatchlistAnalysisItem => item !== null);

    return { data: analysisData, error: null };
  } catch (error) {
    return { data: null, error: "Error inesperado" };
  }
}
```

**2. Actualizar datos** (`src/features/reviews/actions.ts`):
```typescript
export async function updateMovieRating(
  watchlistId: string,
  rating: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (rating < 1 || rating > 10) {
      return { success: false, error: "La calificación debe estar entre 1 y 10" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const updateData: TablesUpdate<"watchlists"> = {
      user_rating: rating,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("watchlists")
      .update(updateData)
      .eq("id", watchlistId)
      .eq("user_id", user.id); // Seguridad: solo actualizar propios registros

    if (error) {
      return { success: false, error: "Error al guardar la calificación" };
    }

    // Revalidar páginas relacionadas
    revalidatePath("/app/rate-movies");
    revalidatePath("/app/analysis");

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error inesperado" };
  }
}
```

**3. Autenticación** (`src/features/auth/actions.ts`):
```typescript
export async function login(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await (await supabase).auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Credenciales inválidas' }
    }

    revalidatePath('/', 'layout')
    redirect('/app')
}
```

### Revalidación de Caché

Next.js cachea las páginas por defecto. Para invalidar el caché después de mutaciones, usar `revalidatePath`:

```typescript
import { revalidatePath } from 'next/cache'

// Revalidar una ruta específica
revalidatePath('/app/analysis')

// Revalidar todas las rutas bajo un path
revalidatePath('/app', 'layout')
```

### Componentes Server vs Client

#### Server Components (Por Defecto)

- Se ejecutan en el servidor
- Pueden hacer llamadas directas a la base de datos
- No pueden usar hooks de React (`useState`, `useEffect`, etc.)
- No pueden usar eventos del navegador
- Se usan para renderizar datos estáticos o dinámicos del servidor

**Ejemplo**:
```typescript
// ✅ Server Component
import { getWatchlistAnalysis } from "@/features/analysis/actions";

export default async function AnalysisPage() {
  const result = await getWatchlistAnalysis();
  return <div>{/* render result.data */}</div>;
}
```

#### Client Components

- Se ejecutan en el navegador
- Pueden usar hooks de React
- Pueden manejar eventos y estado local
- Deben marcarse con `"use client"` al inicio del archivo
- Se usan para interactividad del usuario

**Ejemplo**:
```typescript
// ✅ Client Component
"use client";

import { useState } from "react";

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Patrón de Composición

Las páginas deben componer componentes de features, no implementar lógica directamente:

```typescript
// ✅ CORRECTO
import { getWatchlistAnalysis } from "@/features/analysis/actions";
import { AnalysisStats } from "@/features/analysis/components/AnalysisStats";
import { AnalysisTable } from "@/features/analysis/components/AnalysisTable";

export default async function AnalysisPage() {
  const result = await getWatchlistAnalysis();
  
  if (result.error) {
    return <ErrorState error={result.error} />;
  }
  
  return (
    <div>
      <AnalysisStats data={result.data} />
      <AnalysisTable data={result.data} />
    </div>
  );
}
```

---

## Sistema de Tipos

### Tipos de Base de Datos

**`src/types/database.types.ts` es la ÚNICA FUENTE DE VERDAD** para todos los tipos relacionados con la base de datos.

#### Helpers de Tipos Disponibles

1. **`Tables<'table_name'>`**: Tipo para leer datos de una tabla
   ```typescript
   import type { Tables } from "@/types/database.types";
   
   type Movie = Tables<'movies'>;
   type Profile = Tables<'profiles'>;
   ```

2. **`TablesInsert<'table_name'>`**: Tipo para insertar datos
   ```typescript
   import type { TablesInsert } from "@/types/database.types";
   
   const newMovie: TablesInsert<'movies'> = {
     imdb_id: "tt1234567",
     title: "Example Movie",
     // ... otros campos
   };
   ```

3. **`TablesUpdate<'table_name'>`**: Tipo para actualizar datos
   ```typescript
   import type { TablesUpdate } from "@/types/database.types";
   
   const updateData: TablesUpdate<'watchlists'> = {
     user_rating: 8,
     updated_at: new Date().toISOString(),
   };
   ```

4. **`Enums<'enum_name'>`**: Tipo para enums de la base de datos
   ```typescript
   import type { Enums } from "@/types/database.types";
   ```

#### Reglas de Uso

- **NUNCA** crear tipos personalizados que dupliquen los tipos de la base de datos
- **SIEMPRE** usar los tipos de `database.types.ts` directamente
- **NUNCA** usar `any` o `unknown` cuando existe el tipo correcto
- **SIEMPRE** respetar los nombres de campos, tipos y nullability definidos

**Ejemplo Correcto**:
```typescript
import type { Tables, TablesInsert } from "@/types/database.types";

// ✅ Usar tipos directamente
const movie: Tables<'movies'> = await getMovie();
const newWatchlist: TablesInsert<'watchlists'> = {
  user_id: user.id,
  movie_id: movie.id,
  status: 'watched',
};
```

**Ejemplo Incorrecto**:
```typescript
// ❌ NO crear tipos personalizados
interface MyMovie {
  id: string;
  title: string;
  // ...
}

// ❌ NO usar any
const movie: any = await getMovie();
```

### Tipos de Features

Cada feature puede definir sus propios tipos en `features/<feature>/types/`, pero estos deben:
- Extender o componer tipos de `database.types.ts` cuando sea necesario
- Ser específicos del feature y no duplicar tipos de dominio
- Exportarse desde `index.ts` del feature

**Ejemplo**:
```typescript
// features/analysis/types/index.ts
import type { Tables } from "@/types/database.types";

export interface WatchlistAnalysisItem {
  watchlist: Tables<'watchlists'>;
  movie: Tables<'movies'>;
}
```

---

## Autenticación y Seguridad

### Flujo de Autenticación

1. **Registro** (`/login`):
   - Usuario completa formulario
   - Se llama a `signup()` Server Action
   - Supabase envía email de confirmación (si está configurado)
   - Usuario es redirigido a `/confirm-email` o `/app`

2. **Login** (`/login`):
   - Usuario completa formulario
   - Se llama a `login()` Server Action
   - Supabase valida credenciales
   - Si es exitoso, se redirige a `/app`

3. **Callback de Email** (`/auth/callback`):
   - Supabase redirige después de confirmar email o reset password
   - Se intercambia el código por una sesión
   - Usuario es redirigido a `/app` o a la ruta especificada en `next`

4. **Middleware**:
   - En cada request, el middleware verifica la sesión
   - Si no hay usuario y está en ruta protegida → redirige a `/login`
   - Si hay usuario y está en `/` → redirige a `/app`
   - Refresca automáticamente el token si es necesario

### AuthProvider (Cliente)

El `AuthProvider` (`src/lib/providers/auth-provider.tsx`) proporciona el estado de autenticación a los componentes cliente:

```typescript
'use client';

import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createBrowserClient();

    useEffect(() => {
        // 1. Obtener sesión inicial
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        };

        getInitialSession();

        // 2. Escuchar cambios en la autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase]);

    return (
        <AuthContext.Provider value={{ user, session, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
```

**Uso en componentes cliente**:
```typescript
'use client';
import { useAuth } from '@/lib/providers/auth-provider';

export function MyComponent() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Welcome, {user.email}</div>;
}
```

### Validación de Usuario en Server Actions

Todas las Server Actions que requieren autenticación deben validar el usuario:

```typescript
export async function myAction() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "Usuario no autenticado" };
  }

  // Continuar con la lógica...
}
```

### Seguridad en Queries

Siempre filtrar por `user_id` en queries que devuelven datos del usuario:

```typescript
const { data } = await supabase
  .from("watchlists")
  .select("*")
  .eq("user_id", user.id); // ✅ Siempre filtrar por user_id
```

---

## Estados de UI

Todas las pantallas que muestran datos deben implementar tres estados:

### 1. Loading State

Usar componentes Skeleton para mantener el layout estable:

```typescript
import { AnalysisStatsSkeleton } from "@/features/analysis/components/AnalysisStatsSkeleton";

export default function AnalysisPage() {
  return (
    <div>
      <AnalysisStatsSkeleton />
    </div>
  );
}
```

**Archivo**: `src/app/app/analysis/loading.tsx`

### 2. Empty State

Mostrar mensaje educativo y CTA cuando no hay datos:

```typescript
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

if (isEmpty) {
  return (
    <EmptyState
      icon={<Upload className="h-12 w-12 text-muted-foreground" />}
      title="No hay datos para analizar"
      description="Sube tu archivo CSV para generar un análisis detallado."
      action={
        <Button asChild>
          <Link href={APP_ROUTES.UPLOAD}>Subir CSV</Link>
        </Button>
      }
    />
  );
}
```

### 3. Error State

Mostrar mensaje de error y opción de reintentar:

```typescript
import { ErrorState } from "@/components/ui/error-state";

if (error) {
  return (
    <ErrorState
      title="Error al cargar el análisis"
      description={error}
      action={
        <Button asChild>
          <Link href={APP_ROUTES.ANALYSIS}>Reintentar</Link>
        </Button>
      }
    />
  );
}
```

### Patrón Completo

```typescript
export default async function AnalysisPage() {
  const result = await getWatchlistAnalysis();
  
  // Error state
  if (result.error) {
    return <ErrorState error={result.error} />;
  }
  
  // Empty state
  if (!result.data || result.data.length === 0) {
    return <EmptyState />;
  }
  
  // Success state
  return <AnalysisTable data={result.data} />;
}
```

---

## Sistema de Diseño

### Design Tokens

Todos los tokens de diseño están definidos en `src/styles/globals.css` usando CSS variables.

#### Colores

**Light Mode**:
- `--background`: `0 0% 100%` (blanco)
- `--foreground`: `222 47% 11%` (texto principal)
- `--primary`: `142 76% 36%` (verde accent)
- `--muted`: `210 40% 98%` (gris claro)
- `--border`: `214 32% 91%` (borde)

**Dark Mode**:
- `--background`: `223 49% 8%` (fondo oscuro)
- `--foreground`: `210 40% 96%` (texto claro)
- `--primary`: `142 71% 45%` (verde accent)
- `--muted`: `217 33% 17%` (gris oscuro)
- `--border`: `215 25% 27%` (borde)

#### Tipografía

- **Heading Font**: Fraunces (serif)
- **Body Font**: Inter (sans-serif)
- Escalas definidas en `designSystem.md`

#### Espaciado

Base unit: 4px
- Valores disponibles: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

#### Radius

- Valores: 0, 4, 8, 12, 16, 9999

### Reglas de Estilos

1. **NUNCA** hardcodear colores (hex, rgb) en componentes
2. **SIEMPRE** usar variables CSS o clases de Tailwind que referencien los tokens
3. **NUNCA** modificar `globals.css` sin aprobación
4. **SIEMPRE** consultar `designSystem.md` antes de crear nuevos patrones

**Ejemplo Correcto**:
```typescript
<div className="bg-background text-foreground border-border">
  {/* ✅ Usa tokens del sistema */}
</div>
```

**Ejemplo Incorrecto**:
```typescript
<div style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>
  {/* ❌ Hardcodea colores */}
</div>
```

### Utilidad `cn()`

Para combinar clases condicionalmente, usar `cn()` de `src/lib/utils/cn.ts`:

```typescript
import { cn } from "@/lib/utils/cn";

export function Button({ variant, className }: ButtonProps) {
  return (
    <button
      className={cn(
        "base-button-styles",
        variant === "primary" && "bg-primary text-primary-foreground",
        className
      )}
    />
  );
}
```

---

## Convenciones de Código

### Nombres de Archivos

- **Componentes**: `PascalCase.tsx` (ej: `AnalysisStats.tsx`)
- **Hooks**: `use-thing.ts` exportando `useThing` (ej: `use-auth.ts` → `useAuth`)
- **Types**: `*.ts` con tipos exportados (ej: `index.ts`)
- **Utils**: Funciones puras en `*.ts` (ej: `cn.ts`)

### Imports

- **SIEMPRE** usar path aliases `@/...`
- **NUNCA** usar imports relativos profundos (`../../..`)
- **PREFERIR** imports desde barrel exports de features (`@/features/<feature>`)

**Ejemplo Correcto**:
```typescript
import { AnalysisStats } from "@/features/analysis";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
```

**Ejemplo Incorrecto**:
```typescript
import { AnalysisStats } from "../../../features/analysis/components/AnalysisStats";
```

### Exports

Cada feature debe exportar su API pública desde `index.ts`:

```typescript
// features/analysis/index.ts
export { AnalysisStats } from "./components/AnalysisStats";
export { AnalysisTable } from "./components/AnalysisTable";
export { getWatchlistAnalysis } from "./actions";
export type { WatchlistAnalysisItem } from "./types";
```

### Componentes

- **Preferir** componentes pequeños y enfocados
- **Evitar** "god components" (>200 líneas)
- **Separar** lógica de presentación

---

## Flujo de Datos

### Flujo Típico

1. **Usuario navega a una página** (`/app/analysis`)
2. **Página (Server Component)** llama a Server Action:
   ```typescript
   const result = await getWatchlistAnalysis();
   ```
3. **Server Action**:
   - Crea cliente de Supabase
   - Valida usuario autenticado
   - Hace query a la base de datos
   - Retorna `{ data, error }`
4. **Página** maneja estados:
   - Si `error` → muestra `ErrorState`
   - Si `data` vacío → muestra `EmptyState`
   - Si `data` existe → renderiza componentes con datos
5. **Componentes** reciben datos como props y los renderizan

### Interactividad del Usuario

Cuando el usuario interactúa (click, submit, etc.):

1. **Client Component** maneja el evento
2. Llama a Server Action (puede ser desde formulario o función)
3. Server Action procesa y retorna resultado
4. Componente actualiza UI según resultado
5. Se revalida el caché si es necesario (`revalidatePath`)

---

## Configuración

### Variables de Entorno

El proyecto requiere las siguientes variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # o tu dominio en producción
```

### Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app": ["./src/app"],
      "@/components": ["./src/components"],
      "@/features": ["./src/features"],
      "@/lib": ["./src/lib"],
      "@/config": ["./src/config"],
      "@/types": ["./src/types"],
      "@/styles": ["./src/styles"]
    }
  }
}
```

---

## Resumen de Métodos y Patrones Clave

### Métodos de Supabase Más Usados

1. **`supabase.auth.getUser()`**: Obtener usuario actual
2. **`supabase.auth.signInWithPassword()`**: Login
3. **`supabase.auth.signUp()`**: Registro
4. **`supabase.auth.signOut()`**: Logout
5. **`supabase.from('table').select('*')`**: Seleccionar datos
6. **`supabase.from('table').insert(data)`**: Insertar datos
7. **`supabase.from('table').update(data).eq('id', id)`**: Actualizar datos
8. **`supabase.from('table').delete().eq('id', id)`**: Eliminar datos

### Patrones de Código

1. **Server Actions**: `"use server"` + async function + return `{ data, error }`
2. **Server Components**: async function + await Server Action + render
3. **Client Components**: `"use client"` + hooks + eventos
4. **Estados de UI**: Loading (Skeleton) → Empty → Error → Success
5. **Tipos**: Siempre usar `Tables`, `TablesInsert`, `TablesUpdate` de `database.types.ts`

---

## Notas Finales

- Este documento debe mantenerse actualizado cuando cambie la arquitectura
- Consultar `designSystem.md` para decisiones de diseño
- Consultar `.cursorrules` para reglas de desarrollo
- Las políticas RLS deben estar configuradas en Supabase (no en el código frontend)
- El frontend valida autenticación, pero la seguridad real depende de RLS

---

**Última actualización**: Diciembre 2024

