"use client";

import { useEffect, useState } from "react";
import { getSettingsAction, updateSettingsAction } from "@/lib/actions/settings.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

export default function AdminProvidersPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getSettingsAction().then((res) => {
      if (res.success) setSettings(res.data);
      setLoading(false);
    });
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await updateSettingsAction(settings);
    setSaving(false);
    if (res.success) {
      toast({ title: "Provider Configurations Saved", description: "Storage, SMS/WhatsApp, and Payment settings updated." });
    } else {
      toast({ title: "Error", description: res.error, type: "error" });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading provider settings...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Provider Architecture Layers</h1>
          <p className="text-muted-foreground">Configure Payment Gateways, Storage Providers, and SMS/WhatsApp Gateways.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Provider Configs"}
        </Button>
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments">Payment Gateways</TabsTrigger>
          <TabsTrigger value="storage">Storage Providers</TabsTrigger>
          <TabsTrigger value="messaging">SMS & WhatsApp Gateways</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Modular Payment Gateways</CardTitle>
              <CardDescription>Configure Manual QR Code, Manual Bank Transfer, Cashfree, PhonePe, and Stripe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Default Payment Provider</Label>
                <Select value={settings.defaultPaymentProvider || "MANUAL"} onChange={(e) => handleChange("defaultPaymentProvider", e.target.value)}>
                  <option value="MANUAL">Manual QR & Bank Transfer (Default)</option>
                  <option value="CASHFREE">Cashfree Payments</option>
                  <option value="PHONEPE">PhonePe PG</option>
                  <option value="STRIPE">Stripe International</option>
                </Select>
              </div>

              <div className="border p-4 rounded-md space-y-4">
                <h4 className="font-semibold text-sm">Manual Bank & QR Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bank Account Name</Label>
                    <Input value={settings.bankAccountName || ""} onChange={(e) => handleChange("bankAccountName", e.target.value)} />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input value={settings.bankAccountNumber || ""} onChange={(e) => handleChange("bankAccountNumber", e.target.value)} />
                  </div>
                  <div>
                    <Label>IFSC Code</Label>
                    <Input value={settings.bankIfsc || ""} onChange={(e) => handleChange("bankIfsc", e.target.value)} />
                  </div>
                  <div>
                    <Label>UPI QR Code Image URL</Label>
                    <Input value={settings.upiQrUrl || ""} onChange={(e) => handleChange("upiQrUrl", e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Provider Layer</CardTitle>
              <CardDescription>Switch between Local Storage, Cloudinary, and AWS S3 seamlessly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Active Storage Provider</Label>
                <Select value={settings.activeStorageProvider || "local"} onChange={(e) => handleChange("activeStorageProvider", e.target.value)}>
                  <option value="local">Local Storage (Uploads Folder)</option>
                  <option value="cloudinary">Cloudinary Media CDN</option>
                  <option value="s3">AWS S3 Bucket</option>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messaging">
          <Card>
            <CardHeader>
              <CardTitle>SMS & WhatsApp Provider Layer</CardTitle>
              <CardDescription>Configure MSG91, TextLocal, Twilio, and Meta WhatsApp API credentials.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SMS Gateway Provider</Label>
                  <Select value={settings.smsProvider || "msg91"} onChange={(e) => handleChange("smsProvider", e.target.value)}>
                    <option value="msg91">MSG91</option>
                    <option value="textlocal">TextLocal</option>
                    <option value="twilio">Twilio SMS</option>
                    <option value="mock">Mock Sandbox</option>
                  </Select>
                </div>

                <div>
                  <Label>WhatsApp Business Provider</Label>
                  <Select value={settings.whatsappProvider || "whatsapp_business_api"} onChange={(e) => handleChange("whatsappProvider", e.target.value)}>
                    <option value="whatsapp_business_api">Meta WhatsApp Business API</option>
                    <option value="twilio_whatsapp">Twilio WhatsApp API</option>
                    <option value="mock">Mock Sandbox</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

