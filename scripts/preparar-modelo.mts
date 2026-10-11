/**
 * Prepara el modelo 3D de la zapatilla para el configurador.
 *
 * El modelo original ("Materials Variants Shoe", © 2021 Shopify, licencia CC BY 4.0)
 * viene en una sola malla: el color de cada parte está pintado en una imagen (textura).
 * Para poder cambiar el color de cada parte por separado, este script:
 *
 * 1. Descarga el modelo original.
 * 2. Mira de qué color es cada triángulo en las 3 versiones de color del modelo
 *    y elige la parte cuyo color de referencia se parece más.
 * 3. Junta los triángulos que se tocan en piezas (un cordón, una franja, la suela...)
 *    y le da a cada pieza la parte que tiene la mayoría de sus triángulos.
 * 4. Crea una malla por parte, con su propio material sin textura de color.
 * 5. Comprime la geometría y las texturas para que cargue rápido en el celular.
 *
 * Uso: npm run modelo
 */
import { mkdir } from "node:fs/promises";
import { NodeIO, Primitive, Texture } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  clearNodeTransform,
  flatten,
  meshopt,
  prune,
  textureCompress,
} from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

const URL_ORIGINAL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb";
const SALIDA = "public/modelos/zapatilla.glb";

// Las 3 versiones de color que trae el modelo original
const VERSIONES = ["Midnight", "Beach", "Street"] as const;

// Color de referencia de cada grupo de triángulos en cada versión (RGB de 0 a 255),
// en el mismo orden que VERSIONES. Se midieron agrupando los colores del modelo original.
const REFERENCIAS: { parte: string; colores: number[][] }[] = [
  { parte: "suela", colores: [[225, 225, 225], [225, 225, 225], [225, 225, 225]] },
  { parte: "cordones", colores: [[44, 43, 42], [44, 43, 42], [45, 43, 42]] },
  { parte: "cuerpo", colores: [[59, 142, 179], [204, 165, 166], [43, 43, 43]] },
  { parte: "cuerpo", colores: [[17, 98, 140], [182, 146, 146], [41, 41, 41]] },
  { parte: "franjas", colores: [[2, 43, 67], [128, 88, 90], [219, 66, 78]] },
  // Tiradores (las argollas para ponerse la zapatilla) y parche del talón
  { parte: "detalles", colores: [[50, 126, 164], [197, 167, 167], [197, 197, 197]] },
  { parte: "detalles", colores: [[14, 18, 21], [21, 16, 15], [30, 12, 13]] },
];

// Las piezas de tela (el cuerpo y la lengüeta) tienen un forro gris por dentro.
// Si al menos este porcentaje de una pieza es "cuerpo", se trata como tela.
const MINIMO_TELA = 0.25;

type Imagen = { pixeles: Buffer; ancho: number; alto: number };

async function decodificar(textura: Texture): Promise<Imagen> {
  const { data, info } = await sharp(textura.getImage()!)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { pixeles: data, ancho: info.width, alto: info.height };
}

// Devuelve el color [r, g, b] de la imagen en la coordenada de textura (u, v)
function colorEn(imagen: Imagen, u: number, v: number): number[] {
  const x = Math.min(imagen.ancho - 1, Math.floor(u * imagen.ancho));
  const y = Math.min(imagen.alto - 1, Math.floor(v * imagen.alto));
  const i = (y * imagen.ancho + x) * 3;
  return [imagen.pixeles[i], imagen.pixeles[i + 1], imagen.pixeles[i + 2]];
}

// Busca la referencia cuyos colores se parecen más a los colores medidos
function parteMasParecida(colores: number[][]): string {
  let mejor = REFERENCIAS[0];
  let menorDistancia = Infinity;
  for (const referencia of REFERENCIAS) {
    let distancia = 0;
    referencia.colores.forEach((color, version) => {
      color.forEach((canal, c) => {
        distancia += (canal - colores[version][c]) ** 2;
      });
    });
    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      mejor = referencia;
    }
  }
  return mejor.parte;
}

// Junta los triángulos que se tocan en piezas. Devuelve, para cada triángulo,
// el número de la pieza a la que pertenece.
function separarEnPiezas(indices: ArrayLike<number>, posiciones: ArrayLike<number>) {
  // El modelo repite vértices en la misma posición (en las costuras de la textura),
  // así que los vértices se identifican por su posición.
  const puntoPorPosicion = new Map<string, number>();
  const puntoDeVertice: number[] = [];
  for (let v = 0; v < posiciones.length / 3; v++) {
    const clave = [0, 1, 2].map((eje) => posiciones[v * 3 + eje].toFixed(5)).join(",");
    if (!puntoPorPosicion.has(clave)) puntoPorPosicion.set(clave, puntoPorPosicion.size);
    puntoDeVertice.push(puntoPorPosicion.get(clave)!);
  }

  // Cada punto apunta a otro de su misma pieza; siguiendo la cadena se llega al
  // "representante" de la pieza (algoritmo union-find).
  const siguiente = Array.from({ length: puntoPorPosicion.size }, (_, i) => i);
  const representante = (punto: number) => {
    while (siguiente[punto] !== punto) punto = siguiente[punto];
    return punto;
  };
  for (let t = 0; t < indices.length; t += 3) {
    const a = representante(puntoDeVertice[indices[t]]);
    siguiente[representante(puntoDeVertice[indices[t + 1]])] = a;
    siguiente[representante(puntoDeVertice[indices[t + 2]])] = a;
  }

  const piezas: number[] = [];
  for (let t = 0; t < indices.length; t += 3) {
    piezas.push(representante(puntoDeVertice[indices[t]]));
  }
  return piezas;
}

