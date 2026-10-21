import type { AcabadoId, ColorId, ParteId } from "./opciones";

/**
 * Las fotos por capas de la zapatilla, para la imagen que se ve al compartir el link.
 *
 * El 3D no se puede dibujar en el servidor, así que las fotos se sacan antes, desde la página
 * (scripts/sacar-capas.mts): una de cada parte en cada color y acabado, con fondo transparente
 * y solo con los píxeles de esa parte. El servidor pone una encima de otra, como calcomanías,
 * y queda la zapatilla con los colores del link (app/imagen/route.tsx).
 */

export const CARPETA_CAPAS = "assets/capas";

// Todas las capas miden lo mismo y se ven desde la misma cámara, así calzan justo
export const TAMAÑO_CAPAS = { ancho: 600, alto: 478 };

// Lo que no es de ninguna parte y no cambia de color: el forro y la sombra en el suelo.
// Va debajo de las demás capas
export const CAPA_BASE = "base.png";

/** El archivo de una capa, por ejemplo "suela-caramelo-brillante.png". */
export function nombreDeCapa(parte: ParteId, color: ColorId, acabado: AcabadoId): string {
  return `${parte}-${color}-${acabado}.png`;
}
