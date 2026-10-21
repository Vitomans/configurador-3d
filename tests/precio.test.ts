import { describe, expect, it } from "vitest";
import { CONFIGURACION_INICIAL, PARTES, type Configuracion } from "@/lib/opciones";
import { calcularPrecio, formatearPrecio, recargoDeParte } from "@/lib/precio";

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

describe("recargoDeParte", () => {
  const suela = PARTES.find((parte) => parte.id === "suela")!;

  it("no suma nada si la parte es mate y su color no es especial", () => {
    expect(recargoDeParte(suela, CONFIGURACION_INICIAL)).toBe(0);
  });

  it("suma el acabado y el color especial de la misma parte", () => {
    const configuracion: Configuracion = {
      ...CONFIGURACION_INICIAL,
      suela: { color: "caramelo", acabado: "brillante" },
    };

    expect(recargoDeParte(suela, configuracion)).toBe(8 + 10);
  });

  it("el precio es la base más el recargo de cada parte", () => {
    const configuracion: Configuracion = {
      ...CONFIGURACION_INICIAL,
      cuerpo: { color: "rojo", acabado: "brillante" },
      suela: { color: "caramelo", acabado: "brillante" },
    };
    const recargos = PARTES.map((parte) => recargoDeParte(parte, configuracion));

    expect(recargos).toEqual([8, 0, 18, 0, 0]);
    expect(calcularPrecio(configuracion)).toBe(120 + 8 + 18);
  });
});

describe("formatearPrecio", () => {
  it("muestra el monto en dólares", () => {
    expect(formatearPrecio(136)).toBe("US$ 136");
  });
});
