"use client";

import { useEffect, useState } from "react";
import { getSettingsAction, updateSettingsAction } from "@/lib/actions/settings.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
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
      toast({ title: "Settings Saved", description: "Website branding and settings updated successfully." });
    } else {
      toast({ title: "Error", description: res.error, type: "error" });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website & Enterprise Settings</h1>
          <p className="text-muted-foreground">White-label branding, colors, contact info, SEO, and system settings.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="branding">Branding & Logos</TabsTrigger>
          <TabsTrigger value="theme">Theme & Colors</TabsTrigger>
          <TabsTrigger value="contact">Contact & Social</TabsTrigger>
          <TabsTrigger value="seo">SEO & Metadata</TabsTrigger>
          <TabsTrigger value="locale">Locale & Currency</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>Configure site name, company details, logos, and favicon.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Website Name</Label>
                  <Input value={settings.websiteName || ""} onChange={(e) => handleChange("websiteName", e.target.value)} />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input value={settings.companyName || ""} onChange={(e) => handleChange("companyName", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Light Logo URL</Label>
                  <Input value={settings.logo || ""} onChange={(e) => handleChange("logo", e.target.value)} />
                </div>
                <div>
                  <Label>Dark Logo URL</Label>
                  <Input value={settings.darkLogo || ""} onChange={(e) => handleChange("darkLogo", e.target.value)} />
                </div>
                <div>
                  <Label>Favicon URL</Label>
                  <Input value={settings.favicon || ""} onChange={(e) => handleChange("favicon", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Runtime Theme Builder</CardTitle>
              <CardDescription>Set theme primary/secondary colors and custom properties.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Primary Color (Hex/HSL)</Label>
                  <div className="flex gap-2">
                    <Input type="color" className="w-12 h-10 p-1" value={settings.primaryColor || "#e11d48"} onChange={(e) => handleChange("primaryColor", e.target.value)} />
                    <Input value={settings.primaryColor || "#e11d48"} onChange={(e) => handleChange("primaryColor", e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" className="w-12 h-10 p-1" value={settings.secondaryColor || "#4f46e5"} onChange={(e) => handleChange("secondaryColor", e.target.value)} />
                    <Input value={settings.secondaryColor || "#4f46e5"} onChange={(e) => handleChange("secondaryColor", e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label>Border Radius</Label>
                  <Input value={settings.borderRadius || "0.5rem"} onChange={(e) => handleChange("borderRadius", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Details & Social Media</CardTitle>
              <CardDescription>Displayed dynamically in footer and contact page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Contact Phone</Label>
                  <Input value={settings.contactNumber || ""} onChange={(e) => handleChange("contactNumber", e.target.value)} />
                </div>
                <div>
                  <Label>WhatsApp Number</Label>
                  <Input value={settings.whatsappNumber || ""} onChange={(e) => handleChange("whatsappNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Support Email</Label>
                  <Input value={settings.emailAddress || ""} onChange={(e) => handleChange("emailAddress", e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Office Address</Label>
                <Input value={settings.officeAddress || ""} onChange={(e) => handleChange("officeAddress", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Search Engine Metadata</CardTitle>
              <CardDescription>Default titles, descriptions, and OpenGraph images.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Default SEO Title</Label>
                <Input value={settings.seoTitle || ""} onChange={(e) => handleChange("seoTitle", e.target.value)} />
              </div>
              <div>
                <Label>SEO Meta Description</Label>
                <Input value={settings.seoDescription || ""} onChange={(e) => handleChange("seoDescription", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locale">
          <Card>
            <CardHeader>
              <CardTitle>Locale & Regional Settings</CardTitle>
              <CardDescription>Configure currency, date formats, and time zone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Currency Code</Label>
                  <Input value={settings.currency || "INR"} onChange={(e) => handleChange("currency", e.target.value)} />
                </div>
                <div>
                  <Label>Time Zone</Label>
                  <Input value={settings.timeZone || "Asia/Kolkata"} onChange={(e) => handleChange("timeZone", e.target.value)} />
                </div>
                <div>
                  <Label>Date Format</Label>
                  <Input value={settings.dateFormat || "DD/MM/YYYY"} onChange={(e) => handleChange("dateFormat", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
