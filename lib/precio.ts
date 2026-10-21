import {
  ACABADOS,
  PARTES,
  PRECIO_BASE,
  RECARGO_TEXTO,
  type Configuracion,
  type Parte,
} from "@/lib/opciones";

/**
 * Cuánto le suma una parte al precio base: el recargo de su acabado y, si su color
 * es especial (como la suela caramelo), el de su color. El resumen del pedido lo
 * muestra parte por parte.
 */
export function recargoDeParte(parte: Parte, configuracion: Configuracion): number {
  const { color, acabado } = configuracion[parte.id];
  return ACABADOS[acabado].recargo + (parte.recargos?.[color] ?? 0);
}

/** Cuánto suma el texto del talón: nada si no hay texto. */
export function recargoDelTexto(texto: string): number {
  return texto ? RECARGO_TEXTO : 0;
}

/**
 * Calcula el precio de un diseño: el precio base más los recargos de cada parte
 * (por el acabado y por los colores especiales) y el del texto del talón, si tiene.
 *
 * Es una función pura: con el mismo diseño siempre devuelve el mismo
 * precio y no depende de React ni del 3D. Por eso es fácil de testear.
 */
export function calcularPrecio(configuracion: Configuracion, texto = ""): number {
  let total = PRECIO_BASE;

  for (const parte of PARTES) {
    total += recargoDeParte(parte, configuracion);
  }

  return total + recargoDelTexto(texto);
}

/** Muestra un monto en dólares, por ejemplo 136 → "US$ 136". */
export function formatearPrecio(monto: number): string {
  return `US$ ${monto}`;
}
