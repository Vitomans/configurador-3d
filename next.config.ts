import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No generar el archivo AGENTS.md (instrucciones para asistentes de IA) al correr "next dev"
  agentRules: false,
  // La imagen para compartir lee la letra y las capas de la zapatilla del disco mientras la página
  // está publicada. Así Vercel sabe que tiene que subir esos archivos junto con ella
  outputFileTracingIncludes: {
    "/imagen": ["./assets/**/*"],
  },
  turbopack: {
    rules: {
      // Procesa los archivos CSS con Tailwind
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
