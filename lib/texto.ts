import { Color } from "three";
import { COLORES, LARGO_MAXIMO_TEXTO } from "./opciones";

/**
 * El texto que se imprime en el talón de la zapatilla.
 */

/**
 * Deja el texto como se imprime: en mayúsculas, solo letras (con la Ñ) y números, y con 3
 * caracteres como máximo. Por ejemplo "v.m!" → "VM".
 *
 * Se usa al escribir en el panel y al leer el link: así un link escrito a mano termina
 * igual que si se hubiera escrito en el panel.
 */
export function limpiarTexto(valor: string): string {
  return valor
    .toUpperCase()
    .replace(/[^A-Z0-9Ñ]/g, "")
    .slice(0, LARGO_MAXIMO_TEXTO);
}

// Qué tan claro ve el ojo un color, de 0 (negro) a 1 (blanco). Es la fórmula de las pautas de
// accesibilidad (WCAG). Pide el color en su forma "lineal", que es justo como lo guarda three.js
function luminancia(hex: string) {
  const { r, g, b } = new Color(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * El contraste entre dos colores, como lo mide WCAG: de 1 (el mismo color) a 21 (negro sobre
 * blanco). Para que un texto se lea bien, las pautas piden al menos 4,5.
 */
export function contraste(hexA: string, hexB: string): number {
  const [clara, oscura] = [luminancia(hexA), luminancia(hexB)].sort((a, b) => b - a);
  return (clara + 0.05) / (oscura + 0.05);
}

/**
 * El color del texto: blanco o negro (los del catálogo), el que más contraste tenga con el
 * color del cuerpo. Así se lee con cualquier diseño: blanco sobre azul marino, negro sobre blanco.
 */
export function colorDelTexto(colorDelCuerpo: string): string {
  const { blanco, negro } = COLORES;
  return contraste(colorDelCuerpo, blanco.hex) >= contraste(colorDelCuerpo, negro.hex)
    ? blanco.hex
    : negro.hex;
}
