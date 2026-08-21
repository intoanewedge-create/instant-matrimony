"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

export function PwaRegister() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js?v=2", { scope: "/" })
      .then((reg) => {
        setRegistration(reg);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      })
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    setShowUpdate(false);
    window.location.reload();
  };

  return (
    <>
      {showUpdate && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-card border border-border p-4 rounded-xl shadow-lg flex items-start gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground">App Update Available</h4>
            <p className="text-xs text-muted-foreground mt-1">
              A new version of InstantMatrimony is ready. Reload to update.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleUpdate}>
                Update Now
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowUpdate(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
