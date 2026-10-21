"use client";

import { useEffect, useRef } from "react";
import { IconoCerrar, IconoCompartir, IconoDescargar } from "@/components/Iconos";
import { useCompartir } from "@/hooks/useCompartir";
import { ACABADOS, COLORES, PARTES, PRECIO_BASE } from "@/lib/opciones";
import { calcularPrecio, formatearPrecio, recargoDeParte, recargoDelTexto } from "@/lib/precio";
import { colorDelTexto } from "@/lib/texto";
import { useConfigurador } from "@/store/useConfigurador";

type Props = {
  abierto: boolean;
  foto: string | null; // la foto de la zapatilla (un JPG como data URL), o null si no hay 3D
  alCerrar: () => void;
};

const estiloBotonSecundario =
  "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-stone-300 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors hover:border-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

/**
 * El resumen del pedido: la foto del diseño, el color y el acabado de cada parte, el texto
 * del talón, la talla y el detalle del precio. Es una compra simulada: no se cobra nada.
 */
export default function ResumenPedido({ abierto, foto, alCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const configuracion = useConfigurador((estado) => estado.configuracion);
  const texto = useConfigurador((estado) => estado.texto);
  const talla = useConfigurador((estado) => estado.talla);
  // textoDelBoton: "Compartir" o "¡Link copiado!"
  const { texto: textoDelBoton, compartir } = useCompartir();

  // El <dialog> se abre con showModal(): queda encima de todo, el resto de la página no se
  // puede tocar mientras está abierto, el foco no se escapa y la tecla Esc lo cierra
  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierto && !elemento.open) elemento.showModal();
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  // close() dispara el evento "close", y ahí se avisa con alCerrar
  const cerrar = () => dialogo.current?.close();

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="titulo-pedido"
      // Se dispara siempre que se cierra: con Esc, con un botón o con un clic fuera de la caja
      onClose={alCerrar}
      // Un clic en el fondo oscuro, fuera de la caja, le llega al <dialog> mismo y lo cierra.
      // La caja de adentro tapa todo el <dialog>, así que un clic en ella no cuenta
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) cerrar();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-2xl bg-white text-stone-900 shadow-2xl backdrop:bg-stone-900/60 motion-safe:animate-aparecer"
    >
      {/* En el celular va todo hacia abajo. En escritorio, la foto a la izquierda
          y el título y el detalle a la derecha */}
      <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2 md:gap-x-6">
        <header className="flex items-start justify-between gap-2 md:col-start-2">
          <div>
            <p className="text-xs font-semibold tracking-widest text-marca-oscuro uppercase">
              Agregada al carrito
            </p>
            <h2 id="titulo-pedido" className="letra-marca mt-1 text-xl uppercase">
              Tu pedido
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

        {/* La foto es cuadrada. En el celular se muestra recortada arriba y abajo (object-cover),
            donde solo hay fondo, para que el resumen quepa en la pantalla */}
        <div className="md:col-start-1 md:row-span-2 md:row-start-1">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element -- es una foto recién sacada (un data URL): next/image no tiene nada que optimizar
            <img
              src={foto}
              alt="Foto de tu zapatilla con el diseño elegido"
              className="aspect-16/10 w-full rounded-xl object-cover md:aspect-square"
            />
          ) : (
            <div className="flex aspect-16/10 items-center justify-center rounded-xl bg-stone-100 p-6 text-center text-sm text-stone-500 md:aspect-square">
              No hay foto: este navegador no puede mostrar la zapatilla en 3D.
            </div>
          )}
        </div>

        <div className="md:col-start-2">
          {/* El detalle del precio: la zapatilla base y lo que suma cada parte */}
          <ul className="divide-y divide-stone-100 text-sm">
            <li className="flex items-baseline justify-between gap-4 pb-2 font-medium">
              <span>Zapatilla Pisada · Talla {talla}</span>
              <span>{formatearPrecio(PRECIO_BASE)}</span>
            </li>
            {PARTES.map((parte) => {
              const { color, acabado } = configuracion[parte.id];
              const recargo = recargoDeParte(parte, configuracion);
              return (
                <li key={parte.id} className="flex items-center gap-2 py-1">
                  <span
                    aria-hidden
                    className="size-3.5 shrink-0 rounded-full border border-black/20"
                    style={{ backgroundColor: COLORES[color].hex }}
                  />
                  <span className="w-17 shrink-0 text-stone-500">{parte.nombre}</span>
                  <span className="flex-1">
                    {COLORES[color].nombre} · {ACABADOS[acabado].nombre}
                  </span>
                  {recargo > 0 && <span>+{formatearPrecio(recargo)}</span>}
                </li>
              );
            })}
            {/* El texto del talón, si lleva. El circulito es el color en que se imprime */}
            {texto && (
              <li className="flex items-center gap-2 py-1">
                <span
                  aria-hidden
                  className="size-3.5 shrink-0 rounded-full border border-black/20"
                  style={{ backgroundColor: colorDelTexto(COLORES[configuracion.cuerpo.color].hex) }}
                />
                <span className="w-17 shrink-0 text-stone-500">Texto</span>
                <span className="flex-1">{texto} en el talón</span>
                <span>+{formatearPrecio(recargoDelTexto(texto))}</span>
              </li>
            )}
          </ul>

          <p className="mt-1 flex items-baseline justify-between border-t border-stone-200 pt-3">
            <span className="font-medium">Total</span>
            <span className="letra-marca text-2xl">{formatearPrecio(calcularPrecio(configuracion, texto))}</span>
          </p>

          <p className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-stone-700">
            Es una compra simulada: no se cobra nada.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {/* download: el navegador guarda la imagen con este nombre en vez de abrirla */}
            {foto && (
              <a href={foto} download="pisada-mi-zapatilla.jpg" className={estiloBotonSecundario}>
                <IconoDescargar />
                Descargar imagen
              </a>
            )}
            <button type="button" onClick={compartir} aria-live="polite" className={estiloBotonSecundario}>
              <IconoCompartir />
              {textoDelBoton}
            </button>
            <button
              type="button"
              onClick={cerrar}
              className="basis-full cursor-pointer rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Seguir diseñando
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
