import { create } from "zustand";

// En qué va la realidad aumentada de Android (WebXR):
// apagada: no hay sesión. abriendo: se pidió la cámara y el celular todavía no responde.
// buscando: no encuentra el suelo ni una mesa. lista: hay una superficie al centro de la pantalla.
// puesta: la zapatilla ya está sobre la superficie
export type EstadoRealidadAumentada = "apagada" | "abriendo" | "buscando" | "lista" | "puesta";

type Estado = {
  estado: EstadoRealidadAumentada;
  // Las dejan listas los componentes del 3D (<RealidadAumentada>), porque necesitan la escena,
  // y los usa el botón "Ver en tu espacio", que está fuera del canvas (como sacarFoto)
  // Android: abre la cámara con la zapatilla encima. capa es lo que se ve sobre la cámara
  // (los avisos y el botón para salir)
  entrar: (capa: HTMLElement) => Promise<void>;
  salir: () => void;
  // iPhone: arma el archivo USDZ de la zapatilla, con el diseño y del largo de la talla
  armarUsdz: () => Promise<Blob>;
};

const sin3d = () => Promise.reject(new Error("La zapatilla 3D todavía no está lista"));

// Mientras no haya 3D (cargando o sin WebGL), no hay realidad aumentada
export const FUNCIONES_SIN_3D = { entrar: sin3d, salir: () => {}, armarUsdz: sin3d };

export const useRealidadAumentada = create<Estado>()(() => ({
  estado: "apagada",
  ...FUNCIONES_SIN_3D,
}));
