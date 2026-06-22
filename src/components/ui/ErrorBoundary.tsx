'use client'
import { Component, ReactNode } from 'react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  section?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error(`[ErrorBoundary${this.props.section ? ` — ${this.props.section}` : ''}]`, error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="text-4xl mb-3" aria-hidden="true">⚠️</div>
          <h2 className="text-base font-bold text-gray-800 mb-1">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-4">
            {this.props.section
              ? `The ${this.props.section} section failed to load.`
              : 'This section could not be loaded.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 rounded-lg text-white text-sm font-bold"
              style={{ background: '#f68b1f' }}
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              Go home
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  section?: string
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary section={section}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
