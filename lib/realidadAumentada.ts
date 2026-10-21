/**
 * Lo que necesita "Ver en tu espacio" (la realidad aumentada) y no depende del navegador:
 * el tamaño real de la zapatilla y el dibujo del código QR.
 */
import { encode } from "uqr";
import type { Talla } from "@/lib/opciones";

// Si la persona todavía no elige su talla, la zapatilla se muestra en talla 42
export const TALLA_DE_MUESTRA: Talla = 42;

// El largo de la zapatilla en centímetros. En la numeración europea, cada número de talla
// es 2/3 de centímetro (el "punto francés"): una talla 42 mide 28 cm
export function largoDeLaTalla(talla: Talla) {
  return (talla * 2) / 3;
}

// En realidad aumentada, 1 unidad de la escena es 1 metro, y el modelo mide unas 3 unidades
// de largo (en el visor, 1 unidad son 10 cm). Esto dice cuánto hay que achicarlo para que mida
// lo mismo que una zapatilla de esa talla. largoDelModelo va en unidades de la escena
export function escalaReal(largoDelModelo: number, talla: Talla) {
  return largoDeLaTalla(talla) / 100 / largoDelModelo;
}

// El margen blanco alrededor del código, en cuadritos: el estándar pide 4 para que se lea bien
const MARGEN_QR = 4;

/**
 * Arma el código QR de un texto (el link del diseño) como el camino de un SVG: un cuadrito
 * de 1 × 1 por cada módulo negro. tamaño es cuántos cuadritos mide por lado, con el margen.
 * ecc "M": el código se puede leer aunque falte o esté manchado un 15 %
 */
export function codigoQr(texto: string) {
  const { data, size } = encode(texto, { ecc: "M", border: MARGEN_QR });
  let camino = "";
  data.forEach((fila, y) => {
    fila.forEach((negro, x) => {
      // M va a la esquina del cuadrito, h1 y v1 dibujan dos lados, h-1 el tercero y z lo cierra
      if (negro) camino += `M${x} ${y}h1v1h-1z`;
    });
  });
  return { tamaño: size, camino };
}
