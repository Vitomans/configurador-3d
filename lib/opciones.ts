/**
 * Catálogo del configurador: las partes de la zapatilla, los colores, los acabados y los precios.
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
  recargos?: Partial<Record<ColorId, number>>; // colores especiales que cuestan más (en USD)
};

// Precio de la zapatilla sin recargos (en USD)
export const PRECIO_BASE = 120;

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
    recargos: { caramelo: 10 },
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
// El recargo se cobra por cada parte que lleva ese acabado.
export const ACABADOS: Record<
  AcabadoId,
  { nombre: string; rugosidad: number; recargo: number }
> = {
  mate: { nombre: "Mate", rugosidad: 0.85, recargo: 0 },
  brillante: { nombre: "Brillante", rugosidad: 0.3, recargo: 8 },
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

// El texto del talón: hasta 3 letras o números, como unas iniciales o el número de una camiseta.
// Es opcional y cuesta lo mismo con 1, 2 o 3 caracteres (en USD)
export const LARGO_MAXIMO_TEXTO = 3;
export const RECARGO_TEXTO = 5;

// Las tallas, en la numeración europea (la que se usa en Chile). No cambian el precio.
// "as const" hace que TypeScript sepa cuáles son: el tipo Talla es 36 | 37 | ... | 45
export const TALLAS = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45] as const;

export type Talla = (typeof TALLAS)[number];
