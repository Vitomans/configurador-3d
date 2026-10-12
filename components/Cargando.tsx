// Aviso que tapa el visor mientras se descarga el modelo 3D.
// Es HTML normal (no va dentro del <Canvas>), así se ve desde el primer momento,
// incluso antes de que termine de cargar JavaScript.
export default function Cargando() {
  return (
    <div
      role="status"
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-100 text-sm text-neutral-600"
    >
      {/* El círculo solo gira si la persona no pidió reducir las animaciones (motion-safe) */}
      <span
        aria-hidden
        className="size-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 motion-safe:animate-spin"
      />
      Cargando zapatilla…
    </div>
  );
}
