# Guía de Diseño & UX – Plataforma CineMatch

## Introducción

Documento vivo para mantener coherencia de diseño y UX entre **Web** y **Mobile**. Su objetivo es que cualquiera pueda diseñar y evolucionar la experiencia sin romper consistencia.

---

## Principios de diseño

- **Clarity first:** cada pantalla deja claro qué es, qué muestra y cuál es la próxima acción.
- **Explainability:** recomendaciones y estados se entienden con una justificación visible o a 1 toque.
- **Mobile‑first:** primero perfecto en pantallas pequeñas, luego se expande en Web.
- **Visual consistency:** tipografías, tamaños, espaciados, colores y estados se usan de manera uniforme.
- **Emotional tone:** microcopys, imágenes y transiciones sutiles acompañan la emoción del cine.
- **Pragmatic accessibility:** contraste, tamaños táctiles y mensajes comprensibles.
- **Progressive disclosure:** mostrar lo necesario ahora, detalles bajo demanda.
- **Perceived performance:** feedback inmediato con skeletons/loaders y estados claros.

---

## Reglas de oro del sistema

1. **Una pantalla = un patrón principal.**
No mezclar “wizard” con “dashboard” en la misma vista.

2. **Los tokens de diseño son IRREEMPLAZABLES.**
   > [!IMPORTANT]
   > Colores, paddings, márgenes, bordes y tipografía definidos en el sistema deben respetarse **sin falta**. NO se deben usar valores "hardcoded" ni sobreescribir tokens globales en componentes locales. La consistencia visual depende de la adherencia estricta a estos tokens.

---

## Conceptos y vocabulario

- **Movie:** unidad principal (título, año, géneros, ficha, rating, assets).
- **Quality:** característica evaluable (ej.: “Ritmo”, “Profundidad de personajes”).
- **Dimension:** grupo de cualidades (ej.: “Narrativa”, “Estilo visual”).
- **Cinephile profile:** gustos y señales del usuario.
- **Explainable recommendation:** sugerencia + por qué aparece.
- **WatchList:** lista guardada.
- **To Watch:** subset de WatchList (prioridad alta).

---

## Elementos compartidos Web + Mobile

- **Title hierarchy:** H1 (pantalla), H2 (bloques principales), H3 (subsecciones).
- **Movie card structure:** poster, título, metadatos clave, acción primaria visible, secundarias en menú.
- **Visual states:** default, hover/pressed, loading, empty, error, success.
- **Voice:** cercano, claro, breve. Sin jerga.
- **Wizards/onboarding:** cortos, 1 objetivo por paso, feedback evidente.
- **Iconography & labels:** set común; misma acción = mismo nombre.

---

## Diferencias por plataforma

### Web

- Más ancho: columnas, paneles laterales y tablas si aportan claridad.
- Búsqueda visible, filtros avanzados persistentes, navegación por teclado cuando sea posible.
- Se permite más densidad sin perder legibilidad.

### Mobile

- Navegación simple: **bottom bar (hasta 5 secciones)**.
- Táctil: áreas grandes, gestos con cuidado (evitar gestos ocultos críticos).
- 1 tarea por vista; acciones puntuales en **bottom sheets**.

---

## Tipos de pantallas

- **Lists:** lista/parrilla con filtros y orden.
- **Details:** ficha + cualidades/dimensiones + explicabilidad.
- **Wizards:** setup de perfil y preferencias.
- **Dashboards:** resumen personal (continuar, novedades, insights).
- **Profiles:** perfil cinéfilo editable.
- **Empty states:** mensaje + icono/ilustración + acción para empezar.

---

## Naming oficial

### Reglas generales

- Títulos = sustantivos claros (“Biblioteca”, “Perfil”).
- Acciones = verbos en infinitivo (“Guardar”, “Editar”, “Cancelar”).
- Sin tecnicismos ni siglas internas.
- Consistencia: un concepto = un nombre.
- Corto (1–2 palabras). Especificidad en subtítulos, no en títulos largos.
- Capitalización: solo primera palabra + nombres propios (“Lista para ver”).

