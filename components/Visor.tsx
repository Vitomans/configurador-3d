"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import Camara from "./Camara";
import Cargando from "./Cargando";
import Fotografo from "./Fotografo";
import LimiteDeError from "./LimiteDeError";
import Producto from "./Producto";
import RealidadAumentada from "./RealidadAumentada";

// Lo que se ve si el 3D no funciona (por ejemplo, si el navegador no tiene WebGL)
function SinVisor() {
  return (
    <div
      role="alert"
      className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-stone-600"
    >
      No se pudo mostrar la zapatilla en 3D en este navegador.
      <br />
      Igual puedes elegir los colores y compartir tu diseño.
    </div>
  );
}

export default function Visor() {
  // Empieza en true para que el aviso de carga se vea desde el primer momento.
  // <Producto> lo cambia a false cuando el modelo ya está listo.
  const [cargando, setCargando] = useState(true);

  return (
    // Si el 3D falla, solo el visor muestra el aviso: el panel y el precio siguen funcionando
    <LimiteDeError alternativa={<SinVisor />}>
      {/* La posición de la cámara la maneja <Camara> */}
      <Canvas camera={{ fov: 40 }} dpr={[1, 2]}>
        {/* El modelo se carga en segundo plano; mientras tanto se ve el aviso de carga */}
        <Suspense fallback={null}>
          {/* En realidad aumentada, la zapatilla y su sombra se mueven y se achican juntas */}
          <RealidadAumentada>
            <Producto alCargar={() => setCargando(false)} />

            {/* Sombra suave bajo la zapatilla. La zapatilla nunca se mueve (gira la cámara),
                así que la sombra se calcula una sola vez (frames={1}) y no en cada cuadro.
                Va dentro del Suspense para calcularla cuando la zapatilla ya está cargada. */}
            <ContactShadows
              position={[0, 0, 0]}
              scale={6}
              blur={2.5}
              far={2}
              opacity={0.5}
              frames={1}
            />
          </RealidadAumentada>

          {/* Deja lista la foto para el resumen del pedido, cuando la zapatilla ya está cargada */}
          <Fotografo />
        </Suspense>

        {/* Iluminación tipo estudio de fotos: paneles de luz alrededor del producto.
            Los materiales reflejan estos paneles, por eso se ven realistas. */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={3} position={[4, 5, 4]} scale={[6, 3, 1]} />
          <Lightformer form="rect" intensity={1.5} position={[-5, 2, 2]} scale={[4, 4, 1]} />
          <Lightformer form="rect" intensity={2} position={[0, 3, -6]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={1} position={[0, 8, 0]} scale={[6, 6, 1]} />
        </Environment>

        {/* Girar y acercar, la entrada animada y el giro automático */}
        <Camara listo={!cargando} />
      </Canvas>

      {cargando && <Cargando />}
    </LimiteDeError>
  );
}
