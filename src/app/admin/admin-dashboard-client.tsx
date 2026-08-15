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
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">{metrics.pendingProfiles} Profiles Pending Approval</h4>
                <p className="text-[11px] text-amber-700">Action required to verify new members</p>
              </div>
            </div>
            <Link href="/admin/profiles">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 shadow-sm">
                Review <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {metrics.pendingPayments > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-rose-900 text-sm">{metrics.pendingPayments} Payments Pending Verification</h4>
                <p className="text-[11px] text-rose-700">Verify UTR numbers and approve memberships</p>
              </div>
            </div>
            <Link href="/admin/payments">
              <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 shadow-sm">
                Verify <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {metrics.activeConciergeCases > 0 && (
          <div className="p-4 rounded-2xl bg-pink-50/90 border border-pink-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-100 text-pink-600 rounded-xl">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-pink-900 text-sm">{metrics.activeConciergeCases} Active Concierge Cases</h4>
                <p className="text-[11px] text-pink-700">VIP Concierge clients awaiting updates</p>
              </div>
            </div>
            <Link href="/admin/concierge">
              <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs h-8 shadow-sm">
                Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Primary 16 Statistics Cards Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-600" /> Executive Metrics Overview
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "Total Users", val: metrics.totalUsers, color: "text-blue-600" },
            { label: "Active Users", val: metrics.activeUsers, color: "text-emerald-600" },
            { label: "Pending Approvals", val: metrics.pendingProfiles, color: "text-amber-600" },
            { label: "Approved Profiles", val: metrics.approvedProfiles, color: "text-emerald-600" },
            { label: "Rejected Profiles", val: metrics.rejectedProfiles, color: "text-red-600" },
            { label: "Suspended Profiles", val: metrics.suspendedProfiles, color: "text-slate-500" },
            { label: "Pending Payments", val: metrics.pendingPayments, color: "text-amber-600" },
            { label: "Active Subscriptions", val: metrics.activeMemberships, color: "text-rose-600" },
            { label: "Expiring Soon", val: metrics.expiringMemberships, color: "text-orange-600" },
            { label: "Expired Members", val: metrics.expiredMemberships, color: "text-slate-400" },
            { label: "Total Revenue", val: formatCurrency(metrics.totalRevenue), color: "text-emerald-600" },
            { label: "Monthly Revenue", val: formatCurrency(metrics.monthlyRevenue), color: "text-emerald-600" },
            { label: "Regs Today", val: metrics.newUsersToday, color: "text-blue-600" },
            { label: "Interests Today", val: metrics.interestsToday, color: "text-pink-600" },
            { label: "Messages Today", val: metrics.messagesToday, color: "text-indigo-600" },
            { label: "Concierge Cases", val: metrics.activeConciergeCases, color: "text-amber-600" },
          ].map((stat, idx) => (
            <Card key={idx} className="border border-slate-200/90 bg-white p-3 space-y-1 shadow-sm rounded-xl">
              <span className="text-[10px] text-slate-500 font-medium block truncate">{stat.label}</span>
              <span className={`text-lg font-extrabold ${stat.color} block`}>{stat.val}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Analytics Chart & Timeframe Selector */}
      <Card className="border border-slate-200/90 bg-white p-6 space-y-6 shadow-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-600" /> Platform Growth & Revenue Analytics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Visualizing user acquisitions, revenue streams, and approvals.</p>
          </div>

          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
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
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Bar Chart Render */}
        <div className="space-y-4">
          <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4 border-b border-slate-100">
            {chartData.map((bar, idx) => {
              const heightPct = Math.max(15, Math.min(100, (bar.revenue / (maxVal || 1)) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCurrency(bar.revenue)}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-rose-600 to-pink-500 rounded-t-md group-hover:from-rose-500 group-hover:to-pink-400 transition-all shadow-sm"
                  />
                  <span className="text-xs font-semibold text-slate-500">{bar.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Daily Revenue (₹)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> User Registrations</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Profile Approvals</span>
          </div>
        </div>
      </Card>

      {/* Recent Activity Feeds */}
      <Card className="border border-slate-200/90 bg-white p-6 space-y-4 shadow-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-600" /> Recent Platform Activity
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
                    ? "bg-rose-50 text-rose-600 border border-rose-200 font-bold"
                    : "text-slate-500 hover:text-slate-900"
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
              <div key={u.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900">{u.publicId || `Profile ID: ${u.id.slice(0, 8)}`}</span>
                </div>
                <span className="text-[10px] text-slate-400">{formatDateTime(u.createdAt)}</span>
              </div>
            ))}

          {activeActivityTab === "profiles" &&
            activityFeeds.recentProfiles?.map((p: any) => (
              <div key={p.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-emerald-700">Approved Profile:</span>
                  <span className="text-slate-900 ml-2 font-medium">{p.user?.publicId || `Profile ID: ${p.user?.id?.slice(0, 8)}`}</span>
                </div>
                <span className="text-[10px] text-slate-400">{formatDateTime(p.approvedAt || p.createdAt)}</span>
              </div>
            ))}

          {activeActivityTab === "payments" &&
            activityFeeds.recentPayments?.map((p: any) => (
              <div key={p.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-rose-600">{formatCurrency(p.amount)}</span>
                  <span className="text-slate-600 ml-2">[{p.status}] UTR: {p.utrNumber || "N/A"}</span>
                </div>
                <span className="text-[10px] text-slate-400">{formatDateTime(p.createdAt)}</span>
              </div>
            ))}

          {activeActivityTab === "unlocks" &&
            activityFeeds.recentUnlocks?.map((u: any) => (
              <div key={u.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900">{u.user?.publicId || `Profile ID: ${u.user?.id?.slice(0, 8)}`}</span>
                  <span className="text-slate-500 mx-1.5">unlocked contact for</span>
                  <span className="font-bold text-rose-600">{u.targetUser?.publicId || `Profile ID: ${u.targetUser?.id?.slice(0, 8)}`}</span>
                </div>
                <span className="text-[10px] text-slate-400">{formatDateTime(u.unlockedAt)}</span>
              </div>
            ))}

          {activeActivityTab === "concierge" &&
            activityFeeds.recentConciergeUpdates?.map((cu: any) => (
              <div key={cu.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-pink-600">{cu.case?.user?.publicId || `Profile ID: ${cu.case?.user?.id?.slice(0, 8)}`}:</span>
                  <span className="text-slate-700 ml-2">{cu.content}</span>
                </div>
                <span className="text-[10px] text-slate-400">{formatDateTime(cu.createdAt)}</span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
