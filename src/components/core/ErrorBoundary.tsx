import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-6">
            <AlertTriangle className="w-16 h-16 mx-auto text-destructive" />
            <div>
              <h1 className="text-2xl font-orbitron font-bold mb-2">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We apologize for the inconvenience. The error has been logged.
              </p>
            </div>
            {this.state.error && (
              <details className="text-left text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 bg-secondary/10 rounded overflow-auto text-xs">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <Button onClick={this.handleReset} variant="premium" className="w-full">
              Return to Home
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
