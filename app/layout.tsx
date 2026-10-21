import type { Metadata } from "next";
import { Archivo, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// La letra de la marca. Es "variable": un solo archivo trae todos los grosores y anchos
// (el eje "wdth"), así la página puede usar la versión extendida (ver globals.css)
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  style: ["italic"],
  axes: ["wdth"],
});

const TITULO = "Pisada · Diseña tu zapatilla en 3D";
const DESCRIPCION =
  "Diseña tu zapatilla en 3D: elige el color y el acabado de cada parte, mira el precio y comparte tu diseño con un link.";

export const metadata: Metadata = {
  // La dirección de la página publicada, para que la imagen para compartir tenga una dirección completa.
  // Vercel la entrega en VERCEL_PROJECT_PRODUCTION_URL (sin https://); en local es localhost.
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: TITULO,
  description: DESCRIPCION,
  // Lo que se ve al compartir el link. La imagen es app/opengraph-image.tsx.
  openGraph: {
    type: "website",
    siteName: "Pisada",
    locale: "es_CL",
    title: TITULO,
    description: DESCRIPCION,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${archivo.variable}`}>
      <body className="bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
