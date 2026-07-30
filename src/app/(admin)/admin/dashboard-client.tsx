"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getLiveStatsAction } from "@/lib/actions/admin.actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, CreditCard, ShieldAlert, RefreshCw, Cpu, Database, Activity, Clock } from "lucide-react";
import { AdminCard } from "@/components/admin/design-system";

interface DashboardClientProps {
  initialData: {
    stats: {
      totalUsers: number;
      pendingProfiles: number;
      activeMemberships: number;
      totalRevenue: number;
    };
    recentUsers: any[];
    auditLogs: any[];
    health: any;
  };
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [data, setData] = useState(initialData);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // 30s default
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isPending, startTransition] = useTransition();

  const handleRefresh = async () => {
    startTransition(async () => {
      const res = await getLiveStatsAction();
      if (res.success && res.data) {
        setData(res.data);
        setLastUpdated(new Date());
      }
    });
  };

  // Setup auto refresh loop
  useEffect(() => {
    if (refreshInterval === 0) return;

    const timer = setInterval(() => {
      handleRefresh();
    }, refreshInterval * 1000);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  const { stats, recentUsers, auditLogs, health } = data;

  const badgeVariants: Record<string, "success" | "warning" | "default" | "danger" | "secondary"> = {
    APPROVED: "success",
    PENDING: "warning",
    DRAFT: "secondary",
    REJECTED: "danger",
    SUSPENDED: "danger",
  };

  return (
    <div className="space-y-6">
      {/* Live Sync Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-850 p-4 rounded-xl">
        <div className="flex items-center gap-3 select-text">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-bold text-slate-400">
            Last synced: {lastUpdated.toLocaleTimeString()}
          </span>
          {isPending && (
            <span className="text-[10px] font-bold text-primary animate-pulse">
              Syncing live metrics...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Refresh interval:</span>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-bold text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={10}>10 Seconds</option>
            <option value={30}>30 Seconds</option>
            <option value={60}>60 Seconds</option>
            <option value={0}>Off (Manual)</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label="Refresh dashboard metrics"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 select-text">
        <Card className="bg-slate-900 border-slate-850 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Database Engine</span>
            <Database className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-white">
              {health?.services?.database?.status === "UP" ? "Connected" : "Offline"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Latency: {health?.services?.database?.latencyMs || 0}ms
            </p>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-850 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cache Store</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-white">
              {health?.services?.cache?.status === "UP" ? "Connected" : "Offline"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Latency: {health?.services?.cache?.latencyMs || 0}ms
            </p>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-850 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Background Daemon</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-white uppercase">
              {health?.services?.scheduler?.status || "UP"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Provider: {health?.services?.scheduler?.provider || "Memory"}
            </p>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-850 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Server Memory</span>
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-white">
              {health?.memory?.used || "N/A"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Total Limit: {health?.memory?.total || "N/A"}
            </p>
          </div>
        </Card>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 select-text">
        <Card className="bg-slate-900 border-slate-850">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Registers</p>
              <p className="text-2xl font-black mt-1 text-white">{stats.totalUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-850">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Pending Review</p>
              <p className="text-2xl font-black mt-1 text-white">{stats.pendingProfiles}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-850">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Active Subs</p>
              <p className="text-2xl font-black mt-1 text-white">{stats.activeMemberships}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-850">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <span className="text-lg font-black">₹</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Gross Revenues</p>
              <p className="text-2xl font-black mt-1 text-white">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables feed row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-text">
        <div className="lg:col-span-8">
          <AdminCard title="Recent Registrations" subtitle="Fresh user signups and profiles pending initial moderation review">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/20 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">User Details</th>
                    <th className="pb-3 px-4">City location</th>
                    <th className="pb-3 px-4">Approval State</th>
                    <th className="pb-3 pl-4 text-right">Date joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/25">
                  {recentUsers.map((user, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{user.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">{user.city}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={badgeVariants[user.status] || "default"}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 pl-4 text-right text-slate-400 font-semibold">{user.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>

        <div className="lg:col-span-4">
          <AdminCard title="Security timeline feed" subtitle="Immutable administrative change ledger tracking logins and flags">
            <div className="space-y-4">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 shrink-0 text-slate-400 border border-slate-800">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-white truncate">{log.action}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{log.details}</p>
                    <p className="text-[9px] text-slate-500 font-semibold mt-1">{log.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
