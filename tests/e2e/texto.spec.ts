import { expect, test } from "@playwright/test";
import { abrir, ESPERA, estaQuieta, fotoDelCentro, precio, seVeIgualQue } from "./ayudas";

test("el texto del talón se ve en la zapatilla, suma al precio y va en el link", async ({ page }) => {
  // Con 'reducir movimiento' la cámara salta al talón, sin viaje: así las fotos son exactas
  await page.emulateMedia({ reducedMotion: "reduce" });
  await abrir(page);

  // Al tocar el campo, la cámara va al talón. Se espera a que quede quieta para sacar la foto
  const campo = page.getByLabel("Texto en el talón");
  await campo.click();
  await expect.poll(() => estaQuieta(page), ESPERA).toBe(true);
  const sinTexto = await fotoDelCentro(page);

  // Lo escrito queda en mayúsculas y sin signos, suma US$ 5 y va en el link
  await campo.pressSequentially("v.m");
  await expect(campo).toHaveValue("VM");
  await expect(precio(page)).toHaveText("US$ 125");
  await expect(page).toHaveURL(/\?texto=VM$/);

  // El texto aparece en el talón. Esto también prueba que la cámara fue al talón: desde la vista
  // de adelante el talón no se ve, y la foto no cambiaría
  await expect.poll(() => seVeIgualQue(page, sinTexto), ESPERA).toBe(false);

  // Al borrarlo, el precio vuelve, el link queda limpio y el talón se ve como antes
  await campo.clear();
  await expect(precio(page)).toHaveText("US$ 120");
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => seVeIgualQue(page, sinTexto), ESPERA).toBe(true);
});
