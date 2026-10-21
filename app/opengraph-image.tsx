import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { Huella } from "@/components/Logo";
import { COLORES, PARTES } from "@/lib/opciones";

// La imagen que se ve al compartir el link (en WhatsApp, LinkedIn, Slack...).
// Next.js la dibuja una vez al compilar, a partir de este JSX, y agrega sola las etiquetas og:image.
// Solo entiende flexbox y estilos escritos en cada elemento: aquí no hay Tailwind.

export const alt = "Pisada: diseña tu zapatilla en 3D, elige el color de cada parte y comparte tu diseño";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// La misma letra de la marca (ver app/layout.tsx), con su licencia en assets/OFL.txt.
// Aquí va el archivo fijo de la versión extendida, gruesa y en cursiva.
const archivo = await readFile(join(process.cwd(), "assets/Archivo-ExpandedExtraBoldItalic.ttf"));

// Una foto de la zapatilla con fondo transparente. El 3D no se puede dibujar en el servidor,
// así que la foto se sacó de la página (herramienta aparte, fuera del repo)
const zapatilla = await readFile(join(process.cwd(), "assets/zapatilla.png"));
const fotoZapatilla = `data:image/png;base64,${zapatilla.toString("base64")}`;

const MARCA = "#e4572e";
const TINTA = "#1c1917"; // stone-900

// Los colores que se pueden elegir para el cuerpo, como muestra
const coloresDelCuerpo = PARTES.find((parte) => parte.id === "cuerpo")!.colores;

export default function ImagenParaCompartir() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        // El mismo fondo de estudio del visor
        backgroundImage: "radial-gradient(circle at 70% 50%, #ffffff 0%, #f3f0eb 50%, #e6e0d7 100%)",
        color: TINTA,
        fontFamily: "Archivo",
        padding: "56px 64px",
      }}
    >
      {/* El nombre gigante y casi transparente detrás de la zapatilla, como en la página */}
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 200,
          display: "flex",
          justifyContent: "center",
          fontSize: 250,
          color: "rgba(28, 25, 23, 0.05)",
        }}
      >
        PISADA
      </span>

      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Huella tamaño={60} />
          <span style={{ fontSize: 48 }}>PISADA</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 66, lineHeight: 1 }}>DISEÑA TU</span>
          <span style={{ fontSize: 66, lineHeight: 1 }}>ZAPATILLA</span>
          <span style={{ fontSize: 66, lineHeight: 1, color: MARCA }}>EN 3D</span>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            {coloresDelCuerpo.map((id) => (
              <div
                key={id}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: COLORES[id].hex,
                  border: "2px solid rgba(0, 0, 0, 0.12)",
                }}
              />
            ))}
          </div>
        </div>

        <span style={{ fontSize: 20, color: "#57534e", whiteSpace: "nowrap" }}>Demo de portafolio · Next.js · Three.js</span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- aquí no existe <Image> de Next.js */}
      <img
        src={fotoZapatilla}
        alt=""
        width={600}
        height={478}
        style={{ position: "absolute", right: 20, top: 84 }}
      />
    </div>,
    { ...size, fonts: [{ name: "Archivo", data: archivo, style: "italic", weight: 800 }] },
  );
}
