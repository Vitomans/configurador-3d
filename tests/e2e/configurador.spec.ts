import { expect, test, type Page } from "@playwright/test";

// Abre la página y espera a que la zapatilla termine de cargar
async function abrir(page: Page, ruta = "/") {
  await page.goto(ruta);
  await expect(page.getByText("Cargando zapatilla…")).toBeHidden();
}

const precio = (page: Page) => page.getByLabel("Precio", { exact: true });
const opcion = (page: Page, nombre: string) =>
  page.getByRole("radio", { name: nombre, exact: true });

// Los botones de radio están escondidos y encima va su etiqueta con el diseño,
// así que se hace clic en la etiqueta, como lo haría una persona
async function elegir(page: Page, nombre: string) {
  await page.locator("label", { has: opcion(page, nombre) }).click();
  await expect(opcion(page, nombre)).toBeChecked();
}

test("cambia colores y acabados, actualiza el precio y el link", async ({ page }) => {
  await abrir(page);
  await expect(precio(page)).toHaveText("US$ 120");

  await elegir(page, "Suela");
  await elegir(page, "Caramelo (+US$ 10)");
  await expect(precio(page)).toHaveText("US$ 130");

  await elegir(page, "Brillante (+US$ 8)");
  await expect(precio(page)).toHaveText("US$ 138");

  // El link de la barra de direcciones guarda el diseño
  await expect(page).toHaveURL(/\?suela=caramelo&acabado-suela=brillante$/);

  // "Copiar link" copia ese mismo link
  await page.getByRole("button", { name: "Copiar link" }).click();
  await expect(page.getByRole("button", { name: "¡Link copiado!" })).toBeVisible();
  const copiado = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiado).toBe(page.url());
});

test("abre un link compartido con el mismo diseño", async ({ page }) => {
  await abrir(page, "/?cuerpo=rojo&suela=caramelo&acabado-suela=brillante");

  await expect(precio(page)).toHaveText("US$ 138");
  await expect(opcion(page, "Rojo")).toBeChecked();

  await elegir(page, "Suela");
  await expect(opcion(page, "Caramelo (+US$ 10)")).toBeChecked();
  await expect(opcion(page, "Brillante (+US$ 8)")).toBeChecked();
});

test("ignora los valores del link que no existen", async ({ page }) => {
  await abrir(page, "/?cuerpo=morado&acabado-suela=dorado");

  await expect(precio(page)).toHaveText("US$ 120");
  await expect(opcion(page, "Azul marino")).toBeChecked();
});

test("la página no se desplaza y el precio siempre se ve", async ({ page }) => {
  await abrir(page);

  // La página mide justo lo que la pantalla: no hay barra de desplazamiento ni a lo alto ni a lo ancho
  const tamaño = await page.evaluate(() => ({
    alto: document.documentElement.scrollHeight,
    ancho: document.documentElement.scrollWidth,
    altoPantalla: window.innerHeight,
    anchoPantalla: window.innerWidth,
  }));
  expect(tamaño.alto).toBeLessThanOrEqual(tamaño.altoPantalla);
  expect(tamaño.ancho).toBeLessThanOrEqual(tamaño.anchoPantalla);

  await expect(page.getByRole("region", { name: "Vista 3D de la zapatilla" })).toBeInViewport();
  await expect(precio(page)).toBeInViewport();
  await expect(page.getByRole("button", { name: "Copiar link" })).toBeInViewport();
});
