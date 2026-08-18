"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  createBannerAction,
  updateBannerAction,
  deleteBannerAction,
  toggleBannerActiveAction,
} from "@/lib/actions/banner.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import {
  ImageIcon,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Eye,
  Layers,
  ArrowUpDown,
  X,
  Sparkles,
} from "lucide-react";

const IMAGE_PRESETS = [
  { label: "Official Logo", url: "/InstantMatrimony-Logo.jpeg" },
  { label: "Telugu Matchmaking", url: "/InstantMatrimony-Logo.jpeg" },
];

export function AdminBannersClient({ initialBanners }: { initialBanners: any[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("/InstantMatrimony-Logo.jpeg");
  const [newLinkUrl, setNewLinkUrl] = useState("/register");
  const [newOrder, setNewOrder] = useState(0);
  const [newIsActive, setNewIsActive] = useState(true);

  // Edit modal state
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);

  // Delete modal state
  const [deletingBanner, setDeletingBanner] = useState<any | null>(null);

  // Handlers
  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImageUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a headline and image URL.",
        type: "error",
      });
      return;
    }

    startTransition(async () => {
      const res = await createBannerAction({
        title: newTitle.trim(),
        subtitle: newSubtitle.trim() || undefined,
        imageUrl: newImageUrl.trim(),
        linkUrl: newLinkUrl.trim() || undefined,
        order: Number(newOrder) || 0,
        isActive: newIsActive,
      });

      if (res.success) {
        toast({
          title: "Banner Created",
          description: "Promotional banner added to system rotation.",
        });
        setNewTitle("");
        setNewSubtitle("");
        setNewImageUrl("/InstantMatrimony-Logo.jpeg");
        setNewLinkUrl("/register");
        setNewOrder(0);
        setNewIsActive(true);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to create banner.",
          type: "error",
        });
      }
    });
  };

  const handleOpenEdit = (banner: any) => {
    setEditingBanner(banner);
    setEditTitle(banner.title);
    setEditSubtitle(banner.subtitle || "");
    setEditImageUrl(banner.imageUrl);
    setEditLinkUrl(banner.linkUrl || "");
    setEditOrder(banner.order || 0);
    setEditIsActive(banner.isActive);
  };

  const handleSaveEdit = () => {
    if (!editingBanner) return;
    if (!editTitle.trim() || !editImageUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Headline and image URL cannot be empty.",
        type: "error",
      });
      return;
    }

    startTransition(async () => {
      const res = await updateBannerAction(editingBanner.id, {
        title: editTitle.trim(),
        subtitle: editSubtitle.trim() || null,
        imageUrl: editImageUrl.trim(),
        linkUrl: editLinkUrl.trim() || null,
        order: Number(editOrder) || 0,
        isActive: editIsActive,
      });

      if (res.success) {
        toast({
          title: "Banner Updated",
          description: "Banner details successfully updated.",
        });
        setEditingBanner(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to update banner.",
          type: "error",
        });
      }
    });
  };

  const handleToggleActive = (banner: any) => {
    startTransition(async () => {
      const res = await toggleBannerActiveAction(banner.id);
      if (res.success) {
        toast({
          title: "Status Changed",
          description: `Banner is now ${!banner.isActive ? "Active in rotation" : "Hidden"}.`,
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to toggle status.",
          type: "error",
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingBanner) return;
    startTransition(async () => {
      const res = await deleteBannerAction(deletingBanner.id);
      if (res.success) {
        toast({
          title: "Banner Removed",
          description: "Banner permanently deleted.",
        });
        setDeletingBanner(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to delete banner.",
          type: "error",
        });
      }
    });
  };

  const filteredBanners = initialBanners.filter((b) => {
    const query = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(query) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(query)) ||
      (b.linkUrl && b.linkUrl.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            Hero & Promotional Banners
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure homepage hero carousels, announcement cards, and promotional banners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            Total: <strong>{initialBanners.length}</strong> ({initialBanners.filter((b) => b.isActive).length} Live)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Banner Form */}
        <Card className="border border-slate-200 bg-white lg:col-span-1 h-fit shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
              <Plus className="w-4 h-4 text-rose-500" /> Create Banner
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Add a new slider or campaign promotion.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Banner Headline</label>
                <Input
                  placeholder="e.g. Find Your Perfect Life Partner"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Subtitle / Tagline</label>
                <Input
                  placeholder="e.g. Join thousands of verified brides and grooms across AP & TS"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Image Asset URL</label>
                <Input
                  placeholder="/InstantMatrimony-Logo.jpeg or https://..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs font-mono"
                />
                <div className="flex gap-1.5 mt-1">
                  {IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setNewImageUrl(preset.url)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        newImageUrl === preset.url
                          ? "bg-rose-50 text-rose-600 border-rose-300"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Destination Link URL</label>
                <Input
                  placeholder="e.g. /register, /membership, /pricing"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-slate-400" /> Display Order
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={newOrder}
                    onChange={(e) => setNewOrder(Number(e.target.value))}
                    className="border-slate-200 bg-white text-slate-900 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Status</label>
                  <button
                    type="button"
                    onClick={() => setNewIsActive(!newIsActive)}
                    className={`w-full h-9 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      newIsActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-white text-slate-500 border-slate-200"
                    }`}
                  >
                    {newIsActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {newIsActive ? "Active (Live)" : "Draft (Off)"}
                  </button>
                </div>
              </div>

              {/* Real-time preview card */}
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                  <Eye className="w-3 h-3 text-rose-400" /> Live Preview
                </label>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 relative">
                      <Image
                        src={newImageUrl || "/InstantMatrimony-Logo.jpeg"}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{newTitle || "Banner Headline"}</p>
                      <p className="text-[10px] text-slate-500 truncate">{newSubtitle || "Subtitle description"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span className="font-mono text-rose-500">{newLinkUrl || "/register"}</span>
                    <span>Order: #{newOrder}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs h-9 shadow-lg shadow-rose-950/30"
              >
                {isPending ? <Spinner className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Save & Deploy Banner
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Existing Banners List */}
        <Card className="border border-slate-200 bg-white lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
                  <ImageIcon className="w-4 h-4 text-rose-500" /> Active Banners ({filteredBanners.length})
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs">
                  Promotional items in member and guest banner rotations.
                </CardDescription>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search banners by title or link..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-white border-slate-200 text-xs text-slate-900 h-8"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto max-h-[650px]">
            {filteredBanners.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
                <p className="text-sm font-medium">No banners configured.</p>
                <p className="text-xs text-slate-500">
                  Create a new promotional banner from the left panel to display it on the website.
                </p>
              </div>
            ) : (
              filteredBanners.map((banner) => (
                <div
                  key={banner.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    banner.isActive
                      ? "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                      : "bg-slate-50 border-slate-200 opacity-75"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-white shrink-0">
                      <Image
                        src={banner.imageUrl || "/InstantMatrimony-Logo.jpeg"}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-800 truncate">{banner.title}</h3>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-semibold border ${
                            banner.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Priority #{banner.order}
                        </span>
                      </div>
                      {banner.subtitle && (
                        <p className="text-xs text-slate-500 line-clamp-1">{banner.subtitle}</p>
                      )}
                      {banner.linkUrl && (
                        <p className="text-[11px] text-rose-500 font-mono flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> {banner.linkUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(banner)}
                      title={banner.isActive ? "Deactivate banner" : "Activate banner"}
                      className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 h-8 w-8 p-0"
                    >
                      {banner.isActive ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(banner)}
                      title="Edit banner"
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingBanner(banner)}
                      title="Delete banner"
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Banner Dialog Modal */}
      {editingBanner && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-rose-500" /> Edit Banner
              </h3>
              <button
                onClick={() => setEditingBanner(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Headline</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Subtitle / Description</label>
                <Input
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Image URL</label>
                <Input
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Destination Link</label>
                <Input
                  value={editLinkUrl}
                  onChange={(e) => setEditLinkUrl(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Display Order</label>
                  <Input
                    type="number"
                    min={0}
                    value={editOrder}
                    onChange={(e) => setEditOrder(Number(e.target.value))}
                    className="border-slate-200 bg-white text-slate-900 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Status</label>
                  <button
                    type="button"
                    onClick={() => setEditIsActive(!editIsActive)}
                    className={`w-full h-9 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      editIsActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-white text-slate-500 border-slate-200"
                    }`}
                  >
                    {editIsActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={() => setEditingBanner(null)}
                size="sm"
                className="text-slate-500 hover:text-slate-900"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                onClick={handleSaveEdit}
                size="sm"
                className="bg-rose-600 hover:bg-rose-500 text-white"
              >
                {isPending ? <Spinner className="w-4 h-4 mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBanner && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-50 text-red-500 border border-red-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Banner</h3>
                <p className="text-xs text-slate-500 mt-0.5">Are you sure you want to delete this promotional banner?</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-slate-800">{deletingBanner.title}</p>
              <p className="text-slate-500 truncate">{deletingBanner.subtitle || deletingBanner.linkUrl}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setDeletingBanner(null)}
                size="sm"
                className="text-slate-500 hover:text-slate-900"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                onClick={handleConfirmDelete}
                size="sm"
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                {isPending ? <Spinner className="w-4 h-4 mr-2" /> : null}
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
