import type { Metadata } from "next";
import BarraCompra from "@/components/BarraCompra";
import BotonCompartir from "@/components/BotonCompartir";
import Logo from "@/components/Logo";
import PanelOpciones from "@/components/PanelOpciones";
import Visor from "@/components/Visor";
import { aParametros, datosParaCompartir, TAMAÑO_IMAGEN } from "@/lib/compartir";

const REPO = "https://github.com/Vitomans/configurador-3d";

// Lo que se ve al compartir el link: cada diseño anuncia su propia imagen (ver lib/compartir.ts).
// Como depende del link, el servidor arma la página en cada visita, en vez de entregar un
// archivo hecho al compilar. Al robot de WhatsApp le llega todo en el <head>, que es donde lo busca
export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const { titulo, descripcion, imagen, alt } = datosParaCompartir(aParametros(await searchParams));
  return {
    openGraph: {
      type: "website",
      siteName: "Pisada",
      locale: "es_CL",
      title: titulo,
      description: descripcion,
      images: [{ url: imagen, ...TAMAÑO_IMAGEN, alt, type: "image/png" }],
    },
  };
}

export default function Home() {
  return (
    // La página ocupa justo el alto de la pantalla (h-dvh) y no se desplaza entera:
    // solo se desplaza el panel. Así la zapatilla siempre queda a la vista mientras eliges.
    <div className="flex h-dvh flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Logo />
          <p className="hidden text-sm text-stone-500 md:block">Zapatillas hechas a tu medida</p>
        </div>
        <a
          href={REPO}
          className="rounded-full text-sm font-medium text-stone-600 hover:text-stone-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          Código en GitHub
        </a>
      </header>

      {/* En el celular el visor va arriba y el panel abajo; en escritorio quedan lado a lado */}
      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* touch-none: arrastrar el dedo sobre el visor gira la zapatilla en vez de mover la página.
            El fondo es un degradado circular, más claro al centro, como la luz de un estudio de fotos.
            @container permite medir el texto de fondo según el ancho del visor (cqw) */}
        <section
          aria-label="Vista 3D de la zapatilla"
          className="@container relative h-[45dvh] shrink-0 touch-none overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f3f0eb_55%,#e6e0d7_100%)] lg:h-auto lg:flex-1"
        >
          {/* El nombre de la marca gigante y casi transparente, detrás de la zapatilla, como en una vitrina.
              El canvas 3D es transparente, así que se ve a través de él */}
          <p
            aria-hidden
            className="letra-marca pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[19cqw] leading-none text-stone-900/[0.04] uppercase select-none"
          >
            Pisada
          </p>

          <Visor />

          {/* Encima de la zapatilla, arriba a la derecha. Funciona aunque no haya 3D */}
          <BotonCompartir />

          {/* La ayuda cambia según el dispositivo: dedo (pointer-coarse) o mouse */}
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-stone-500">
            <span className="pointer-coarse:hidden">Arrastra para girar · Usa la rueda para acercar</span>
            <span className="hidden pointer-coarse:inline">Desliza para girar · Pellizca para acercar</span>
          </p>
        </section>

        <aside className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain border-t border-stone-200 lg:w-96 lg:flex-none lg:border-t-0 lg:border-l">
          <div className="p-4 sm:p-6">
            <p className="text-xs font-semibold tracking-widest text-marca-oscuro uppercase">
              Hecha a tu medida
            </p>
            <h1 className="letra-marca mt-1 text-xl uppercase lg:text-2xl">Diseña tu zapatilla</h1>
            <p className="mt-2 text-stone-600">
              Empieza con una combinación lista o elige el color y el acabado de cada parte, agrega tus iniciales y al final elige tu talla.
            </p>
            <PanelOpciones />
            <p className="mt-8 text-xs text-stone-500">
              Pisada es una tienda ficticia. Es un demo de portafolio hecho por{" "}
              <a href="https://github.com/Vitomans" className="font-medium text-stone-700 hover:underline">
                Victor Mendez
              </a>
              .
            </p>
          </div>
          <BarraCompra />
        </aside>
      </main>
    </div>
  );
}
