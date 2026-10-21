import { useEffect, useRef } from "react";
import { CameraControls, CameraControlsImpl } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const { ACTION } = CameraControlsImpl;

// El punto al que mira la cámara: el centro de la zapatilla
const OBJETIVO = [0, 0.6, 0] as const;
// Dónde parte la entrada: lejos, alta y del otro lado de la zapatilla
const POSICION_INICIAL = [-4.5, 3, 4] as const;
// Dónde termina: de frente, un poco de lado y desde arriba
const POSICION = [3.5, 2, 3.5] as const;

// Cuánto gira sola la zapatilla: 0,3 radianes por segundo, una vuelta cada 21 segundos
const VELOCIDAD_DE_GIRO = 0.3;

/**
 * Los controles de la cámara: girar con el mouse o los dedos y acercar con la rueda o pellizcando.
 * Además, cuando la zapatilla termina de cargar (listo), la cámara entra con un movimiento suave
 * y después la zapatilla gira sola hasta que la persona la toca.
 */
export default function Camara({ listo }: { listo: boolean }) {
  const controles = useRef<CameraControlsImpl>(null);
  // useRef y no useState: cambian muchas veces y no hace falta volver a dibujar nada
  const girando = useRef(false);
  const tocada = useRef(false); // la persona ya movió la cámara

  // Mientras carga el modelo, la cámara espera en el punto de partida, ya mirando a la zapatilla
  useEffect(() => {
    controles.current?.setLookAt(...POSICION_INICIAL, ...OBJETIVO, false);
  }, []);

  useEffect(() => {
    const camara = controles.current;
    if (!listo || !camara) return;

    // Si la persona pidió reducir las animaciones, la cámara salta al final y no gira sola
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      camara.setLookAt(...POSICION, ...OBJETIVO, false);
      return;
    }

    // setLookAt con true anima el viaje y devuelve una promesa que se cumple cuando la cámara llega
    camara.setLookAt(...POSICION, ...OBJETIVO, true).then(() => {
      if (!tocada.current) girando.current = true;
    });
  }, [listo]);

  // useFrame se ejecuta en cada cuadro (unas 60 veces por segundo). delta son los segundos
  // desde el cuadro anterior: así la velocidad es la misma aunque el computador sea lento.
  useFrame((_, delta) => {
    if (girando.current && controles.current) {
      controles.current.azimuthAngle += VELOCIDAD_DE_GIRO * delta;
    }
  });

  return (
    <CameraControls
      ref={controles}
      makeDefault
      // La entrada dura cerca de un segundo y medio
      smoothTime={0.45}
      // Con el mouse: izquierdo para girar y la rueda para acercar. Sin desplazar la cámara
      // (el botón derecho no hace nada), así la zapatilla no se pierde de vista.
      mouseButtons={{ left: ACTION.ROTATE, middle: ACTION.DOLLY, right: ACTION.NONE, wheel: ACTION.DOLLY }}
      // Con los dedos: uno para girar y dos para acercar (pellizcar)
      touches={{ one: ACTION.TOUCH_ROTATE, two: ACTION.TOUCH_DOLLY, three: ACTION.NONE }}
      // Límites de zoom y de ángulo, para que la zapatilla no se aleje demasiado ni se vea desde abajo
      minDistance={2.5}
      maxDistance={7}
      maxPolarAngle={Math.PI / 2 - 0.05}
      // Apenas la persona toca la zapatilla (o usa la rueda), deja de girar sola
      onStart={() => {
        tocada.current = true;
        girando.current = false;
      }}
    />
  );
}
