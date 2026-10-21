import {
  ACABADOS,
  CONFIGURACION_INICIAL,
  PARTES,
  type AcabadoId,
  type ColorId,
  type Configuracion,
  type Parte,
} from "@/lib/opciones";
import { limpiarTexto } from "@/lib/texto";

// Nombre del parámetro del link que guarda el acabado de una parte, por ejemplo "acabado-suela"
const parametroAcabado = (parte: Parte) => `acabado-${parte.id}`;

// Nombre del parámetro del link que guarda el texto del talón, por ejemplo "texto=VM"
const PARAMETRO_TEXTO = "texto";

/**
 * Convierte el diseño (los colores, los acabados y el texto del talón) en los parámetros
 * del link, por ejemplo "cuerpo=rojo&acabado-suela=brillante&texto=VM".
 * Solo guarda lo que cambió respecto al diseño inicial, para que el link sea corto.
 */
export function configuracionAParametros(configuracion: Configuracion, texto = ""): string {
  const parametros = new URLSearchParams();

  for (const parte of PARTES) {
    const { color, acabado } = configuracion[parte.id];
    const inicial = CONFIGURACION_INICIAL[parte.id];

    if (color !== inicial.color) parametros.set(parte.id, color);
    if (acabado !== inicial.acabado) parametros.set(parametroAcabado(parte), acabado);
  }

  if (texto) parametros.set(PARAMETRO_TEXTO, texto);

  return parametros.toString();
}

/**
 * Lee el texto del talón que viene en el link. Pasa por el mismo filtro que el campo del
 * panel: "texto=v.m" queda en "VM", y si no queda nada, la zapatilla va sin texto.
 */
export function parametrosATexto(parametros: URLSearchParams): string {
  return limpiarTexto(parametros.get(PARAMETRO_TEXTO) ?? "");
}

/**
 * Hace lo contrario: lee los parámetros del link y arma el diseño.
 * Un link lo puede escribir cualquiera, así que se revisa cada valor: si no existe
 * o no corresponde (por ejemplo "suela=morado"), esa parte queda como en el diseño inicial.
 */
export function parametrosAConfiguracion(parametros: URLSearchParams): Configuracion {
  const configuracion = { ...CONFIGURACION_INICIAL };

  for (const parte of PARTES) {
    const color = parametros.get(parte.id);
    const acabado = parametros.get(parametroAcabado(parte));
    const inicial = CONFIGURACION_INICIAL[parte.id];

    configuracion[parte.id] = {
      color: esColorDeLaParte(parte, color) ? color : inicial.color,
      acabado: esAcabado(acabado) ? acabado : inicial.acabado,
    };
  }

  return configuracion;
}

// Estas funciones le dicen a TypeScript que, si devuelven true, el texto es un
// ColorId o un AcabadoId válido (se llaman "type guards").
function esColorDeLaParte(parte: Parte, valor: string | null): valor is ColorId {
  return parte.colores.some((color) => color === valor);
}

function esAcabado(valor: string | null): valor is AcabadoId {
  return valor !== null && Object.hasOwn(ACABADOS, valor);
}
