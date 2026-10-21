import type { ReactNode } from "react";

// Los íconos de los botones. Son solo un adorno (aria-hidden): cada botón ya dice qué hace con su texto
function Icono({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
    >
      {children}
    </svg>
  );
}

// Una flecha que sale de una caja, como el botón de compartir del celular
export function IconoCompartir() {
  return (
    <Icono>
      <path d="M12 15V3M7.5 7.5 12 3l4.5 4.5" />
      <path d="M8 11H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-2" />
    </Icono>
  );
}

export function IconoDescargar() {
  return (
    <Icono>
      <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5" />
      <path d="M5 20h14" />
    </Icono>
  );
}

// Una bolsa de compras
export function IconoBolsa() {
  return (
    <Icono>
      <path d="M5 8h14l-1 13H6L5 8Z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </Icono>
  );
}

// Un cubo entre las esquinas de un visor, como el de la cámara del celular
export function IconoRealidadAumentada() {
  return (
    <Icono>
      <path d="M3 8V4h4M17 4h4v4M21 16v4h-4M7 20H3v-4" />
      <path d="m12 7 4.5 2.5v5L12 17l-4.5-2.5v-5L12 7Z" />
      <path d="m7.5 9.5 4.5 2.5 4.5-2.5M12 12v5" />
    </Icono>
  );
}

export function IconoCerrar() {
  return (
    <Icono>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icono>
  );
}
