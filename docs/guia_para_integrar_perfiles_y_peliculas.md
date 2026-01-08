# Guía de Integración Frontend - Perfil de Miembro del Equipo

Esta guía explica cómo integrar la nueva función unificada `getPersonProfile` para mostrar perfiles completos de directores, actores, guionistas, etc.

## 1. Server Action Unificado

Hemos centralizado toda la lógica en una función maestra:

*   **Función**: `getPersonProfile(name: string)`
*   **Importación**: `import { getPersonProfile } from '@/features/person/actions';`

Esta función busca a la persona, obtiene su biografía completa y **todos** sus créditos (actuación, dirección, guión, etc.), además de persistir las películas más relevantes en nuestra base de datos local.

### Estructura de Respuesta
```typescript
{
  id: number;
  name: string;
  biography: string;
  birthday: string;
  photo_url: string;
  known_for_department: string;
  credits: {
    cast: Movie[];      // Actuación
    crew: {
      directing: Movie[]; // Dirección
      writing: Movie[];   // Guión
      camera: Movie[];    // Fotografía
      music: Movie[];     // Música
      // ... otros
    }
  };
}
```

## 2. Estrategia de Implementación (Página de Perfil)

Recomendamos una ruta dinámica única: `/person/[name]`.

**Archivo**: `src/app/person/[name]/page.tsx`

```tsx
import { getPersonProfile } from '@/features/person/actions';
import { notFound } from 'next/navigation';

export default async function PersonPage({ params }: { params: { name: string } }) {
  const decodedName = decodeURIComponent(params.name);
  const profile = await getPersonProfile(decodedName);

  if ('error' in profile) {
    return <div>Persona no encontrada</div>;
  }

  return (
    <div className="container mx-auto py-8">
      {/* Cabecera del Perfil */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <img 
          src={profile.photo_url || '/placeholder.jpg'} 
          alt={profile.name} 
          className="w-48 h-72 object-cover rounded-lg shadow-lg" 
        />
        <div>
          <h1 className="text-4xl font-bold mb-4">{profile.name}</h1>
          {profile.birthday && <p className="text-gray-400 mb-4">Nacimiento: {profile.birthday}</p>}
          <p className="max-w-3xl leading-relaxed text-gray-300">
            {profile.biography || 'Sin biografía disponible.'}
          </p>
        </div>
      </div>

      {/* Secciones de Créditos */}
      {/* NOTA IMPORTANTE: La API devuelve TODA la filmografía. 
          Las películas populares ya están en DB (tienen db_id).
          Las "raras" se importarán automáticamente si el usuario hace click (On-Demand Seeding).
          El enlace funciona igual para ambas: `/movie/${movie.id}` 
      */}
      
      <CreditsSection title="Dirección" movies={profile.credits.crew.directing} />
      <CreditsSection title="Actuación" movies={profile.credits.cast} />
      <CreditsSection title="Guión" movies={profile.credits.crew.writing} />
      <CreditsSection title="Fotografía" movies={profile.credits.crew.camera} />
      <CreditsSection title="Música" movies={profile.credits.crew.music} />
    </div>
  );
}

function CreditsSection({ title, movies }: { title: string, movies: any[] }) {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="group relative">
            <Link href={`/movie/${movie.id}`}> 
              <div className="aspect-[2/3] overflow-hidden rounded-md bg-gray-800 cursor-pointer">
                 <img 
                   src={movie.poster_path || '/poster-placeholder.png'} 
                   alt={movie.title}
                   className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                   loading="lazy"
                 />
              </div>
              <h3 className="mt-2 text-sm font-medium truncate group-hover:text-primary transition-colors">{movie.title}</h3>
              <p className="text-xs text-gray-500">{movie.release_year}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 3. Integración de Enlaces

Actualiza tu componente `PersonLink` para apuntar a la nueva ruta:

```tsx
// src/components/PersonLink.tsx
import Link from 'next/link';

