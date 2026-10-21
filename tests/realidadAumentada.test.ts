import { encode } from "uqr";
import { describe, expect, it } from "vitest";
import { TALLAS } from "@/lib/opciones";
import { codigoQr, escalaReal, largoDeLaTalla } from "@/lib/realidadAumentada";

describe("largoDeLaTalla", () => {
  it("cada número de talla es 2/3 de centímetro", () => {
    expect(largoDeLaTalla(36)).toBeCloseTo(24, 6);
    expect(largoDeLaTalla(42)).toBeCloseTo(28, 6);
    expect(largoDeLaTalla(45)).toBeCloseTo(30, 6);
  });

  it("todas las tallas miden entre 24 y 30 cm, y cada una más que la anterior", () => {
    const largos = TALLAS.map(largoDeLaTalla);
    largos.forEach((largo, i) => {
      expect(largo).toBeGreaterThanOrEqual(24);
      expect(largo).toBeLessThanOrEqual(30);
      if (i > 0) expect(largo).toBeGreaterThan(largos[i - 1]);
    });
  });
});

describe("escalaReal", () => {
  it("achica el modelo para que mida lo mismo que la talla, en metros", () => {
    // El modelo mide unas 3 unidades de largo: en talla 42 tiene que medir 0,28 m
    const escala = escalaReal(2.98, 42);
    expect(2.98 * escala).toBeCloseTo(0.28, 6);
  });

  it("un modelo el doble de largo se achica el doble", () => {
    expect(escalaReal(6, 40)).toBeCloseTo(escalaReal(3, 40) / 2, 9);
  });
});

describe("codigoQr", () => {
  const link = "https://pisada-3d.vercel.app/?cuerpo=rojo&texto=VM";

  it("dibuja un cuadrito por cada módulo negro del código", () => {
    const { tamaño, camino } = codigoQr(link);
    const { data } = encode(link, { ecc: "M", border: 4 });
    const negros = data.flat().filter(Boolean).length;

    expect(tamaño).toBe(data.length);
    expect(camino.match(/M/g)).toHaveLength(negros);
  });

  it("deja el margen blanco de 4 cuadritos que pide el estándar", () => {
    const { tamaño, camino } = codigoQr(link);
    // Lee la esquina de cada cuadrito ("M x y") y revisa que ninguno quede en el margen
    const esquinas = [...camino.matchAll(/M(\d+) (\d+)/g)].map(([, x, y]) => [Number(x), Number(y)]);
    for (const [x, y] of esquinas) {
      expect(Math.min(x, y)).toBeGreaterThanOrEqual(4);
      expect(Math.max(x, y)).toBeLessThan(tamaño - 4);
    }
  });

  it("cada link tiene su propio código", () => {
    expect(codigoQr(link).camino).not.toBe(codigoQr(`${link}&suela=negro`).camino);
  });
});
