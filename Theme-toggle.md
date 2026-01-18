# Efecto Mask para Transición de Tema

Implementación concisa de transición de tema usando **CSS Mask** con animación de revelación radial desde el punto de click.

## Arquitectura

### Componentes

- **`ThemeRevealProvider`**: Proveedor principal que gestiona la animación de transición
- **`ThemeToggle`**: Botón que dispara la transición capturando coordenadas del click
- **`ThemeProvider`**: Wrapper de `next-themes` para integración con Next.js

## Cómo Funciona el Efecto Mask

### 1. Captura del Estado Visual (Snapshot)

Al hacer click en el toggle:

```110:114:src/components/theme/theme-reveal-provider.tsx
function setRevealMask(el: HTMLElement, xPx: number, yPx: number, rPx: number) {
  el.style.setProperty("--reveal-x", `${xPx}px`);
  el.style.setProperty("--reveal-y", `${yPx}px`);
  el.style.setProperty("--reveal-r", `${rPx}px`);
```

- Se clona el DOM actual (`cloneNode`) para crear un snapshot del tema anterior
- Se congelan los estilos computados (`freezeComputedStyles`) y variables CSS (`freezeCSSVariables`) para evitar cambios durante la transición

### 2. Overlay con Mask

El overlay contiene el snapshot y se sitúa sobre todo el contenido:

```266:277:src/components/theme/theme-reveal-provider.tsx
        <div
          ref={overlayRef}
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ display: "none" }}
          suppressHydrationWarning
          aria-hidden="true"
        >
          <div
            ref={snapshotRootRef}
            className="h-full w-full bg-background text-foreground"
          />
        </div>
```

**Z-index**: `9998` (overlay) < `10000` (toggle button), permitiendo interacción con el botón durante la animación.

### 3. Mask Radial con CSS Variables

El mask se aplica mediante `radial-gradient` con variables CSS:

```117:134:src/components/theme/theme-reveal-provider.tsx
  const maskValue =
    "radial-gradient(circle at var(--reveal-x) var(--reveal-y), transparent var(--reveal-r), black calc(var(--reveal-r) + 1px))";

  // Aplicar propiedades de máscara (webkit y estándar)
  const maskProps = [
    { webkit: "-webkit-mask-image", standard: "mask-image", value: maskValue },
    {
      webkit: "-webkit-mask-repeat",
      standard: "mask-repeat",
      value: "no-repeat",
    },
    { webkit: "-webkit-mask-size", standard: "mask-size", value: "100% 100%" },
  ] as const;

  for (const prop of maskProps) {
    el.style.setProperty(prop.webkit, prop.value);
    el.style.setProperty(prop.standard, prop.value);
  }
```

**Explicación del mask**:
- `transparent var(--reveal-r)`: Círculo transparente (agujero) que crece desde `(x, y)`
- `black calc(var(--reveal-r) + 1px)`: Resto del overlay opaco que tapa el contenido
- Soporte webkit y estándar para compatibilidad cross-browser

### 4. Animación Sincronizada

Secuencia de eventos:

```224:254:src/components/theme/theme-reveal-provider.tsx
      // SINCRONIZACIÓN MAESTRA (imperceptible):
      // 1) Mostramos el overlay con snapshot del tema viejo (tapa todo).
      // 2) Cambiamos el tema real por debajo (setTheme) cuando el overlay ya está pintado.
      // 3) Animamos un "agujero" que CRECE en el overlay, revelando el tema nuevo debajo.
      gsap.set(overlayEl, { display: "block", zIndex: OVERLAY_Z_INDEX });
      setRevealMask(overlayEl, originX, originY, 0);

      // Esperamos 2 frames: uno para pintar overlay, otro para aplicar nuevo tema antes de animar.
      requestAnimationFrame(() => {
        setTheme(nextTheme);
        requestAnimationFrame(() => {
          gsap.to(overlayEl, {
            duration: ANIMATION_DURATION,
            ease: "expo.inOut",
            onUpdate: function () {
              setRevealMask(
                overlayEl,
                originX,
                originY,
                endRadius * this.progress()
              );
            },
            onComplete: () => {
              setIsAnimating(false);
              gsap.set(overlayEl, { display: "none" });
              clearRevealMask(overlayEl);
              snapshotRootEl.replaceChildren();
            },
          });
        });
      });
```

**Fases**:
1. Frame 1: Overlay visible con snapshot (tema viejo congelado)
2. Frame 2: `setTheme(nextTheme)` cambia el contenido real (invisible bajo overlay)
3. GSAP anima `--reveal-r` de `0` a `endRadius`, creciendo el agujero transparente

## Integración con Elementos

### Toggle Button

```16:20:src/components/theme/theme-toggle.tsx
  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isAnimating) return;
    const nextTheme = resolvedTheme === "light" ? "dark" : "light";
    startReveal(e.clientX, e.clientY, nextTheme);
  };
```

- Captura `clientX/clientY` del evento click
- Previene múltiples clicks durante animación (`isAnimating`)
- Z-index `10000` asegura que permanece clickeable sobre el overlay

### Fusion con Sistema de Tema

- **Variables CSS congeladas**: El snapshot mantiene las CSS variables del tema anterior incluso después de `setTheme`
- **Estilos computados**: `freezeComputedStyles` preserva colores, bordes, sombras del tema viejo
- **Contenido interactivo**: Inputs, textareas y selects mantienen sus valores en el snapshot

## Ventajas de esta Implementación

1. **Performance**: Usa `cloneNode` (nativo) en lugar de re-render React
2. **Precisión visual**: Congela estilos computados para evitar flashes
3. **Compatibilidad**: Soporte webkit + estándar para mask
4. **Sincronización**: `requestAnimationFrame` asegura orden correcto de pintado
5. **UX**: Animación suave (`expo.inOut`) desde punto de interacción

## Configuración

- **Duración**: `ANIMATION_DURATION = 0.8s`
- **Easing**: `expo.inOut` (GSAP)
- **Z-index overlay**: `9998`
- **Z-index toggle**: `10000`
