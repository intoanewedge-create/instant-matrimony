import React from "react";
import { verifyAdminAccess } from "@/lib/actions/admin-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/design-system";
import { MarketingClient } from "./marketing-client";

export default async function MarketingPage() {
  // 1. RBAC Guard check
  await verifyAdminAccess("MANAGE_MARKETING", "Marketing");

  // 2. Fetch campaigns and coupons
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  // 3. Map campaigns safely
  const mappedCampaigns = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    status: c.status,
    targetSegment: c.targetSegment,
    content: c.content,
    scheduledAt: c.scheduledAt ? c.scheduledAt.toISOString() : null,
    sentCount: c.sentCount,
    clickCount: c.clickCount,
  }));

  // 4. Map coupons safely
  const mappedCoupons = coupons.map((cp) => ({
    id: cp.id,
    code: cp.code,
    discountType: cp.discountType,
    discountValue: cp.discountValue,
    startDate: cp.startDate.toISOString(),
    endDate: cp.endDate.toISOString(),
    maxRedemptions: cp.maxRedemptions,
    currentRedemptions: cp.currentRedemptions,
    isActive: cp.isActive,
  }));

  return (
    <main id="admin-main-content" className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      <AdminPageHeader
        title="Marketing & Growth Engine"
        description="Compose outbound email campaigns, distribute promo codes, and track audience click-through metrics."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Marketing" }
        ]}
      />

      <MarketingClient
        initialCampaigns={mappedCampaigns}
        initialCoupons={mappedCoupons}
      />
    </main>
  );
}
