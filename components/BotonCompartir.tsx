"use client";

import { IconoCompartir } from "@/components/Iconos";
import { useCompartir } from "@/hooks/useCompartir";

// El botón para compartir el diseño, sobre la zapatilla. Está siempre a mano,
// sin tener que elegir talla ni abrir el resumen del pedido
export default function BotonCompartir() {
  const { texto, compartir } = useCompartir();

  return (
    <button
      type="button"
      onClick={compartir}
      // Los lectores de pantalla anuncian "¡Link copiado!" cuando cambia el texto
      aria-live="polite"
      className="absolute top-3 right-3 flex cursor-pointer items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-stone-900/10 backdrop-blur transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <IconoCompartir />
      {texto}
    </button>
  );
}
