import { create } from "zustand";
import {
  CONFIGURACION_INICIAL,
  type AcabadoId,
  type ColorId,
  type Configuracion,
  type ParteId,
  type Talla,
} from "@/lib/opciones";
import { limpiarTexto } from "@/lib/texto";
import type { NombreVista } from "@/lib/vistas";

type EstadoConfigurador = {
  configuracion: Configuracion;
  texto: string; // el texto del talón, ya limpio ("" si no lleva)
  parteActiva: ParteId; // la parte que se está editando en el panel
  vista: NombreVista; // lo que muestra la cámara: la parte activa, o el talón mientras se escribe
  talla: Talla | null; // null hasta que la persona elige una
  faltaTalla: boolean; // true si apretó "Agregar al carrito" sin elegir talla
  elegirParte: (parte: ParteId) => void;
  cambiarColor: (parte: ParteId, color: ColorId) => void;
  cambiarAcabado: (parte: ParteId, acabado: AcabadoId) => void;
  cambiarTexto: (texto: string) => void;
  mirarElTalon: () => void;
  // El diseño que viene en un link: los colores, los acabados y el texto
  cargarDiseno: (configuracion: Configuracion, texto: string) => void;
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
  texto: "",
  parteActiva: "cuerpo",
  vista: "cuerpo",
  talla: null,
  faltaTalla: false,

  // La cámara va a mostrar la parte elegida
  elegirParte: (parte) => set({ parteActiva: parte, vista: parte }),

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

  // Lo escrito se guarda limpio: en mayúsculas, sin signos y con 3 caracteres como máximo
  cambiarTexto: (texto) => set({ texto: limpiarTexto(texto) }),

  // La cámara va al talón, donde se ve el texto. La parte activa del panel no cambia
  mirarElTalon: () => set({ vista: "talon" }),

  cargarDiseno: (configuracion, texto) => set({ configuracion, texto }),

  // Cambia los colores y los acabados, y vuelve al cuerpo, así la cámara muestra la zapatilla
  // completa. El texto se queda: es de la persona, no de la combinación
  aplicarCombinacion: (configuracion) =>
    set({ configuracion, parteActiva: "cuerpo", vista: "cuerpo" }),

  // Al elegir una talla, el aviso de que faltaba desaparece
  elegirTalla: (talla) => set({ talla, faltaTalla: false }),

  avisarQueFaltaTalla: () => set({ faltaTalla: true }),

  // Mientras no haya 3D (cargando o sin WebGL), no hay foto
  sacarFoto: () => null,
}));
