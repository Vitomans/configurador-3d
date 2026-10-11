import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No generar el archivo AGENTS.md (instrucciones para asistentes de IA) al correr "next dev"
  agentRules: false,
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
