"use client";

import { useEffect, useState } from "react";
import { getSystemHealthAction } from "@/lib/actions/system-health.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminSystemHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSystemHealthAction().then((res) => {
      if (res.success) setHealth(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Checking system health...</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Health Dashboard</h1>
        <p className="text-muted-foreground">Real-time status monitor for Database, Storage, SMTP, CPU, RAM, and Node environment.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-emerald-500">
          <CardHeader className="py-3">
            <CardDescription>Overall Status</CardDescription>
            <CardTitle className="text-2xl text-emerald-600 font-bold">{health?.status}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardDescription>Database Pool</CardDescription>
            <CardTitle className="text-2xl">{health?.database}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardDescription>RAM Memory Usage</CardDescription>
            <CardTitle className="text-2xl">{health?.memoryUsagePercent}% <span className="text-xs text-muted-foreground font-normal">({health?.memoryUsedMB} MB / {health?.memoryTotalMB} MB)</span></CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardDescription>System Uptime</CardDescription>
            <CardTitle className="text-2xl">{Math.round(health?.uptimeSeconds / 60)} mins</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment Diagnostics</CardTitle>
          <CardDescription>Node.js, OS Platform, SMTP, Storage, and queue state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 font-mono text-sm">
          <div className="flex justify-between border-b py-2">
            <span>Node Version:</span>
            <span className="font-semibold">{health?.nodeVersion}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>OS Platform:</span>
            <span className="font-semibold">{health?.platform}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>SMTP Service Status:</span>
            <span className="font-semibold text-emerald-600">{health?.smtp}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>Storage Provider Status:</span>
            <span className="font-semibold text-emerald-600">{health?.storage}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
