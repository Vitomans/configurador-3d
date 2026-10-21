import { useEffect, useMemo, useRef, useState } from "react";
import { useCursor, useGLTF } from "@react-three/drei";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { Color, type Mesh, type MeshStandardMaterial } from "three";
import {
  ACABADOS,
  COLOR_INTERIOR,
  COLORES,
  PARTES,
  type ParteId,
} from "@/lib/opciones";
import { colorResaltado } from "@/lib/resalte";
import { useConfigurador } from "@/store/useConfigurador";
import TextoTalon from "./TextoTalon";

const RUTA_MODELO = "/modelos/zapatilla.glb";

// Qué tan rápido llega una pieza a su nuevo color o acabado. En cada cuadro avanza una parte
// del camino que le falta: con 12, en un cuarto de segundo ya hizo el 95 %.
const RAPIDEZ = 12;
// Cuánto se acerca una pieza a su color resaltado (0 nada, 1 todo) cuando tiene el mouse encima
const RESALTE_BAJO_EL_MOUSE = 0.5;
// Al elegir una pieza, un destello: toma su color resaltado y vuelve a su color en estos segundos
const DURACION_DESTELLO = 0.9;

// alCargar avisa al visor que el modelo ya está listo, para esconder el aviso de carga
export default function Producto({ alCargar }: { alCargar: () => void }) {
  // useGLTF "suspende" este componente hasta que el modelo termina de descargarse,
  // así que si este código se ejecuta, el modelo ya está listo.
  const { nodes, materials } = useGLTF(RUTA_MODELO);
  const configuracion = useConfigurador((estado) => estado.configuracion);
  const texto = useConfigurador((estado) => estado.texto);
  const parteActiva = useConfigurador((estado) => estado.parteActiva);
  const elegirParte = useConfigurador((estado) => estado.elegirParte);

  // La parte bajo el mouse se resalta, y el mouse muestra la "manito"
  const [parteBajoElMouse, setParteBajoElMouse] = useState<ParteId | null>(null);
  useCursor(parteBajoElMouse !== null);

  useEffect(() => {
    alCargar();
  }, [alCargar]);

  return (
    // El nombre sirve para encontrar la zapatilla al armar el archivo para el iPhone (sin la sombra)
    <group name="zapatilla">
      {PARTES.map(({ id }) => {
        const { color, acabado } = configuracion[id];
        return (
          <Pieza
            key={id}
            nodo={nodes[id] as Mesh}
            material={materials[id]}
            color={COLORES[color].hex}
            rugosidad={ACABADOS[acabado].rugosidad}
            bajoElMouse={parteBajoElMouse === id}
            elegida={parteActiva === id}
            onClick={(evento) => {
              // Si el puntero se movió más de 2 px, el usuario estaba girando la zapatilla
              if (evento.delta > 2) return;
              evento.stopPropagation(); // solo cuenta la parte de más adelante
              elegirParte(id);
            }}
            onPointerOver={(evento) => {
              evento.stopPropagation();
              // Solo con el mouse: en una pantalla táctil la parte quedaría aclarada después de tocarla
              if (evento.pointerType === "mouse") setParteBajoElMouse(id);
            }}
            onPointerOut={() => setParteBajoElMouse(null)}
          >
            {/* El texto va pegado al cuerpo, en el talón */}
            {id === "cuerpo" && texto && (
              <TextoTalon nodo={nodes.cuerpo as Mesh} texto={texto} colorDelCuerpo={COLORES[color].hex} />
            )}
          </Pieza>
        );
      })}

      <Pieza nodo={nodes.interior as Mesh} material={materials.interior} color={COLOR_INTERIOR} />
    </group>
  );
}

type PropsPieza = {
  nodo: Mesh;
  color: string;
  rugosidad?: number;
  bajoElMouse?: boolean;
  elegida?: boolean;
} & ThreeElements["mesh"];

// Dibuja una pieza del modelo. El modelo está comprimido: cada pieza guarda su
// posición y su tamaño aparte de su forma, así que hay que copiar los tres.
function Pieza({ nodo, color, rugosidad, bajoElMouse = false, elegida = false, ...props }: PropsPieza) {
  const malla = useRef<Mesh>(null);
  const colorFinal = useMemo(() => new Color(color), [color]);
  const colorDeResalte = useMemo(() => new Color(colorResaltado(color)), [color]);
  // Lo que se va animando cuadro a cuadro. Son refs: cambian 60 veces por segundo
  // y no hace falta que React vuelva a dibujar el componente
  const primerCuadro = useRef(true);
  const colorActual = useRef(new Color()); // va camino al color elegido
  const resalte = useRef(0); // por el mouse: de 0 a RESALTE_BAJO_EL_MOUSE
  const destello = useRef(0); // va de 1 a 0 después de elegir la pieza
  const yaElegida = useRef(elegida);

  // Al elegir la pieza, un destello. No al abrir la página: ahí el cuerpo ya viene elegido
  useEffect(() => {
    if (elegida && !yaElegida.current) destello.current = 1;
    yaElegida.current = elegida;
  }, [elegida]);

  useFrame((_, delta) => {
    const material = malla.current?.material as MeshStandardMaterial | undefined;
    if (!material) return;

    // El primer cuadro llega de una vez: al abrir la página no hay nada que animar
    const avance = primerCuadro.current ? 1 : 1 - Math.exp(-RAPIDEZ * delta);
    primerCuadro.current = false;

    // lerp mezcla dos colores: el actual avanza una parte del camino que le falta al elegido
    colorActual.current.lerp(colorFinal, avance);
    if (rugosidad !== undefined) material.roughness += (rugosidad - material.roughness) * avance;

    // El resalte del mouse también aparece y desaparece suave; el destello se apaga parejo
    resalte.current += ((bajoElMouse ? RESALTE_BAJO_EL_MOUSE : 0) - resalte.current) * avance;
    destello.current = Math.max(0, destello.current - delta / DURACION_DESTELLO);

    // El color que se ve: el actual, acercado al resaltado según el mayor de los dos resaltes
    material.color.lerpColors(
      colorActual.current,
      colorDeResalte,
      Math.max(resalte.current, destello.current),
    );
  });

  return (
    <mesh
      ref={malla}
      geometry={nodo.geometry}
      position={nodo.position}
      scale={nodo.scale}
      {...props}
    />
  );
}

// Empieza a descargar el modelo apenas se carga este archivo
useGLTF.preload(RUTA_MODELO);
