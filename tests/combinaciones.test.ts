import { describe, expect, it } from "vitest";
import {
  COMBINACIONES,
  coloresDe,
  combinacionAlAzar,
  sonIguales,
} from "@/lib/combinaciones";
import { CONFIGURACION_INICIAL, PARTES, type Configuracion } from "@/lib/opciones";
import { configuracionAParametros, parametrosAConfiguracion } from "@/lib/url";

// Un diseño es válido si sobrevive al link: parametrosAConfiguracion cambia por el diseño
// inicial cualquier color que esa parte no ofrezca, así que el diseño no volvería igual
const esValido = (configuracion: Configuracion) =>
  sonIguales(
    parametrosAConfiguracion(new URLSearchParams(configuracionAParametros(configuracion))),
    configuracion,
  );

describe("COMBINACIONES", () => {
  it("la primera es el diseño inicial, para poder volver a él", () => {
    expect(COMBINACIONES[0].nombre).toBe("Original");
    expect(COMBINACIONES[0].configuracion).toEqual(CONFIGURACION_INICIAL);
  });

  it.each(COMBINACIONES)("$nombre solo usa colores que ofrece cada parte", ({ configuracion }) => {
    expect(esValido(configuracion)).toBe(true);
  });

  it("no hay dos con el mismo nombre ni con el mismo diseño", () => {
    const nombres = new Set(COMBINACIONES.map((c) => c.nombre));
    const disenos = new Set(COMBINACIONES.map((c) => configuracionAParametros(c.configuracion)));

    expect(nombres.size).toBe(COMBINACIONES.length);
    expect(disenos.size).toBe(COMBINACIONES.length);
  });
});

describe("sonIguales", () => {
  it("compara el color y el acabado de cada parte", () => {
    const brillante: Configuracion = {
      ...CONFIGURACION_INICIAL,
      suela: { color: "blanco", acabado: "brillante" },
    };

    expect(sonIguales(CONFIGURACION_INICIAL, { ...CONFIGURACION_INICIAL })).toBe(true);
    expect(sonIguales(CONFIGURACION_INICIAL, brillante)).toBe(false);
  });
});

describe("coloresDe", () => {
  it("da los colores del diseño sin repetir, en el orden de las partes", () => {
    expect(coloresDe(CONFIGURACION_INICIAL)).toEqual(["azul-marino", "blanco", "naranjo"]);
  });
});

describe("combinacionAlAzar", () => {
  it("con el azar en 0 elige el primer color de cada parte, todas brillantes", () => {
    const configuracion = combinacionAlAzar(() => 0);

    for (const parte of PARTES) {
      expect(configuracion[parte.id]).toEqual({ color: parte.colores[0], acabado: "brillante" });
    }
  });

  it("con el azar casi en 1 elige el último color de cada parte, todas mate", () => {
    const configuracion = combinacionAlAzar(() => 0.99);

    for (const parte of PARTES) {
      expect(configuracion[parte.id]).toEqual({ color: parte.colores.at(-1), acabado: "mate" });
    }
  });

  it("las franjas no salen del color del cuerpo", () => {
    // Con 0,2 el cuerpo sale negro (el 2.º de 6) y las franjas también saldrían negras
    // (el 2.º de 6), pero el negro se saca de la lista y sale rojo (el 2.º de los 5 que quedan)
    const configuracion = combinacionAlAzar(() => 0.2);

    expect(configuracion.cuerpo.color).toBe("negro");
    expect(configuracion.franjas.color).toBe("rojo");
  });

  it("siempre da un diseño válido", () => {
    for (let vez = 0; vez < 200; vez++) {
      const configuracion = combinacionAlAzar();

      expect(esValido(configuracion)).toBe(true);
      expect(configuracion.franjas.color).not.toBe(configuracion.cuerpo.color);
    }
  });
});
