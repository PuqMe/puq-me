"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "linear-gradient(135deg, #0f050d 0%, #1a0f2e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: "system-ui, sans-serif",
        }}>
          <div style={{
            maxWidth: 400,
            textAlign: "center",
            color: "#fff",
          }}>
            <div style={{
              fontSize: 48,
              marginBottom: 16,
              lineHeight: 1,
            }}>
              ⚠️
            </div>
            <h1 style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 8,
              color: "#fff",
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.6)",
              marginBottom: 24,
              lineHeight: 1.5,
            }}>
              We encountered an error while rendering this page. Please try again.
            </p>
            {this.state.error && (
              <pre style={{
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(168, 85, 247, 0.2)",
                borderRadius: 8,
                padding: 12,
                marginBottom: 24,
                fontSize: 11,
                color: "rgba(255, 255, 255, 0.5)",
                textAlign: "left",
                overflow: "auto",
                maxHeight: 100,
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleRetry}
              style={{
                background: "linear-gradient(135deg, #c084fc, #a855f7)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.transform = "scale(1.02)";
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
