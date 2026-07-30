import React from "react";
import { verifyAdminAccess } from "@/lib/actions/admin-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/design-system";
import { AdminVerificationClient } from "./verification-client";

export default async function AdminVerificationPage() {
  // 1. RBAC Guard and Feature Flag Check
  await verifyAdminAccess("MANAGE_VERIFICATION", "Verification");

  // 2. Fetch pending verifications
  const pendingVerifications = await prisma.identityVerification.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      documentMedia: true,
      selfieMedia: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  // 3. Fetch pending photos
  const pendingPhotos = await prisma.photo.findMany({
    where: { isApproved: false },
    include: {
      profile: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 4. Map records safely
  const serializedVerifications = pendingVerifications.map((v) => ({
    id: v.id,
    userId: v.userId,
    userName: v.user?.name || "Unnamed User",
    userEmail: v.user?.email || "N/A",
    documentType: v.documentType,
    documentUrl: v.documentMedia?.url || "",
    selfieUrl: v.selfieMedia?.url || "",
    submittedAt: v.updatedAt.toISOString(),
  }));

  const serializedPhotos = pendingPhotos.map((p) => ({
    id: p.id,
    profileId: p.profileId,
    userName: p.profile?.user?.name || "Unnamed User",
    url: p.url,
    isMain: p.isMain,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <main id="admin-main-content" className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      <AdminPageHeader
        title="Verification & Media Control"
        description="Verify government documents, inspect user selfie matching pairs, and review profile gallery uploads."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Media Verifications" }
        ]}
      />

      <AdminVerificationClient
        verifications={serializedVerifications}
        photos={serializedPhotos}
      />
    </main>
  );
}
