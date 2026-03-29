import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In production, send to error tracking service
    console.error('Uncaught error:', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
          <h1 className="text-4xl font-bold text-destructive">Something went wrong</h1>
          <p className="text-muted-foreground max-w-sm">
            An unexpected error occurred. Please reload the page or go back home.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload
            </Button>
            <Button onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}>
              Go home
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
