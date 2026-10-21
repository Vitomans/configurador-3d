import { expect, test } from "@playwright/test";

test("la página tiene su ícono y una imagen para compartir el link", async ({ page, request }) => {
  await page.goto("/");

  // El ícono de la pestaña es la huella de la marca
  const icono = await page.locator('link[rel="icon"]').getAttribute("href");
  const respuestaIcono = await request.get(icono!);
  expect(respuestaIcono.ok()).toBe(true);
  expect(respuestaIcono.headers()["content-type"]).toContain("image/svg+xml");

  // WhatsApp, LinkedIn y otros leen la etiqueta og:image para mostrar la imagen al compartir el link
  const imagen = await page.locator('meta[property="og:image"]').getAttribute("content");
  const respuestaImagen = await request.get(imagen!);
  expect(respuestaImagen.ok()).toBe(true);
  expect(respuestaImagen.headers()["content-type"]).toBe("image/png");
});
