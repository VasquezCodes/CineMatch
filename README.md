# 🎬 CineMatch

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)

**Una plataforma social de películas con recomendaciones personalizadas y explicables**

🚧 **Proyecto en Desarrollo Activo** 🚧

</div>

---

## 📖 Descripción

**CineMatch** es una aplicación web diseñada para los amantes del cine que buscan descubrir películas basadas en sus gustos personales. A diferencia de otras plataformas, CineMatch ofrece **recomendaciones explicables**, permitiendo a los usuarios entender *por qué* se les sugiere cada película.

### Características Principales

- 🎯 **Recomendaciones Personalizadas**: Sistema inteligente basado en el perfil cinéfilo del usuario
- 📊 **Insights de Visualización**: Estadísticas y análisis de tus hábitos de consumo
- 📋 **Watchlist Inteligente**: Organiza las películas que quieres ver con prioridades
- 🔍 **Integración con TMDB**: Datos enriquecidos de películas (sinopsis, reparto, trailers, etc.)
- 📥 **Importación de Historial**: Importa tu historial desde otras plataformas
- 🌙 **Modo Oscuro/Claro**: Interfaz adaptada a tus preferencias visuales
- 📱 **Mobile-First Design**: Experiencia optimizada para todos los dispositivos

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Frontend** | React 19 |
| **Lenguaje** | TypeScript 5 |
| **Base de Datos** | Supabase (PostgreSQL) |
| **Autenticación** | Supabase Auth |
| **Estilos** | Tailwind CSS 4 |
| **Componentes UI** | shadcn/ui + Radix UI |
| **Animaciones** | Framer Motion |
| **API de Películas** | TMDB (The Movie Database) |

---

## 📁 Estructura del Proyecto

```
cinematch/
├── src/
│   ├── app/                    # Rutas y páginas (App Router)
│   │   ├── (auth)/             # Páginas de autenticación
│   │   ├── (marketing)/        # Landing pages
│   │   └── app/                # App principal (protegida)
│   ├── components/             # Componentes reutilizables
│   ├── features/               # Módulos por funcionalidad
│   │   ├── auth/               # Autenticación
│   │   ├── home/               # Dashboard principal
│   │   ├── import/             # Importación de datos
│   │   ├── insights/           # Estadísticas del usuario
│   │   ├── movie/              # Detalles de películas
│   │   ├── qualification/      # Sistema de calificación
│   │   ├── recommendations/    # Motor de recomendaciones
│   │   └── watchlist/          # Gestión de watchlist
│   ├── lib/                    # Utilidades y configuraciones
│   ├── config/                 # Configuraciones de la app
│   ├── styles/                 # Estilos globales
│   └── types/                  # Tipos TypeScript
├── designSystem.md             # Guía de diseño UX/UI
└── package.json
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta en [Supabase](https://supabase.com)
- API Key de [TMDB](https://www.themoviedb.org/documentation/api)

### Pasos de Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/VasquezCodes/CineMatch.git
   cd CineMatch
   ```

2. **Instala las dependencias**
   ```bash
   pnpm install
   # o
   npm install
   ```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   
   # TMDB
   TMDB_READ_TOKEN=tu_tmdb_read_token
   TMDB_API_KEY=tu_tmdb_api_key
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   pnpm dev
   # o
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia servidor de desarrollo |
| `pnpm build` | Genera build de producción |
| `pnpm start` | Inicia servidor de producción |
| `pnpm lint` | Ejecuta ESLint |

---

## 🎨 Sistema de Diseño

El proyecto sigue un sistema de diseño coherente documentado en [`designSystem.md`](./designSystem.md) con los siguientes principios:

- **Clarity First**: Cada pantalla es clara en su propósito
- **Explainability**: Las recomendaciones incluyen justificación visible
- **Mobile-First**: Diseño optimizado primero para móviles
- **Visual Consistency**: Tipografías, colores y espaciados uniformes

---

## 🚧 Estado del Desarrollo

Este proyecto se encuentra en **desarrollo activo**. Algunas características pueden estar incompletas o sujetas a cambios.

### Roadmap

- [x] Sistema de autenticación
- [x] Integración con TMDB
- [x] Importación de historial
- [ ] Motor de recomendaciones completo
- [ ] Sistema de calificación por cualidades
- [ ] Funcionalidades sociales/comunidad
- [ ] App móvil nativa

---

##  Autores

Desarrollado por:

| | Nombre | GitHub |
|---|--------|--------|
| 👤 | **VasquezCodes** | [@VasquezCodes](https://github.com/VasquezCodes) |
| 👤 | **Gael** | [@Galleee2002](https://github.com/Galleee2002) |

---