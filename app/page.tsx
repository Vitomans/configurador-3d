import Visor from "@/components/Visor";
import PanelOpciones from "@/components/PanelOpciones";
import Resumen from "@/components/Resumen";

export default function Home() {
  return (
    // La página ocupa justo el alto de la pantalla (h-dvh) y no se desplaza entera:
    // solo se desplaza el panel. Así la zapatilla siempre queda a la vista mientras eliges.
    <div className="flex h-dvh flex-col">
      <header className="shrink-0 border-b border-neutral-200 px-4 py-3 sm:px-6">
        <p className="text-xl font-bold tracking-tight">Pisada</p>
      </header>

      {/* En el celular el visor va arriba y el panel abajo; en escritorio quedan lado a lado */}
      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* touch-none: arrastrar el dedo sobre el visor gira la zapatilla en vez de mover la página */}
        <section
          aria-label="Vista 3D de la zapatilla"
          className="relative h-[45dvh] shrink-0 touch-none bg-neutral-100 lg:h-auto lg:flex-1"
        >
          <Visor />
          {/* La ayuda cambia según el dispositivo: dedo (pointer-coarse) o mouse */}
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-neutral-500">
            <span className="pointer-coarse:hidden">Arrastra para girar · Usa la rueda para acercar</span>
            <span className="hidden pointer-coarse:inline">Desliza para girar · Pellizca para acercar</span>
          </p>
        </section>

        <aside className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain border-t border-neutral-200 lg:w-96 lg:flex-none lg:border-t-0 lg:border-l">
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-semibold">Diseña tu zapatilla</h1>
            <p className="mt-2 text-neutral-600">
              Elige el color y el material de cada parte.
            </p>
            <PanelOpciones />
          </div>
          <Resumen />
        </aside>
      </main>
    </div>
  );
}
