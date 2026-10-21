// El símbolo de la marca: la huella de una zapatilla (una "pisada"), con las ranuras de la suela.
// El mismo dibujo es el ícono de la pestaña (app/icon.svg) y va en la imagen para compartir.
// Las ranuras son líneas del color del fondo: solo se notan donde cruzan la suela blanca.
export function Huella({ tamaño }: { tamaño: number }) {
  return (
    <svg viewBox="0 0 32 32" width={tamaño} height={tamaño} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#e4572e" />
      <g transform="rotate(20 16 16)">
        <path
          d="M16 3C20.4 3 22.6 6.6 22.2 11C21.9 14.4 20.2 16.4 19.9 19.2C19.6 22 20.4 24.6 20 26.6C19.6 28.6 18 29.6 16.2 29.6C14.2 29.6 12.6 28.6 12.4 26.4C12.2 24 13 22 12.6 19.4C12.2 16.8 10 15 9.8 11.4C9.6 6.4 12.2 3 16 3Z"
          fill="#ffffff"
        />
        <path d="M8 7.5H24M8 11H24M8 14.5H24M8 22.5H24M8 25.8H24" stroke="#e4572e" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

// El logo completo: la huella y el nombre con la letra de la marca
export default function Logo() {
  return (
    <span className="flex items-center gap-2">
      <Huella tamaño={28} />
      <span className="letra-marca text-xl uppercase">Pisada</span>
    </span>
  );
}
