import { expect, test, type Page } from "@playwright/test";
import { abrir, elegir } from "./ayudas";

const visor = (page: Page) => page.getByRole("region", { name: "Vista 3D de la zapatilla" });

// Una foto chica del centro del visor, donde está la zapatilla. Es chica para que sea rápida:
// sin tarjeta de video (como en el CI) una foto del visor completo puede tardar 2,5 s
async function fotoDelCentro(page: Page) {
  const caja = (await visor(page).boundingBox())!;
  const centro = { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };
  return page.screenshot({ clip: { x: centro.x - 100, y: centro.y - 75, width: 200, height: 150 } });
}

// Saca dos fotos con medio segundo de diferencia. Si son idénticas, la zapatilla está quieta.
// Funciona porque, con la cámara quieta, el 3D dibuja exactamente los mismos píxeles en cada cuadro.
async function estaQuieta(page: Page) {
  const antes = await fotoDelCentro(page);
  await page.waitForTimeout(500);
  const despues = await fotoDelCentro(page);
  return antes.equals(despues);
}

// Si el centro del visor se ve idéntico a una foto anterior. Es más rápido que estaQuieta:
// saca una sola foto y no espera
async function seVeIgualQue(page: Page, foto: Buffer) {
  return (await fotoDelCentro(page)).equals(foto);
}

// Cuánto esperar a que la zapatilla quede quieta: cada intento tarda casi 2 s sin tarjeta de video
const ESPERA = { timeout: 20_000 };

test("la zapatilla gira sola hasta que la tocas", async ({ page }) => {
  await abrir(page);

  // Primero entra la cámara y después la zapatilla gira sola: no está quieta
  expect(await estaQuieta(page)).toBe(false);

  // Arrastrar un poco sobre el visor, como al girarla con el mouse
  const caja = (await visor(page).boundingBox())!;
  await page.mouse.move(caja.x + caja.width * 0.3, caja.y + caja.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(caja.x + caja.width * 0.4, caja.y + caja.height * 0.5, { steps: 5 });
  await page.mouse.up();

  // La cámara frena suave y después queda quieta: ya no gira sola
  await expect.poll(() => estaQuieta(page), ESPERA).toBe(true);
});

test("con 'reducir movimiento' la zapatilla no se mueve sola", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await abrir(page);

  // La zapatilla queda quieta: no gira sola
  await expect.poll(() => estaQuieta(page), ESPERA).toBe(true);
});

test("al elegir una parte, la cámara va a mostrarla y deja de girar", async ({ page }) => {
  await abrir(page);
  expect(await estaQuieta(page)).toBe(false);

  // La cámara viaja hasta la suela y se queda ahí: la zapatilla ya no gira sola
  await elegir(page, "Suela");
  await expect.poll(() => estaQuieta(page), ESPERA).toBe(true);
});

test("cada parte tiene su vista y al volver al cuerpo se ve igual que al principio", async ({ page }) => {
  // Con 'reducir movimiento' la cámara salta de una vista a otra, sin viaje: así las fotos son exactas
  await page.emulateMedia({ reducedMotion: "reduce" });
  await abrir(page);
  await expect.poll(() => estaQuieta(page), ESPERA).toBe(true);
  const alPrincipio = await fotoDelCentro(page);

  // Se compara cuando la zapatilla queda quieta: el destello de la suela también cambia
  // la foto, aunque la cámara no se mueva
  await elegir(page, "Suela");
  await expect.poll(() => estaQuieta(page), ESPERA).toBe(true);
  expect(await seVeIgualQue(page, alPrincipio)).toBe(false);

  // Volver al cuerpo deja la cámara justo donde estaba, y la pieza con su color cuando se apaga el destello
  await elegir(page, "Cuerpo");
  await expect.poll(() => seVeIgualQue(page, alPrincipio), ESPERA).toBe(true);
});

test("la parte bajo el mouse se resalta", async ({ page, isMobile }) => {
  test.skip(isMobile, "En el celular no hay mouse");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await abrir(page);
  await expect.poll(() => estaQuieta(page), ESPERA).toBe(true);
  const sinMouse = await fotoDelCentro(page);

  // El mouse en el centro del visor, sobre la zapatilla: la parte cambia de color
  const caja = (await visor(page).boundingBox())!;
  await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
  await expect.poll(() => seVeIgualQue(page, sinMouse), ESPERA).toBe(false);

  // Al sacar el mouse, la parte vuelve a su color
  await page.mouse.move(0, 0);
  await expect.poll(() => seVeIgualQue(page, sinMouse), ESPERA).toBe(true);
});
