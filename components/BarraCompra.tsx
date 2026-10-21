"use client";

import { useState } from "react";
import { IconoBolsa } from "@/components/Iconos";
import ResumenPedido from "@/components/ResumenPedido";
import { useSincronizarUrl } from "@/hooks/useSincronizarUrl";
import { calcularPrecio, formatearPrecio } from "@/lib/precio";
import { useConfigurador } from "@/store/useConfigurador";

// Si la persona pidió reducir las animaciones, la página salta en vez de deslizarse
const reducirMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// El precio total y el botón "Agregar al carrito", que abre el resumen del pedido
export default function BarraCompra() {
  useSincronizarUrl();

  const configuracion = useConfigurador((estado) => estado.configuracion);
  const [abierto, setAbierto] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);

  function agregarAlCarrito() {
    // getState() lee el store en este momento, sin que este componente tenga que escucharlo
    const { talla, avisarQueFaltaTalla, sacarFoto } = useConfigurador.getState();

    // Sin talla no se agrega: el panel muestra el aviso y se desplaza hasta las tallas
    if (talla === null) {
      avisarQueFaltaTalla();
      const tallas = document.getElementById("talla");
      tallas?.scrollIntoView({ block: "center", behavior: reducirMovimiento() ? "auto" : "smooth" });
      // El foco pasa a la primera talla, así con el teclado se elige con las flechas
      tallas?.querySelector("input")?.focus({ preventScroll: true });
      return;
    }

    // La foto se saca al abrir el resumen, con el diseño de este momento
    setFoto(sacarFoto());
    setAbierto(true);
  }

  return (
    // sticky bottom-0: queda pegado abajo del panel, así el precio siempre se ve.
    // mt-auto: si sobra espacio (en escritorio), lo empuja al fondo.
    <div className="sticky bottom-0 mt-auto flex items-center justify-between gap-4 border-t border-stone-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
      <div>
        <label htmlFor="precio" className="block text-sm text-stone-500">
          Precio
        </label>
        {/* <output> es la etiqueta de HTML para el resultado de un cálculo.
            aria-live hace que los lectores de pantalla anuncien el precio cuando cambia */}
        <output id="precio" className="letra-marca block text-2xl" aria-live="polite">
          {formatearPrecio(calcularPrecio(configuracion))}
        </output>
      </div>

      <button
        type="button"
        onClick={agregarAlCarrito}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <IconoBolsa />
        Agregar al carrito
      </button>

      <ResumenPedido abierto={abierto} foto={foto} alCerrar={() => setAbierto(false)} />
    </div>
  );
}