async function main() {
  await MeshoptEncoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.encoder": MeshoptEncoder });

  console.log("Descargando el modelo original...");
  const respuesta = await fetch(URL_ORIGINAL);
  if (!respuesta.ok) throw new Error(`No se pudo descargar: ${respuesta.status}`);
  const documento = await io.readBinary(new Uint8Array(await respuesta.arrayBuffer()));
  const raiz = documento.getRoot();

  // Agranda el modelo 10 veces (mide 30 cm y queda de 3 unidades) para usar números
  // cómodos en la escena, y deja su posición y tamaño "horneados" en la geometría.
  const escena = raiz.listScenes()[0];
  const contenedor = documento.createNode("contenedor").setScale([10, 10, 10]);
  for (const hijo of escena.listChildren()) {
    escena.removeChild(hijo);
    contenedor.addChild(hijo);
  }
  escena.addChild(contenedor);
  await documento.transform(flatten());
  const nodoOriginal = raiz.listNodes().find((nodo) => nodo.getMesh())!;
  clearNodeTransform(nodoOriginal);

  const original = nodoOriginal.getMesh()!.listPrimitives()[0];
  const materialOriginal = original.getMaterial()!;
  const indices = original.getIndices()!.getArray()!;
  const uv = original.getAttribute("TEXCOORD_0")!.getArray()!;
  const posiciones = original.getAttribute("POSITION")!.getArray()!;

  // Decodifica la textura de color de cada versión
  const imagenes: Imagen[] = [];
  for (const version of VERSIONES) {
    const textura = raiz
      .listTextures()
      .find((t) => t.getName().includes(`diffuse${version}`))!;
    imagenes.push(await decodificar(textura));
  }

  // Paso 1: la parte de cada triángulo, según el color en el centro del triángulo
  const partePorColor: string[] = [];
  for (let t = 0; t < indices.length; t += 3) {
    const vertices = [indices[t], indices[t + 1], indices[t + 2]];
    const u = vertices.reduce((suma, v) => suma + uv[v * 2], 0) / 3;
    const v = vertices.reduce((suma, v) => suma + uv[v * 2 + 1], 0) / 3;
    partePorColor.push(parteMasParecida(imagenes.map((imagen) => colorEn(imagen, u, v))));
  }

  // Paso 2: cuenta cuántos triángulos de cada parte tiene cada pieza
  const piezaDeTriangulo = separarEnPiezas(indices, posiciones);
  const votosPorPieza = new Map<number, Map<string, number>>();
  piezaDeTriangulo.forEach((pieza, t) => {
    if (!votosPorPieza.has(pieza)) votosPorPieza.set(pieza, new Map());
    const votos = votosPorPieza.get(pieza)!;
    votos.set(partePorColor[t], (votos.get(partePorColor[t]) ?? 0) + 1);
  });

  // Paso 3: la parte final de cada triángulo
  const triangulosPorParte = new Map<string, number[]>();
  piezaDeTriangulo.forEach((pieza, t) => {
    const votos = votosPorPieza.get(pieza)!;
    const total = [...votos.values()].reduce((suma, n) => suma + n, 0);
    let parte: string;
    if ((votos.get("cuerpo") ?? 0) / total >= MINIMO_TELA) {
      // Pieza de tela: lo que no es cuerpo es el forro de adentro
      parte = partePorColor[t] === "cuerpo" ? "cuerpo" : "interior";
    } else {
      // Cualquier otra pieza: la parte con más triángulos se queda con toda la pieza
      parte = [...votos.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }
    if (!triangulosPorParte.has(parte)) triangulosPorParte.set(parte, []);
    triangulosPorParte.get(parte)!.push(indices[t * 3], indices[t * 3 + 1], indices[t * 3 + 2]);
  });

  // Crea una malla por parte. Todas comparten los vértices del modelo original
  // y conservan el relieve (normalTexture) y las sombras suaves (occlusionTexture).
  const buffer = raiz.listBuffers()[0];
  for (const [parte, triangulos] of triangulosPorParte) {
    const material = documento
      .createMaterial(parte)
      .setBaseColorFactor([1, 1, 1, 1])
      .setRoughnessFactor(0.8)
      .setMetallicFactor(0)
      .setNormalTexture(materialOriginal.getNormalTexture())
      .setOcclusionTexture(materialOriginal.getOcclusionTexture());

    const primitiva = documento
      .createPrimitive()
      .setMode(Primitive.Mode.TRIANGLES)
      .setIndices(
        documento
          .createAccessor()
          .setType("SCALAR")
          .setArray(new Uint32Array(triangulos))
          .setBuffer(buffer),
      )
      .setMaterial(material);
    for (const semantica of ["POSITION", "NORMAL", "TEXCOORD_0"]) {
      primitiva.setAttribute(semantica, original.getAttribute(semantica));
    }

    const malla = documento.createMesh(parte).addPrimitive(primitiva);
    escena.addChild(documento.createNode(parte).setMesh(malla));
    console.log(`${parte}: ${triangulos.length / 3} triángulos`);
  }

  // Quita la malla original y lo que quedó sin usar (variantes, texturas de color)
  nodoOriginal.dispose();
  raiz.listExtensionsUsed().forEach((extension) => {
    if (extension.extensionName === "KHR_materials_variants") extension.dispose();
  });

  await documento.transform(
    prune(),
    // Texturas a 1024 px en formato WebP (pesan mucho menos que JPG de 2048 px)
    textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024] }),
    // Comprime la geometría con meshopt
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );

  await mkdir("public/modelos", { recursive: true });
  await io.write(SALIDA, documento);
  console.log(`Listo: ${SALIDA}`);
}

await main();
