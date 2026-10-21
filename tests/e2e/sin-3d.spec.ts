import { expect, test } from "@playwright/test";
import { abrir, elegir, precio } from "./ayudas";

// Un navegador con WebGL apagado no puede dibujar 3D
test.use({ launchOptions: { args: ["--disable-webgl", "--disable-webgl2"] } });

test("si el navegador no puede mostrar 3D, el panel y el carrito siguen funcionando", async ({ page }) => {
  await abrir(page);

  await expect(
    page.getByRole("alert").filter({ hasText: "No se pudo mostrar la zapatilla en 3D" }),
  ).toBeVisible();

  await elegir(page, "Suela");
  await elegir(page, "Caramelo (+US$ 10)");
  await expect(precio(page)).toHaveText("US$ 130");
  await expect(page).toHaveURL(/\?suela=caramelo$/);

  // También se puede agregar al carrito: el resumen avisa que no hay foto y no ofrece descargarla
  await elegir(page, "40");
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  const resumen = page.getByRole("dialog", { name: "Tu pedido" });
  await expect(resumen.getByText("No hay foto")).toBeVisible();
  await expect(resumen.getByText("US$ 130")).toBeVisible();
  await expect(resumen.getByRole("link", { name: "Descargar imagen" })).toHaveCount(0);
});
