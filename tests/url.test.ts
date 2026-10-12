import { describe, expect, it } from "vitest";
import { CONFIGURACION_INICIAL, type Configuracion } from "@/lib/opciones";
import { configuracionAParametros, parametrosAConfiguracion } from "@/lib/url";

const leer = (texto: string) => parametrosAConfiguracion(new URLSearchParams(texto));

describe("configuracionAParametros", () => {
  it("deja el link limpio si no se cambió nada", () => {
    expect(configuracionAParametros(CONFIGURACION_INICIAL)).toBe("");
  });

  it("guarda solo lo que cambió respecto al diseño inicial", () => {
    const configuracion: Configuracion = {
      ...CONFIGURACION_INICIAL,
      cuerpo: { color: "rojo", acabado: "mate" },
      suela: { color: "blanco", acabado: "brillante" },
    };

    expect(configuracionAParametros(configuracion)).toBe(
      "cuerpo=rojo&acabado-suela=brillante",
    );
  });
});

describe("parametrosAConfiguracion", () => {
  it("usa el diseño inicial si el link no trae parámetros", () => {
    expect(leer("")).toEqual(CONFIGURACION_INICIAL);
  });

  it("recupera el mismo diseño que se guardó en el link", () => {
    const configuracion: Configuracion = {
      cuerpo: { color: "verde-oliva", acabado: "brillante" },
      franjas: { color: "amarillo", acabado: "mate" },
      suela: { color: "caramelo", acabado: "brillante" },
      cordones: { color: "negro", acabado: "mate" },
      detalles: { color: "celeste", acabado: "brillante" },
    };

    expect(leer(configuracionAParametros(configuracion))).toEqual(configuracion);
  });

  it("ignora colores que no existen o que no se ofrecen para esa parte", () => {
    // "morado" no existe y la suela no se vende en rojo
    const configuracion = leer("cuerpo=morado&suela=rojo&cordones=negro");

    expect(configuracion.cuerpo).toEqual(CONFIGURACION_INICIAL.cuerpo);
    expect(configuracion.suela).toEqual(CONFIGURACION_INICIAL.suela);
    expect(configuracion.cordones.color).toBe("negro");
  });

  it("ignora acabados que no existen", () => {
    expect(leer("acabado-cuerpo=dorado").cuerpo.acabado).toBe("mate");
  });

  it("ignora parámetros que no son del configurador", () => {
    expect(leer("utm_source=instagram")).toEqual(CONFIGURACION_INICIAL);
  });
});
