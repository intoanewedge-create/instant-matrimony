"use client";

import { useEffect, useState } from "react";
import { isSystemInstalledAction, runSetupWizardAction } from "@/lib/actions/installer.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InstallerWizardPage() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    adminName: "Super Admin",
    adminEmail: "admin@instantmatrimony.com",
    adminPassword: "AdminPassword123!",
    websiteName: "InstantMatrimony",
    companyName: "InstantMatrimony Tech Solutions Pvt Ltd",
    contactEmail: "support@instantmatrimony.com",
    contactPhone: "+91 98765 43210",
    primaryColor: "#e11d48",
    currency: "INR",
  });

  useEffect(() => {
    isSystemInstalledAction().then((installed) => {
      setIsInstalled(installed);
      setLoading(false);
    });
  }, []);

  const handleChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleFinish = async () => {
    setSubmitting(true);
    const res = await runSetupWizardAction(formData);
    setSubmitting(false);
    if (res.success) {
      setIsInstalled(true);
    } else {
      alert(`Setup error: ${res.error}`);
    }
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground">Checking installation status...</div>;

  if (isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-emerald-600 font-bold text-2xl">System Installed & Locked</CardTitle>
            <CardDescription>
              InstantMatrimony has already been configured and activated. The Setup Wizard is automatically disabled for security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => (window.location.href = "/admin")}>
              Go to Admin Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-2xl font-bold text-primary">InstantMatrimony Setup Wizard</CardTitle>
              <CardDescription>First-time commercial environment installer & database seeder</CardDescription>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-mono text-xs font-semibold">
              Step {step} of 3
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">1. Administrator Account Setup</h3>
              <div>
                <Label>Super Admin Full Name</Label>
                <Input value={formData.adminName} onChange={(e) => handleChange("adminName", e.target.value)} />
              </div>
              <div>
                <Label>Admin Email Address</Label>
                <Input value={formData.adminEmail} onChange={(e) => handleChange("adminEmail", e.target.value)} />
              </div>
              <div>
                <Label>Admin Password</Label>
                <Input type="password" value={formData.adminPassword} onChange={(e) => handleChange("adminPassword", e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => setStep(2)}>Next: Website Branding</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">2. Website White-Label Branding</h3>
              <div>
                <Label>Website Name</Label>
                <Input value={formData.websiteName} onChange={(e) => handleChange("websiteName", e.target.value)} />
              </div>
              <div>
                <Label>Company Name</Label>
                <Input value={formData.companyName} onChange={(e) => handleChange("companyName", e.target.value)} />
              </div>
              <div>
                <Label>Support Email</Label>
                <Input value={formData.contactEmail} onChange={(e) => handleChange("contactEmail", e.target.value)} />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input value={formData.contactPhone} onChange={(e) => handleChange("contactPhone", e.target.value)} />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(3)}>Next: Finalize</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">3. Confirm & Complete Installation</h3>
              <p className="text-sm text-muted-foreground">
                Clicking finish will seed master tables, initialize system settings, register your Super Admin account, and lock the setup wizard permanently.
              </p>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" onClick={handleFinish} disabled={submitting}>
                  {submitting ? "Installing System..." : "Complete Setup & Lock Installer"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
