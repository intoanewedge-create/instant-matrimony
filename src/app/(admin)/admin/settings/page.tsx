import React from "react";
import { verifyAdminAccess } from "@/lib/actions/admin-guard";
import { container } from "@/lib/container";
import { AdminPageHeader } from "@/components/admin/design-system";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  // 1. RBAC Guard check
  await verifyAdminAccess("MANAGE_SYSTEM");

  // 2. Load flags
  let flagsRes = await container.services.featureFlagService.listFlags();
  if (!flagsRes.success || !flagsRes.data) {
    throw new Error(flagsRes.error || "Failed to load feature flags.");
  }

  let flags = flagsRes.data;

  // 3. Dynamic Seeding of missing module flags
  const moduleKeys = [
    { key: "analytics", desc: "Allows viewing Business Intelligence and charts", cat: "Admin Workspaces" },
    { key: "marketing", desc: "Allows managing newsletters, coupon codes, and email templates", cat: "Admin Workspaces" },
    { key: "cms", desc: "Allows publishing and rolling back dynamic pages", cat: "Admin Workspaces" },
    { key: "reports", desc: "Allows generating CSV/Excel reports", cat: "Admin Workspaces" },
    { key: "moderation", desc: "Allows approving profiles, banning users, and blacklist entries", cat: "Admin Workspaces" },
    { key: "verification", desc: "Allows approving/rejecting government ID submissions", cat: "Admin Workspaces" },
  ];

  let seededAny = false;
  for (const mod of moduleKeys) {
    const exists = flags.some((f) => f.key === mod.key);
    if (!exists) {
      await container.services.featureFlagService.setFlag(mod.key, true, "true", mod.desc, mod.cat);
      seededAny = true;
    }
  }

  if (seededAny) {
    // Reload flags from DB to get the newly seeded records
    flagsRes = await container.services.featureFlagService.listFlags();
    flags = flagsRes.data || [];
  }

  return (
    <main id="admin-main-content" className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      <AdminPageHeader
        title="Settings & Feature Flags"
        description="Enable/disable workspaces, configure API endpoints, adjust moderation sensitivity thresholds, and toggle functional feature gates."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Settings" }
        ]}
      />

      <SettingsForm initialFlags={flags} />
    </main>
  );
}
