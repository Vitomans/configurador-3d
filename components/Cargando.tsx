// Aviso sobre el visor mientras se descarga el modelo 3D. No tiene fondo propio:
// se ve el fondo de estudio del visor (ver app/page.tsx).
// Es HTML normal (no va dentro del <Canvas>), así se ve desde el primer momento,
// incluso antes de que termine de cargar JavaScript.
export default function Cargando() {
  return (
    <div
      role="status"
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-stone-600"
    >
      {/* El círculo solo gira si la persona no pidió reducir las animaciones (motion-safe) */}
      <span
        aria-hidden
        className="size-8 rounded-full border-2 border-stone-300 border-t-marca motion-safe:animate-spin"
      />
      Cargando zapatilla…
    </div>
  );
}
