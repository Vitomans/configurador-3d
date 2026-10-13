import { defineConfig, devices } from "@playwright/test";

// En GitHub Actions la variable CI vale "true"
const enCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "tests/e2e",
  // En CI, si alguien deja un test.only por error, el CI falla en vez de saltarse los demás
  forbidOnly: enCI,
  // En CI se reintenta una vez, por si el navegador tarda más de la cuenta
  retries: enCI ? 1 : 0,
  reporter: enCI ? "github" : "list",
  // El CI no tiene tarjeta de video: el 3D se dibuja con el procesador y todo va más lento
  timeout: enCI ? 60_000 : 30_000,
  expect: { timeout: enCI ? 10_000 : 5_000 },
  use: {
    baseURL: "http://localhost:3000",
    locale: "es-CL",
    // Para poder leer lo que copió el botón "Copiar link"
    permissions: ["clipboard-read", "clipboard-write"],
    // La traza (capturas y pasos) sirve para ver qué pasó cuando un test falla. En CI se graba
    // solo en el segundo intento, porque grabarla hace más lenta la página
    trace: enCI ? "on-first-retry" : "retain-on-failure",
  },
  // Los mismos tests corren en una pantalla de escritorio y en un celular chico
  // (360 × 740): en una pantalla chica se notan antes los problemas de espacio
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
    { name: "celular", use: { ...devices["Galaxy S8"] } },
  ],
  // Playwright levanta la página antes de los tests. En CI usa la versión ya compilada
  // (npm run build corre antes); en local usa la de desarrollo, o la que ya esté abierta.
  webServer: {
    command: enCI ? "npm start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !enCI,
  },
});
