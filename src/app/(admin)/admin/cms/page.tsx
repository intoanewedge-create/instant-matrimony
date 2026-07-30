"use client";

import React, { useState, useEffect } from "react";
import {
  listPagesAction,
  createPageAction,
  updatePageAction,
  deletePageAction,
  seedDefaultPagesAction,
} from "@/lib/actions/cms.actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit3, Trash2, Globe, RefreshCw, Save, X, LayoutDashboard } from "lucide-react";

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  seoTitle: string | null;
  seoDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  updatedAt: Date;
}

export default function CmsAdminPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    seoTitle: "",
    seoDescription: "",
    metaKeywords: "",
    ogImage: "",
    canonicalUrl: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await listPagesAction();
      if (res.success && res.data) {
        setPages(res.data);
      } else {
        setMessage({ type: "error", text: res.error || "Failed to load pages" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Failed to load pages" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleEditClick = (page: CmsPage) => {
    setSelectedPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content,
      status: page.status,
      seoTitle: page.seoTitle || "",
      seoDescription: page.seoDescription || "",
      metaKeywords: page.metaKeywords || "",
      ogImage: page.ogImage || "",
      canonicalUrl: page.canonicalUrl || "",
    });
    setIsEditing(true);
    setIsCreating(false);
    setMessage(null);
  };

  const handleCreateClick = () => {
    setFormData({
      slug: "",
      title: "",
      content: "",
      status: "DRAFT",
      seoTitle: "",
      seoDescription: "",
      metaKeywords: "",
      ogImage: "",
      canonicalUrl: "",
    });
    setIsCreating(true);
    setIsEditing(false);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    setLoading(true);
    try {
      const res = await deletePageAction(id);
      if (res.success) {
        setMessage({ type: "success", text: "Page deleted successfully" });
        setSelectedPage(null);
        setIsEditing(false);
        fetchPages();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to delete page" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (isEditing && selectedPage) {
        const res = await updatePageAction(selectedPage.id, formData);
        if (res.success) {
          setMessage({ type: "success", text: "Page updated successfully" });
          setIsEditing(false);
          setSelectedPage(null);
          fetchPages();
        } else {
          setMessage({ type: "error", text: res.error || "Failed to update page" });
        }
      } else if (isCreating) {
        const res = await createPageAction(formData);
        if (res.success) {
          setMessage({ type: "success", text: "Page created successfully" });
          setIsCreating(false);
          fetchPages();
        } else {
          setMessage({ type: "error", text: res.error || "Failed to create page" });
        }
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await seedDefaultPagesAction();
      if (res.success) {
        setMessage({ type: "success", text: "Successfully seeded default pages" });
        fetchPages();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to seed pages" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 select-text max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CMS Content Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build pages, write blogs, publish legal policy disclosures, and manage SEO metadata.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchPages} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleSeed} className="gap-2">
            <Globe className="h-4 w-4" />
            Seed Default Pages
          </Button>
          <Button variant="default" size="sm" onClick={handleCreateClick} className="gap-2 bg-primary">
            <Plus className="h-4 w-4" />
            Add Page
          </Button>
        </div>
      </div>

      {/* Message banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pages List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Page Inventory
          </h2>

          {loading && pages.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : pages.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm text-muted-foreground">No pages created yet.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => (
                <Card
                  key={page.id}
                  onClick={() => handleEditClick(page)}
                  className={`cursor-pointer transition-all border border-border/40 hover:border-primary/40 ${
                    selectedPage?.id === page.id ? "border-primary bg-primary/5" : "bg-card"
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">{page.title}</h4>
                      <p className="text-xs text-muted-foreground font-mono">/{page.slug}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={page.status === "PUBLISHED" ? "success" : "secondary"}>
                        {page.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(page.id);
                        }}
                        className="text-red-500 hover:bg-red-500/5 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Editor Form */}
        <div className="lg:col-span-2">
          {isEditing || isCreating ? (
            <Card className="border border-border/40">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
                <div>
                  <CardTitle>{isCreating ? "New CMS Page" : "Edit CMS Page"}</CardTitle>
                  <CardDescription>
                    {isCreating
                      ? "Create a dynamic page with markdown content and custom SEO properties."
                      : `Modify details and publish states for page id: ${selectedPage?.id}`}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreating(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* General details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Page Title</span>
                      <Input
                        placeholder="e.g. About Us"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Slug Path</span>
                      <Input
                        placeholder="e.g. about"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                        disabled={isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Page Status</span>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED",
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="DRAFT">DRAFT (Invisible to Users)</option>
                      <option value="PUBLISHED">PUBLISHED (Live on Website)</option>
                      <option value="ARCHIVED">ARCHIVED (Locked/Hidden)</option>
                    </select>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Markdown Content</span>
                    <textarea
                      placeholder="# Markdown support enabled..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={8}
                      className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>

                  {/* SEO details */}
                  <div className="border-t border-border/10 pt-6 space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      Search Engine Optimization (SEO) Metadata
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground font-medium">Meta Title Tag</span>
                        <Input
                          placeholder="If left blank, Page Title is used"
                          value={formData.seoTitle}
                          onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground font-medium">Meta Keywords</span>
                        <Input
                          placeholder="matrimony, wedding, match"
                          value={formData.metaKeywords}
                          onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground font-medium">Meta Description</span>
                      <Input
                        placeholder="Brief summary of the page for search result listings..."
                        value={formData.seoDescription}
                        onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end space-x-2 border-t border-border/10 pt-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setIsCreating(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button variant="default" type="submit" disabled={loading} className="bg-primary gap-2">
                      <Save className="h-4 w-4" />
                      {isEditing ? "Save Page" : "Create Page"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full border border-dashed border-border/60 p-12 flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-semibold text-lg">No Page Selected</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Click on any page in the list to edit its contents and SEO parameters, or create a brand new one using the &apos;Add Page&apos; button.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
