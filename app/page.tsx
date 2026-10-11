export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-neutral-200 px-4 py-3 sm:px-6">
        <p className="text-xl font-bold tracking-tight">Pisada</p>
      </header>

      {/* On mobile the viewer goes on top and the panel below; on desktop they sit side by side */}
      <main className="flex flex-1 flex-col lg:flex-row">
        <section
          aria-label="3D viewer"
          className="flex h-[55dvh] items-center justify-center bg-neutral-100 lg:h-auto lg:flex-1"
        >
          <p className="text-neutral-500">3D viewer coming soon</p>
        </section>

        <aside className="border-t border-neutral-200 p-4 sm:p-6 lg:w-96 lg:border-t-0 lg:border-l">
          <h1 className="text-2xl font-semibold">Design your sneaker</h1>
          <p className="mt-2 text-neutral-600">
            Pick colors and materials for each part.
          </p>
        </aside>
      </main>
    </div>
  );
}
