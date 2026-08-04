import { prisma } from "../prisma";
import { Result, returnSuccess, returnFailure } from "../result";

export interface ReportMetrics {
  totalUsers: number;
  totalProfiles: number;
  approvedProfiles: number;
  pendingProfiles: number;
  totalMemberships: number;
  activeMemberships: number;
  totalRevenue: number;
  totalPayments: number;
  approvedPayments: number;
  pendingPayments: number;
  totalInterests: number;
  acceptedInterests: number;
  totalMessages: number;
  totalConciergeCases: number;
  totalContactUnlocks: number;
}

export class ReportsAnalyticsService {
  async getOverviewMetrics(): Promise<Result<ReportMetrics>> {
    try {
      const [
        totalUsers,
        totalProfiles,
        approvedProfiles,
        pendingProfiles,
        totalMemberships,
        activeMemberships,
        totalPayments,
        approvedPayments,
        pendingPayments,
        paidSum,
        totalInterests,
        acceptedInterests,
        totalMessages,
        totalConciergeCases,
        totalContactUnlocks,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.profile.count(),
        prisma.profile.count({ where: { status: "APPROVED" } }),
        prisma.profile.count({ where: { status: "PENDING" } }),
        prisma.membership.count(),
        prisma.membership.count({ where: { status: "ACTIVE" } }),
        prisma.payment.count(),
        prisma.payment.count({ where: { status: "PAID" } }),
        prisma.payment.count({ where: { status: "PENDING" } }),
        prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
        prisma.interest.count(),
        prisma.interest.count({ where: { status: "ACCEPTED" } }),
        prisma.message.count(),
        prisma.conciergeCase.count(),
        prisma.contactUnlock.count(),
      ]);

      const metrics: ReportMetrics = {
        totalUsers,
        totalProfiles,
        approvedProfiles,
        pendingProfiles,
        totalMemberships,
        activeMemberships,
        totalRevenue: paidSum._sum.amount || 0,
        totalPayments,
        approvedPayments,
        pendingPayments,
        totalInterests,
        acceptedInterests,
        totalMessages,
        totalConciergeCases,
        totalContactUnlocks,
      };

      return returnSuccess(metrics);
    } catch (e: any) {
      return returnFailure(e.message, "REPORTS_METRICS_ERROR");
    }
  }

  async getRevenueTrend(days: number = 30): Promise<Result<{ date: string; amount: number }[]>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const payments = await prisma.payment.findMany({
        where: {
          status: "PAID",
          createdAt: { gte: startDate },
        },
        select: { createdAt: true, amount: true },
      });

      const dayMap: Record<string, number> = {};
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        dayMap[dateStr] = 0;
      }

      for (const p of payments) {
        const dateStr = p.createdAt.toISOString().split("T")[0];
        if (dayMap[dateStr] !== undefined) {
          dayMap[dateStr] += p.amount;
        }
      }

      const trend = Object.entries(dayMap)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return returnSuccess(trend);
    } catch (e: any) {
      return returnFailure(e.message, "REVENUE_TREND_ERROR");
    }
  }

  exportToCsv(data: Record<string, any>[]): string {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    for (const row of data) {
      const values = headers.map((h) => {
        const val = row[h] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  }
}

export const reportsAnalyticsService = new ReportsAnalyticsService();
