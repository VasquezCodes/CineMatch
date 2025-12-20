// Route configuration

// Rutas primarias (flujo principal CineMatch)
export const APP_ROUTES = {
  HOME: "/app",
  UPLOAD: "/app/upload",
  ANALYSIS: "/app/analysis",
  RECOMMENDATIONS: "/app/recommendations",
  PROFILE: "/app/profile",
  LOGIN: "/login",
} as const;

// Rutas secundarias (features adicionales)
export const SECONDARY_ROUTES = {
  LIBRARY: "/app/library",
  INSIGHTS: "/app/insights",
  GAMES: "/app/games",
  COMMUNITY: "/app/community",
  QUALIFICATION: "/app/qualification",
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
export type SecondaryRoute =
  (typeof SECONDARY_ROUTES)[keyof typeof SECONDARY_ROUTES];
