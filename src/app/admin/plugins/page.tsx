"use client";

import { useEffect, useState } from "react";
import { getPluginsAction, togglePluginAction } from "@/lib/actions/plugin.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

export default function AdminPluginsPage() {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getPluginsAction().then((res) => {
      if (res.success && res.data) setPlugins(res.data);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (pluginKey: string, isEnabled: boolean) => {
    const res = await togglePluginAction(pluginKey, isEnabled);
    if (res.success) {
      setPlugins((prev) => prev.map((p) => (p.pluginKey === pluginKey ? { ...p, isEnabled } : p)));
      toast({ title: "Plugin Toggled", description: `Plugin ${pluginKey} ${isEnabled ? "enabled" : "disabled"}.` });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading plugin manager...</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plugin & Extension Architecture</h1>
        <p className="text-muted-foreground">Modular plugin registry. Enable or disable future enterprise extensions cleanly.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Installed Extension Modules ({plugins.length})</CardTitle>
          <CardDescription>Toggle optional enterprise plugins without code modification.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {plugins.map((plugin) => (
              <div key={plugin.pluginKey} className="border p-4 rounded-lg flex items-start justify-between space-x-4">
                <div className="space-y-1">
                  <div className="font-semibold text-base flex items-center gap-2">
                    {plugin.name}
                    <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono font-normal">v{plugin.version}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{plugin.description}</p>
                </div>
                <Switch checked={plugin.isEnabled} onCheckedChange={(val) => handleToggle(plugin.pluginKey, val)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
