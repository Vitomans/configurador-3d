import { Color, SRGBColorSpace } from "three";

// Cuánto cambia la luminosidad (de 0 a 1) de una pieza resaltada
const CAMBIO = 0.25;

/**
 * El color de una pieza resaltada (con el mouse encima o recién elegida): más claro si la pieza
 * es oscura y más oscuro si es clara. Así el resalte se nota con cualquier color: en una suela
 * blanca, aclarar no se vería.
 */
export function colorResaltado(hex: string): string {
  const color = new Color(hex);
  // getHSL separa el color en tono (h), saturación (s) y luminosidad (l, de 0 a 1).
  // Con SRGBColorSpace la luminosidad se mide como la ve el ojo y no como la calcula el 3D
  const { h, s, l } = color.getHSL({ h: 0, s: 0, l: 0 }, SRGBColorSpace);
  const nueva = l > 0.6 ? l - CAMBIO : l + CAMBIO;
  return `#${color.setHSL(h, s, nueva, SRGBColorSpace).getHexString()}`;
}
