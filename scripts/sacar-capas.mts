/**
 * Saca las fotos por capas de la zapatilla para la imagen que se ve al compartir el link
 * (ver lib/capas.ts). El 3D no se puede dibujar en el servidor, así que este script saca
 * las fotos desde la misma página:
 *
 * 1. Abre la página con el diseño inicial y una vez por cada color y acabado de cada parte,
 *    siempre con la misma cámara (con "reducir movimiento", sin entrada ni giro).
 * 2. Compara cada foto con la del diseño inicial: los píxeles que cambian cuando cambia el
 *    color del cuerpo son del cuerpo. Así sabe de qué parte es cada píxel.
 * 3. Guarda una capa por foto, solo con los píxeles de su parte, y una capa base con lo que
 *    no es de ninguna parte (el forro y la sombra en el suelo).
 *
 * Uso: con la página abierta en localhost:3000 (mejor la versión compilada: npm run build
 * y npm start), npm run capas. Hay que volver a correrlo si cambia el catálogo o el modelo.
 */
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { chromium, type Browser } from "@playwright/test";
import sharp, { type Region } from "sharp";
import { CAPA_BASE, CARPETA_CAPAS, TAMAÑO_CAPAS, nombreDeCapa } from "../lib/capas.ts";
import { ACABADOS, PARTES, type AcabadoId, type ColorId, type ParteId } from "../lib/opciones.ts";

const PAGINA = "http://localhost:3000";
// Cuánto tiene que cambiar un píxel (de 0 a 255) para contar como parte de una pieza.
// La página dibuja siempre los mismos píxeles, así que fuera de la pieza el cambio es 0
const UMBRAL = 2;

type Foto = { parte: ParteId; color: ColorId; acabado: AcabadoId; pixeles: Buffer };

// Abre la página con un diseño y saca una foto del 3D con fondo transparente, en alta resolución.
// De a una página: sin tarjeta de video, varias a la vez no alcanzan a dibujar
async function sacarFoto(navegador: Browser, parametros: string): Promise<Buffer> {
  const pagina = await navegador.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
    locale: "es-CL",
  });
  await pagina.goto(`${PAGINA}/?${parametros}`);
  await pagina.getByText("Cargando zapatilla…").waitFor({ state: "hidden", timeout: 60_000 });
  // El canvas 3D es transparente: se quitan los fondos de atrás y todo lo que va encima del visor
  // (el nombre gigante, la ayuda, "Compartir"). nextjs-portal es el botón del modo desarrollo
  await pagina.addStyleTag({
    content: `html, body, main, section { background: transparent !important }
      section > :not(:has(canvas)), nextjs-portal { visibility: hidden !important }`,
  });
  await pagina.waitForTimeout(500);
  const foto = await pagina.locator("canvas").screenshot({ omitBackground: true });
  await pagina.close();
  return foto;
}

