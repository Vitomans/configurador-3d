import { create } from "zustand";
import {
  CONFIGURACION_INICIAL,
  type AcabadoId,
  type ColorId,
  type Configuracion,
  type ParteId,
  type Talla,
} from "@/lib/opciones";

type EstadoConfigurador = {
  configuracion: Configuracion;
  parteActiva: ParteId; // la parte que se está editando en el panel
  talla: Talla | null; // null hasta que la persona elige una
  faltaTalla: boolean; // true si apretó "Agregar al carrito" sin elegir talla
  elegirParte: (parte: ParteId) => void;
  cambiarColor: (parte: ParteId, color: ColorId) => void;
  cambiarAcabado: (parte: ParteId, acabado: AcabadoId) => void;
  cargarConfiguracion: (configuracion: Configuracion) => void; // por ejemplo, la que viene en un link
  aplicarCombinacion: (configuracion: Configuracion) => void; // una combinación lista o una al azar
  elegirTalla: (talla: Talla) => void;
  avisarQueFaltaTalla: () => void;
  // Saca una foto de la zapatilla 3D y la devuelve como imagen JPG (un data URL), o null si no
  // hay 3D. La deja lista <Fotografo>, que está dentro del canvas; el resumen del pedido la usa
  sacarFoto: () => string | null;
};

// Estado compartido entre el panel y el visor 3D. Cualquier componente puede leerlo
// con useConfigurador(...) sin tener que pasarlo de componente en componente (props).
export const useConfigurador = create<EstadoConfigurador>()((set) => ({
  configuracion: CONFIGURACION_INICIAL,
  parteActiva: "cuerpo",
  talla: null,
  faltaTalla: false,

  elegirParte: (parte) => set({ parteActiva: parte }),

  // El estado no se modifica: se crea una copia con el cambio (inmutabilidad).
  // Así React detecta que algo cambió y vuelve a dibujar.
  cambiarColor: (parte, color) =>
    set((estado) => ({
      configuracion: {
        ...estado.configuracion,
        [parte]: { ...estado.configuracion[parte], color },
      },
    })),

  cambiarAcabado: (parte, acabado) =>
    set((estado) => ({
      configuracion: {
        ...estado.configuracion,
        [parte]: { ...estado.configuracion[parte], acabado },
      },
    })),

  cargarConfiguracion: (configuracion) => set({ configuracion }),

  // Cambia todo el diseño y vuelve al cuerpo, así la cámara muestra la zapatilla completa
  aplicarCombinacion: (configuracion) => set({ configuracion, parteActiva: "cuerpo" }),

  // Al elegir una talla, el aviso de que faltaba desaparece
  elegirTalla: (talla) => set({ talla, faltaTalla: false }),

  avisarQueFaltaTalla: () => set({ faltaTalla: true }),

  // Mientras no haya 3D (cargando o sin WebGL), no hay foto
  sacarFoto: () => null,
}));
