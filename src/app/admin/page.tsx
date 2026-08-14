import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "./admin-dashboard-client";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if ((session.user as any).role !== "ADMIN") {
    redirect("/error/403");
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let totalUsers = 0;
  let activeUsers = 0;
  let pendingProfiles = 0;
  let approvedProfiles = 0;
  let rejectedProfiles = 0;
  let suspendedProfiles = 0;
  let pendingPayments = 0;
  let activeMemberships = 0;
  let expiringMemberships = 0;
  let expiredMemberships = 0;
  let totalRevenue = 0;
  let monthlyRevenue = 0;
  let newUsersToday = 0;
  let interestsToday = 0;
  let messagesToday = 0;
  let activeConciergeCases = 0;
  let recentUsers: any[] = [];
  let recentProfiles: any[] = [];
  let recentPayments: any[] = [];
  let recentUnlocks: any[] = [];
  let recentConciergeUpdates: any[] = [];

  try {
    const [
      tu,
      au,
      pp,
      ap,
      rp,
      sp,
      ppay,
      am,
      em,
      exm,
      paymentsApproved,
      monthlyPaymentsApproved,
      nut,
      it,
      mt,
      acc,
      rUsers,
      rProfiles,
      rPayments,
      rUnlocks,
      rConciergeUpdates,
    ] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.user.count({ where: { isActive: true } }).catch(() => 0),
      prisma.profile.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.profile.count({ where: { status: "APPROVED" } }).catch(() => 0),
      prisma.profile.count({ where: { status: "REJECTED" } }).catch(() => 0),
      prisma.profile.count({ where: { status: "SUSPENDED" } }).catch(() => 0),
      prisma.payment.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.membership.count({ where: { status: "ACTIVE" } }).catch(() => 0),
      prisma.membership
        .count({
          where: {
            status: "ACTIVE",
            endDate: { lte: new Date(Date.now() + 7 * 86400000) },
          },
        })
        .catch(() => 0),
      prisma.membership.count({ where: { status: "EXPIRED" } }).catch(() => 0),
      prisma.payment
        .aggregate({
          where: { status: "PAID" },
          _sum: { amount: true },
        })
        .catch(() => ({ _sum: { amount: 0 } })),
      prisma.payment
        .aggregate({
          where: { status: "PAID", createdAt: { gte: startOfMonth } },
          _sum: { amount: true },
        })
        .catch(() => ({ _sum: { amount: 0 } })),
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }).catch(() => 0),
      prisma.interest.count({ where: { createdAt: { gte: startOfToday } } }).catch(() => 0),
      prisma.message.count({ where: { createdAt: { gte: startOfToday } } }).catch(() => 0),
      prisma.conciergeCase.count({ where: { status: { not: "CLOSED" } } }).catch(() => 0),
      // Recent activity feeds
      prisma.user
        .findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, email: true, createdAt: true },
        })
        .catch(() => []),
      prisma.profile
        .findMany({
          where: { status: "APPROVED" },
          orderBy: { approvedAt: "desc" },
          take: 5,
          include: { user: { select: { name: true } } },
        })
        .catch(() => []),
      prisma.payment
        .findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { order: true },
        })
        .catch(() => []),
      prisma.contactUnlock
        .findMany({
          orderBy: { unlockedAt: "desc" },
          take: 5,
          include: {
            user: { select: { name: true } },
            targetUser: { select: { name: true } },
          },
        })
        .catch(() => []),
      prisma.conciergeUpdate
        .findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { case: { include: { user: { select: { name: true } } } } },
        })
        .catch(() => []),
    ]);

    totalUsers = tu;
    activeUsers = au;
    pendingProfiles = pp;
    approvedProfiles = ap;
    rejectedProfiles = rp;
    suspendedProfiles = sp;
    pendingPayments = ppay;
    activeMemberships = am;
    expiringMemberships = em;
    expiredMemberships = exm;
    totalRevenue = paymentsApproved._sum?.amount || 0;
    monthlyRevenue = monthlyPaymentsApproved._sum?.amount || 0;
    newUsersToday = nut;
    interestsToday = it;
    messagesToday = mt;
    activeConciergeCases = acc;
    recentUsers = rUsers;
    recentProfiles = rProfiles;
    recentPayments = rPayments;
    recentUnlocks = rUnlocks;
    recentConciergeUpdates = rConciergeUpdates;
  } catch (error) {
    console.error("Admin dashboard metrics query error:", error);
  }

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
    totalRevenue,
    monthlyRevenue,
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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Executive Admin Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
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
