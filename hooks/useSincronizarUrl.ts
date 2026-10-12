import { useEffect } from "react";
import { configuracionAParametros, parametrosAConfiguracion } from "@/lib/url";
import { useConfigurador } from "@/store/useConfigurador";

/**
 * Mantiene el diseño y el link de la página sincronizados:
 * 1. Al abrir la página, carga el diseño que viene en el link (si trae uno).
 * 2. Desde ahí, cada cambio en el diseño actualiza el link de la barra de direcciones.
 */
export function useSincronizarUrl() {
  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    useConfigurador.getState().cargarConfiguracion(parametrosAConfiguracion(parametros));

    // subscribe avisa cada vez que cambia el estado y devuelve la función para dejar
    // de escuchar, que React llama cuando el componente desaparece.
    return useConfigurador.subscribe((estado, anterior) => {
      if (estado.configuracion === anterior.configuracion) return; // solo cambió la parte activa

      const nuevos = configuracionAParametros(estado.configuracion);
      // replaceState cambia el link sin recargar la página y sin llenar el historial
      window.history.replaceState(null, "", nuevos ? `?${nuevos}` : window.location.pathname);
    });
  }, []);
}
