import { useEffect, useMemo, useState } from "react";
import { Decal } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace, Vector3, type Mesh } from "three";
import { colorDelTexto } from "@/lib/texto";

// Dónde va el texto, en unidades de la escena (1 unidad = 10 cm): en el talón, entre el parche
// de arriba y la suela. El talón está hacia -X (ver lib/vistas.ts)
const CENTRO = new Vector3(-1.3, 0.59, 0);
// El tamaño de la calcomanía: ancho y alto, y la profundidad, que es hasta dónde alcanza a
// pegarse. El talón es curvo: tiene que llegar a los costados sin pasar al otro lado de la zapatilla
const TAMANO = new Vector3(0.6, 0.24, 0.4);
// Gira la calcomanía para que mire de frente al talón (hacia +X) y el texto se lea de izquierda a derecha
const GIRO: [number, number, number] = [0, -Math.PI / 2, 0];

// El texto se dibuja en un canvas 2D, con la misma forma que la calcomanía (2,5 veces más ancho
// que alto). Ese dibujo se pega en el 3D como una imagen (una textura)
const ANCHO = 1000;
const ALTO = 400;

// La letra de la marca: Archivo, gruesa, en cursiva y extendida, como el logo (ver globals.css)
function useLetraDeLaMarca() {
  const [familia, setFamilia] = useState<string | null>(null);

  useEffect(() => {
    // next/font le pone a la letra un nombre propio y lo guarda en la variable --font-archivo
    const nombre = getComputedStyle(document.documentElement).getPropertyValue("--font-archivo");
    // Un canvas no espera a que la letra se descargue: si no está lista, dibuja con otra.
    // Por eso se pide primero y se dibuja cuando llegó (o con la letra de respaldo, si falló)
    document.fonts.load(`italic 800 100px ${nombre}`).then(
      () => setFamilia(nombre),
      () => setFamilia("sans-serif"),
    );
  }, []);

  return familia;
}

// Dibuja el texto centrado sobre un fondo transparente y lo devuelve como textura
function dibujarTexto(texto: string, color: string, familia: string) {
  const canvas = document.createElement("canvas");
  canvas.width = ANCHO;
  canvas.height = ALTO;
  const dibujo = canvas.getContext("2d")!;

  // Las letras ocupan el 80 % del alto. Si el texto queda muy ancho, se achica hasta caber
  let tamaño = ALTO * 0.8;
  dibujo.font = `italic 800 ${tamaño}px ${familia}`;
  dibujo.fontStretch = "expanded";
  const ancho = dibujo.measureText(texto).width;
  if (ancho > ANCHO * 0.94) {
    tamaño *= (ANCHO * 0.94) / ancho;
    dibujo.font = `italic 800 ${tamaño}px ${familia}`;
  }

  // Para centrarlo a lo alto se mide cuánto sube y cuánto baja el texto desde su línea base
  const medida = dibujo.measureText(texto);
  const base = (ALTO + medida.actualBoundingBoxAscent - medida.actualBoundingBoxDescent) / 2;
  dibujo.fillStyle = color;
  dibujo.textAlign = "center";
  dibujo.fillText(texto, ANCHO / 2, base);

  const textura = new CanvasTexture(canvas);
  textura.colorSpace = SRGBColorSpace; // los colores del canvas están en sRGB, como los de la página
  return textura;
}

type Props = {
  nodo: Mesh; // la pieza del cuerpo, tal como viene en el modelo
  texto: string;
  colorDelCuerpo: string;
};

/**
 * El texto del talón, pegado al cuerpo como una calcomanía. Decal (de drei) proyecta una imagen
 * sobre la superficie, como un proyector: la imagen se dobla con la curva del talón.
 * Va dentro de la malla del cuerpo, así que se mueve y se toca junto con ella.
 */
export default function TextoTalon({ nodo, texto, colorDelCuerpo }: Props) {
  const familia = useLetraDeLaMarca();
  const color = colorDelTexto(colorDelCuerpo);

  const textura = useMemo(
    () => (familia === null ? null : dibujarTexto(texto, color, familia)),
    [texto, color, familia],
  );
  // La textura vieja se borra de la memoria de la tarjeta de video al cambiar el texto o el color
  useEffect(() => () => textura?.dispose(), [textura]);

  // El modelo está comprimido: cada pieza guarda sus puntos en su propia escala, y la malla los
  // lleva a la escena con su posición y su tamaño (ver <Pieza>). Decal trabaja con los puntos
  // de la pieza, así que el centro y el tamaño se pasan a esa escala
  const { posicion, tamano } = useMemo(
    () => ({
      posicion: CENTRO.clone().sub(nodo.position).divideScalar(nodo.scale.x),
      tamano: TAMANO.clone().divideScalar(nodo.scale.x),
    }),
    [nodo],
  );

  if (!textura) return null;

  return (
    // El nombre sirve para encontrarlo al armar el archivo para el iPhone (ver RealidadAumentada.tsx)
    <Decal name="texto-del-talon" position={posicion} rotation={GIRO} scale={tamano}>
      {/* Un material propio en vez del de Decal: con luz, como el resto de la zapatilla, y con
          depthTest, para que el texto no se vea a través de la zapatilla cuando se mira de frente.
          polygonOffset lo dibuja apenas por delante del cuerpo, para que no se mezclen */}
      <meshStandardMaterial
        map={textura}
        transparent
        polygonOffset
        polygonOffsetFactor={-10}
        roughness={0.6}
      />
    </Decal>
  );
}
