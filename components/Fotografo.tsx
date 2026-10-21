import { useEffect } from "react";
import { useThree, type RootState } from "@react-three/fiber";
import { PerspectiveCamera, Vector2 } from "three";
import { VISTAS } from "@/lib/vistas";
import { useConfigurador } from "@/store/useConfigurador";

// El tamaño de la foto, en píxeles: cuadrada, como las fotos de Instagram, y del mismo
// tamaño en el celular y en el computador
const ANCHO = 1080;
const ALTO = 1080;

// Saca una foto de la zapatilla y la devuelve como un archivo PNG en memoria (un Blob)
function fotografiar({ gl, scene, camera }: RootState): Promise<Blob | null> {
  // Una cámara solo para la foto, en la vista de toda la zapatilla. Así la foto sale igual
  // aunque la persona esté mirando la suela de cerca
  const camaraDeFoto = new PerspectiveCamera(40, ANCHO / ALTO);
  const { posicion, objetivo } = VISTAS.cuerpo;
  camaraDeFoto.position.set(...posicion);
  camaraDeFoto.lookAt(...objetivo);

  // El canvas se agranda por un momento al tamaño de la foto. false: solo cambian sus píxeles,
  // no su tamaño en la página. Se dibuja la zapatilla desde la cámara de la foto y se copia
  const tamaño = gl.getSize(new Vector2());
  const densidad = gl.getPixelRatio();
  gl.setPixelRatio(1);
  gl.setSize(ANCHO, ALTO, false);
  gl.render(scene, camaraDeFoto);

  // El canvas 3D es transparente, así que la foto se arma en otro canvas (2D):
  // primero el fondo de estudio, el mismo degradado del visor, y encima la zapatilla
  const foto = document.createElement("canvas");
  foto.width = ANCHO;
  foto.height = ALTO;
  const dibujo = foto.getContext("2d")!;
  const fondo = dibujo.createRadialGradient(ANCHO / 2, ALTO * 0.45, 0, ANCHO / 2, ALTO * 0.45, ANCHO * 0.75);
  fondo.addColorStop(0, "#ffffff");
  fondo.addColorStop(0.55, "#f3f0eb");
  fondo.addColorStop(1, "#e6e0d7");
  dibujo.fillStyle = fondo;
  dibujo.fillRect(0, 0, ANCHO, ALTO);
  dibujo.drawImage(gl.domElement, 0, 0);

  // Todo vuelve como estaba y se dibuja de nuevo la vista normal. Como pasa todo seguido,
  // antes de que la pantalla se actualice, la persona nunca ve la cámara de la foto
  gl.setPixelRatio(densidad);
  gl.setSize(tamaño.x, tamaño.y, false);
  gl.render(scene, camera);

  // Convertir la foto en PNG toma un momento: toBlob lo hace sin congelar la página y avisa al terminar
  return new Promise((resolver) => foto.toBlob(resolver, "image/png"));
}

/**
 * No dibuja nada: deja lista en el store la función para sacar la foto de la zapatilla.
 * Tiene que estar dentro del <Canvas> para tener el 3D (useThree), y el resumen del pedido,
 * que está fuera, la usa a través del store.
 */
export default function Fotografo() {
  // get() entrega el estado del 3D en el momento en que se llama (la cámara puede haber cambiado)
  const get = useThree((estado) => estado.get);

  useEffect(() => {
    useConfigurador.setState({ sacarFoto: () => fotografiar(get()) });
    // Si el visor desaparece, ya no hay foto
    return () => useConfigurador.setState({ sacarFoto: async () => null });
  }, [get]);

  return null;
}
