import {
  CONFIGURACION_INICIAL,
  PARTES,
  type AcabadoId,
  type ColorId,
  type Configuracion,
} from "@/lib/opciones";

/**
 * Combinaciones listas: diseños completos que se aplican con un clic,
 * para no tener que elegir parte por parte.
 */

export type Combinacion = { nombre: string; configuracion: Configuracion };

export const COMBINACIONES: Combinacion[] = [
  // La primera es el diseño inicial: así se puede volver a él
  { nombre: "Original", configuracion: CONFIGURACION_INICIAL },
  {
    nombre: "Clásica",
    configuracion: {
      cuerpo: { color: "blanco", acabado: "mate" },
      franjas: { color: "negro", acabado: "mate" },
      suela: { color: "blanco", acabado: "mate" },
      cordones: { color: "blanco", acabado: "mate" },
      detalles: { color: "negro", acabado: "mate" },
    },
  },
  {
    // Toda negra: las franjas se distinguen del cuerpo solo por el brillo
    nombre: "Nocturna",
    configuracion: {
      cuerpo: { color: "negro", acabado: "mate" },
      franjas: { color: "negro", acabado: "brillante" },
      suela: { color: "negro", acabado: "mate" },
      cordones: { color: "negro", acabado: "mate" },
      detalles: { color: "amarillo", acabado: "mate" },
    },
  },
  {
    nombre: "Retro",
    configuracion: {
      cuerpo: { color: "blanco", acabado: "mate" },
      franjas: { color: "rojo", acabado: "mate" },
      suela: { color: "caramelo", acabado: "mate" },
      cordones: { color: "blanco", acabado: "mate" },
      detalles: { color: "rojo", acabado: "mate" },
    },
  },
  {
    nombre: "Sendero",
    configuracion: {
      cuerpo: { color: "verde-oliva", acabado: "mate" },
      franjas: { color: "naranjo", acabado: "mate" },
      suela: { color: "crema", acabado: "mate" },
      cordones: { color: "negro", acabado: "mate" },
      detalles: { color: "naranjo", acabado: "mate" },
    },
  },
];

// Si dos diseños tienen el mismo color y el mismo acabado en cada parte
export function sonIguales(a: Configuracion, b: Configuracion) {
  return PARTES.every(
    ({ id }) => a[id].color === b[id].color && a[id].acabado === b[id].acabado,
  );
}

// Los colores de un diseño, sin repetir y en el orden de las partes. Son los
// circulitos que se muestran al lado del nombre de cada combinación
export function coloresDe(configuracion: Configuracion): ColorId[] {
  return [...new Set(PARTES.map(({ id }) => configuracion[id].color))];
}

// Cuántas partes salen brillantes al azar: 1 de cada 4, para que se vea el acabado
// sin que todas brillen
const PROBABILIDAD_BRILLANTE = 0.25;

/**
 * El botón "Sorpréndeme": un color al azar de los que tiene cada parte y, a veces, brillante.
 * azar es Math.random, pero los tests le pasan números fijos para saber qué va a salir.
 */
export function combinacionAlAzar(azar: () => number = Math.random): Configuracion {
  // Un elemento al azar de una lista: azar() da un número entre 0 y 1 (sin llegar a 1)
  const unoDe = <T>(lista: T[]) => lista[Math.floor(azar() * lista.length)];
  const configuracion = { ...CONFIGURACION_INICIAL };

  // PARTES empieza por el cuerpo, así que cuando toca las franjas el cuerpo ya tiene color
  for (const parte of PARTES) {
    // Las franjas no salen del color del cuerpo, porque casi no se verían
    // (en Nocturna es a propósito: ahí se distinguen por el brillo)
    const colores =
      parte.id === "franjas"
        ? parte.colores.filter((color) => color !== configuracion.cuerpo.color)
        : parte.colores;
    const acabado: AcabadoId = azar() < PROBABILIDAD_BRILLANTE ? "brillante" : "mate";

    configuracion[parte.id] = { color: unoDe(colores), acabado };
  }

  return configuracion;
}
