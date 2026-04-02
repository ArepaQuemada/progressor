"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; message: string };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-xl border border-red-700 bg-red-900/20 p-6 text-center space-y-3">
            <p className="text-red-400 font-medium">Algo salió mal</p>
            {this.state.message && (
              <p className="text-red-500 text-sm font-mono">{this.state.message}</p>
            )}
            <button
              onClick={() => this.setState({ hasError: false, message: "" })}
              className="text-sm text-zinc-400 hover:text-white underline"
            >
              Reintentar
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
