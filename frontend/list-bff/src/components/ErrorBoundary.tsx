import { Component, type ReactNode } from 'react'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useUrlSearch } from '../hooks/useUrlParam'

type Props = { children: ReactNode; onReset: () => void; resetKey: string }
type State = { error: Error | null; resetKey: string }

// Still no hook equivalent for error boundaries in React.
class Boundary extends Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  // Changing any filter clears the error, so the new query gets a chance to run.
  static getDerivedStateFromProps({ resetKey }: Props, state: State) {
    return resetKey === state.resetKey ? null : { error: null, resetKey }
  }
  retry = () => {
    this.props.onReset() // lets React Query refetch the failed queries
    this.setState({ error: null })
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <p role="alert" className="error">
        {this.state.error.message} <button onClick={this.retry}>Retry</button>
      </p>
    )
  }
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { reset } = useQueryErrorResetBoundary()
  return <Boundary onReset={reset} resetKey={useUrlSearch()}>{children}</Boundary>
}
