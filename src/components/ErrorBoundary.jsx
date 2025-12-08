import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
          <Card className="w-full max-w-md backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-white/20">
            <CardHeader>
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred. Don't worry, your data is safe.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mb-4">
                  <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                      <summary className="cursor-pointer">Stack trace</summary>
                      <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                You can try the following:
              </p>
              <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 mt-2 space-y-1">
                <li>Click "Try Again" to reset the error</li>
                <li>Reload the page</li>
                <li>If the problem persists, contact support</li>
              </ul>
            </CardContent>

            <CardFooter className="flex space-x-2">
              <Button onClick={this.handleReset} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button onClick={this.handleReload} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;