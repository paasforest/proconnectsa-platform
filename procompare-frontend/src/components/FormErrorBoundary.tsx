'use client';

import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { debug } from '@/lib/debug';

interface FormErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentStack?: string;
}

function FormErrorFallback({ error, resetErrorBoundary, componentStack }: FormErrorFallbackProps) {
  // Log error for debugging
  debug.error(error, 'FormErrorBoundary');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-800">Form Error</CardTitle>
          </div>
          <CardDescription className="text-red-600">
            Something went wrong with the form. Don't worry, your data is safe.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-red-100 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-2">Error Details:</h3>
            <p className="text-red-700 text-sm font-mono">{error.message}</p>
            {process.env.NODE_ENV === 'development' && componentStack && (
              <details className="mt-2">
                <summary className="text-red-600 text-sm cursor-pointer">Stack Trace</summary>
                <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap overflow-auto">
                  {componentStack}
                </pre>
              </details>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={resetErrorBoundary}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <strong>Need help?</strong> If this error persists, please contact support with the error details above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FormErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function FormErrorBoundary({ 
  children, 
  fallback: FallbackComponent = FormErrorFallback,
  onError 
}: FormErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error for debugging
    debug.error(error, 'FormErrorBoundary');
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(error, {
      //   tags: { component: 'FormErrorBoundary' },
      //   extra: errorInfo
      // });
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={handleError}
      onReset={() => {
        // Clear any form state or local storage on reset
        debug.form('Form error boundary reset');
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook for programmatic error reporting
export const useFormErrorReporting = () => {
  const reportError = (error: Error, context?: string) => {
    debug.error(error, context);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // errorTrackingService.captureException(error, {
      //   tags: { context: context || 'form' },
      //   level: 'error'
      // });
    }
  };

  const reportWarning = (message: string, context?: string) => {
    debug.form(`⚠️ WARNING [${context || 'form'}]: ${message}`);
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // monitoringService.captureMessage(message, {
      //   level: 'warning',
      //   tags: { context: context || 'form' }
      // });
    }
  };

  return { reportError, reportWarning };
};

export default FormErrorBoundary;
