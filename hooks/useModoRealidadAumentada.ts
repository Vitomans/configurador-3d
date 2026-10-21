import { useEffect, useState } from "react";

// Cómo se muestra la zapatilla en realidad aumentada en este navegador:
// "quick-look" en iPhone y iPad (Safari), "webxr" en Android (Chrome), o null si no se puede
export type ModoRealidadAumentada = "quick-look" | "webxr" | null;

async function detectarModo(): Promise<ModoRealidadAumentada> {
  // Safari abre los archivos USDZ en su visor de realidad aumentada (AR Quick Look) desde un
  // link con rel="ar". Si el navegador conoce ese rel, es un iPhone o un iPad
  if (document.createElement("a").relList.supports("ar")) return "quick-look";
  // Chrome en Android dibuja el 3D encima de la cámara (WebXR), si el celular es compatible con ARCore.
  // En el computador navigator.xr puede existir, pero responde que no
  const webxr = await navigator.xr?.isSessionSupported("immersive-ar").catch(() => false);
  return webxr ? "webxr" : null;
}

/**
 * Revisa una vez qué realidad aumentada tiene el navegador. Mientras revisa devuelve undefined:
 * la respuesta de navigator.xr llega después (es una promesa), en unos milisegundos
 */
export function useModoRealidadAumentada() {
  const [modo, setModo] = useState<ModoRealidadAumentada | undefined>(undefined);

  useEffect(() => {
    detectarModo().then(setModo);
  }, []);

  return modo;
}
