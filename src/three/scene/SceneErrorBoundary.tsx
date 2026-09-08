import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  children: ReactNode
  onError?: (error: Error) => void
}

interface State {
  failed: boolean
}

/** Catches WebGL/renderer failures so a 3D problem never blanks the page. */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error)
    if (import.meta.env.DEV) console.error('3D scene failed', error, info.componentStack)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
