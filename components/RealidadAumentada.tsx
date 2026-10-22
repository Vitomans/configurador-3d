import { useEffect, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Box3,
  BufferGeometry,
  Group,
  Vector3,
  type Material,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
  type PerspectiveCamera,
  type Texture,
} from "three";
import { escalaReal, TALLA_DE_MUESTRA } from "@/lib/realidadAumentada";
import { useConfigurador } from "@/store/useConfigurador";
import { FUNCIONES_SIN_3D, useRealidadAumentada } from "@/store/useRealidadAumentada";

// La zapatilla se gira para que la persona la vea en diagonal desde la punta, como en el visor
// (VISTAS.cuerpo): así se ven el costado y la punta. Es el ángulo de la dirección (1, 0, 1)
// del modelo, que va de la zapatilla hacia la cámara del visor
const ANGULO_DE_LA_VISTA = Math.PI / 4;

// En el visor, el texto del talón se dibuja apenas por delante del cuerpo (polygonOffset),
// pero eso no existe en el archivo del iPhone: el texto quedaría justo sobre la superficie y se
// mezclaría con ella. Se separa un poco (en unidades de la pieza del cuerpo: unos 0,7 mm en talla 42)
const SEPARACION_DEL_TEXTO = 0.005;

// El largo de la zapatilla (a lo largo del eje X), en unidades de la escena. Se mide en el
// momento, sin achicar, así que también sirve si algún día cambia el modelo
function medirLargo(zapatilla: Object3D) {
  return new Box3().setFromObject(zapatilla).getSize(new Vector3()).x;
}

// Cuánto hay que achicar la zapatilla para que mida lo mismo que la talla elegida (o la 42)
function escalaDeLaTalla(zapatilla: Object3D) {
  return escalaReal(medirLargo(zapatilla), useConfigurador.getState().talla ?? TALLA_DE_MUESTRA);
}

// Mueve cada punto de la forma un poco hacia afuera, siguiendo su normal (hacia donde mira).
// La copia es una forma común: clone() intentaría crear otra DecalGeometry, que necesita sus datos
function separar(geometria: BufferGeometry, distancia: number) {
  const copia = new BufferGeometry().copy(geometria);
  const { position: puntos, normal: normales } = copia.attributes;
  for (let i = 0; i < puntos.count; i++) {
    puntos.setXYZ(
      i,
      puntos.getX(i) + normales.getX(i) * distancia,
      puntos.getY(i) + normales.getY(i) * distancia,
      puntos.getZ(i) + normales.getZ(i) * distancia,
    );
  }
  return copia;
}

/**
 * Arma el archivo USDZ (el formato que abre el iPhone) con una copia de la zapatilla tal como
 * se ve: con sus colores, sus acabados y el texto del talón, del largo de la talla.
 * La copia comparte las formas y los materiales con la zapatilla del visor, así que lo que se
 * cambia para el archivo se cambia en copias, para no tocar lo que se ve
 */
async function armarUsdz(zapatilla: Object3D) {
  // El convertidor de three.js se descarga recién aquí: solo lo necesitan los iPhone
  const { USDZExporter } = await import("three/examples/jsm/exporters/USDZExporter.js");

  const copia = zapatilla.clone();
  const texturas = new Map<Texture, Texture>();
  copia.traverse((objeto) => {
    const malla = objeto as Mesh;
    if (!malla.isMesh) return;

    const material = (malla.material as Material).clone() as MeshStandardMaterial;
    malla.material = material;
    // El relieve y las sombras de la tela se guardan en JPG y no en PNG: pesan mucho menos y el
    // archivo se arma y se abre más rápido. El texto del talón sigue en PNG, porque necesita
    // transparencia alrededor de las letras
    for (const nombre of ["normalMap", "aoMap", "roughnessMap", "metalnessMap"] as const) {
      const textura = material[nombre];
      if (!textura) continue;
      if (!texturas.has(textura)) {
        const enJpg = textura.clone();
        enJpg.userData.mimeType = "image/jpeg";
        texturas.set(textura, enJpg);
      }
      material[nombre] = texturas.get(textura)!;
    }

    if (malla.name === "texto-del-talon") {
      malla.geometry = separar(malla.geometry, SEPARACION_DEL_TEXTO);
    }
  });

  const modelo = new Group();
  modelo.scale.setScalar(escalaDeLaTalla(zapatilla));
  // El visor del iPhone deja el modelo con su frente (+Z) hacia la persona
  modelo.rotation.y = -ANGULO_DE_LA_VISTA;
  modelo.add(copia);
  modelo.updateMatrixWorld(true);

  const datos = await new USDZExporter().parseAsync(modelo, { quickLookCompatible: true });
  return new Blob([datos], { type: "model/vnd.usdz+zip" });
}

/**
 * La realidad aumentada ("Ver en tu espacio"). Envuelve la zapatilla y su sombra (children),
 * para poder moverlas y achicarlas juntas, y deja listas en el store las funciones que usa el
 * botón, que está fuera del canvas:
 *
 * - Android (WebXR): Chrome dibuja la escena encima de la cámara. Con el "hit test" el celular
 *   busca superficies (el suelo o una mesa) en el centro de la pantalla; un anillo muestra dónde
 *   quedaría la zapatilla, y al tocar la pantalla queda ahí, de su tamaño real.
 * - iPhone: arma el archivo USDZ, que abre el visor de realidad aumentada de Apple (Quick Look).
 */
