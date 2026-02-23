"use client";

import React from 'react';

interface SilentErrorBoundaryState {
  hasError: boolean;
}

/**
 * Silent error boundary that returns null on error instead of showing error UI.
 * Used for non-critical features like push notifications.
 */
class SilentErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  SilentErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): SilentErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error but don't show UI - this is for non-critical features
    console.warn('Push notification error (silently handled):', error.message);
  }

  render() {
    if (this.state.hasError) {
      // Return null instead of error UI - fail silently
      return null;
    }

    return this.props.children;
  }
}

export default SilentErrorBoundary;
