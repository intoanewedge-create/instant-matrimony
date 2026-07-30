"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/design-system";
import { Button } from "@/components/ui/button";

function DisabledModuleContent() {
  const searchParams = useSearchParams();
  const moduleName = searchParams.get("module") || "Requested";

  return (
    <main id="admin-main-content" className="p-6 max-w-4xl mx-auto space-y-6">
      <AdminPageHeader
        title={`${moduleName} Module Disabled`}
        description="This workspace component is currently disabled under Feature Flag controls."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "System Management" }
        ]}
      />

      <AdminCard className="text-center py-12 flex flex-col items-center">
        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full mb-4">
          <SlidersHorizontal className="h-10 w-10" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">Module Offline</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          The <strong>{moduleName}</strong> engine has been switched off in the administrator controls. To re-enable it, please visit the Feature Flags page.
        </p>
        <a href="/admin/settings">
          <Button variant="default">Go to Settings</Button>
        </a>
      </AdminCard>
    </main>
  );
}

export default function DisabledModulePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs font-semibold">Loading Module Details...</div>}>
      <DisabledModuleContent />
    </Suspense>
  );
}
