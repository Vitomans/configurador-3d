import { useEffect } from "react";
import { configuracionAParametros, parametrosAConfiguracion, parametrosATexto } from "@/lib/url";
import { useConfigurador } from "@/store/useConfigurador";

/**
 * Mantiene el diseño y el link de la página sincronizados:
 * 1. Al abrir la página, carga el diseño que viene en el link (si trae uno).
 * 2. Desde ahí, cada cambio en el diseño actualiza el link de la barra de direcciones.
 */
export function useSincronizarUrl() {
  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    useConfigurador
      .getState()
      .cargarDiseno(parametrosAConfiguracion(parametros), parametrosATexto(parametros));

    // subscribe avisa cada vez que cambia el estado y devuelve la función para dejar
    // de escuchar, que React llama cuando el componente desaparece.
    return useConfigurador.subscribe((estado, anterior) => {
      // Si no cambió el diseño (por ejemplo, solo la parte activa o la talla), el link sigue igual
      if (estado.configuracion === anterior.configuracion && estado.texto === anterior.texto) return;

      const nuevos = configuracionAParametros(estado.configuracion, estado.texto);
      // replaceState cambia el link sin recargar la página y sin llenar el historial
      window.history.replaceState(null, "", nuevos ? `?${nuevos}` : window.location.pathname);
    });
  }, []);
}
