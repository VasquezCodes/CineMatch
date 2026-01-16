/**
 * Rutas de la aplicación
 * Centraliza todas las rutas para fácil mantenimiento
 */

// Rutas principales de la aplicación
export const APP_ROUTES = {
  // Marketing
  HOME: "/",

  // Auth
  LOGIN: "/login",

  // App - Flujo principal
  DASHBOARD: "/app",
  UPLOAD: "/app/upload",
  ANALYSIS: "/app/analysis",
  RATE_MOVIES: "/app/rate-movies",
  RECOMMENDATIONS: "/app/recommendations",
  PROFILE: "/app/profile",
} as const;

// Rutas secundarias (features adicionales)
export const SECONDARY_ROUTES = {
  LIBRARY: "/app/library",
  IMPORTS: "/app/imports",
  INSIGHTS: "/app/insights",
  GAMES: "/app/games",
  COMMUNITY: "/app/community",
  QUALIFICATION: "/app/qualification",
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];
export type SecondaryRoute = typeof SECONDARY_ROUTES[keyof typeof SECONDARY_ROUTES];
