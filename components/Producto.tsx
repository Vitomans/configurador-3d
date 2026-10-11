import { useGLTF } from "@react-three/drei";
import type { Mesh } from "three";

const RUTA_MODELO = "/modelos/zapatilla.glb";

// Colores de ejemplo de cada parte. Más adelante los va a elegir el usuario en el panel.
const PARTES: Record<string, string> = {
  cuerpo: "#2b4c7e",
  franjas: "#f2f2f2",
  suela: "#f5f5f5",
  cordones: "#f2f2f2",
  detalles: "#e4572e",
  interior: "#3a3a3a",
};

export default function Producto() {
  const { nodes, materials } = useGLTF(RUTA_MODELO);

  return (
    <group>
      {Object.entries(PARTES).map(([parte, color]) => {
        const pieza = nodes[parte] as Mesh;
        return (
          // El modelo está comprimido: cada pieza guarda su posición y su tamaño
          // aparte de su forma, así que hay que copiar los tres.
          <mesh
            key={parte}
            geometry={pieza.geometry}
            position={pieza.position}
            scale={pieza.scale}
            material={materials[parte]}
            material-color={color}
          />
        );
      })}
    </group>
  );
}

// Empieza a descargar el modelo apenas se carga este archivo
useGLTF.preload(RUTA_MODELO);
