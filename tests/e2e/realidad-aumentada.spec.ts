import { expect, test, type Page } from "@playwright/test";
import { strFromU8, unzipSync } from "three/examples/jsm/libs/fflate.module.js";
import { codigoQr } from "../../lib/realidadAumentada";
import { abrir, elegir } from "./ayudas";

const boton = (page: Page) => page.getByRole("button", { name: "Ver en tu espacio" });

// Pasa un canal de color (de 0 a 1) de sRGB, como el de un hex, a lineal: la fórmula del estándar sRGB
const enLineal = (canal: number) => (canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4);

// Lo que guardan los navegadores falsos de abajo, para revisarlo en el test
declare global {
  interface Window {
    linkAr?: string;
    sesionPedida?: { modo: string; opciones: XRSessionInit; raizEsLaCapa: boolean };
  }
}

test("en el computador muestra un código QR con el link del diseño", async ({ page, isMobile }) => {
  test.skip(isMobile, "En el celular no se muestra el código");
  await abrir(page, "/?cuerpo=rojo&texto=vm");

  await boton(page).click();
  const dialogo = page.getByRole("dialog", { name: "Mírala en tu espacio" });
  const codigo = dialogo.getByRole("img", { name: "Código QR con el link de tu diseño" });
  await expect(codigo).toBeVisible();
  // El código es el del link de la página, que tiene el diseño
  await expect(codigo.locator("path")).toHaveAttribute("d", codigoQr(page.url()).camino);

  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
});

test("en un celular sin realidad aumentada explica qué navegador usar", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Es el caso de un celular");
  // El navegador de los tests no tiene realidad aumentada: ni WebXR ni el visor de Apple
  await abrir(page);

  await boton(page).click();
  const dialogo = page.getByRole("dialog", { name: "Mírala en tu espacio" });
  await expect(dialogo).toContainText("Este navegador no puede mostrar realidad aumentada");
  await expect(dialogo.getByRole("img")).toHaveCount(0);
});

test("en Android pide la cámara con WebXR y avisa si no se pudo abrir", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Es el caso de un celular");
  // Un WebXR falso: dice que puede mostrar realidad aumentada, guarda lo que se le pidió y
  // responde como Chrome en un celular que no es compatible con ARCore: dice que sí, pero falla al
  // pedir la sesión, con el mismo error que si faltara el permiso para usar la cámara
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "xr", {
      value: {
        isSessionSupported: async (modo: string) => modo === "immersive-ar",
        requestSession: async (modo: string, opciones: XRSessionInit) => {
          const raiz = opciones.domOverlay?.root;
          window.sesionPedida = { modo, opciones: { ...opciones, domOverlay: undefined }, raizEsLaCapa: raiz instanceof HTMLElement };
          throw new DOMException("The specified session configuration is not supported.", "NotSupportedError");
        },
      },
    });
  });
  await abrir(page);

  await boton(page).click();
  const dialogo = page.getByRole("dialog", { name: "No se pudo abrir" });
  await expect(dialogo).toContainText("Servicios de Google Play para RA");
  await expect(dialogo.getByRole("link", { name: "Ver los celulares compatibles" })).toHaveAttribute(
    "href",
    "https://developers.google.com/ar/devices",
  );
  const pedida = await page.evaluate(() => window.sesionPedida);
  expect(pedida).toEqual({
    modo: "immersive-ar",
    // hit-test para encontrar el suelo o una mesa; dom-overlay para los avisos encima de la cámara
    opciones: { requiredFeatures: ["hit-test"], optionalFeatures: ["dom-overlay"] },
    raizEsLaCapa: true,
  });
  // El botón vuelve a estar disponible para intentarlo de nuevo
  await page.keyboard.press("Escape");
  await expect(boton(page)).toBeEnabled();
});

test("en el iPhone arma el archivo USDZ con el diseño y del largo de la talla", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Es el caso de un celular");
  // El navegador de los tests no es Safari: se le hace creer que conoce los links rel="ar", y en
  // vez de abrir el visor de Apple, el link se guarda para revisar el archivo
  await page.addInitScript(() => {
    const soporta = DOMTokenList.prototype.supports;
    DOMTokenList.prototype.supports = function (valor) {
      return valor === "ar" || soporta.call(this, valor);
    };
    const clic = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      // Safari pide una imagen dentro del link
      if (this.rel === "ar" && this.querySelector("img")) window.linkAr = this.href;
      else clic.call(this);
    };
  });
  await abrir(page, "/?cuerpo=rojo&texto=vm");
  await elegir(page, "36");

  await boton(page).click();
  const link = await (await page.waitForFunction(() => window.linkAr)).jsonValue();
  // allowsContentScaling=0: la zapatilla queda de su tamaño real
  expect(link).toMatch(/^blob:.+#allowsContentScaling=0$/);

  // El archivo pasa de la página al test escrito como texto (base64): pesa más de 2 MB, y como
  // lista de números sería lentísimo
  const base64 = await page.evaluate(async (archivo) => {
    const datos = await (await fetch(archivo)).blob();
    const lector = new FileReader();
    const url = await new Promise<string>((listo) => {
      lector.onload = () => listo(lector.result as string);
      lector.readAsDataURL(datos);
    });
    return url.slice(url.indexOf(",") + 1);
  }, link!.split("#")[0]);

  // El archivo USDZ es un zip: el modelo (un texto) y las imágenes
  const archivos = unzipSync(new Uint8Array(Buffer.from(base64, "base64")));
  // Apple pide que el modelo sea el primer archivo
  expect(Object.keys(archivos)[0]).toBe("model.usda");
  const modelo = strFromU8(archivos["model.usda"]);

  // El cuerpo es rojo (#c62f35). El archivo guarda los colores en lineal y no en sRGB, como el hex
  const rojo = [0xc6, 0x2f, 0x35].map((canal) => enLineal(canal / 255));
  const colores = [...modelo.matchAll(/diffuseColor = \(([^)]+)\)/g)].map(([, rgb]) => rgb.split(", ").map(Number));
  expect(colores.some((color) => Math.hypot(...color.map((canal, i) => canal - rojo[i])) < 0.001)).toBe(true);

  // El texto del talón va como una imagen PNG, con transparencia alrededor de las letras
  expect(modelo).toContain('def Xform "textodeltalon"');
  expect(Object.keys(archivos).some((nombre) => nombre.endsWith(".png"))).toBe(true);

  // El primer giro y tamaño del archivo es el de toda la zapatilla. Su escala por el largo del
  // modelo (2,98 unidades) da el largo de una talla 36: 24 cm
  const [, fila] = modelo.match(/matrix4d xformOp:transform = \( \(([^)]+)\)/)!;
  const [x, , z] = fila.split(", ").map(Number);
  expect(Math.hypot(x, z) * 2.98).toBeCloseTo(0.24, 2);
});
