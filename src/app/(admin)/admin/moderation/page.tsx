import React from "react";
import { verifyAdminAccess } from "@/lib/actions/admin-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/design-system";
import { ModerationClient } from "./moderation-client";

export default async function ModerationPage() {
  // 1. RBAC Guard and Feature Flag Check
  await verifyAdminAccess("MANAGE_MODERATION", "Moderation");

  // 2. Fetch pending profiles
  const pendingProfiles = await prisma.profile.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
  });

  // 3. Map database records
  const mapped = pendingProfiles.map((p) => ({
    id: p.id,
    userId: p.userId,
    name: p.user?.name || "Unnamed User",
    email: p.user?.email || "N/A",
    gender: p.gender || "Not Specified",
    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.toLocaleDateString() : "Not Set",
    religion: p.religion || "Not Specified",
    caste: p.caste || "N/A",
    income: p.income || 0,
    bio: p.bio || "No biography details shared.",
  }));

  return (
    <main id="admin-main-content" className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      <AdminPageHeader
        title="Profile Moderation Console"
        description="Verify individual profile registrations, check self-reported biographies, and suspend or flag violating accounts."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Moderation" }
        ]}
      />

      <ModerationClient initialProfiles={mapped} />
    </main>
  );
}
