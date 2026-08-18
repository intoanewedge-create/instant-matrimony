"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  toggleTestimonialApprovedAction,
} from "@/lib/actions/testimonial.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Star,
  Layers,
  ArrowUpDown,
  X,
  Heart,
} from "lucide-react";

export function AdminTestimonialsClient({ initialTestimonials }: { initialTestimonials: any[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newOrder, setNewOrder] = useState(0);
  const [newIsApproved, setNewIsApproved] = useState(true);

  // Edit modal state
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editOrder, setEditOrder] = useState(0);
  const [editIsApproved, setEditIsApproved] = useState(true);

  // Delete modal state
  const [deletingTestimonial, setDeletingTestimonial] = useState<any | null>(null);

  // Handlers
  const handleCreateTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide couple names and testimonial story.",
        type: "error",
      });
      return;
    }

    startTransition(async () => {
      const res = await createTestimonialAction({
        name: newName.trim(),
        role: newRole.trim() || undefined,
        content: newContent.trim(),
        photoUrl: newPhotoUrl.trim() || undefined,
        rating: Number(newRating) || 5,
        order: Number(newOrder) || 0,
        isApproved: newIsApproved,
      });

      if (res.success) {
        toast({
          title: "Testimonial Published",
          description: "New success story successfully added to the showcase.",
        });
        setNewName("");
        setNewRole("");
        setNewContent("");
        setNewPhotoUrl("");
        setNewRating(5);
        setNewOrder(0);
        setNewIsApproved(true);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to create testimonial.",
          type: "error",
        });
      }
    });
  };

  const handleOpenEdit = (t: any) => {
    setEditingTestimonial(t);
    setEditName(t.name);
    setEditRole(t.role || "");
    setEditContent(t.content);
    setEditPhotoUrl(t.photoUrl || "");
    setEditRating(t.rating || 5);
    setEditOrder(t.order || 0);
    setEditIsApproved(t.isApproved);
  };

  const handleSaveEdit = () => {
    if (!editingTestimonial) return;
    if (!editName.trim() || !editContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Names and story content cannot be empty.",
        type: "error",
      });
      return;
    }

    startTransition(async () => {
      const res = await updateTestimonialAction(editingTestimonial.id, {
        name: editName.trim(),
        role: editRole.trim() || null,
        content: editContent.trim(),
        photoUrl: editPhotoUrl.trim() || null,
        rating: Number(editRating) || 5,
        order: Number(editOrder) || 0,
        isApproved: editIsApproved,
      });

      if (res.success) {
        toast({
          title: "Testimonial Updated",
          description: "Success story updated successfully.",
        });
        setEditingTestimonial(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to update testimonial.",
          type: "error",
        });
      }
    });
  };

  const handleToggleApproved = (t: any) => {
    startTransition(async () => {
      const res = await toggleTestimonialApprovedAction(t.id);
      if (res.success) {
        toast({
          title: "Visibility Changed",
          description: `Testimonial is now ${!t.isApproved ? "Approved & Live" : "Hidden"}.`,
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to change visibility.",
          type: "error",
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingTestimonial) return;
    startTransition(async () => {
      const res = await deleteTestimonialAction(deletingTestimonial.id);
      if (res.success) {
        toast({
          title: "Testimonial Removed",
          description: "Story permanently removed from showcase.",
        });
        setDeletingTestimonial(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to delete testimonial.",
          type: "error",
        });
      }
    });
  };

  const filteredTestimonials = initialTestimonials.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      (t.role && t.role.toLowerCase().includes(query)) ||
      t.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            Testimonials & Success Stories
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Moderate, approve, and showcase verified member reviews and happy marriage stories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
            <Layers className="w-3.5 h-3.5 text-rose-500" />
            Total: <strong>{initialTestimonials.length}</strong> ({initialTestimonials.filter((t) => t.isApproved).length} Approved)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Testimonial Form */}
        <Card className="border border-slate-200 bg-white lg:col-span-1 h-fit shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
              <Plus className="w-4 h-4 text-rose-500" /> Add Success Story
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Publish a new happy couple testimonial to public pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            <form onSubmit={handleCreateTestimonial} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Couple Names / Member Name</label>
                <Input
                  placeholder="e.g. Aarav & Priya"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Location & Date / Tagline</label>
                <Input
                  placeholder="e.g. Hyderabad, Telangana • Married Oct 2025"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Story / Feedback Content</label>
                <Textarea
                  placeholder="Enter their feedback or matrimonial success story..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  className="border-slate-200 bg-white text-slate-900 text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Photo Asset URL (Optional)</label>
                <Input
                  placeholder="/InstantMatrimony-Logo.jpeg or https://..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Rating (1 - 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-500 ml-2">{newRating} / 5</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-slate-400" /> Order Priority
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
                  <label className="text-xs font-semibold text-slate-700">Approval State</label>
                  <button
                    type="button"
                    onClick={() => setNewIsApproved(!newIsApproved)}
                    className={`w-full h-9 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      newIsApproved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-white text-slate-500 border-slate-200"
                    }`}
                  >
                    {newIsApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {newIsApproved ? "Approved" : "Pending"}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs h-9 shadow-lg shadow-rose-950/30"
              >
                {isPending ? <Spinner className="w-4 h-4 mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
                Publish Success Story
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Existing Testimonials List */}
        <Card className="border border-slate-200 bg-white lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
                  <MessageSquare className="w-4 h-4 text-rose-500" /> Published Stories ({filteredTestimonials.length})
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Success stories displayed on homepage and /success-stories.
                </CardDescription>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search by couple names or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-white border-slate-200 text-xs text-slate-900 h-8"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto max-h-[650px]">
            {filteredTestimonials.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
                <p className="text-sm font-medium">No testimonials found.</p>
                <p className="text-xs text-slate-500">
                  Add a happy couple story from the left panel to populate your success stories.
                </p>
              </div>
            ) : (
              filteredTestimonials.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    t.isApproved
                      ? "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                      : "bg-slate-50 border-slate-200 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center font-bold text-xs text-white uppercase shadow-md shrink-0">
                        {t.name.split(" ")[0]?.slice(0, 1) || "M"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-800">{t.name}</h3>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-semibold border ${
                              t.isApproved
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {t.isApproved ? "Approved" : "Under Review"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Order: #{t.order}
                          </span>
                        </div>
                        {t.role && <p className="text-xs text-slate-500">{t.role}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleApproved(t)}
                        title={t.isApproved ? "Revoke approval" : "Approve testimonial"}
                        className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 h-7 w-7 p-0"
                      >
                        {t.isApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(t)}
                        title="Edit testimonial"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-7 w-7 p-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingTestimonial(t)}
                        title="Delete testimonial"
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= (t.rating || 5)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic pl-3 border-l-2 border-rose-400">
                    "{t.content}"
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Testimonial Dialog Modal */}
      {editingTestimonial && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-rose-500" /> Edit Story
              </h3>
              <button
                onClick={() => setEditingTestimonial(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Names</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Location / Date</label>
                <Input
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Story Content</label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="border-slate-200 bg-white text-slate-900 text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= editRating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-500">{editRating} / 5</span>
                </div>
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
                    onClick={() => setEditIsApproved(!editIsApproved)}
                    className={`w-full h-9 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      editIsApproved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-white text-slate-500 border-slate-200"
                    }`}
                  >
                    {editIsApproved ? "Approved" : "Hidden"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={() => setEditingTestimonial(null)}
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
      {deletingTestimonial && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-50 text-red-500 border border-red-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Testimonial</h3>
                <p className="text-xs text-slate-500 mt-0.5">Are you sure you want to remove this story?</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-slate-800">{deletingTestimonial.name}</p>
              <p className="text-slate-500 line-clamp-2">"{deletingTestimonial.content}"</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setDeletingTestimonial(null)}
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
