"use client";

import { useEffect, useState } from "react";
import { useSincronizarUrl } from "@/hooks/useSincronizarUrl";
import { calcularPrecio, formatearPrecio } from "@/lib/precio";
import { useConfigurador } from "@/store/useConfigurador";

type EstadoCopia = "inicial" | "copiado" | "error";

const TEXTO_BOTON: Record<EstadoCopia, string> = {
  inicial: "Copiar link",
  copiado: "¡Link copiado!",
  error: "No se pudo copiar",
};

// El precio total y el botón para compartir el diseño
export default function Resumen() {
  useSincronizarUrl();

  const configuracion = useConfigurador((estado) => estado.configuracion);
  const [estadoCopia, setEstadoCopia] = useState<EstadoCopia>("inicial");

  // Después de 2 segundos el botón vuelve a decir "Copiar link"
  useEffect(() => {
    if (estadoCopia === "inicial") return;
    const temporizador = setTimeout(() => setEstadoCopia("inicial"), 2000);
    return () => clearTimeout(temporizador);
  }, [estadoCopia]);

  async function copiarLink() {
    try {
      // El link de la barra de direcciones ya tiene el diseño (lo mantiene useSincronizarUrl)
      await navigator.clipboard.writeText(window.location.href);
      setEstadoCopia("copiado");
    } catch {
      setEstadoCopia("error");
    }
  }

  return (
    <div className="mt-8 flex items-center justify-between gap-4 border-t border-neutral-200 pt-6">
      <div>
        <p className="text-sm text-neutral-500">Precio</p>
        {/* aria-live hace que los lectores de pantalla anuncien el precio cuando cambia */}
        <p className="text-2xl font-semibold" aria-live="polite">
          {formatearPrecio(calcularPrecio(configuracion))}
        </p>
      </div>

      <button
        type="button"
        onClick={copiarLink}
        aria-live="polite"
        className="min-w-36 cursor-pointer rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        {TEXTO_BOTON[estadoCopia]}
      </button>
    </div>
  );
}
