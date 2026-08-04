"use client";

import { useEffect, useState } from "react";
import { licenseService } from "@/lib/services/license.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminLicensePage() {
  const [license, setLicense] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    licenseService.getLicenseInfo().then((res) => {
      if (res.success) setLicense(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading license information...</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commercial License Architecture</h1>
        <p className="text-muted-foreground">Commercial distribution details, version info, domain locking, and activation status.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commercial License Details</CardTitle>
          <CardDescription>Enterprise White-Label License Key and Ownership.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 font-mono text-sm">
          <div className="flex justify-between border-b py-2">
            <span>License Key:</span>
            <span className="font-semibold text-primary">{license?.licenseKey}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>Customer Name:</span>
            <span>{license?.customerName}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>Company:</span>
            <span>{license?.company}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>Domain Binding:</span>
            <span>{license?.domain}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>Version:</span>
            <span className="bg-muted px-2 py-0.5 rounded">{license?.version}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>Activation Status:</span>
            <span className="text-emerald-600 font-bold">{license?.status}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
