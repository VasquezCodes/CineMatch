# GEMINI.md - CineMatch Project Overview

## 1. Project Description

CineMatch is a social movie platform that provides personalized and explainable recommendations. It's built for film lovers who want to discover movies based on their personal tastes and understand *why* a movie is recommended to them.

**Key Features:**
- Personalized and explainable movie recommendations.
- User-specific viewing insights and statistics.
- Smart Watchlist to organize and prioritize movies.
- Rich movie data from The Movie Database (TMDB).
- History import from other platforms.
- Light and Dark mode support.
- Mobile-first responsive design.

## 2. Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 19
- **Backend-as-a-Service (BaaS):** Supabase (PostgreSQL, Auth, Storage)
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui built on Radix UI
- **Animations:** Framer Motion, GSAP
- **Data Fetching:** React Query, React Server Components
- **Forms & Validation:** Zod
- **External APIs:** TMDB for movie data.

## 3. Architecture & Project Structure

The project follows a feature-based architecture, promoting separation of concerns and modularity.

```
src/
├── app/              # Next.js App Router: Handles routing and page composition.
│   ├── (auth)/       # Authentication-related routes (e.g., login, signup).
│   ├── (marketing)/  # Marketing pages (e.g., landing page).
│   └── app/          # Core application routes, protected by authentication.
│
├── components/       # Shared UI components.
│   ├── ui/           # Base components from shadcn/ui (Button, Card, etc.).
│   ├── layout/       # Structural components (AppShell, Header, Footer).
│   └── shared/       # Components shared across multiple features.
│
├── features/         # Self-contained business logic modules.
│   │                 # Each feature has its own `actions.ts`, `components/`, etc.
│   ├── auth/         # User authentication logic.
│   ├── library/      # User's movie library.
│   ├── analysis/     # User data analysis and insights.
│   └── ...           # Other features like 'profile', 'recommendations', etc.
│
├── lib/              # Core libraries, utilities, and integrations.
│   ├── supabase/     # Supabase client configurations (browser, server, middleware).
│   ├── providers/    # Global context providers (Theme, Auth).
│   ├── tmdb/         # TMDB API client and utilities.
│   └── utils/        # General utility functions.
│
├── types/            # TypeScript type definitions.
│   └── database.types.ts # Auto-generated types from Supabase schema (Single Source of Truth).
│
├── config/           # Application-wide configuration (routes, navigation).
└── styles/           # Global styles and Tailwind CSS setup.
```

**Architectural Principles:**
- **Server Components by Default:** Maximizes performance by rendering on the server.
- **Feature-Driven Structure:** Code for a specific feature is co-located. `src/features` is the heart of the business logic.
- **Strict Separation of Concerns:** `src/app` is for routing only. Logic resides in `src/features`.
- **Server Actions for Mutations:** Data mutations are handled via Server Actions, ensuring secure and server-managed operations.
- **Supabase Integration:** Uses dedicated clients for server, browser, and middleware contexts to handle data fetching and authentication securely.
- **Type Safety:** Relies on auto-generated types from the Supabase schema (`database.types.ts`) as the single source of truth for data shapes.

## 4. Key Files

- **`ARQUITECTURA.md`**: The primary source for in-depth architectural decisions, Supabase integration patterns, and data flow.
- **`designSystem.md`**: The guide for UI/UX principles, design tokens (colors, spacing, typography), and component patterns.
- **`package.json`**: Defines project dependencies and scripts.
- **`next.config.mjs`**: Next.js configuration, including image loading from Cloudinary and TMDB.
- **`tsconfig.json`**: TypeScript configuration, including path aliases for cleaner imports.
- **`src/middleware.ts`**: Handles session management and route protection using Supabase middleware.
- **`src/types/database.types.ts`**: **Crucial file.** Contains all TypeScript types generated from the database schema.

## 5. Getting Started & Scripts

**Setup:**
1. Clone the repo.
2. Create a `.env.local` file with Supabase and TMDB API keys.
3. Run `pnpm install`.

**Available Scripts (`package.json`):**
- `pnpm dev`: Starts the development server.
- `pnpm build`: Creates a production build.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Runs the ESLint code linter.

## 6. Design System & UI

The project uses a design system based on **shadcn/ui** and **Tailwind CSS**.

- **Tokens:** All design tokens (colors, fonts, spacing) are defined as CSS variables in `src/styles/globals.css` and documented in `designSystem.md`.
- **Component Library:** `shadcn/ui` provides the base for UI components, which are customized for the project.
- **Responsiveness:** The design is mobile-first.
- **States:** All data-displaying components must handle loading, empty, and error states gracefully, using Skeletons, EmptyState, and ErrorState components respectively.

## 7. Authentication Flow

- Authentication is managed by **Supabase Auth**.
- The `src/middleware.ts` file intercepts requests to refresh user sessions and protect routes.
- **Three Supabase clients** are used:
    1.  **Server Client (`/lib/supabase/server.ts`):** For use in Server Components and Server Actions.
    2.  **Browser Client (`/lib/supabase/client.ts`):** For use in Client Components.
    3.  **Middleware Client (`/lib/supabase/middleware.ts`):** For session management in the middleware.
- All Server Actions that modify data must perform a server-side check for an authenticated user.
