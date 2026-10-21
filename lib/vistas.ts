/**
 * Desde dónde mira la cámara a cada parte de la zapatilla y al texto del talón. Son solo datos,
 * como el catálogo.
 *
 * La zapatilla está acostada a lo largo del eje X: el talón hacia -X y la punta hacia +X.
 * El eje Y apunta hacia arriba y el suelo está en Y = 0.
 */
import type { ParteId } from "./opciones";

type Punto = readonly [x: number, y: number, z: number];

// posicion: dónde está la cámara. objetivo: el punto al que mira
export type Vista = { posicion: Punto; objetivo: Punto };

// Lo que puede mostrar la cámara: una parte, o el talón mientras se escribe el texto
export type NombreVista = ParteId | "talon";

// Hasta dónde puede mover la cámara la persona: ni muy cerca ni muy lejos, y nunca
// desde abajo del suelo. El ángulo se mide desde arriba: 0 es mirar desde el techo
// y 90° (π / 2) es mirar desde el nivel del suelo.
export const LIMITES = {
  distanciaMinima: 2.5,
  distanciaMaxima: 7,
  anguloMaximo: Math.PI / 2 - 0.05,
};

// Dónde espera la cámara mientras carga el modelo: lejos, alta y del otro lado de la zapatilla
export const VISTA_DE_ENTRADA: Vista = { posicion: [-4.5, 3, 4], objetivo: [0, 0.6, 0] };

export const VISTAS: Record<NombreVista, Vista> = {
  // Toda la zapatilla: de frente, un poco de lado y desde arriba. Es donde termina la entrada
  cuerpo: { posicion: [3.5, 2, 3.5], objetivo: [0, 0.6, 0] },
  // Las franjas van a los costados: la cámara mira de lado
  franjas: { posicion: [0.6, 1.3, 4.3], objetivo: [0, 0.5, 0] },
  // La suela: casi a ras del suelo
  suela: { posicion: [3.2, 0.55, 2.6], objetivo: [0, 0.25, 0] },
  // Los cordones: desde arriba y un poco de lado
  cordones: { posicion: [1.5, 3.8, 2.8], objetivo: [0.1, 0.7, 0] },
  // Los tiradores y el parche del talón: desde atrás
  detalles: { posicion: [-4, 2.2, 1.8], objetivo: [-0.5, 0.75, 0] },
  // El texto del talón: casi de frente al talón y a su altura, para leerlo bien
  talon: { posicion: [-4.2, 1.3, 1], objetivo: [-1.1, 0.6, 0] },
};

// La foto del resumen del pedido, si la zapatilla lleva texto: desde atrás y un poco de lado, para
// que se lea el texto y se vea el costado. Sin texto, la foto se saca desde la vista del cuerpo
export const VISTA_DE_FOTO_CON_TEXTO: Vista = { posicion: [-4.6, 1.6, 1.8], objetivo: [-0.5, 0.6, 0] };
