import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // El mismo atajo que usa Next.js: "@/lib/precio" apunta a "./lib/precio"
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
