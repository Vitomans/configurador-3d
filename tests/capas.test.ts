import { readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { CAPA_BASE, CARPETA_CAPAS, TAMAÑO_CAPAS, nombreDeCapa } from "@/lib/capas";
import { ACABADOS, PARTES, type AcabadoId } from "@/lib/opciones";

// Si un test de aquí falla, hay que volver a sacar las capas: npm run capas (ver scripts/sacar-capas.mts)

const esperadas = [
  CAPA_BASE,
  ...PARTES.flatMap((parte) =>
    parte.colores.flatMap((color) =>
      (Object.keys(ACABADOS) as AcabadoId[]).map((acabado) => nombreDeCapa(parte.id, color, acabado)),
    ),
  ),
];

describe("las capas de la zapatilla", () => {
  it("hay una por cada color y acabado de cada parte, más la base, y ninguna de sobra", async () => {
    const archivos = await readdir(CARPETA_CAPAS);
    expect(archivos.toSorted()).toEqual(esperadas.toSorted());
  });

  it("todas miden lo mismo y tienen algo dibujado", async () => {
    for (const archivo of esperadas) {
      const imagen = sharp(join(CARPETA_CAPAS, archivo));
      const { width, height } = await imagen.metadata();
      expect({ archivo, ancho: width, alto: height }).toEqual({ archivo, ...TAMAÑO_CAPAS });

      // channels[3] es la transparencia: si su máximo es 0, la capa está vacía
      const { channels } = await imagen.stats();
      expect(channels[3].max, archivo).toBeGreaterThan(0);
    }
  });
});
