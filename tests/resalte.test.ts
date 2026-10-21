import { Color, SRGBColorSpace } from "three";
import { describe, expect, it } from "vitest";
import { COLORES } from "@/lib/opciones";
import { colorResaltado } from "@/lib/resalte";

// El tono (h) y la luminosidad (l) de un color, de 0 a 1, como los ve el ojo
const hsl = (hex: string) => new Color(hex).getHSL({ h: 0, s: 0, l: 0 }, SRGBColorSpace);

describe("colorResaltado", () => {
  it("oscurece los colores claros", () => {
    expect(hsl(colorResaltado(COLORES.blanco.hex)).l).toBeLessThan(hsl(COLORES.blanco.hex).l);
  });

  it("aclara los colores oscuros", () => {
    expect(hsl(colorResaltado(COLORES.negro.hex)).l).toBeGreaterThan(hsl(COLORES.negro.hex).l);
  });

  it("mantiene el tono: el azul marino resaltado sigue siendo azul", () => {
    const azul = COLORES["azul-marino"].hex;
    expect(hsl(colorResaltado(azul)).h).toBeCloseTo(hsl(azul).h, 2);
  });

  // Así el resalte se nota igual con cualquier color del catálogo
  it.each(Object.values(COLORES))("cambia la luminosidad en 0,25 en el $nombre", ({ hex }) => {
    const cambio = Math.abs(hsl(colorResaltado(hex)).l - hsl(hex).l);
    expect(cambio).toBeCloseTo(0.25, 2);
  });
});
