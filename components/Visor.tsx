"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import Cargando from "./Cargando";
import Producto from "./Producto";

export default function Visor() {
  // Empieza en true para que el aviso de carga se vea desde el primer momento.
  // <Producto> lo cambia a false cuando el modelo ya está listo.
  const [cargando, setCargando] = useState(true);

  return (
    <>
      <Canvas camera={{ position: [3.5, 2, 3.5], fov: 40 }} dpr={[1, 2]}>
        {/* El modelo se carga en segundo plano; mientras tanto se ve el aviso de carga */}
        <Suspense fallback={null}>
          <Producto alCargar={() => setCargando(false)} />
        </Suspense>

        {/* Sombra suave bajo la zapatilla */}
        <ContactShadows position={[0, 0, 0]} scale={6} blur={2.5} far={2} opacity={0.5} />

        {/* Iluminación tipo estudio de fotos: paneles de luz alrededor del producto.
            Los materiales reflejan estos paneles, por eso se ven realistas. */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={3} position={[4, 5, 4]} scale={[6, 3, 1]} />
          <Lightformer form="rect" intensity={1.5} position={[-5, 2, 2]} scale={[4, 4, 1]} />
          <Lightformer form="rect" intensity={2} position={[0, 3, -6]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={1} position={[0, 8, 0]} scale={[6, 6, 1]} />
        </Environment>

        {/* Girar con el mouse o los dedos. Sin desplazar la cámara y con límites de zoom
            y de ángulo para que la zapatilla no se pierda ni se vea desde abajo. */}
        <OrbitControls
          makeDefault
          target={[0, 0.6, 0]}
          enablePan={false}
          minDistance={2.5}
          maxDistance={7}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>

      {cargando && <Cargando />}
    </>
  );
}
