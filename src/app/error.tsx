"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error captured:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center select-none">
      <div className="max-w-md bg-card border border-border/50 p-8 rounded-2xl shadow-sm flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600 mb-6">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">500 - System Error</h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          An unexpected server or runtime exception occurred. Our engineers have been alerted.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
          <Button onClick={() => reset()} className="w-full">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"} className="w-full">
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
