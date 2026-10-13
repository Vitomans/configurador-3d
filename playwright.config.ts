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
  use: {
    baseURL: "http://localhost:3000",
    locale: "es-CL",
    // Para poder leer lo que copió el botón "Copiar link"
    permissions: ["clipboard-read", "clipboard-write"],
    // Si un test falla, guarda la traza (capturas y pasos) para ver qué pasó
    trace: "retain-on-failure",
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