### Navegación principal (labels)

- **Home**
- **Library**
- **Insights**
- **Recommendations**
- **Community**
- **Games**
- **Profile**

> Nota: vocabulario igual en Web y Mobile (cambia el layout, no los nombres).

### Naming transversal

- Estados: **Loading**, **No data**, **Error**
- Acciones frecuentes: **Continue**, **Save**, **Edit**, **Cancel**
- Flujos: **Step 1**, **Step 2**, **Summary**

### Naming a evitar

Dashboard, Latency, Pipeline, siglas no explicadas, jerga ambigua (“Pro”, “Avanzado” sin contexto), duplicidades.

---

## Jerarquías visuales

### Niveles

- **Primary title** → identifica la pantalla.
- **Subtitle** → apoya sin competir.
- **Content blocks** → secciones con encabezado.
- **Primary content** → lo más relevante del bloque.
- **Secondary content** → metadatos/ayudas.

### Jerarquía de acciones

- **Primary action:** 1 por vista/bloque.
- **Secondary action:** alternativa útil (menos prominente).
- **Tertiary action:** en menús.

### Estados

- Loading: skeletons, sin saltos de layout.
- Empty: mensaje + próxima acción.
- Error: qué pasó + reintentar o volver.

---

## Patrones de layout (contrato del sistema)

### List layout

Header con título + filtros básicos → lista/parrilla → paginación o carga.

### Detail layout

Título + datos clave → bloques (sinopsis/cualidades/dimensiones/reseñas) → acciones.

### Wizard layout

Progreso claro → contenido del paso → acciones (Continue / Back / Cancel) → resumen final.

### Dashboard layout

Bloques ordenados por relevancia → cards con CTAs → densidad controlada.

### Profile layout

Resumen → tabs/bloques (preferencias/seguridad/notifs) → edición contextual.

### Community layout

Feed/lista → ordenar/filtrar → reaccionar/comentar/compartir.

### States layout

Loading (skeleton), Empty (educativo), Error (recuperable).

---

## Patrones UI transversales

- **Movie Card** (unidad base)
- **Quality Chip** (selección múltiple)
- **Recommendation Group Block** (agrupa por resonancia, no ranking)
- **System Feedback** (mensaje claro + chips de entradas activas)
- **Educational Empty State** (enseña y da acción)
- **Loader/Skeleton** (layout estable)
- **CTAs** (1 primaria por vista/bloque)

---

## UI Kit Foundations (para código + Figma)

> Stack UI: **shadcn/ui** como base de componentes.

### Color tokens (hex)

**Light**

- Background: `#FFFFFF`
- Surface/Card: `#F8FAFC`
- Border: `#E2E8F0`
- Text Main: `#0F172A`
- Text Muted: `#64748B`
- Accent (Brand): `#16A34A`

**Dark**

- Background: `#0B1120`
- Surface/Card: `#1E293B`
- Border: `#334155`
- Text Main: `#F1F5F9`
- Text Muted: `#94A3B8`
- Accent (Brand): `#22C55E`

### Typography (scale)

- Display 1: 40/44
- Display 2: 32/38
- Heading 1: 24/32
- Heading 2: 20/28
- Heading 3: 18/26
- Body: 16/24
- Body Small: 14/20
- Caption: 12/16

### Spacing

Base unit: 4px (solo valores del sistema)

- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

### Radius

- 0, 4, 8, 12, 16, 9999

### Shadows

- none / sm / md / lg (sutiles, secundarias a surface + spacing)

### Breakpoints (Tailwind)

- sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536

### Container

- Max width: 1200px
- Padding: 16 (mobile) / 24 (tablet) / 32 (desktop)

---

## Pendiente de definir

- Estilo final de imágenes
- Animaciones/transiciones por plataforma
- Microinteracciones (cards/gestos)
- Gamificación (si aplica)
- Sonidos/hápticos en mobile
- Estrategia de tooltips y ayudas contextuales

---

## Notas finales

Cualquier cambio debe mantener coherencia, reforzar explicabilidad y cuidar el tono emocional del producto.
