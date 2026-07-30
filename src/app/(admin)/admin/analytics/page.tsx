import React from "react";
import { verifyAdminAccess } from "@/lib/actions/admin-guard";
import { getBIAnalyticsSummaryAction } from "@/lib/actions/admin.actions";
import { AdminCard, AdminPageHeader, AdminStatGrid } from "@/components/admin/design-system";
import { KpiCard } from "@/components/admin/kpi-card";
import { LineChart, BarChart, FunnelChart, CohortGrid } from "@/components/admin/chart-widgets";
import { DollarSign, MessageSquare, Search, ShieldCheck } from "lucide-react";

export default async function AnalyticsPage() {
  // 1. RBAC Guard & Feature Flag check
  await verifyAdminAccess("VIEW_ANALYTICS", "Analytics");

  // 2. Fetch BI analytics summary
  const summaryRes = await getBIAnalyticsSummaryAction();
  if (!summaryRes.success || !summaryRes.data) {
    throw new Error(summaryRes.error || "Failed to fetch analytics summary");
  }

  const data = summaryRes.data;

  // Generate dynamic line chart points for revenue trend mock data
  const revenueTrendData = [
    { date: "Mon", value: data.revenue.totalRevenue * 0.7 },
    { date: "Tue", value: data.revenue.totalRevenue * 0.85 },
    { date: "Wed", value: data.revenue.totalRevenue * 0.8 },
    { date: "Thu", value: data.revenue.totalRevenue * 0.95 },
    { date: "Fri", value: data.revenue.totalRevenue * 0.9 },
    { date: "Sat", value: data.revenue.totalRevenue * 1.1 },
    { date: "Sun", value: data.revenue.totalRevenue },
  ];

  // Group search popular queries for BarChart
  const popularQueryBars = data.searches.popularQueries.map((q) => ({
    label: q.query,
    value: q.count,
  }));

  // Map funnel data
  const funnelStages = data.funnel.map((f: any) => ({
    stage: f.stage,
    count: f.count,
    conversionRate: f.conversionRate,
  }));

  // Map cohorts data
  const cohortsData = data.cohorts.map((c: any) => ({
    cohortName: c.cohortName,
    size: c.size,
    retentionRates: c.retentionRates,
  }));

  return (
    <main id="admin-main-content" className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      <AdminPageHeader
        title="Business Intelligence"
        description="Comprehensive funnel conversion metrics, financial dashboards, messaging activity, search queries trends, and weekly cohort retention rates."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Analytics" }
        ]}
      />

      {/* KPI Cards Grid */}
      <AdminStatGrid>
        <KpiCard
          title="Total Revenue"
          value={`$${data.revenue.totalRevenue.toLocaleString()}`}
          subtext="Updated hourly"
          trend={{ value: data.revenue.growthPercent, isPositive: true }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          title="Search Activity"
          value={data.searches.totalSearches}
          subtext="Queries processed"
          trend={{ value: 12, isPositive: true }}
          icon={<Search className="h-4 w-4" />}
        />
        <KpiCard
          title="Messaging Activity"
          value={data.messaging.totalMessages}
          subtext="Messages delivered"
          trend={{ value: 8, isPositive: true }}
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <KpiCard
          title="Verified Profiles"
          value={data.verifications.totalVerified}
          subtext={`${data.verifications.pendingCount} pending review`}
          trend={{ value: data.verifications.rejectionRate, isPositive: false }}
          icon={<ShieldCheck className="h-4 w-4" />}
        />
      </AdminStatGrid>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart data={revenueTrendData} title="Revenue Growth Trend ($)" />
        {popularQueryBars.length > 0 ? (
          <BarChart data={popularQueryBars} title="Popular Search Term Frequencies" />
        ) : (
          <AdminCard title="Popular Search Term Frequencies">
            <div className="flex items-center justify-center h-[200px] text-xs font-semibold text-muted-foreground">
              No search logs recorded.
            </div>
          </AdminCard>
        )}

        <FunnelChart data={funnelStages} title="User Acquisition & Paid Conversion Funnel" />
        <CohortGrid data={cohortsData} title="Weekly Retention Cohorts" />
      </div>
    </main>
  );
}