// Recorta la foto donde está la zapatilla y la achica al tamaño de las capas.
// Devuelve los píxeles sin comprimir: 4 números por píxel (rojo, verde, azul y transparencia)
async function ajustar(foto: Buffer, recorte: Region): Promise<Buffer> {
  return sharp(foto)
    .extract(recorte)
    .resize(TAMAÑO_CAPAS.ancho, TAMAÑO_CAPAS.alto, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

// Cuánto cambió un píxel entre dos fotos. Cada color se multiplica por su transparencia:
// en un píxel casi transparente, un cambio de color casi no se ve
function cambio(a: Buffer, b: Buffer, i: number): number {
  const alfaA = a[i + 3] / 255;
  const alfaB = b[i + 3] / 255;
  let mayor = Math.abs(a[i + 3] - b[i + 3]);
  for (let canal = 0; canal < 3; canal++) {
    mayor = Math.max(mayor, Math.abs(a[i + canal] * alfaA - b[i + canal] * alfaB));
  }
  return mayor;
}

// Guarda una capa: la foto, pero transparente en los píxeles que no son de esa capa
async function guardarCapa(pixeles: Buffer, esDeLaCapa: (pixel: number) => boolean, archivo: string) {
  const capa = Buffer.from(pixeles);
  for (let pixel = 0; pixel < capa.length / 4; pixel++) {
    if (!esDeLaCapa(pixel)) capa.writeUInt32BE(0, pixel * 4);
  }
  // Con una paleta de colores, como un GIF, pesa la tercera parte y casi no se nota
  await sharp(capa, { raw: { width: TAMAÑO_CAPAS.ancho, height: TAMAÑO_CAPAS.alto, channels: 4 } })
    .png({ palette: true, quality: 90 })
    .toFile(join(CARPETA_CAPAS, archivo));
}

async function main() {
  const navegador = await chromium.launch();

  // 1. La foto del diseño inicial, y dónde está la zapatilla en ella (sharp recorta los bordes
  //    transparentes y dice cuánto recortó). Ese recorte se usa en todas las fotos
  console.log("Foto del diseño inicial...");
  const fotoInicial = await sacarFoto(navegador, "");
  const { info } = await sharp(fotoInicial).trim().toBuffer({ resolveWithObject: true });
  const recorte = {
    left: -(info.trimOffsetLeft ?? 0),
    top: -(info.trimOffsetTop ?? 0),
    width: info.width,
    height: info.height,
  };
  const inicial = await ajustar(fotoInicial, recorte);

  // Todo depende de que la página dibuje siempre los mismos píxeles con el mismo diseño.
  // Si no, las capas saldrían manchadas: se revisa con una segunda foto del diseño inicial
  const otraVez = await ajustar(await sacarFoto(navegador, ""), recorte);
  if (!otraVez.equals(inicial)) throw new Error("Dos fotos del mismo diseño salieron distintas");

  // 2. Una foto por cada color y acabado de cada parte. Las demás partes quedan como al inicio
  const pendientes = PARTES.flatMap((parte) =>
    parte.colores.flatMap((color) =>
      (Object.keys(ACABADOS) as AcabadoId[]).map((acabado) => ({ parte: parte.id, color, acabado })),
    ),
  );
  const fotos: Foto[] = [];
  for (const { parte, color, acabado } of pendientes) {
    const foto = await sacarFoto(navegador, `${parte}=${color}&acabado-${parte}=${acabado}`);
    fotos.push({ parte, color, acabado, pixeles: await ajustar(foto, recorte) });
    console.log(`${fotos.length} de ${pendientes.length}: ${nombreDeCapa(parte, color, acabado)}`);
  }
  await navegador.close();

  // 3. De qué parte es cada píxel: de la que más lo hace cambiar al cambiarle el color.
  //    En el borde entre dos partes, el píxel cambia con las dos y queda con la que cambia más
  const totalPixeles = TAMAÑO_CAPAS.ancho * TAMAÑO_CAPAS.alto;
  const dueño: (ParteId | null)[] = new Array(totalPixeles).fill(null);
  const mayorCambio = new Array(totalPixeles).fill(UMBRAL);
  for (const foto of fotos) {
    for (let pixel = 0; pixel < totalPixeles; pixel++) {
      const cuanto = cambio(foto.pixeles, inicial, pixel * 4);
      if (cuanto > mayorCambio[pixel]) {
        mayorCambio[pixel] = cuanto;
        dueño[pixel] = foto.parte;
      }
    }
  }

  // 4. Guarda las capas. La carpeta se vacía antes, para que no queden capas de colores que ya no existen
  await rm(CARPETA_CAPAS, { recursive: true, force: true });
  await mkdir(CARPETA_CAPAS, { recursive: true });
  await guardarCapa(inicial, (pixel) => dueño[pixel] === null, CAPA_BASE);
  for (const foto of fotos) {
    await guardarCapa(
      foto.pixeles,
      (pixel) => dueño[pixel] === foto.parte,
      nombreDeCapa(foto.parte, foto.color, foto.acabado),
    );
  }

  for (const parte of PARTES) {
    const pixeles = dueño.filter((cual) => cual === parte.id).length;
    console.log(`${parte.id}: ${pixeles} píxeles`);
  }
  console.log(`Listo: ${fotos.length + 1} capas en ${CARPETA_CAPAS}/`);
}

await main();
