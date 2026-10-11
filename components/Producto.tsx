import { useState } from "react";
import { useCursor, useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import type { Mesh } from "three";
import {
  ACABADOS,
  COLOR_INTERIOR,
  COLORES,
  PARTES,
  type ParteId,
} from "@/lib/opciones";
import { useConfigurador } from "@/store/useConfigurador";

const RUTA_MODELO = "/modelos/zapatilla.glb";

export default function Producto() {
  const { nodes, materials } = useGLTF(RUTA_MODELO);
  const configuracion = useConfigurador((estado) => estado.configuracion);
  const elegirParte = useConfigurador((estado) => estado.elegirParte);

  // Muestra la "manito" del mouse cuando está sobre una parte que se puede elegir
  const [parteBajoElMouse, setParteBajoElMouse] = useState<ParteId | null>(null);
  useCursor(parteBajoElMouse !== null);

  return (
    <group>
      {PARTES.map(({ id }) => {
        const { color, acabado } = configuracion[id];
        return (
          <Pieza
            key={id}
            nodo={nodes[id] as Mesh}
            material={materials[id]}
            material-color={COLORES[color].hex}
            material-roughness={ACABADOS[acabado].rugosidad}
            onClick={(evento) => {
              // Si el puntero se movió más de 2 px, el usuario estaba girando la zapatilla
              if (evento.delta > 2) return;
              evento.stopPropagation(); // solo cuenta la parte de más adelante
              elegirParte(id);
            }}
            onPointerOver={(evento) => {
              evento.stopPropagation();
              setParteBajoElMouse(id);
            }}
            onPointerOut={() => setParteBajoElMouse(null)}
          />
        );
      })}

      <Pieza
        nodo={nodes.interior as Mesh}
        material={materials.interior}
        material-color={COLOR_INTERIOR}
      />
    </group>
  );
}

// Dibuja una pieza del modelo. El modelo está comprimido: cada pieza guarda su
// posición y su tamaño aparte de su forma, así que hay que copiar los tres.
function Pieza({ nodo, ...props }: { nodo: Mesh } & ThreeElements["mesh"]) {
  return (
    <mesh
      geometry={nodo.geometry}
      position={nodo.position}
      scale={nodo.scale}
      {...props}
    />
  );
}

// Empieza a descargar el modelo apenas se carga este archivo
useGLTF.preload(RUTA_MODELO);
