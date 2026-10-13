"use client";

import { Component, type ReactNode } from "react";

type Props = { alternativa: ReactNode; children: ReactNode };

// Un "límite de error" (error boundary): si algo de adentro falla al dibujarse,
// muestra la alternativa en vez de romper toda la página.
// React solo permite atrapar estos errores con un componente de clase.
export default class LimiteDeError extends Component<Props, { fallo: boolean }> {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  render() {
    return this.state.fallo ? this.props.alternativa : this.props.children;
  }
}
