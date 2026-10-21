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

test("cada diseño anuncia su propia imagen al compartir el link", async ({ request, isMobile }) => {
  test.skip(isMobile, "No usa la pantalla: basta con probarlo una vez");

  // Se pide la página como el robot de WhatsApp, que no ejecuta JavaScript: lee el HTML y nada más
  const respuesta = await request.get("/?texto=vm&cuerpo=rojo", { headers: { "user-agent": "WhatsApp/2.24.1 A" } });
  const html = await respuesta.text();

  // Las etiquetas tienen que estar en el <head>, que es donde las busca el robot
  const cabeza = html.slice(0, html.indexOf("</head>"));
  const imagen = cabeza.match(/<meta property="og:image" content="([^"]+)"/)?.[1].replaceAll("&amp;", "&");
  expect(cabeza).toContain('<meta property="og:title" content="Así quedó mi zapatilla · Pisada"');
  // El diseño va limpio y siempre en el mismo orden: el cuerpo primero, el texto al final
  expect(imagen).toBe("http://localhost:3000/imagen?cuerpo=rojo&texto=VM");

  const respuestaImagen = await request.get(imagen!);
  expect(respuestaImagen.ok()).toBe(true);
  expect(respuestaImagen.headers()["content-type"]).toBe("image/png");
});
