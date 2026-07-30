import React from "react";
import { verifyAdminAccess } from "@/lib/actions/admin-guard";
import { prisma } from "@/lib/prisma";
import { healthService } from "@/lib/services/health.service";
import { AdminPageHeader } from "@/components/admin/design-system";
import { DashboardClient } from "./dashboard-client";

export default async function AdminDashboardPage() {
  // 1. RBAC Guard Gating
  await verifyAdminAccess("VIEW_ANALYTICS");

  // 2. Query initial data
  const userCount = await prisma.user.count();
  const pendingCount = await prisma.profile.count({ where: { status: "PENDING" } });
  const membershipCount = await prisma.membership.count({ where: { status: "ACTIVE" } });
  
  const payments = await prisma.payment.findMany({ where: { status: "PAID" } });
  const revenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

  const dbUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { profile: true },
  });
  const recentUsers = dbUsers.map((u) => ({
    id: u.id,
    name: u.name || "Unnamed User",
    email: u.email,
    city: u.profile?.city || "Not set",
    status: u.profile?.status || "DRAFT",
    date: new Date(u.createdAt).toLocaleDateString(),
  }));

  const dbLogs = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });
  const auditLogs = dbLogs.map((l) => ({
    action: l.action,
    details: l.details || "",
    date: new Date(l.createdAt).toLocaleDateString(),
  }));

  const health = await healthService.getHealth();

  const initialData = {
    stats: {
      totalUsers: userCount,
      pendingProfiles: pendingCount,
      activeMemberships: membershipCount,
      totalRevenue: revenue || 0,
    },
    recentUsers,
    auditLogs,
    health,
  };

  return (
    <main id="admin-main-content" className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      <AdminPageHeader
        title="Operations Control Center"
        description="Live dashboard monitoring user verification streams, payments ledger, and system background task engines."
        breadcrumbs={[
          { label: "Dashboard" }
        ]}
      />

      <DashboardClient initialData={initialData} />
    </main>
  );
}
