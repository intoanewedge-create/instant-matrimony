"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center select-none">
      <div className="max-w-md bg-card border border-border/50 p-8 rounded-2xl shadow-sm flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 mb-6 animate-pulse">
          <WifiOff className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">You are Offline</h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          It looks like you have lost connection to the internet. Pages that you have previously visited will continue to be readable, but dynamic search results or new chat threads will require an active connection.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
          <Button onClick={handleRetry} className="w-full">
            Retry Connection
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"} className="w-full">
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
