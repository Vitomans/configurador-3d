import { describe, expect, it } from "vitest";
import { LIMITES, VISTA_DE_ENTRADA, VISTAS, type Vista } from "@/lib/vistas";

// Qué tan lejos está la cámara de lo que mira, y desde qué ángulo (0 es mirar desde el techo)
function medir({ posicion, objetivo }: Vista) {
  const [x, y, z] = posicion.map((valor, i) => valor - objetivo[i]);
  const distancia = Math.hypot(x, y, z);
  return { distancia, angulo: Math.acos(y / distancia) };
}

// Si una vista se sale de los límites, los controles de la cámara la corrigen y la cámara
// no termina donde se pensó: por ejemplo, más lejos o más arriba, y la parte no se ve bien
describe("VISTAS", () => {
  const vistas = [["entrada", VISTA_DE_ENTRADA] as const, ...Object.entries(VISTAS)];

  it.each(vistas)("la vista de %s respeta los límites de la cámara", (_, vista) => {
    const { distancia, angulo } = medir(vista);

    expect(distancia).toBeGreaterThanOrEqual(LIMITES.distanciaMinima);
    expect(distancia).toBeLessThanOrEqual(LIMITES.distanciaMaxima);
    expect(angulo).toBeLessThanOrEqual(LIMITES.anguloMaximo);
  });

  it("cada parte tiene una vista distinta", () => {
    const posiciones = Object.values(VISTAS).map(({ posicion }) => posicion.join());
    expect(new Set(posiciones).size).toBe(posiciones.length);
  });
});
