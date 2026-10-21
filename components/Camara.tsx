import { useEffect, useRef } from "react";
import { CameraControls, CameraControlsImpl } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { LIMITES, VISTA_DE_ENTRADA, VISTAS, type Vista } from "@/lib/vistas";
import { useConfigurador } from "@/store/useConfigurador";

const { ACTION } = CameraControlsImpl;

// Cuánto gira sola la zapatilla: 0,3 radianes por segundo, una vuelta cada 21 segundos
const VELOCIDAD_DE_GIRO = 0.3;

// Si la persona pidió reducir las animaciones, la cámara salta de una vista a otra sin moverse
const reducirMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Lleva la cámara a una vista. setLookAt con true anima el viaje y devuelve una promesa
// que se cumple cuando la cámara llega
function irA(camara: CameraControlsImpl, { posicion, objetivo }: Vista, animar: boolean) {
  return camara.setLookAt(...posicion, ...objetivo, animar);
}

/**
 * Los controles de la cámara: girar con el mouse o los dedos y acercar con la rueda o pellizcando.
 * Además, cuando la zapatilla termina de cargar (listo), la cámara entra con un movimiento suave
 * y después la zapatilla gira sola hasta que la persona la toca. Al elegir una parte, la cámara
 * va a mostrarla.
 */
export default function Camara({ listo }: { listo: boolean }) {
  const controles = useRef<CameraControlsImpl>(null);
  const parteActiva = useConfigurador((estado) => estado.parteActiva);
  // useRef y no useState: cambian muchas veces y no hace falta volver a dibujar nada
  const girando = useRef(false);
  const quieta = useRef(false); // la persona ya movió la cámara o eligió una parte: no gira más sola
  const parteMostrada = useRef(parteActiva); // la parte que está mostrando la cámara

  // Mientras carga el modelo, la cámara espera en el punto de partida, ya mirando a la zapatilla
  useEffect(() => {
    if (controles.current) irA(controles.current, VISTA_DE_ENTRADA, false);
  }, []);

  // La entrada: cuando el modelo está listo, la cámara llega a la vista de toda la zapatilla
  // y después gira sola
  useEffect(() => {
    const camara = controles.current;
    if (!listo || !camara) return;

    if (reducirMovimiento()) {
      irA(camara, VISTAS.cuerpo, false);
      return;
    }

    irA(camara, VISTAS.cuerpo, true).then(() => {
      if (!quieta.current) girando.current = true;
    });
  }, [listo]);

  // Al elegir otra parte (en el panel o tocándola en la zapatilla), la cámara va a mostrarla
  useEffect(() => {
    const camara = controles.current;
    if (!listo || !camara || parteActiva === parteMostrada.current) return;

    parteMostrada.current = parteActiva;
    // Deja de girar sola, para que la parte quede a la vista
    quieta.current = true;
    girando.current = false;
    irA(camara, VISTAS[parteActiva], !reducirMovimiento());
  }, [listo, parteActiva]);

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
      // Cada viaje de la cámara dura cerca de un segundo
      smoothTime={0.45}
      // Con el mouse: izquierdo para girar y la rueda para acercar. Sin desplazar la cámara
      // (el botón derecho no hace nada), así la zapatilla no se pierde de vista.
      mouseButtons={{ left: ACTION.ROTATE, middle: ACTION.DOLLY, right: ACTION.NONE, wheel: ACTION.DOLLY }}
      // Con los dedos: uno para girar y dos para acercar (pellizcar)
      touches={{ one: ACTION.TOUCH_ROTATE, two: ACTION.TOUCH_DOLLY, three: ACTION.NONE }}
      // Límites de zoom y de ángulo, para que la zapatilla no se aleje demasiado ni se vea desde abajo
      minDistance={LIMITES.distanciaMinima}
      maxDistance={LIMITES.distanciaMaxima}
      maxPolarAngle={LIMITES.anguloMaximo}
      // Apenas la persona toca la zapatilla (o usa la rueda), deja de girar sola
      onStart={() => {
        quieta.current = true;
        girando.current = false;
      }}
    />
  );
}
