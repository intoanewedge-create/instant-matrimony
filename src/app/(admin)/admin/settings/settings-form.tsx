"use client";

import React, { useOptimistic, startTransition } from "react";
import { SlidersHorizontal, ShieldAlert, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { toggleFeatureFlagAction } from "@/lib/actions/admin.actions";
import { AdminCard } from "@/components/admin/design-system";

interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  value: string;
  description: string | null;
  category: string | null;
}

interface SettingsFormProps {
  initialFlags: FeatureFlag[];
}

export function SettingsForm({ initialFlags }: SettingsFormProps) {
  // Use optimistic state to toggle flags
  const [optimisticFlags, setOptimisticFlag] = useOptimistic(
    initialFlags,
    (state, update: { key: string; enabled: boolean }) =>
      state.map((f) => (f.key === update.key ? { ...f, enabled: update.enabled } : f))
  );

  const [notification, setNotification] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleToggle = async (key: string, currentEnabled: boolean) => {
    const nextEnabled = !currentEnabled;
    setNotification(null);

    // Apply optimistic update immediately
    startTransition(() => {
      setOptimisticFlag({ key, enabled: nextEnabled });
    });

    try {
      const res = await toggleFeatureFlagAction(key, nextEnabled);
      if (!res.success) {
        throw new Error(res.error || "Failed to update feature flag.");
      }
      setNotification({
        type: "success",
        message: `Feature flag "${key}" updated successfully.`,
      });
    } catch (e: any) {
      setNotification({
        type: "error",
        message: e.message || `Failed to update flag "${key}". Reverting changes.`,
      });
      // Force page sync on next render to rollback optimistic state
      window.location.reload();
    }
  };

  // Group flags by category
  const categories = optimisticFlags.reduce((acc, flag) => {
    const cat = flag.category || "General Settings";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(flag);
    return acc;
  }, {} as Record<string, FeatureFlag[]>);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : "bg-rose-500/10 border-rose-500/20 text-rose-500"
          }`}
          role="alert"
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(categories).map(([cat, flags]) => (
          <AdminCard key={cat} title={cat} subtitle={`Manage functional gates under ${cat}`}>
            <div className="space-y-4">
              {flags.map((flag) => (
                <div
                  key={flag.key}
                  className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border/20 bg-muted/10 hover:bg-muted/30 transition-all duration-150"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-foreground uppercase select-all">
                      {flag.key.replace(/([A-Z])/g, " $1")}
                    </span>
                    {flag.description && (
                      <p className="text-[10px] text-muted-foreground font-medium select-text">
                        {flag.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggle(flag.key, flag.enabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      flag.enabled ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                    role="switch"
                    aria-checked={flag.enabled}
                    aria-label={`Toggle feature flag ${flag.key}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                        flag.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
