'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <h2 className="font-bold mb-2">Something went wrong</h2>
              <p className="text-sm">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mr-2"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;