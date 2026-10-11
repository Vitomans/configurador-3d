/**
 * Catálogo del configurador: las partes de la zapatilla, los colores y los acabados.
 * Es solo información (datos), separada de la parte visual.
 */

// Todos los colores disponibles. La llave (por ejemplo "azul-marino") es el
// identificador que se guarda en el estado y, más adelante, en el link para compartir.
export const COLORES = {
  blanco: { nombre: "Blanco", hex: "#f2f2f2" },
  negro: { nombre: "Negro", hex: "#1f1f1f" },
  gris: { nombre: "Gris", hex: "#8a8f98" },
  "gris-claro": { nombre: "Gris claro", hex: "#c9ccd1" },
  "azul-marino": { nombre: "Azul marino", hex: "#2b4c7e" },
  celeste: { nombre: "Celeste", hex: "#5ab4e5" },
  rojo: { nombre: "Rojo", hex: "#c62f35" },
  naranjo: { nombre: "Naranjo", hex: "#e4572e" },
  amarillo: { nombre: "Amarillo", hex: "#f2c230" },
  "verde-oliva": { nombre: "Verde oliva", hex: "#5b6b3a" },
  crema: { nombre: "Crema", hex: "#efe4cf" },
  caramelo: { nombre: "Caramelo", hex: "#c68a4a" },
};

export type ColorId = keyof typeof COLORES;

export type ParteId = "cuerpo" | "franjas" | "suela" | "cordones" | "detalles";

export type Parte = {
  id: ParteId;
  nombre: string;
  colores: ColorId[]; // los colores que se pueden elegir para esta parte
};

export const PARTES: Parte[] = [
  {
    id: "cuerpo",
    nombre: "Cuerpo",
    colores: ["azul-marino", "negro", "blanco", "gris", "rojo", "verde-oliva"],
  },
  {
    id: "franjas",
    nombre: "Franjas",
    colores: ["blanco", "negro", "rojo", "naranjo", "amarillo", "celeste"],
  },
  {
    id: "suela",
    nombre: "Suela",
    colores: ["blanco", "negro", "gris-claro", "crema", "caramelo"],
  },
  {
    id: "cordones",
    nombre: "Cordones",
    colores: ["blanco", "negro", "rojo", "naranjo", "amarillo", "celeste"],
  },
  {
    id: "detalles",
    nombre: "Detalles",
    colores: ["naranjo", "negro", "blanco", "rojo", "amarillo", "celeste"],
  },
];

export type AcabadoId = "mate" | "brillante";

// La "rugosidad" (roughness) dice qué tan áspera es la superficie:
// cerca de 1 la luz se reparte (mate) y cerca de 0 se refleja como un espejo (brillante).
export const ACABADOS: Record<AcabadoId, { nombre: string; rugosidad: number }> = {
  mate: { nombre: "Mate", rugosidad: 0.85 },
  brillante: { nombre: "Brillante", rugosidad: 0.3 },
};

// Lo que eligió el usuario para cada parte
export type Configuracion = Record<ParteId, { color: ColorId; acabado: AcabadoId }>;

export const CONFIGURACION_INICIAL: Configuracion = {
  cuerpo: { color: "azul-marino", acabado: "mate" },
  franjas: { color: "blanco", acabado: "mate" },
  suela: { color: "blanco", acabado: "mate" },
  cordones: { color: "blanco", acabado: "mate" },
  detalles: { color: "naranjo", acabado: "mate" },
};

// El forro interior no se puede cambiar: siempre va en este color
export const COLOR_INTERIOR = "#3a3a3a";
