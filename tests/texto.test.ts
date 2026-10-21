import { describe, expect, it } from "vitest";
import { COLORES, PARTES } from "@/lib/opciones";
import { colorDelTexto, contraste, limpiarTexto } from "@/lib/texto";

describe("limpiarTexto", () => {
  it("pasa las letras a mayúsculas", () => {
    expect(limpiarTexto("vm")).toBe("VM");
  });

  it("deja solo letras (con la Ñ) y números", () => {
    expect(limpiarTexto("v.m")).toBe("VM");
    expect(limpiarTexto("ñ 1")).toBe("Ñ1");
    expect(limpiarTexto("<b>")).toBe("B");
  });

  it("corta el texto en 3 caracteres", () => {
    expect(limpiarTexto("ABCDEF")).toBe("ABC");
  });

  it("devuelve un texto vacío si no queda nada", () => {
    expect(limpiarTexto("")).toBe("");
    expect(limpiarTexto("!?")).toBe("");
  });
});

describe("contraste", () => {
  it("es 1 entre un color y él mismo, y 21 entre negro y blanco puros", () => {
    expect(contraste("#2b4c7e", "#2b4c7e")).toBeCloseTo(1, 2);
    expect(contraste("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("no importa el orden de los colores", () => {
    expect(contraste("#c62f35", "#f2f2f2")).toBeCloseTo(contraste("#f2f2f2", "#c62f35"), 6);
  });
});

describe("colorDelTexto", () => {
  it("va en blanco sobre un cuerpo oscuro y en negro sobre uno claro", () => {
    expect(colorDelTexto(COLORES["azul-marino"].hex)).toBe(COLORES.blanco.hex);
    expect(colorDelTexto(COLORES.blanco.hex)).toBe(COLORES.negro.hex);
  });

  // Con cualquier color del cuerpo, el texto llega al contraste que piden las pautas (4,5)
  const cuerpo = PARTES.find((parte) => parte.id === "cuerpo")!;
  it.each(cuerpo.colores.map((id) => COLORES[id]))("se lee bien sobre el $nombre", ({ hex }) => {
    expect(contraste(hex, colorDelTexto(hex))).toBeGreaterThanOrEqual(4.5);
  });
});
