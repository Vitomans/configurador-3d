import { expect, test } from "@playwright/test";
import { abrir, elegir, precio } from "./ayudas";

// Un navegador con WebGL apagado no puede dibujar 3D
test.use({ launchOptions: { args: ["--disable-webgl", "--disable-webgl2"] } });

test("si el navegador no puede mostrar 3D, el panel sigue funcionando", async ({ page }) => {
  await abrir(page);

  await expect(
    page.getByRole("alert").filter({ hasText: "No se pudo mostrar la zapatilla en 3D" }),
  ).toBeVisible();

  await elegir(page, "Suela");
  await elegir(page, "Caramelo (+US$ 10)");
  await expect(precio(page)).toHaveText("US$ 130");
  await expect(page).toHaveURL(/\?suela=caramelo$/);
});
