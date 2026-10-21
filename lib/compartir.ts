import { ACABADOS, COLORES, PARTES, type Configuracion } from "@/lib/opciones";
import { calcularPrecio, formatearPrecio } from "@/lib/precio";
import { configuracionAParametros, parametrosAConfiguracion, parametrosATexto } from "@/lib/url";

/**
 * Lo que se ve al compartir el link (en WhatsApp, LinkedIn, Slack...): el título, la descripción
 * y la imagen. WhatsApp no ejecuta el 3D: lee las etiquetas og:... del HTML y baja la imagen.
 * Por eso cada link anuncia su propia imagen, con los colores de su diseño (app/imagen/route.tsx).
 */

export const TITULO = "Pisada · Diseña tu zapatilla en 3D";
export const DESCRIPCION =
  "Diseña tu zapatilla en 3D: elige el color y el acabado de cada parte, mira el precio y comparte tu diseño con un link.";

// El tamaño que piden WhatsApp, LinkedIn y los demás para la imagen grande
export const TAMAÑO_IMAGEN = { width: 1200, height: 630 };

// Next.js entrega los parámetros del link como un objeto ({ cuerpo: "rojo" }); aquí se pasan a
// URLSearchParams, que es lo que leen las funciones de lib/url.ts. Si un parámetro viene
// repetido, llega como lista
export function aParametros(busqueda: Record<string, string | string[] | undefined>): URLSearchParams {
  const parametros = new URLSearchParams();
  for (const [nombre, valor] of Object.entries(busqueda)) {
    for (const uno of [valor ?? []].flat()) parametros.append(nombre, uno);
  }
  return parametros;
}

/**
 * Lee el diseño que trae el link, con los mismos filtros que la página. "enLimpio" es el link
 * vuelto a armar: sin valores inventados y siempre en el mismo orden. Si queda vacío, el link
 * no trae ningún diseño (es la portada).
 */
export function leerDiseno(parametros: URLSearchParams) {
  const configuracion = parametrosAConfiguracion(parametros);
  const texto = parametrosATexto(parametros);
  return { configuracion, texto, enLimpio: configuracionAParametros(configuracion, texto) };
}

// El diseño en palabras, para el texto alternativo de la imagen (lo leen los lectores de pantalla)
function describir(configuracion: Configuracion, texto: string): string {
  const partes = PARTES.map((parte) => {
    const { color, acabado } = configuracion[parte.id];
    const brillo = acabado === "brillante" ? ` ${ACABADOS.brillante.nombre.toLowerCase()}` : "";
    return `${parte.nombre}: ${COLORES[color].nombre.toLowerCase()}${brillo}.`;
  });
  if (texto) partes.push(`Texto en el talón: ${texto}.`);
  return partes.join(" ");
}

/**
 * El título, la descripción y la imagen para compartir un link. Sin diseño, son los de la portada.
 * Con diseño, la imagen lleva el diseño en su dirección: "/imagen?cuerpo=rojo&texto=VM".
 */
export function datosParaCompartir(parametros: URLSearchParams) {
  const { configuracion, texto, enLimpio } = leerDiseno(parametros);

  if (!enLimpio) {
    return {
      titulo: TITULO,
      descripcion: DESCRIPCION,
      imagen: "/imagen",
      alt: "Pisada: diseña tu zapatilla en 3D, elige el color de cada parte y comparte tu diseño",
    };
  }

  const precio = formatearPrecio(calcularPrecio(configuracion, texto));
  return {
    titulo: "Así quedó mi zapatilla · Pisada",
    descripcion: `La diseñé en Pisada y cuesta ${precio}. Ábrela para verla en 3D y cambiarle lo que quieras.`,
    imagen: `/imagen?${enLimpio}`,
    alt: `Mi zapatilla Pisada, de ${precio}. ${describir(configuracion, texto)}`,
  };
}
