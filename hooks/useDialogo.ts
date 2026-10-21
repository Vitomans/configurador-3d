import { useEffect, useRef, type MouseEvent } from "react";

/**
 * Abre y cierra un <dialog> según abierto. Lo usan el resumen del pedido y "Ver en tu espacio".
 * El <dialog> se abre con showModal(): queda encima de todo, el resto de la página no se puede
 * tocar mientras está abierto, el foco no se escapa y la tecla Esc lo cierra
 */
export function useDialogo(abierto: boolean) {
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierto && !elemento.open) elemento.showModal();
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  // close() dispara el evento "close", y ahí el <dialog> avisa con su onClose
  const cerrar = () => dialogo.current?.close();

  // Un clic en el fondo oscuro, fuera de la caja, le llega al <dialog> mismo y lo cierra.
  // La caja de adentro tapa todo el <dialog>, así que un clic en ella no cuenta
  const cerrarSiTocaFuera = (evento: MouseEvent<HTMLDialogElement>) => {
    if (evento.target === evento.currentTarget) cerrar();
  };

  return { dialogo, cerrar, cerrarSiTocaFuera };
}
