"use client";

import { useEffect, useRef, useState } from "react";
import { IconoCerrar, IconoRealidadAumentada } from "@/components/Iconos";
import { useDialogo } from "@/hooks/useDialogo";
import { useModoRealidadAumentada } from "@/hooks/useModoRealidadAumentada";
import type { Talla } from "@/lib/opciones";
import { codigoQr, largoDeLaTalla, TALLA_DE_MUESTRA } from "@/lib/realidadAumentada";
import { useConfigurador } from "@/store/useConfigurador";
import { useRealidadAumentada, type EstadoRealidadAumentada } from "@/store/useRealidadAumentada";

// Lo que explica el diálogo cuando el botón no abre la realidad aumentada
type Aviso = "qr" | "sin-realidad-aumentada" | "error";

const AVISOS: Record<Aviso, { titulo: string; texto: string }> = {
  qr: {
    titulo: "Mírala en tu espacio",
    texto:
      "Escanea el código con la cámara de tu celular. Se abre tu diseño, y ahí tocas «Ver en tu espacio»: tu zapatilla aparece sobre la mesa o el suelo, en su tamaño real.",
  },
  "sin-realidad-aumentada": {
    titulo: "Mírala en tu espacio",
    texto:
      "Este navegador no puede mostrar realidad aumentada. Abre esta página en Chrome si tienes un Android compatible con ARCore, o en Safari si tienes un iPhone.",
  },
  error: {
    titulo: "No se pudo abrir",
    texto:
      "No se pudo abrir la realidad aumentada. Revisa que el navegador tenga permiso para usar la cámara y vuelve a intentarlo.",
  },
};

// Lo que se lee encima de la cámara en Android, según en qué va la sesión
function mensaje(estado: Exclude<EstadoRealidadAumentada, "apagada">, talla: Talla) {
  const largo = largoDeLaTalla(talla).toLocaleString("es-CL", { maximumFractionDigits: 1 });
  return {
    abriendo: "Abriendo la cámara…",
    buscando: "Mueve el celular despacio, apuntando al suelo o a una mesa",
    lista: "Toca la pantalla para poner tu zapatilla",
    puesta: `Así se ve en talla ${talla} (${largo} cm). Toca otro lugar para moverla`,
  }[estado];
}

// El link del archivo anterior, para liberar su memoria cuando se arma uno nuevo
let archivoAnterior: string | null = null;

// En el iPhone, el visor de realidad aumentada de Apple (AR Quick Look) se abre con un link
// con rel="ar" que apunta a un archivo USDZ. Aquí el archivo está en la memoria del navegador
function abrirEnQuickLook(archivo: Blob) {
  if (archivoAnterior) URL.revokeObjectURL(archivoAnterior);
  archivoAnterior = URL.createObjectURL(archivo);

  const link = document.createElement("a");
  link.rel = "ar";
  // allowsContentScaling=0: la zapatilla queda de su tamaño real (no se agranda pellizcando)
  link.href = `${archivoAnterior}#allowsContentScaling=0`;
  // Safari abre el visor solo si el link tiene una imagen adentro
  link.appendChild(document.createElement("img"));
  link.click();
}

// El código QR del link, dibujado como SVG. crispEdges: sin bordes suavizados entre los
// cuadritos, para que no queden líneas claras que confundan a la cámara
function CodigoQr({ link }: { link: string }) {
  const { tamaño, camino } = codigoQr(link);
  return (
    <svg
      viewBox={`0 0 ${tamaño} ${tamaño}`}
      role="img"
      aria-label="Código QR con el link de tu diseño"
      shapeRendering="crispEdges"
      className="mx-auto mt-4 aspect-square w-56 rounded-lg bg-white text-stone-900 ring-1 ring-stone-200"
    >
      <path d={camino} fill="currentColor" />
    </svg>
  );
}

/**
 * El botón "Ver en tu espacio", sobre la zapatilla. Según el navegador:
 * - Android (Chrome): abre la cámara con la zapatilla encima (ver RealidadAumentada.tsx), y
 *   encima de la cámara muestra los avisos y el botón para salir.
 * - iPhone (Safari): arma el archivo USDZ y lo abre en el visor de Apple.
 * - Computador: muestra un código QR para abrir el diseño en el celular.
 */
