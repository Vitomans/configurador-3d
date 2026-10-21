import { NextRequest } from "next/server";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/imagen/route";

// Pide la imagen para compartir de un link, como lo haría WhatsApp
async function pedir(link: string) {
  const respuesta = await GET(new NextRequest(`http://localhost:3000/imagen${link}`));
  return { respuesta, imagen: Buffer.from(await respuesta.arrayBuffer()) };
}

// Cuántos píxeles de la imagen son rojos (como el cuerpo rojo, con sus luces y sombras)
async function pixelesRojos(imagen: Buffer) {
  const { data } = await sharp(imagen).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let rojos = 0;
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (r > 100 && r > 2.5 * g && r > 2.5 * b) rojos++;
  }
  return rojos;
}

describe("la imagen para compartir", () => {
  it("es un PNG de 1200 × 630 que pesa menos de 300 KB, el máximo seguro para WhatsApp", async () => {
    const { respuesta, imagen } = await pedir("?cuerpo=rojo&acabado-suela=brillante&texto=VM");

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get("content-type")).toBe("image/png");
    const { width, height, format } = await sharp(imagen).metadata();
    expect({ width, height, format }).toEqual({ width: 1200, height: 630, format: "png" });
    expect(imagen.length).toBeLessThan(300 * 1024);
  });

  it("dibuja la zapatilla con los colores del link", async () => {
    const inicial = await pixelesRojos((await pedir("")).imagen);
    const conCuerpoRojo = await pixelesRojos((await pedir("?cuerpo=rojo")).imagen);

    // El cuerpo ocupa buena parte de la foto: con el cuerpo rojo hay miles de píxeles rojos más
    expect(conCuerpoRojo - inicial).toBeGreaterThan(20_000);
  });

  it("un link con valores inventados se dibuja como la portada", async () => {
    const portada = (await pedir("")).imagen;
    const inventado = (await pedir("?cuerpo=morado&otra=cosa")).imagen;

    expect(inventado.equals(portada)).toBe(true);
  });
});
