import { ErrorBoundary } from "react-error-boundary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface DuckDBErrorFallbackProps {
  error: Error;
}

function DuckDBErrorFallback({ error }: DuckDBErrorFallbackProps) {
  const resetErrorBoundary = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-destructive">
            Failed to Initialize DuckDB
          </CardTitle>
          <CardDescription>
            An error occurred while initializing DuckDB. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-mono text-muted-foreground">
              {error.message || "Unknown error occurred"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={resetErrorBoundary} variant="default">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DuckDBErrorBoundaryProps {
  children: ReactNode;
}

export function DuckDBErrorBoundary({ children }: DuckDBErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={DuckDBErrorFallback}
      onError={(error, errorInfo) => {
        console.error("DuckDB initialization error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
