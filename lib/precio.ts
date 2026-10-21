import { ACABADOS, PARTES, PRECIO_BASE, type Configuracion, type Parte } from "@/lib/opciones";

/**
 * Cuánto le suma una parte al precio base: el recargo de su acabado y, si su color
 * es especial (como la suela caramelo), el de su color. El resumen del pedido lo
 * muestra parte por parte.
 */
export function recargoDeParte(parte: Parte, configuracion: Configuracion): number {
  const { color, acabado } = configuracion[parte.id];
  return ACABADOS[acabado].recargo + (parte.recargos?.[color] ?? 0);
}

/**
 * Calcula el precio de una configuración: el precio base más los recargos
 * de cada parte (por el acabado y por los colores especiales).
 *
 * Es una función pura: con la misma configuración siempre devuelve el mismo
 * precio y no depende de React ni del 3D. Por eso es fácil de testear.
 */
export function calcularPrecio(configuracion: Configuracion): number {
  let total = PRECIO_BASE;

  for (const parte of PARTES) {
    total += recargoDeParte(parte, configuracion);
  }

  return total;
}

/** Muestra un monto en dólares, por ejemplo 136 → "US$ 136". */
export function formatearPrecio(monto: number): string {
  return `US$ ${monto}`;
}
