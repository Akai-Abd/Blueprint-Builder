'use client';

import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <span className="error-boundary__icon">⚠️</span>
          <h2 className="error-boundary__title">
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </h2>
          <p className="error-boundary__message">
            An unexpected error occurred. Try refreshing the section or reloading
            the page.
          </p>
          {this.state.error && (
            <pre className="error-boundary__details">
              {this.state.error.message}
            </pre>
          )}
          <button className="btn btn--primary" onClick={this.handleRetry}>
            ↻ Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
