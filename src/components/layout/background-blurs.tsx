/**
 * BackgroundBlurs
 * Efectos decorativos de fondo usando blur.
 * Respeta la paleta de colores del sistema (chart colors) y tema light/dark.
 * Sin animaciones - puramente estático para crear profundidad visual.
 */
export function BackgroundBlurs() {
  return (
    <>
      <div className="blur-decoration blur-decoration-1" aria-hidden="true" />
      <div className="blur-decoration blur-decoration-2" aria-hidden="true" />
    </>
  );
}