export function PersonLink({ name, className }: { name: string, className?: string }) {
  return (
    <Link 
      href={`/person/${encodeURIComponent(name)}`}
      className={`hover:underline hover:text-primary transition-colors ${className}`}
    >
      {name}
    </Link>
  );
}
```

## 4. Integración de Detalles de Película (Server Action)

Para mostrar el detalle de cada película, utilizamos la acción `getMovie`.

*   **Función**: `getMovie(id: string)`
*   **Importación**: `import { getMovie } from '@/features/movie/actions';`
*   **Archivo**: `src/features/movie/actions.ts`

### Característica Clave: "Just-In-Time" Seeding

Esta función es especial porque acepta dos tipos de ID:
1.  **UUID de Supabase** (ej. `a0eebc99-9c0b...`): Si la película ya existe en nuestra base de datos.
2.  **ID de TMDB** (ej. `550`): Si el usuario viene desde un perfil y la película no está guardada.

**Si pasas un ID de TMDB (numérico), la función automáticamente inyecta la película en la base de datos antes de devolver la respuesta.** Esto hace que la navegación sea fluida siempre.

### Estructura de Respuesta (MovieDetail)

El objeto `extended_data` es vital para mostrar fichas técnicas ricas.

```typescript
{
  id: string;          // UUID final (siempre devuelto, incluso si pediste por TMDB ID)
  imdb_id: string;
  title: string;
  year: number;
  poster_url: string;
  director: string;
  genres: string[];
  synopsis: string;
  rating?: number;     // Tu calificación (si estás logueado)
  watchlist?: {        // Tu estado de watchlist (si estás logueado)
      status: string;
      added_at: string;
  };
  extended_data: {
    technical: {
      runtime: number;      // Duración en minutos
      certification: string; // Clasificación (PG-13, R, etc)
      tagline: string;
      trailer_key: string;  // Key de Youtube
    };
    cast: { name: string, role: string, photo: string }[];
    crew_details: { name: string, job: string, photo: string }[];
  }
}
```

### Ejemplo de Página (`src/app/movie/[id]/page.tsx`)

```tsx
import { getMovie } from '@/features/movie/actions';
import { notFound } from 'next/navigation';

export default async function MoviePage({ params }: { params: { id: string } }) {
  const movie = await getMovie(params.id);

  if (!movie) return notFound();

  return (
    <div className="container mx-auto py-8">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-8">
        <img 
          src={movie.poster_url || '/placeholder.png'} 
          className="w-72 rounded-lg shadow-2xl" 
        />
        <div>
          <h1 className="text-4xl font-bold">{movie.title} <span className="text-gray-400">({movie.year})</span></h1>
          <p className="italic text-gray-400 text-lg mt-1">{movie.extended_data.technical?.tagline}</p>
          
          <div className="flex gap-2 mt-4">
             {movie.genres.map(g => (
               <span key={g} className="px-3 py-1 bg-gray-800 rounded-full text-sm">{g}</span>
             ))}
             <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">{movie.extended_data.technical?.runtime} min</span>
          </div>

          <p className="mt-6 text-lg leading-relaxed">{movie.synopsis}</p>

          {/* Director & Crew */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
               <h3 className="font-bold text-gray-400">Director</h3>
               <p>{movie.director}</p>
            </div>
            {/* Puedes agregar más crew aquí desde movie.extended_data.crew_details */}
          </div>
        </div>
      </div>

      {/* Reparto */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Reparto Principal</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movie.extended_data.cast?.map((actor) => (
             <div key={actor.name} className="bg-gray-900 rounded-lg p-3">
                <img src={actor.photo || '/avatar.png'} className="w-full h-40 object-cover rounded mb-2"/>
                <p className="font-bold truncate">{actor.name}</p>
                <p className="text-sm text-gray-400 truncate">{actor.role}</p>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```
