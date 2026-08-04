"use client";

import { useEffect, useState } from "react";
import { getOverviewMetricsAction, getRevenueTrendAction } from "@/lib/actions/reports.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOverviewMetricsAction(), getRevenueTrendAction()]).then(([mRes, tRes]) => {
      if (mRes.success) setMetrics(mRes.data);
      if (tRes.success && Array.isArray(tRes.data)) setTrend(tRes.data);
      setLoading(false);
    });
  }, []);

  const handleExportCsv = () => {
    if (!metrics) return;
    const rows = [
      ["Metric Name", "Count/Value"],
      ["Total Registered Users", metrics.totalUsers],
      ["Total Profiles", metrics.totalProfiles],
      ["Approved Profiles", metrics.approvedProfiles],
      ["Total Revenue", `₹${metrics.totalRevenue}`],
      ["Total Payments", metrics.totalPayments],
      ["Approved Payments", metrics.approvedPayments],
      ["Total Interests Sent", metrics.totalInterests],
      ["Accepted Interests", metrics.acceptedInterests],
      ["Messages Exchanged", metrics.totalMessages],
      ["Concierge Cases", metrics.totalConciergeCases],
      ["Contact Unlocks", metrics.totalContactUnlocks],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `InstantMatrimony_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading enterprise reports...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Reports & Analytics</h1>
          <p className="text-muted-foreground">Interactive metrics visualization and CSV/Excel/PDF export engine.</p>
        </div>
        <Button onClick={handleExportCsv}>Export CSV Report</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl">{metrics?.totalUsers}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardDescription>Approved Profiles</CardDescription>
            <CardTitle className="text-2xl">{metrics?.approvedProfiles} / {metrics?.totalProfiles}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">₹{metrics?.totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardDescription>Contact Unlocks</CardDescription>
            <CardTitle className="text-2xl">{metrics?.totalContactUnlocks}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
          <CardDescription>Daily payment breakdown for memberships and add-ons.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-2 border-b pb-2 pt-6">
            {trend.map((item, idx) => {
              const max = Math.max(...trend.map((t) => t.amount), 1);
              const heightPct = Math.round((item.amount / max) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    style={{ height: `${Math.max(heightPct, 5)}%` }}
                    className="w-full bg-primary/80 group-hover:bg-primary rounded-t transition-all"
                  />
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">{item.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