export default function VerEnTuEspacio() {
  const modo = useModoRealidadAumentada();
  const estado = useRealidadAumentada((estado) => estado.estado);
  const talla = useConfigurador((estado) => estado.talla) ?? TALLA_DE_MUESTRA;
  const capa = useRef<HTMLDivElement>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [link, setLink] = useState("");
  const [preparando, setPreparando] = useState(false);
  const { dialogo, cerrar, cerrarSiTocaFuera } = useDialogo(aviso !== null);

  // En la sesión, cada toque en la pantalla pone la zapatilla. Tocar "Salir" no tiene que hacerlo:
  // beforexrselect avisa antes de que un toque sobre la capa cuente, y preventDefault lo descarta
  useEffect(() => {
    const elemento = capa.current;
    if (!elemento) return;
    const descartarSiEsUnBoton = (evento: Event) => {
      if (evento.target instanceof Element && evento.target.closest("button")) evento.preventDefault();
    };
    elemento.addEventListener("beforexrselect", descartarSiEsUnBoton);
    return () => elemento.removeEventListener("beforexrselect", descartarSiEsUnBoton);
  }, []);

  async function verEnTuEspacio() {
    const { entrar, armarUsdz } = useRealidadAumentada.getState();
    try {
      if (modo === "webxr") {
        await entrar(capa.current!);
      } else if (modo === "quick-look") {
        setPreparando(true);
        abrirEnQuickLook(await armarUsdz());
      } else {
        // En el computador, un código QR para seguir en el celular. En un celular sin realidad
        // aumentada el código no sirve de nada: se explica qué navegador usar
        setLink(window.location.href);
        setAviso(window.matchMedia("(pointer: coarse)").matches ? "sin-realidad-aumentada" : "qr");
      }
    } catch (error) {
      // Por ejemplo, si la persona no dio permiso para usar la cámara
      console.error(error);
      setAviso("error");
    } finally {
      setPreparando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={verEnTuEspacio}
        disabled={preparando || estado !== "apagada"}
        className="absolute top-3 left-3 flex cursor-pointer items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-stone-900/10 backdrop-blur transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-70"
      >
        <IconoRealidadAumentada />
        {preparando ? "Preparando…" : "Ver en tu espacio"}
      </button>

      {/* Lo que se ve encima de la cámara en Android (el "DOM overlay" de WebXR): durante la
          sesión, el navegador la muestra a pantalla completa. Existe siempre, vacía y sin tapar
          nada, porque hay que entregarla al pedir la sesión */}
      <div ref={capa} className="pointer-events-none absolute inset-0">
        {estado !== "apagada" && (
          <div className="flex h-full flex-col items-center justify-between p-4 pb-8">
            {/* Mientras se abre la cámara todavía no hay sesión de la que salir */}
            {estado === "abriendo" ? (
              <span />
            ) : (
              <button
                type="button"
                onClick={() => useRealidadAumentada.getState().salir()}
                className="pointer-events-auto flex cursor-pointer items-center gap-2 self-end rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-stone-900 shadow-sm"
              >
                <IconoCerrar />
                Salir
              </button>
            )}
            <p role="status" className="max-w-xs rounded-2xl bg-stone-900/75 px-4 py-2 text-center text-sm text-white">
              {mensaje(estado, talla)}
            </p>
          </div>
        )}
      </div>

      <dialog
        ref={dialogo}
        aria-labelledby="titulo-espacio"
        onClose={() => setAviso(null)}
        onClick={cerrarSiTocaFuera}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white text-stone-900 shadow-2xl backdrop:bg-stone-900/60 motion-safe:animate-aparecer"
      >
        {aviso && (
          <div className="p-4 sm:p-6">
            <header className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-widest text-marca-oscuro uppercase">
                  Realidad aumentada
                </p>
                <h2 id="titulo-espacio" className="letra-marca mt-1 text-xl uppercase">
                  {AVISOS[aviso].titulo}
                </h2>
              </div>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="-m-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                <IconoCerrar />
              </button>
            </header>

            {aviso === "qr" && <CodigoQr link={link} />}
            <p className="mt-4 text-sm text-stone-600">{AVISOS[aviso].texto}</p>
            {aviso === "qr" && (
              <p className="mt-2 text-xs text-stone-500">
                Funciona en Android con Chrome y en iPhone con Safari.
              </p>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
