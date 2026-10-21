"use client";

import { COMBINACIONES, coloresDe, combinacionAlAzar, sonIguales } from "@/lib/combinaciones";
import { ACABADOS, COLORES, PARTES, TALLAS, type AcabadoId } from "@/lib/opciones";
import { formatearPrecio } from "@/lib/precio";
import { useConfigurador } from "@/store/useConfigurador";

// Cada grupo de opciones usa botones de radio (input type="radio") escondidos,
// con un diseño propio encima. Así funcionan con el teclado (flechas) y con
// lectores de pantalla sin programar nada extra.
// "relative" deja el botón escondido dentro de su etiqueta; si no, se ubica fuera
// del panel y estira la página.
const estiloBoton =
  "relative cursor-pointer rounded-full border border-stone-300 px-4 py-2 text-sm transition-colors hover:border-stone-900 has-checked:border-stone-900 has-checked:bg-stone-900 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-600";

// El número del paso, en un círculo, delante del título de cada grupo.
// aria-hidden: el lector de pantalla lee solo el título ("Parte"), sin el número
function Paso({ numero }: { numero: number }) {
  return (
    <span
      aria-hidden
      className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-marca text-[11px] font-semibold text-white"
    >
      {numero}
    </span>
  );
}

// Texto que avisa cuánto suma una opción, por ejemplo " (+US$ 10)", o nada si no suma
function textoRecargo(recargo = 0) {
  return recargo > 0 ? ` (+${formatearPrecio(recargo)})` : "";
}

// Un dado, para el botón "Sorpréndeme". Es solo un adorno: aria-hidden
function Dado() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="size-4 transition-transform motion-safe:group-hover:rotate-12"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function PanelOpciones() {
  const {
    configuracion,
    parteActiva,
    elegirParte,
    cambiarColor,
    cambiarAcabado,
    aplicarCombinacion,
    talla,
    faltaTalla,
    elegirTalla,
  } = useConfigurador();

  const parte = PARTES.find((p) => p.id === parteActiva)!;
  const { color, acabado } = configuracion[parteActiva];

  return (
    <div className="mt-6 space-y-6">
      {/* Un grupo con nombre, como los fieldset de abajo. No es un fieldset porque su título
          (legend) no deja poner el botón "Sorpréndeme" al lado */}
      <div role="group" aria-labelledby="titulo-combinaciones">
        <div className="flex items-center justify-between gap-2">
          <p id="titulo-combinaciones" className="text-sm font-medium">
            Combinaciones listas
          </p>
          <button
            type="button"
            onClick={() => aplicarCombinacion(combinacionAlAzar())}
            className="group -my-1.5 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-marca-oscuro transition-colors hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Dado />
            Sorpréndeme
          </button>
        </div>
        {/* Una combinación queda marcada si el diseño es justo ese. Al cambiar algo
            a mano, ninguna queda marcada.
            En el celular van en una fila que se desliza de lado, para que los pasos de abajo
            se sigan viendo. La fila llega hasta los bordes del panel (-mx-4 con px-4), y el
            espacio que sobra (px-4 y py-1) es para que no se corte el borde de foco */}
        <div className="-mx-4 mt-1 flex gap-2 overflow-x-auto px-4 py-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
          {COMBINACIONES.map((combinacion) => (
            <label
              key={combinacion.nombre}
              className={`group flex shrink-0 items-center gap-2 ${estiloBoton}`}
            >
              <input
                type="radio"
                name="combinacion"
                className="sr-only"
                checked={sonIguales(configuracion, combinacion.configuracion)}
                onChange={() => aplicarCombinacion(combinacion.configuracion)}
              />
              {/* Los colores de la combinación, como una muestra. El lector de pantalla lee solo el nombre */}
              <span aria-hidden className="flex -space-x-1">
                {coloresDe(combinacion.configuracion).map((id) => (
                  <span
                    key={id}
                    className="size-3.5 rounded-full border border-black/20 ring-2 ring-white group-has-checked:border-white/40 group-has-checked:ring-stone-900"
                    style={{ backgroundColor: COLORES[id].hex }}
                  />
                ))}
              </span>
              {combinacion.nombre}
            </label>
          ))}
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">
          <Paso numero={1} />
          Parte
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PARTES.map((p) => (
            <label key={p.id} className={estiloBoton}>
              <input
                type="radio"
                name="parte"
                className="sr-only"
                checked={parteActiva === p.id}
                onChange={() => elegirParte(p.id)}
              />
              {p.nombre}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-stone-500">
          También puedes tocar una parte en la zapatilla.
        </p>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">
          <Paso numero={2} />
          Color:{" "}
          <span className="font-normal">
            {COLORES[color].nombre}
            {textoRecargo(parte.recargos?.[color])}
          </span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {parte.colores.map((id) => (
            <label
              key={id}
              title={COLORES[id].nombre + textoRecargo(parte.recargos?.[id])}
              className="relative size-11 cursor-pointer rounded-full border border-black/15 ring-stone-900 ring-offset-2 transition-shadow has-checked:ring-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-blue-600"
              style={{ backgroundColor: COLORES[id].hex }}
            >
              <input
                type="radio"
                name="color"
                className="sr-only"
                checked={color === id}
                onChange={() => cambiarColor(parteActiva, id)}
              />
              <span className="sr-only">
                {COLORES[id].nombre + textoRecargo(parte.recargos?.[id])}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">
          <Paso numero={3} />
          Acabado
        </legend>
        <div className="mt-2 flex gap-2">
          {(Object.keys(ACABADOS) as AcabadoId[]).map((id) => (
            <label key={id} className={estiloBoton}>
              <input
                type="radio"
                name="acabado"
                className="sr-only"
                checked={acabado === id}
                onChange={() => cambiarAcabado(parteActiva, id)}
              />
              {ACABADOS[id].nombre + textoRecargo(ACABADOS[id].recargo)}
            </label>
          ))}
        </div>
      </fieldset>

      {/* La talla es de toda la zapatilla, no de una parte. El id lo usa "Agregar al carrito"
          para traer este grupo a la vista si falta elegirla */}
      <fieldset id="talla">
        <legend className="text-sm font-medium">
          <Paso numero={4} />
          Talla <span className="font-normal text-stone-500">(EU)</span>
        </legend>
        {/* role="alert": el lector de pantalla lee el aviso apenas aparece */}
        {faltaTalla && (
          <p role="alert" className="mt-1 text-sm text-red-700">
            Elige tu talla para agregar la zapatilla al carrito.
          </p>
        )}
        <div className="mt-2 grid grid-cols-5 gap-2">
          {TALLAS.map((id) => (
            <label
              key={id}
              className={`relative flex h-11 cursor-pointer items-center justify-center rounded-lg border text-sm transition-colors hover:border-stone-900 has-checked:border-stone-900 has-checked:bg-stone-900 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-600 ${faltaTalla ? "border-red-400" : "border-stone-300"}`}
            >
              <input
                type="radio"
                name="talla"
                className="sr-only"
                checked={talla === id}
                onChange={() => elegirTalla(id)}
              />
              {id}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