export default function RealidadAumentada({ children }: { children: ReactNode }) {
  const escenario = useRef<Group>(null); // la zapatilla y su sombra
  const mira = useRef<Group>(null); // el anillo que muestra dónde quedaría la zapatilla
  const busqueda = useRef<XRHitTestSource | null>(null); // busca superficies en el centro de la pantalla
  // get() entrega el estado del 3D en el momento en que se llama (como en <Fotografo>)
  const get = useThree((estado) => estado.get);

  useEffect(() => {
    const zapatillaDelVisor = () => escenario.current!.getObjectByName("zapatilla")!;

    async function entrar(capa: HTMLElement) {
      const { gl } = get();
      const camera = get().camera as PerspectiveCamera;
      const escena = escenario.current!;
      const anillo = mira.current!;
      useRealidadAumentada.setState({ estado: "abriendo" });

      // En la sesión, la cámara del 3D la mueve el celular. Se guarda cómo estaba, para dejarla
      // igual al salir
      const camaraAntes = {
        posicion: camera.position.clone(),
        giro: camera.quaternion.clone(),
        fov: camera.fov,
        zoom: camera.zoom,
      };

      let sesion: XRSession;
      try {
        // hit-test: buscar superficies. dom-overlay: mostrar HTML (capa) encima de la cámara
        sesion = await navigator.xr!.requestSession("immersive-ar", {
          requiredFeatures: ["hit-test"],
          optionalFeatures: ["dom-overlay"],
          domOverlay: { root: capa },
        });
      } catch (error) {
        // Por ejemplo, si el celular no es compatible con ARCore o la persona no dio permiso para usar la cámara
        useRealidadAumentada.setState({ estado: "apagada" });
        throw error;
      }

      // Al salir (con el botón, con "atrás" en el celular o si algo falla), todo vuelve como estaba
      sesion.addEventListener("end", () => {
        busqueda.current?.cancel();
        busqueda.current = null;
        escena.position.set(0, 0, 0);
        escena.rotation.set(0, 0, 0);
        escena.scale.setScalar(1);
        escena.visible = true;
        anillo.visible = false;
        camera.position.copy(camaraAntes.posicion);
        camera.quaternion.copy(camaraAntes.giro);
        camera.fov = camaraAntes.fov;
        camera.zoom = camaraAntes.zoom;
        camera.updateProjectionMatrix();
        useRealidadAumentada.setState({ estado: "apagada" });
      });

      try {
        // "local": las posiciones se miden desde donde estaba el celular al empezar
        gl.xr.setReferenceSpaceType("local");
        // React Three Fiber ve que empezó la sesión y pasa a dibujar con la cámara del celular
        await gl.xr.setSession(sesion);
        // "viewer" es el celular mismo: se busca en la dirección en que apunta (el centro de la pantalla)
        const celular = await sesion.requestReferenceSpace("viewer");
        busqueda.current = (await sesion.requestHitTestSource?.({ space: celular })) ?? null;
      } catch (error) {
        sesion.end();
        throw error;
      }

      // La zapatilla se achica a su tamaño real y se esconde hasta que la persona elija dónde ponerla
      escena.scale.setScalar(escalaDeLaTalla(zapatillaDelVisor()));
      escena.visible = false;
      useRealidadAumentada.setState({ estado: "buscando" });

      // "select" es tocar la pantalla: la zapatilla va adonde está el anillo. Si ya estaba puesta, se mueve
      sesion.addEventListener("select", () => {
        if (!anillo.visible) return;
        escena.position.setFromMatrixPosition(anillo.matrix);
        // Se gira según desde dónde la mira la persona (la cámara), para verla en diagonal desde la punta
        const haciaLaPersona = camera.position.clone().sub(escena.position);
        escena.rotation.y = Math.atan2(haciaLaPersona.x, haciaLaPersona.z) - ANGULO_DE_LA_VISTA;
        escena.visible = true;
        useRealidadAumentada.setState({ estado: "puesta" });
      });
    }

    useRealidadAumentada.setState({
      entrar,
      salir: () => get().gl.xr.getSession()?.end(),
      armarUsdz: () => armarUsdz(zapatillaDelVisor()),
    });
    // Si el visor desaparece, ya no hay realidad aumentada
    return () => useRealidadAumentada.setState(FUNCIONES_SIN_3D);
  }, [get]);

  // En cada cuadro de la sesión, el celular dice si hay una superficie en el centro de la pantalla
  // y dónde está. cuadro (XRFrame) existe solo durante la sesión
  useFrame(({ gl }, _delta, cuadro) => {
    const anillo = mira.current;
    const espacio = gl.xr.getReferenceSpace();
    if (!cuadro || !busqueda.current || !anillo || !espacio) return;

    const [resultado] = cuadro.getHitTestResults(busqueda.current);
    const pose = resultado?.getPose(espacio);
    anillo.visible = pose !== undefined;
    // La pose trae la posición y la inclinación de la superficie, como una matriz
    if (pose) anillo.matrix.fromArray(pose.transform.matrix);

    // El aviso cambia solo cuando encuentra o pierde la superficie, no en cada cuadro
    const { estado } = useRealidadAumentada.getState();
    if (estado === "buscando" && pose) useRealidadAumentada.setState({ estado: "lista" });
    if (estado === "lista" && !pose) useRealidadAumentada.setState({ estado: "buscando" });
  });

  return (
    <>
      <group ref={escenario}>{children}</group>

      {/* El anillo sobre la superficie encontrada. Su posición la pone el celular (matrixAutoUpdate
          en false: no se calcula desde position ni rotation). El anillo se acuesta sobre la superficie */}
      <group ref={mira} matrixAutoUpdate={false} visible={false}>
        <mesh rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.1, 0.12, 48]} />
          <meshBasicMaterial color="white" transparent opacity={0.9} />
        </mesh>
      </group>
    </>
  );
}
