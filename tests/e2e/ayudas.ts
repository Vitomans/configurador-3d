import { expect, type Page } from "@playwright/test";

// Abre la página y espera a que la zapatilla termine de cargar. Sin tarjeta de video
// (como en el CI) puede tardar varios segundos, así que se le da más tiempo
export async function abrir(page: Page, ruta = "/") {
  await page.goto(ruta);
  await expect(page.getByText("Cargando zapatilla…")).toBeHidden({ timeout: 30_000 });
}

export const precio = (page: Page) => page.getByLabel("Precio", { exact: true });

export const opcion = (page: Page, nombre: string) =>
  page.getByRole("radio", { name: nombre, exact: true });

// Los botones de radio están escondidos y encima va su etiqueta con el diseño,
// así que se hace clic en la etiqueta, como lo haría una persona
export async function elegir(page: Page, nombre: string) {
  await page.locator("label", { has: opcion(page, nombre) }).click();
  await expect(opcion(page, nombre)).toBeChecked();
}

export const visor = (page: Page) => page.getByRole("region", { name: "Vista 3D de la zapatilla" });

// Una foto chica del centro del visor, donde está la zapatilla. Es chica para que sea rápida:
// sin tarjeta de video (como en el CI) una foto del visor completo puede tardar 2,5 s
export async function fotoDelCentro(page: Page) {
  const caja = (await visor(page).boundingBox())!;
  const centro = { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };
  return page.screenshot({ clip: { x: centro.x - 100, y: centro.y - 75, width: 200, height: 150 } });
}

// Saca dos fotos con medio segundo de diferencia. Si son idénticas, la zapatilla está quieta.
// Funciona porque, con la cámara quieta, el 3D dibuja exactamente los mismos píxeles en cada cuadro.
export async function estaQuieta(page: Page) {
  const antes = await fotoDelCentro(page);
  await page.waitForTimeout(500);
  const despues = await fotoDelCentro(page);
  return antes.equals(despues);
}

// Si el centro del visor se ve idéntico a una foto anterior. Es más rápido que estaQuieta:
// saca una sola foto y no espera
export async function seVeIgualQue(page: Page, foto: Buffer) {
  return (await fotoDelCentro(page)).equals(foto);
}

// Cuánto esperar a que la zapatilla quede quieta: cada intento tarda casi 2 s sin tarjeta de video
export const ESPERA = { timeout: 20_000 };
