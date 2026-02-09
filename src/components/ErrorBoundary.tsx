import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV !== 'production') console.error('ErrorBoundary caught:', error.message)
    void info
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#020617',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              textAlign: 'center',
              maxWidth: '28rem',
              padding: '3rem 2rem',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1.5rem',
            }}
          >
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(239,68,68,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 300,
                marginBottom: '0.75rem',
                backgroundImage: 'linear-gradient(to right, #E2E8F0, #4F46E5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              System Anomaly Detected
            </h1>

            <p
              style={{
                fontSize: '0.8125rem',
                color: '#94A3B8',
                marginBottom: '2rem',
                lineHeight: 1.6,
              }}
            >
              An unexpected disruption occurred in the analysis engine.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: '100%',
                  height: '3rem',
                  backgroundColor: '#E2E8F0',
                  color: '#020617',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  border: '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(226,232,240,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                REINITIALIZE
              </button>

              <a
                href="/"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '3rem',
                  lineHeight: '3rem',
                  backgroundColor: 'transparent',
                  color: '#94A3B8',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#E2E8F0'
                  e.currentTarget.style.borderColor = 'rgba(226,232,240,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94A3B8'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                RETURN TO BASE
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
