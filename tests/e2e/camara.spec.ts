import { expect, test, type Page } from "@playwright/test";
import { abrir } from "./ayudas";

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
