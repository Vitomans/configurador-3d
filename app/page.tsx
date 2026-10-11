export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-neutral-200 px-4 py-3 sm:px-6">
        <p className="text-xl font-bold tracking-tight">Pisada</p>
      </header>

      {/* En el celular el visor va arriba y el panel abajo; en escritorio quedan lado a lado */}
      <main className="flex flex-1 flex-col lg:flex-row">
        <section
          aria-label="Visor 3D"
          className="flex h-[55dvh] items-center justify-center bg-neutral-100 lg:h-auto lg:flex-1"
        >
          <p className="text-neutral-500">Aquí va el visor 3D</p>
        </section>

        <aside className="border-t border-neutral-200 p-4 sm:p-6 lg:w-96 lg:border-t-0 lg:border-l">
          <h1 className="text-2xl font-semibold">Diseña tu zapatilla</h1>
          <p className="mt-2 text-neutral-600">
            Elige el color y el material de cada parte.
          </p>
        </aside>
      </main>
    </div>
  );
}
