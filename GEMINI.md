# GEMINI.md - CineMatch Project Overview

## 1. Project Description

CineMatch is a social movie platform that provides personalized and explainable recommendations. It's built for film lovers who want to discover movies based on their personal tastes, track their history, and understand *why* certain films are recommended to them.

**Key Features:**
- **Personalized Recommendations:** Explainable movie suggestions based on user taste.
- **Insights & Analysis:** Detailed statistics and visualizations of viewing habits.
- **Smart Watchlist & Library:** Organize and prioritize movies with custom statuses.
- **Rich Movie Data:** Integration with TMDB for comprehensive film information.
- **History Import:** Support for importing movie history from external platforms (CSV).
- **Social & Community:** User profiles, reviews, and community features.
- **Movie Games:** Interactive experiences related to films.
- **Mobile-First Design:** Fully responsive UI with light/dark mode support.

## 2. Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5.9.3
- **UI Library:** React 19.2.4
- **Backend-as-a-Service (BaaS):** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Styling:** Tailwind CSS 4.1.18
- **UI Components:** shadcn/ui (Radix UI)
- **Animations:** Framer Motion 12, GSAP 3
- **Data Fetching & State:** React Query (TanStack Query), React Server Components
- **Forms & Validation:** Zod
- **External APIs:** The Movie Database (TMDB)
- **Utilities:** Papaparse (CSV parsing), Recharts (data visualization), Sonner (toasts).

## 3. Architecture & Project Structure

The project follows a **Feature-Based Architecture**, promoting modularity and strict separation of concerns.

```
src/
├── app/              # Next.js App Router: Routing and page composition ONLY.
│   ├── (auth)/       # Auth routes (login, signup, confirm-email).
│   ├── (marketing)/  # Marketing pages (landing page).
│   ├── app/          # Core protected application routes (analysis, library, etc.).
│   ├── api/          # Route handlers / API endpoints.
│   └── auth/         # Auth callbacks.
│
├── components/       # Shared UI components.
│   ├── ui/           # Primitives (shadcn/ui: Button, Card, etc.).
│   ├── layout/       # Structural (AppShell, Header, Nav, MobileTabs).
│   ├── shared/       # Cross-feature components (PersonLink, RankingCard).
│   └── animations/   # Reusable animation components.
│
├── features/         # Self-contained business logic modules.
│   │                 # (actions.ts, components/, types/, index.ts).
│   ├── analysis/     # Statistics and data visualization.
│   ├── auth/         # User authentication and session management.
│   ├── collection/   # User collections/lists management.
│   ├── import/       # History import logic (CSV).
│   ├── library/      # Main user movie library.
│   ├── movie/        # Movie details and search logic.
│   ├── person/       # Cast and crew information.
│   ├── profile/      # User profile management.
│   ├── rankings/     # Movie rankings and leaderboards.
│   ├── reviews/      # User ratings and reviews.
│   └── watchlist/    # Watchlist management.
│
├── lib/              # Core libraries and integrations.
│   ├── supabase/     # Clients: browser.ts, server.ts, middleware.ts.
│   ├── tmdb/         # TMDB API client and utilities.
│   ├── providers/    # Context providers (Theme, Auth).
│   └── utils/        # Shared utilities (cn, formatters).
│
├── types/            # TypeScript type definitions.
│   └── database.types.ts # SINGLE SOURCE OF TRUTH (Generated from Supabase).
│
├── config/           # App-wide config (routes.ts, nav.ts).
└── styles/           # Global styles and Tailwind tokens.
```

**Architectural Principles:**
- **Server Components by Default:** Maximizes performance and SEO.
- **Logic in Features:** `src/app` only composes components; business logic stays in `src/features`.
- **Server Actions for Mutations:** All data modifications happen via Server Actions with auth checks.
- **Type Safety:** Strict adherence to `database.types.ts` generated types.
- **UI States:** Every data-driven view MUST handle **Loading** (Skeletons), **Empty**, and **Error** states.

## 4. Key Files & Documentation

- **`ARQUITECTURA.md`**: Detailed architectural guide and patterns.
- **`designSystem.md`**: UI/UX principles, tokens, and component patterns.
- **`docs/`**: Feature-specific implementation guides (Import, Person feature, etc.).
- **`src/middleware.ts`**: Session management and route protection.
- **`src/types/database.types.ts`**: Core database types.

## 5. Getting Started & Scripts

**Available Scripts:**
- `pnpm dev`: Starts development server.
- `pnpm build`: Production build.
- `pnpm lint`: ESLint check.

**Setup:**
Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and TMDB keys.

## 6. Authentication & Data Flow

1. **Auth:** Managed by Supabase Auth. Middleware handles session refresh and protection.
2. **Data Fetching:** 
   - **Read:** Server Components call Server Actions or direct Supabase queries.
   - **Write:** Client Components call Server Actions.
3. **Revalidation:** Use `revalidatePath` after mutations to keep the UI in sync.
4. **Security:** Real security is enforced via **RLS (Row Level Security)** in Supabase.