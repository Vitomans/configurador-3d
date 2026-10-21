import { expect, test } from "@playwright/test";
import { abrir, elegir, opcion, precio } from "./ayudas";

test("aplica una combinación lista, una al azar y vuelve al diseño original", async ({ page }) => {
  await abrir(page);
  await expect(opcion(page, "Original")).toBeChecked();

  // Se aplica estando en otra parte: el panel vuelve al cuerpo, para mostrar la zapatilla completa
  await elegir(page, "Suela");
  await elegir(page, "Nocturna");
  await expect(opcion(page, "Cuerpo")).toBeChecked();
  await expect(opcion(page, "Negro")).toBeChecked();
  await expect(precio(page)).toHaveText("US$ 128"); // las franjas son brillantes
  await expect(page).toHaveURL(
    (url) =>
      url.search ===
      "?cuerpo=negro&franjas=negro&acabado-franjas=brillante&suela=negro&cordones=negro&detalles=amarillo",
  );

  // Al cambiar algo a mano, ya no es la combinación
  await elegir(page, "Rojo");
  await expect(opcion(page, "Nocturna")).not.toBeChecked();

  // "Sorpréndeme" arma otro diseño, así que el link cambia
  const antes = page.url();
  await page.getByRole("button", { name: "Sorpréndeme" }).click();
  await expect(page).not.toHaveURL(antes);

  // "Original" vuelve al diseño inicial y deja el link limpio
  await elegir(page, "Original");
  await expect(precio(page)).toHaveText("US$ 120");
  await expect(page).toHaveURL((url) => url.search === "");
});
