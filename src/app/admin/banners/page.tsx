"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ImageIcon, Plus, Trash2, Eye } from "lucide-react";
import Image from "next/image";

export default function AdminBannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState([
    {
      id: "1",
      title: "Find Your Perfect Life Partner",
      subtitle: "Join thousands of verified brides and grooms across Andhra Pradesh and Telangana.",
      imageUrl: "/InstantMatrimony-Logo.jpeg",
      linkUrl: "/register",
      isActive: true,
    },
    {
      id: "2",
      title: "Exclusive Premium Matchmaking",
      subtitle: "Personalized matchmaking and verified contact unlock services.",
      imageUrl: "/InstantMatrimony-Logo.jpeg",
      linkUrl: "/pricing",
      isActive: true,
    },
  ]);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const handleAddBanner = () => {
    if (!title.trim()) {
      toast({ title: "Validation Error", description: "Please enter banner title." });
      return;
    }
    setBanners((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: title.trim(),
        subtitle: subtitle.trim(),
        imageUrl: "/InstantMatrimony-Logo.jpeg",
        linkUrl: linkUrl.trim() || "/register",
        isActive: true,
      },
    ]);
    setTitle("");
    setSubtitle("");
    setLinkUrl("");
    toast({ title: "Banner Added", description: "Promotional banner created successfully." });
  };

  const handleDeleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    toast({ title: "Banner Removed", description: "Banner removed from rotation." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            Hero & Promotional Banners
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure homepage hero banners, promotional sliders, and announcement cards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-500" /> Create Banner
            </CardTitle>
            <CardDescription className="text-slate-400">
              Add a new promotional slider.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Banner Headline</label>
              <Input
                placeholder="e.g. Special Festival Membership Offer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-slate-800 bg-slate-950/60 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Subtitle / Description</label>
              <Input
                placeholder="e.g. Upgrade today and receive double contact unlocks."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="border-slate-800 bg-slate-950/60 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Destination Link</label>
              <Input
                placeholder="e.g. /pricing or /register"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="border-slate-800 bg-slate-950/60 text-white"
              />
            </div>
            <Button
              onClick={handleAddBanner}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white"
            >
              <ImageIcon className="w-4 h-4 mr-2" /> Save Banner
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-rose-500" /> Active Banners ({banners.length})
            </CardTitle>
            <CardDescription className="text-slate-400">
              Live banner rotation shown to prospective and registered members.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center gap-4 justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shrink-0">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-200">{banner.title}</h3>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{banner.subtitle}</p>
                    <p className="text-[11px] text-rose-400 font-mono">Link: {banner.linkUrl}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="text-slate-500 hover:text-red-400 hover:bg-red-950/30 h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
