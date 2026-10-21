import { expect, test, type Page } from "@playwright/test";
import { abrir, elegir, opcion } from "./ayudas";

const agregar = (page: Page) => page.getByRole("button", { name: "Agregar al carrito" });

test("sin talla no se agrega; con talla muestra el resumen con la foto del diseño", async ({ page }) => {
  // Recorre toda la compra y saca dos fotos del 3D: tiene el triple de tiempo que los demás
  test.slow();
  // El texto viene en minúsculas en el link: la página lo muestra en mayúsculas
  await abrir(page, "/?cuerpo=rojo&suela=caramelo&acabado-suela=brillante&texto=vm");
  await expect(page.getByLabel("Texto en el talón")).toHaveValue("VM");
  const resumen = page.getByRole("dialog", { name: "Tu pedido" });

  // Sin talla: avisa, lleva el foco a las tallas y no abre el resumen
  await agregar(page).click();
  await expect(page.getByRole("alert").filter({ hasText: "Elige tu talla" })).toBeVisible();
  await expect(opcion(page, "36")).toBeFocused();
  await expect(resumen).toBeHidden();

  // Al elegir la talla, el aviso desaparece
  await elegir(page, "42");
  await expect(page.getByRole("alert").filter({ hasText: "Elige tu talla" })).toBeHidden();

  // El resumen: la talla, cada parte y el texto con lo que suman, y el total
  await agregar(page).click();
  await expect(resumen).toBeVisible();
  await expect(resumen.getByText("Zapatilla Pisada · Talla 42")).toBeVisible();
  await expect(resumen.getByRole("listitem").filter({ hasText: "Suela" })).toContainText(
    "Caramelo · Brillante+US$ 18",
  );
  await expect(resumen.getByRole("listitem").filter({ hasText: "Texto" })).toContainText(
    "VM en el talón+US$ 5",
  );
  await expect(resumen.getByText("US$ 143")).toBeVisible();

  // La foto es cuadrada y muestra la zapatilla (desde atrás, porque lleva texto) con su cuerpo
  // rojo: se cuentan los píxeles rojos
  const imagen = resumen.getByRole("img", { name: "Foto de tu zapatilla" });
  const foto = await imagen.evaluate(async (elemento: HTMLImageElement) => {
    await elemento.decode();
    const lienzo = document.createElement("canvas");
    lienzo.width = elemento.naturalWidth;
    lienzo.height = elemento.naturalHeight;
    const dibujo = lienzo.getContext("2d")!;
    dibujo.drawImage(elemento, 0, 0);
    const { data } = dibujo.getImageData(0, 0, lienzo.width, lienzo.height);
    let rojos = 0;
    // Cada píxel son 4 números: rojo, verde, azul y transparencia
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 100 && data[i + 1] < 60 && data[i + 2] < 70) rojos++;
    }
    return { ancho: elemento.naturalWidth, alto: elemento.naturalHeight, rojos: rojos / (data.length / 4) };
  });
  expect(foto.ancho).toBe(1080);
  expect(foto.alto).toBe(1080);
  // Desde atrás se ve menos cuerpo que desde adelante: cerca del 4,6 % de la foto es rojo.
  // Sin la zapatilla, o con el cuerpo de otro color, sería casi 0 %
  expect(foto.rojos).toBeGreaterThan(0.03);

  // "Descargar imagen" baja esa misma foto, con un nombre de archivo JPG. Después la descarga se
  // cancela: guardarla en el disco tarda varios segundos y la foto ya se revisó
  const descargar = resumen.getByRole("link", { name: "Descargar imagen" });
  await expect(descargar).toHaveAttribute("href", (await imagen.getAttribute("src"))!);
  const [descarga] = await Promise.all([page.waitForEvent("download"), descargar.click()]);
  expect(descarga.suggestedFilename()).toBe("pisada-mi-zapatilla.jpg");
  await descarga.cancel();

  // "Seguir diseñando" cierra el resumen y el foco vuelve al botón que lo abrió
  await resumen.getByRole("button", { name: "Seguir diseñando" }).click();
  await expect(resumen).toBeHidden();
  await expect(agregar(page)).toBeFocused();

  // Se puede volver a abrir, y con Esc también se cierra
  await agregar(page).click();
  await expect(resumen).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(resumen).toBeHidden();
});
