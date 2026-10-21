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

export const metadata: Metadata = {
  title: "Pisada · Configurador 3D de zapatillas",
  description:
    "Diseña tu zapatilla en 3D: elige el color y el material de cada parte y comparte tu diseño con un link.",
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
