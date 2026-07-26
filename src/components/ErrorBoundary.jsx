import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught UI Error captured by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          minHeight: '100vh',
          background: '#090d16',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            background: 'rgba(255,85,0,0.1)',
            border: '1.5px solid #FF5500',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ margin: '0 0 12px 0', color: '#FF5500', fontSize: '1.4rem' }}>
              FRIENDS MOBILE Application
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>
              The application encountered a temporary rendering issue. Click below to refresh.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{
                  background: 'linear-gradient(135deg, #FF5500, #E03E00)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 14px rgba(255, 85, 0, 0.35)'
                }}
              >
                🔄 Continue / Retry UI
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.88rem'
                }}
              >
                Reload Page
              </button>
            </div>
            {this.state.error && (
              <div style={{ marginTop: '16px', fontSize: '0.75rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: '6px', textAlign: 'left', wordBreak: 'break-word' }}>
                Error: {this.state.error.message || String(this.state.error)}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
