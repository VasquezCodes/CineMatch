import type { ComponentType } from "react";
import { BarChart3, Sparkles, Upload } from "lucide-react";

export type HeroPanelContent =
  | {
      type: "cta";
      buttonLabel: string;
    }
  | {
      type: "insights";
      stats: Array<{
        label: string;
        value: string;
        trend: string;
      }>;
    }
  | {
      type: "recommendations";
      items: Array<{
        title: string;
        genre: string;
        rating: string;
      }>;
    }
  | {
      type: "footer";
      text: string;
    };

export interface HeroPanelData {
  id: number;
  className: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  content: HeroPanelContent;
}

export const heroPanels: HeroPanelData[] = [
  {
    id: 1,
    className: "bg-background text-foreground",
    title: "Importa tu historial",
    description: "Sube tu archivo CSV de Letterboxd y comienza tu viaje.",
    icon: Upload,
    content: {
      type: "cta",
      buttonLabel: "Comenzar Importación",
    },
  },
  {
    id: 2,
    className: "bg-muted text-foreground",
    title: "Analiza tus gustos",
    description: "Descubre patrones ocultos en tus hábitos de visualización.",
    icon: BarChart3,
    content: {
      type: "insights",
      stats: [
        { label: "Tiempo total", value: "312 h", trend: "+18%" },
        { label: "Directores top", value: "24", trend: "+6" },
        { label: "Género favorito", value: "Drama", trend: "Top 1" },
      ],
    },
  },
  {
    id: 3,
    className: "bg-background text-foreground",
    title: "Descubre joyas ocultas",
    description: "Recomendaciones personalizadas basadas en lo que amas.",
    icon: Sparkles,
    content: {
      type: "recommendations",
      items: [
        { title: "The Silent Frame", genre: "Mystery", rating: "4.6" },
        { title: "Before the Fog", genre: "Drama", rating: "4.3" },
        { title: "Solaris Night", genre: "Sci-Fi", rating: "4.7" },
      ],
    },
  },
  {
    id: 4,
    className: "bg-card text-card-foreground border-t border-border",
    title: "Únete a CineMatch",
    description: "Tu compañero definitivo para el descubrimiento de películas.",
    icon: Sparkles,
    content: {
      type: "footer",
      text: "© 2026 CineMatch. Todos los derechos reservados.",
    },
  },
];
