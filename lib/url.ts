import {
  ACABADOS,
  CONFIGURACION_INICIAL,
  PARTES,
  type AcabadoId,
  type ColorId,
  type Configuracion,
  type Parte,
} from "@/lib/opciones";

// Nombre del parámetro del link que guarda el acabado de una parte, por ejemplo "acabado-suela"
const parametroAcabado = (parte: Parte) => `acabado-${parte.id}`;

/**
 * Convierte el diseño en los parámetros del link, por ejemplo
 * "cuerpo=rojo&acabado-suela=brillante".
 * Solo guarda lo que cambió respecto al diseño inicial, para que el link sea corto.
 */
export function configuracionAParametros(configuracion: Configuracion): string {
  const parametros = new URLSearchParams();

  for (const parte of PARTES) {
    const { color, acabado } = configuracion[parte.id];
    const inicial = CONFIGURACION_INICIAL[parte.id];

    if (color !== inicial.color) parametros.set(parte.id, color);
    if (acabado !== inicial.acabado) parametros.set(parametroAcabado(parte), acabado);
  }

  return parametros.toString();
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
