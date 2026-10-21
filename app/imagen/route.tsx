import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { Huella } from "@/components/Logo";
import { CAPA_BASE, CARPETA_CAPAS, TAMAÑO_CAPAS, nombreDeCapa } from "@/lib/capas";
import { leerDiseno, TAMAÑO_IMAGEN } from "@/lib/compartir";
import { COLORES, PARTES } from "@/lib/opciones";
import { calcularPrecio, formatearPrecio } from "@/lib/precio";
import { colorDelTexto } from "@/lib/texto";

// La imagen que se ve al compartir el link (en WhatsApp, LinkedIn, Slack...), con los colores
// del link: /imagen?cuerpo=rojo&texto=VM muestra la zapatilla roja con "VM" en el talón.
// Cada link la anuncia en su etiqueta og:image (ver lib/compartir.ts y app/page.tsx).
// Se dibuja en el servidor cada vez que se pide un diseño nuevo, a partir de este JSX.
// next/og solo entiende flexbox y estilos escritos en cada elemento: aquí no hay Tailwind.

// La misma letra de la marca (ver app/layout.tsx), con su licencia en assets/OFL.txt.
// Aquí va el archivo fijo de la versión extendida, gruesa y en cursiva
const archivo = await readFile(join(process.cwd(), "assets/Archivo-ExpandedExtraBoldItalic.ttf"));

const MARCA = "#e4572e";
const TINTA = "#1c1917"; // stone-900

// Lee una capa de la zapatilla. next/og recibe las imágenes escritas como texto (en base64)
async function leerCapa(nombre: string) {
  const datos = await readFile(join(process.cwd(), CARPETA_CAPAS, nombre));
  return `data:image/png;base64,${datos.toString("base64")}`;
}

// Un circulito de color. Si el acabado es brillante, lleva un reflejo de luz arriba a la izquierda
function Muestra({ hex, brillante = false }: { hex: string; brillante?: boolean }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: hex,
        ...(brillante && {
          backgroundImage: "radial-gradient(circle at 32% 30%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 45%)",
        }),
        border: "2px solid rgba(0, 0, 0, 0.12)",
      }}
    />
  );
}

export async function GET(request: NextRequest) {
  const { configuracion, texto, enLimpio } = leerDiseno(request.nextUrl.searchParams);
  const esPortada = !enLimpio;

  // La zapatilla: la base y encima una capa por parte, con el color y el acabado del diseño
  const capas = await Promise.all([
    leerCapa(CAPA_BASE),
    ...PARTES.map(({ id }) => {
      const { color, acabado } = configuracion[id];
      return leerCapa(nombreDeCapa(id, color, acabado));
    }),
  ]);

  const colorDelCuerpo = COLORES[configuracion.cuerpo.color].hex;
  const coloresDelCuerpo = PARTES.find((parte) => parte.id === "cuerpo")!.colores;

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

        {esPortada ? (
          // La portada: una invitación y los colores que se pueden elegir para el cuerpo
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 66, lineHeight: 1 }}>DISEÑA TU</span>
            <span style={{ fontSize: 66, lineHeight: 1 }}>ZAPATILLA</span>
            <span style={{ fontSize: 66, lineHeight: 1, color: MARCA }}>EN 3D</span>
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              {coloresDelCuerpo.map((id) => (
                <Muestra key={id} hex={COLORES[id].hex} />
              ))}
            </div>
          </div>
        ) : (
          // Un diseño: el color de cada parte, el precio y el texto del talón. El talón no se ve
          // en la foto, así que el texto va aquí, con los mismos colores que en la zapatilla
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 66, lineHeight: 1 }}>ASÍ QUEDÓ</span>
            <span style={{ fontSize: 66, lineHeight: 1, color: MARCA }}>MI DISEÑO</span>
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              {PARTES.map(({ id }) => {
                const { color, acabado } = configuracion[id];
                return <Muestra key={id} hex={COLORES[color].hex} brillante={acabado === "brillante"} />;
              })}
            </div>
            <span style={{ fontSize: 52, marginTop: 28, whiteSpace: "nowrap" }}>
              {formatearPrecio(calcularPrecio(configuracion, texto))}
            </span>
            {texto && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
                <span
                  style={{
                    fontSize: 30,
                    padding: "4px 14px",
                    borderRadius: 10,
                    backgroundColor: colorDelCuerpo,
                    color: colorDelTexto(colorDelCuerpo),
                    border: "2px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  {texto}
                </span>
                <span style={{ fontSize: 22, color: "#57534e" }}>EN EL TALÓN</span>
              </div>
            )}
          </div>
        )}

        <span style={{ fontSize: 20, color: "#57534e", whiteSpace: "nowrap" }}>Demo de portafolio · Next.js · Three.js</span>
      </div>

      {/* Las capas de la zapatilla, una encima de otra en el mismo lugar */}
      {capas.map((capa, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- aquí no existe <Image> de Next.js
        <img
          key={i}
          src={capa}
          alt=""
          width={TAMAÑO_CAPAS.ancho}
          height={TAMAÑO_CAPAS.alto}
          style={{ position: "absolute", right: 20, top: 84 }}
        />
      ))}
    </div>,
    {
      ...TAMAÑO_IMAGEN,
      fonts: [{ name: "Archivo", data: archivo, style: "italic", weight: 800 }],
      // La imagen de un link siempre es la misma, así que no hace falta volver a dibujarla:
      // el navegador la guarda un día y la red de Vercel (s-maxage) hasta un año. Cada deploy
      // empieza con la red vacía, así que si cambian las capas no queda una imagen antigua
      headers: { "cache-control": "public, max-age=86400, s-maxage=31536000" },
    },
  );
}
