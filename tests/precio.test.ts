import { describe, expect, it } from "vitest";
import { CONFIGURACION_INICIAL, type Configuracion } from "@/lib/opciones";
import { calcularPrecio, formatearPrecio } from "@/lib/precio";

describe("calcularPrecio", () => {
  it("cobra solo el precio base cuando todo es mate y sin colores especiales", () => {
    expect(calcularPrecio(CONFIGURACION_INICIAL)).toBe(120);
  });

  it("suma US$ 8 por cada parte con acabado brillante", () => {
    const configuracion: Configuracion = {
      ...CONFIGURACION_INICIAL,
      cuerpo: { color: "azul-marino", acabado: "brillante" },
      cordones: { color: "blanco", acabado: "brillante" },
    };

    expect(calcularPrecio(configuracion)).toBe(120 + 8 + 8);
  });

  it("suma US$ 10 por la suela color caramelo", () => {
    const configuracion: Configuracion = {
      ...CONFIGURACION_INICIAL,
      suela: { color: "caramelo", acabado: "mate" },
    };

    expect(calcularPrecio(configuracion)).toBe(130);
  });

  it("suma todos los recargos juntos", () => {
    const todoBrillante: Configuracion = {
      cuerpo: { color: "rojo", acabado: "brillante" },
      franjas: { color: "negro", acabado: "brillante" },
      suela: { color: "caramelo", acabado: "brillante" },
      cordones: { color: "negro", acabado: "brillante" },
      detalles: { color: "amarillo", acabado: "brillante" },
    };

    expect(calcularPrecio(todoBrillante)).toBe(120 + 5 * 8 + 10);
  });
});

describe("formatearPrecio", () => {
  it("muestra el monto en dólares", () => {
    expect(formatearPrecio(136)).toBe("US$ 136");
  });
});
