"use client";

import React, { useState } from "react";
import { Megaphone, Tag, Plus, CheckCircle, RefreshCw, Send, Check, X } from "lucide-react";
import { createCampaignAction, createCouponAction, publishCampaignAction, archiveCampaignAction } from "@/lib/actions/admin.actions";
import { AdminCard } from "@/components/admin/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CampaignItem {
  id: string;
  name: string;
  type: string;
  status: string;
  targetSegment: string | null;
  content: string;
  scheduledAt: string | null;
  sentCount: number;
  clickCount: number;
}

interface CouponItem {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  maxRedemptions: number;
  currentRedemptions: number;
  isActive: boolean;
}

interface MarketingClientProps {
  initialCampaigns: CampaignItem[];
  initialCoupons: CouponItem[];
}

export function MarketingClient({
  initialCampaigns,
  initialCoupons,
}: MarketingClientProps) {
  const [activeTab, setActiveTab] = useState<"campaigns" | "coupons">("campaigns");
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns);
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);

  // Modals/forms state
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // New Campaign Form values
  const [campName, setCampName] = useState("");
  const [campType, setCampType] = useState<"EMAIL" | "SMS" | "PUSH" | "LANDING">("EMAIL");
  const [campSegment, setCampSegment] = useState("ALL");
  const [campContent, setCampContent] = useState("");
  const [campScheduled, setCampScheduled] = useState("");

  // New Coupon Form values
  const [coupCode, setCoupCode] = useState("");
  const [coupType, setCoupType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [coupValue, setCoupValue] = useState("");
  const [coupMax, setCoupMax] = useState("");

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName || !campContent) return;

    setLoading(true);
    setNotification(null);

    try {
      const res = await createCampaignAction({
        name: campName,
        type: campType,
        targetSegment: campSegment,
        content: campContent,
        scheduledAt: campScheduled ? new Date(campScheduled) : undefined,
      });

      if (!res.success || !res.data) throw new Error(res.error || "Failed to create campaign.");

      // Prepend to campaigns list
      const camp = res.data;
      setCampaigns((prev) => [
        {
          id: camp.id,
          name: camp.name,
          type: camp.type,
          status: camp.status,
          targetSegment: camp.targetSegment,
          content: camp.content,
          scheduledAt: camp.scheduledAt ? camp.scheduledAt.toString() : null,
          sentCount: camp.sentCount,
          clickCount: camp.clickCount,
        },
        ...prev,
      ]);

      setNotification({ type: "success", message: "Campaign created successfully." });
      setShowCampaignForm(false);
      setCampName("");
      setCampContent("");
      setCampScheduled("");
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to create campaign." });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupCode || !coupValue) return;

    setLoading(true);
    setNotification(null);

    try {
      const res = await createCouponAction({
        code: coupCode,
        discountType: coupType,
        discountValue: Number(coupValue),
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        maxRedemptions: coupMax ? Number(coupMax) : undefined,
      });

      if (!res.success || !res.data) throw new Error(res.error || "Failed to create coupon.");

      const coup = res.data;
      setCoupons((prev) => [
        {
          id: coup.id,
          code: coup.code,
          discountType: coup.discountType,
          discountValue: coup.discountValue,
          startDate: coup.startDate.toString(),
          endDate: coup.endDate.toString(),
          maxRedemptions: coup.maxRedemptions,
          currentRedemptions: coup.currentRedemptions,
          isActive: coup.isActive,
        },
        ...prev,
      ]);

      setNotification({ type: "success", message: "Discount coupon code created." });
      setShowCouponForm(false);
      setCoupCode("");
      setCoupValue("");
      setCoupMax("");
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to create coupon." });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    setLoading(true);
    try {
      const res = await publishCampaignAction(id);
      if (!res.success) throw new Error(res.error || "Failed to publish.");
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "ACTIVE" } : c))
      );
      setNotification({ type: "success", message: "Campaign activated." });
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    setLoading(true);
    try {
      const res = await archiveCampaignAction(id);
      if (!res.success) throw new Error(res.error || "Failed to archive.");
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "COMPLETED" } : c))
      );
      setNotification({ type: "success", message: "Campaign archived." });
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : "bg-rose-500/10 border-rose-500/20 text-rose-500"
          }`}
          role="alert"
        >
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Tabbing row */}
      <div className="flex border-b border-border/40 gap-6 justify-between items-center">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "campaigns"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Outbound Campaigns ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "coupons"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Promo Coupons ({coupons.length})
          </button>
        </div>

        {activeTab === "campaigns" ? (
          <Button size="sm" onClick={() => setShowCampaignForm(true)} className="bg-primary text-primary-foreground font-bold">
            <Plus className="h-4 w-4 mr-1.5" /> Compose Campaign
          </Button>
        ) : (
          <Button size="sm" onClick={() => setShowCouponForm(true)} className="bg-primary text-primary-foreground font-bold">
            <Plus className="h-4 w-4 mr-1.5" /> Create Coupon
          </Button>
        )}
      </div>

      {/* CAMPAIGN COMPOSER PANEL */}
      {showCampaignForm && (
        <div className="p-6 bg-muted/20 border border-border/60 rounded-xl max-w-2xl animate-fade-in select-text">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Megaphone className="h-4 w-4 text-primary" /> Create Outbound Campaign
            </h3>
            <button onClick={() => setShowCampaignForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="camp-name">Name</label>
                <Input id="camp-name" value={campName} onChange={(e) => setCampName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="camp-type">Channel</label>
                <select
                  id="camp-type"
                  value={campType}
                  onChange={(e) => setCampType(e.target.value as any)}
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm"
                >
                  <option value="EMAIL">Email Newsletter</option>
                  <option value="SMS">SMS Message</option>
                  <option value="PUSH">Push Alert</option>
                  <option value="LANDING">Landing Page</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="camp-seg">User Segment</label>
                <Input id="camp-seg" value={campSegment} onChange={(e) => setCampSegment(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="camp-sched">Schedule Send Time (Optional)</label>
                <Input id="camp-sched" type="datetime-local" value={campScheduled} onChange={(e) => setCampScheduled(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="camp-content">Campaign Content / Body Body</label>
              <textarea
                id="camp-content"
                value={campContent}
                onChange={(e) => setCampContent(e.target.value)}
                className="w-full min-h-[100px] p-3 bg-background border border-border rounded-lg text-xs"
                required
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCampaignForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary text-white">
                Save & Enqueue
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* COUPON COMPOSER PANEL */}
      {showCouponForm && (
        <div className="p-6 bg-muted/20 border border-border/60 rounded-xl max-w-2xl animate-fade-in select-text">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-primary" /> Create Promo Coupon
            </h3>
            <button onClick={() => setShowCouponForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="coup-code">Promo Code</label>
                <Input id="coup-code" value={coupCode} onChange={(e) => setCoupCode(e.target.value.toUpperCase())} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="coup-type">Discount Type</label>
                <select
                  id="coup-type"
                  value={coupType}
                  onChange={(e) => setCoupType(e.target.value as any)}
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="coup-val">Discount Value</label>
                <Input id="coup-val" type="number" value={coupValue} onChange={(e) => setCoupValue(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase" htmlFor="coup-max">Redemptions Cap (0 = Unlimited)</label>
                <Input id="coup-max" type="number" value={coupMax} onChange={(e) => setCoupMax(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCouponForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary text-white">
                Create Code
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* CAMPAIGNS TAB CONTENT */}
      {activeTab === "campaigns" && (
        <div className="grid grid-cols-1 gap-6">
          {campaigns.length === 0 ? (
            <AdminCard className="text-center py-12 text-muted-foreground text-xs font-semibold">
              No outbound campaigns composed.
            </AdminCard>
          ) : (
            campaigns.map((camp) => (
              <AdminCard key={camp.id}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-2 select-text">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-foreground">{camp.name}</span>
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] uppercase font-bold tracking-wider">{camp.type}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        camp.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" :
                        camp.status === "COMPLETED" ? "bg-muted text-muted-foreground" : "bg-amber-500/10 text-amber-500"
                      }`}>{camp.status}</span>
                    </div>

                    <p className="text-xs text-muted-foreground">{camp.content}</p>

                    <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground pt-2">
                      <span>Sent: {camp.sentCount}</span>
                      <span>Clicks: {camp.clickCount}</span>
                      {camp.scheduledAt && <span>Scheduled: {new Date(camp.scheduledAt).toLocaleString()}</span>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {camp.status === "DRAFT" && (
                      <Button
                        size="sm"
                        onClick={() => handlePublish(camp.id)}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        <Send className="h-3 w-3 mr-1" /> Launch
                      </Button>
                    )}
                    {camp.status === "ACTIVE" && (
                      <Button
                        size="sm"
                        onClick={() => handleArchive(camp.id)}
                        disabled={loading}
                        variant="outline"
                        className="border-rose-500/20 text-rose-500 hover:bg-rose-500/10 font-bold"
                      >
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              </AdminCard>
            ))
          )}
        </div>
      )}

      {/* COUPONS TAB CONTENT */}
      {activeTab === "coupons" && (
        <div className="grid grid-cols-1 gap-6">
          {coupons.length === 0 ? (
            <AdminCard className="text-center py-12 text-muted-foreground text-xs font-semibold">
              No discount coupons defined.
            </AdminCard>
          ) : (
            coupons.map((coup) => (
              <AdminCard key={coup.id}>
                <div className="flex justify-between items-center select-text">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-foreground font-mono bg-muted px-2 py-0.5 rounded border select-all">{coup.code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        coup.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      }`}>{coup.isActive ? "Active" : "Expired"}</span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Discount: {coup.discountType === "PERCENTAGE" ? `${coup.discountValue}%` : `$${coup.discountValue}`}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground pt-1">
                      <span>Redemptions: {coup.currentRedemptions} / {coup.maxRedemptions || "Unlimited"}</span>
                      <span>Expires: {new Date(coup.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </AdminCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}
