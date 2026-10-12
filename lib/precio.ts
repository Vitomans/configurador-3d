import { ACABADOS, PARTES, PRECIO_BASE, type Configuracion } from "@/lib/opciones";

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
    const { color, acabado } = configuracion[parte.id];
    total += ACABADOS[acabado].recargo;
    total += parte.recargos?.[color] ?? 0;
  }

  return total;
}

/** Muestra un monto en dólares, por ejemplo 136 → "US$ 136". */
export function formatearPrecio(monto: number): string {
  return `US$ ${monto}`;
}
