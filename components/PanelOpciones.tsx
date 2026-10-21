"use client";

import { ACABADOS, COLORES, PARTES, type AcabadoId } from "@/lib/opciones";
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

export default function PanelOpciones() {
  const { configuracion, parteActiva, elegirParte, cambiarColor, cambiarAcabado } =
    useConfigurador();

  const parte = PARTES.find((p) => p.id === parteActiva)!;
  const { color, acabado } = configuracion[parteActiva];

  return (
    <div className="mt-6 space-y-6">
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
    </div>
  );
}
