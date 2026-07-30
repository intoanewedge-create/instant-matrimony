"use client";

import React, { useState, useEffect } from "react";
import { setFlagAction, listFlagsAction, seedDefaultFlagsAction } from "@/lib/actions/feature-flag.actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleLeft, ToggleRight, Search, Settings2, Sliders, RefreshCw, Save } from "lucide-react";

interface FeatureFlag {
  key: string;
  enabled: boolean;
  value: string;
  description: string | null;
  category: string | null;
  updatedAt: Date;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await listFlagsAction();
      if (res.success && res.data) {
        setFlags(res.data);
        // Initialize editing inputs
        const inputs: Record<string, string> = {};
        res.data.forEach((f: FeatureFlag) => {
          inputs[f.key] = f.value;
        });
        setEditingValues(inputs);
      } else {
        setMessage({ type: "error", text: res.error || "Failed to load feature flags" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Failed to load feature flags" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleToggle = async (flag: FeatureFlag) => {
    setActionLoading(`toggle-${flag.key}`);
    setMessage(null);
    try {
      const res = await setFlagAction({
        key: flag.key,
        enabled: !flag.enabled,
        value: flag.value,
        description: flag.description || undefined,
        category: flag.category || undefined,
      });

      if (res.success) {
        setMessage({ type: "success", text: `Flag '${flag.key}' has been updated` });
        fetchFlags();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update feature flag" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "An error occurred" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveValue = async (flag: FeatureFlag) => {
    setActionLoading(`save-${flag.key}`);
    setMessage(null);
    try {
      const res = await setFlagAction({
        key: flag.key,
        enabled: flag.enabled,
        value: editingValues[flag.key] || "true",
        description: flag.description || undefined,
        category: flag.category || undefined,
      });

      if (res.success) {
        setMessage({ type: "success", text: `Custom value for '${flag.key}' has been saved` });
        fetchFlags();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update value" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "An error occurred" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await seedDefaultFlagsAction();
      if (res.success) {
        setMessage({ type: "success", text: "Successfully seeded default feature flags" });
        fetchFlags();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to seed default flags" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", ...Array.from(new Set(flags.map((f) => f.category).filter(Boolean)))];

  const filteredFlags = flags.filter((f) => {
    const matchesSearch =
      f.key.toLowerCase().includes(search.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 p-6 select-text max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature Toggles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Safeguard development and toggle features in production dynamically.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchFlags} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="default" size="sm" onClick={handleSeed} className="gap-2 bg-primary">
            <Sliders className="h-4 w-4" />
            Seed Default Toggles
          </Button>
        </div>
      </div>

      {/* Message banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card p-4 rounded-xl border border-border/40">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search toggles by key or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground font-medium">Category:</span>
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat || "all")}
                className="capitalize"
              >
                {cat || "General"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Flags Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredFlags.length === 0 ? (
        <Card className="p-12 text-center">
          <Settings2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="font-semibold text-lg">No Feature Toggles Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Click &apos;Seed Default Toggles&apos; above to setup the recommended system configuration.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredFlags.map((flag) => (
            <Card key={flag.key} className="overflow-hidden border-border/50">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Info Column */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg tracking-tight font-mono">{flag.key}</h3>
                      <Badge variant="secondary" className="capitalize">
                        {flag.category || "General"}
                      </Badge>
                      <Badge variant={flag.enabled ? "success" : "secondary"}>
                        {flag.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {flag.description || "No description provided for this feature flag."}
                    </p>
                  </div>

                  {/* Config & Toggle Controls */}
                  <div className="flex flex-wrap items-center gap-4 lg:self-center">
                    {/* Custom Value field */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground font-medium">Value:</span>
                      <Input
                        value={editingValues[flag.key] ?? flag.value}
                        onChange={(e) =>
                          setEditingValues({
                            ...editingValues,
                            [flag.key]: e.target.value,
                          })
                        }
                        className="w-32 h-9 text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionLoading === `save-${flag.key}`}
                        onClick={() => handleSaveValue(flag)}
                        className="h-9 px-3"
                      >
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Toggle Button */}
                    <Button
                      variant={flag.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggle(flag)}
                      disabled={actionLoading === `toggle-${flag.key}`}
                      className={`gap-2 ${flag.enabled ? "bg-primary" : ""}`}
                    >
                      {flag.enabled ? (
                        <>
                          <ToggleRight className="h-5 w-5 text-white" />
                          <span>Enabled</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                          <span>Disabled</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
