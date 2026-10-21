import { useEffect, useState } from "react";

type EstadoCompartir = "inicial" | "copiado" | "error";

const TEXTO_BOTON: Record<EstadoCompartir, string> = {
  inicial: "Compartir",
  copiado: "¡Link copiado!",
  error: "No se pudo copiar",
};

/**
 * Comparte el link del diseño. En el celular abre el menú de compartir del teléfono
 * (WhatsApp, Instagram, correo...). En el computador copia el link, y el botón avisa
 * por 2 segundos que se copió.
 */
export function useCompartir() {
  const [estado, setEstado] = useState<EstadoCompartir>("inicial");

  // Después de 2 segundos el botón vuelve a decir "Compartir"
  useEffect(() => {
    if (estado === "inicial") return;
    const temporizador = setTimeout(() => setEstado("inicial"), 2000);
    return () => clearTimeout(temporizador);
  }, [estado]);

  async function compartir() {
    // El link de la barra de direcciones ya tiene el diseño (lo mantiene useSincronizarUrl)
    const url = window.location.href;

    // navigator.share abre el menú de compartir del sistema. Solo se usa con pantalla táctil
    // (pointer: coarse): en el computador ese menú es poco común y copiar el link es más útil
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: "Mi zapatilla Pisada", text: "Mira la zapatilla que diseñé", url });
        return;
      } catch (error) {
        // La persona cerró el menú sin elegir nada: no hay que hacer nada más
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Si falló por otra razón, se copia el link
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setEstado("copiado");
    } catch {
      setEstado("error");
    }
  }

  return { texto: TEXTO_BOTON[estado], compartir };
}
