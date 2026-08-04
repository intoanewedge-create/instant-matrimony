import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "./admin-dashboard-client";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Parallel metrics queries
  const [
    totalUsers,
    activeUsers,
    pendingProfiles,
    approvedProfiles,
    rejectedProfiles,
    suspendedProfiles,
    pendingPayments,
    activeMemberships,
    expiringMemberships,
    expiredMemberships,
    paymentsApproved,
    monthlyPaymentsApproved,
    newUsersToday,
    interestsToday,
    messagesToday,
    activeConciergeCases,
    recentUsers,
    recentProfiles,
    recentPayments,
    recentUnlocks,
    recentConciergeUpdates,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.profile.count({ where: { status: "PENDING" } }),
    prisma.profile.count({ where: { status: "APPROVED" } }),
    prisma.profile.count({ where: { status: "REJECTED" } }),
    prisma.profile.count({ where: { status: "SUSPENDED" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.membership.count({ where: { status: "ACTIVE" } }),
    prisma.membership.count({
      where: {
        status: "ACTIVE",
        endDate: { lte: new Date(Date.now() + 7 * 86400000) },
      },
    }),
    prisma.membership.count({ where: { status: "EXPIRED" } }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.interest.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.message.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.conciergeCase.count({ where: { status: { not: "CLOSED" } } }),
    // Recent activity feeds
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.profile.findMany({
      where: { status: "APPROVED" },
      orderBy: { approvedAt: "desc" },
      take: 5,
      include: { user: { select: { name: true } } },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { order: true },
    }),
    prisma.contactUnlock.findMany({
      orderBy: { unlockedAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        targetUser: { select: { name: true } },
      },
    }),
    prisma.conciergeUpdate.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { case: { include: { user: { select: { name: true } } } } },
    }),
  ]);

  const metrics = {
    totalUsers,
    activeUsers,
    pendingProfiles,
    approvedProfiles,
    rejectedProfiles,
    suspendedProfiles,
    pendingPayments,
    activeMemberships,
    expiringMemberships,
    expiredMemberships,
    totalRevenue: paymentsApproved._sum.amount || 0,
    monthlyRevenue: monthlyPaymentsApproved._sum.amount || 0,
    newUsersToday,
    interestsToday,
    messagesToday,
    activeConciergeCases,
  };

  const activityFeeds = {
    recentUsers,
    recentProfiles,
    recentPayments,
    recentUnlocks,
    recentConciergeUpdates,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Executive Admin Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">
          Realtime operational metrics, financial analytics, approval queues, and system alerts.
        </p>
      </div>

      <AdminDashboardClient
        metrics={metrics}
        activityFeeds={JSON.parse(JSON.stringify(activityFeeds))}
      />
    </div>
  );
}
