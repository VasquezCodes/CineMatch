/**
 * Configuración de clases CSS para cada panel del hero
 * Solo se usan las classNames, el contenido está hardcodeado en cada componente
 */
export interface HeroPanelData {
  id: number;
  className: string;
}

export const heroPanels: HeroPanelData[] = [
  {
    id: 0,
    className: "bg-background text-foreground",
  },
  {
    id: 1,
    className: "bg-card text-foreground",
  },
  {
    id: 2,
    className: "bg-background text-foreground",
  },
  {
    id: 3,
    className: "bg-card text-foreground",
  },
];
