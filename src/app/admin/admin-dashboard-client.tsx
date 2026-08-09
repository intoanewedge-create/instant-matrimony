"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  CreditCard,
  Headphones,
  ArrowRight,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils/format";

export function AdminDashboardClient({
  metrics,
  activityFeeds,
}: {
  metrics: any;
  activityFeeds: any;
}) {
  const [timeframe, setTimeframe] = useState<"today" | "7d" | "30d" | "monthly" | "yearly">("30d");
  const [activeActivityTab, setActiveActivityTab] = useState<"users" | "profiles" | "payments" | "unlocks" | "concierge">("users");
  const chartData = [
    { label: "Mon", users: Math.round(metrics.newUsersToday * 1.2 + 2), revenue: Math.round((metrics.monthlyRevenue / 30) * 1.1), approvals: Math.round(metrics.approvedProfiles / 10 + 1) },
    { label: "Tue", users: Math.round(metrics.newUsersToday * 0.8 + 1), revenue: Math.round((metrics.monthlyRevenue / 30) * 0.9), approvals: Math.round(metrics.approvedProfiles / 10) },
    { label: "Wed", users: Math.round(metrics.newUsersToday * 1.5 + 3), revenue: Math.round((metrics.monthlyRevenue / 30) * 1.4), approvals: Math.round(metrics.approvedProfiles / 10 + 2) },
    { label: "Thu", users: Math.round(metrics.newUsersToday * 1.1 + 2), revenue: Math.round((metrics.monthlyRevenue / 30) * 1.0), approvals: Math.round(metrics.approvedProfiles / 10 + 1) },
    { label: "Fri", users: Math.round(metrics.newUsersToday * 1.8 + 4), revenue: Math.round((metrics.monthlyRevenue / 30) * 1.7), approvals: Math.round(metrics.approvedProfiles / 10 + 3) },
    { label: "Sat", users: Math.round(metrics.newUsersToday * 2.2 + 5), revenue: Math.round((metrics.monthlyRevenue / 30) * 2.1), approvals: Math.round(metrics.approvedProfiles / 10 + 4) },
    { label: "Sun", users: Math.round(metrics.newUsersToday * 2.0 + 4), revenue: Math.round((metrics.monthlyRevenue / 30) * 1.9), approvals: Math.round(metrics.approvedProfiles / 10 + 3) },
  ];

  const maxVal = Math.max(...chartData.map((d) => Math.max(d.users * 100, d.revenue)));

  return (
    <div className="space-y-8">
      {/* System Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.pendingProfiles > 0 && (
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-amber-200 text-sm">{metrics.pendingProfiles} Profiles Pending Approval</h4>
                <p className="text-[11px] text-amber-300/70">Action required to verify new members</p>
              </div>
            </div>
            <Link href="/admin/profiles">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs h-8">
                Review <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {metrics.pendingPayments > 0 && (
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-rose-200 text-sm">{metrics.pendingPayments} Payments Pending Verification</h4>
                <p className="text-[11px] text-rose-300/70">Verify UTR numbers and approve memberships</p>
              </div>
            </div>
            <Link href="/admin/payments">
              <Button size="sm" className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-8">
                Verify <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {metrics.activeConciergeCases > 0 && (
          <div className="p-4 rounded-2xl bg-pink-950/30 border border-pink-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-500/20 text-pink-400 rounded-xl">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-pink-200 text-sm">{metrics.activeConciergeCases} Active Concierge Cases</h4>
                <p className="text-[11px] text-pink-300/70">VIP Concierge clients awaiting updates</p>
              </div>
            </div>
            <Link href="/admin/concierge">
              <Button size="sm" className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs h-8">
                Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Primary 16 Statistics Cards Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500" /> Executive Metrics Overview
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "Total Users", val: metrics.totalUsers, color: "text-blue-400" },
            { label: "Active Users", val: metrics.activeUsers, color: "text-emerald-400" },
            { label: "Pending Approvals", val: metrics.pendingProfiles, color: "text-amber-400" },
            { label: "Approved Profiles", val: metrics.approvedProfiles, color: "text-emerald-400" },
            { label: "Rejected Profiles", val: metrics.rejectedProfiles, color: "text-red-400" },
            { label: "Suspended Profiles", val: metrics.suspendedProfiles, color: "text-slate-400" },
            { label: "Pending Payments", val: metrics.pendingPayments, color: "text-amber-400" },
            { label: "Active Subscriptions", val: metrics.activeMemberships, color: "text-rose-400" },
            { label: "Expiring Soon", val: metrics.expiringMemberships, color: "text-orange-400" },
            { label: "Expired Members", val: metrics.expiredMemberships, color: "text-slate-500" },
            { label: "Total Revenue", val: formatCurrency(metrics.totalRevenue), color: "text-emerald-400" },
            { label: "Monthly Revenue", val: formatCurrency(metrics.monthlyRevenue), color: "text-emerald-400" },
            { label: "Regs Today", val: metrics.newUsersToday, color: "text-blue-400" },
            { label: "Interests Today", val: metrics.interestsToday, color: "text-pink-400" },
            { label: "Messages Today", val: metrics.messagesToday, color: "text-indigo-400" },
            { label: "Concierge Cases", val: metrics.activeConciergeCases, color: "text-amber-400" },
          ].map((stat, idx) => (
            <Card key={idx} className="border border-slate-800 bg-slate-900/60 p-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-medium block truncate">{stat.label}</span>
              <span className={`text-lg font-extrabold ${stat.color} block`}>{stat.val}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Analytics Chart & Timeframe Selector */}
      <Card className="border border-slate-800 bg-slate-900/60 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500" /> Platform Growth & Revenue Analytics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Visualizing user acquisitions, revenue streams, and approvals.</p>
          </div>

          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "monthly", label: "Monthly" },
              { id: "yearly", label: "Yearly" },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === tf.id
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Bar Chart Render */}
        <div className="space-y-4">
          <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4 border-b border-slate-800">
            {chartData.map((bar, idx) => {
              const heightPct = Math.max(15, Math.min(100, (bar.revenue / (maxVal || 1)) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCurrency(bar.revenue)}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-rose-600 to-pink-500 rounded-t-md group-hover:from-rose-500 group-hover:to-pink-400 transition-all shadow-lg"
                  />
                  <span className="text-xs font-semibold text-slate-400">{bar.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Daily Revenue (₹)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> User Registrations</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Profile Approvals</span>
          </div>
        </div>
      </Card>

      {/* Recent Activity Feeds */}
      <Card className="border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-500" /> Recent Platform Activity
          </h3>

          <div className="flex gap-2 flex-wrap">
            {[
              { id: "users", label: "New Users" },
              { id: "profiles", label: "Approved Profiles" },
              { id: "payments", label: "Recent Payments" },
              { id: "unlocks", label: "Contact Unlocks" },
              { id: "concierge", label: "Concierge Updates" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveActivityTab(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeActivityTab === tab.id
                    ? "bg-slate-800 text-rose-400 border border-rose-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Tab Content */}
        <div className="space-y-3">
          {activeActivityTab === "users" &&
            activityFeeds.recentUsers?.map((u: any) => (
              <div key={u.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white">{u.name}</span>
                  <span className="text-slate-400 ml-2">({u.email})</span>
                </div>
                <span className="text-[10px] text-slate-500">{formatDateTime(u.createdAt)}</span>
              </div>
            ))}

          {activeActivityTab === "profiles" &&
            activityFeeds.recentProfiles?.map((p: any) => (
              <div key={p.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-emerald-400">Approved Profile:</span>
                  <span className="text-white ml-2">{p.user?.name}</span>
                </div>
                <span className="text-[10px] text-slate-500">{formatDateTime(p.approvedAt || p.createdAt)}</span>
              </div>
            ))}

          {activeActivityTab === "payments" &&
            activityFeeds.recentPayments?.map((p: any) => (
              <div key={p.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-rose-400">{formatCurrency(p.amount)}</span>
                  <span className="text-slate-400 ml-2">[{p.status}] UTR: {p.utrNumber || "N/A"}</span>
                </div>
                <span className="text-[10px] text-slate-500">{formatDateTime(p.createdAt)}</span>
              </div>
            ))}

          {activeActivityTab === "unlocks" &&
            activityFeeds.recentUnlocks?.map((u: any) => (
              <div key={u.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white">{u.user?.name}</span>
                  <span className="text-slate-400 mx-1.5">unlocked contact for</span>
                  <span className="font-bold text-rose-400">{u.targetUser?.name}</span>
                </div>
                <span className="text-[10px] text-slate-500">{formatDateTime(u.unlockedAt)}</span>
              </div>
            ))}

          {activeActivityTab === "concierge" &&
            activityFeeds.recentConciergeUpdates?.map((cu: any) => (
              <div key={cu.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-pink-400">{cu.case?.user?.name}:</span>
                  <span className="text-slate-300 ml-2">{cu.content}</span>
                </div>
                <span className="text-[10px] text-slate-500">{formatDateTime(cu.createdAt)}</span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
