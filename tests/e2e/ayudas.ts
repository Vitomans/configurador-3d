import { expect, type Page } from "@playwright/test";

// Abre la página y espera a que la zapatilla termine de cargar
export async function abrir(page: Page, ruta = "/") {
  await page.goto(ruta);
  await expect(page.getByText("Cargando zapatilla…")).toBeHidden();
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
