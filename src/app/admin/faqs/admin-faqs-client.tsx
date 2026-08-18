"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
  toggleFaqActiveAction,
} from "@/lib/actions/faq.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  X,
  Filter,
  Layers,
  ArrowUpDown,
} from "lucide-react";

const CATEGORY_PRESETS = [
  "General",
  "Verification",
  "Payments",
  "Privacy",
  "Memberships",
  "Matching & Chat",
  "Support",
];

export function AdminFaqsClient({ initialFaqs }: { initialFaqs: any[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Create form state
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newOrder, setNewOrder] = useState(0);
  const [newIsActive, setNewIsActive] = useState(true);

  // Edit modal state
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [editOrder, setEditOrder] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);

  // Delete modal state
  const [deletingFaq, setDeletingFaq] = useState<any | null>(null);

  // Handlers
  const handleCreateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both question and answer text.",
        type: "error",
      });
      return;
    }

    startTransition(async () => {
      const res = await createFaqAction({
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        category: newCategory.trim() || "General",
        order: Number(newOrder) || 0,
        isActive: newIsActive,
      });

      if (res.success) {
        toast({
          title: "FAQ Published",
          description: "New question successfully added to the knowledge base.",
        });
        setNewQuestion("");
        setNewAnswer("");
        setNewCategory("General");
        setNewOrder(0);
        setNewIsActive(true);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to create FAQ.",
          type: "error",
        });
      }
    });
  };

  const handleOpenEdit = (faq: any) => {
    setEditingFaq(faq);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
    setEditCategory(faq.category || "General");
    setEditOrder(faq.order || 0);
    setEditIsActive(faq.isActive);
  };

  const handleSaveEdit = () => {
    if (!editingFaq) return;
    if (!editQuestion.trim() || !editAnswer.trim()) {
      toast({
        title: "Validation Error",
        description: "Question and answer cannot be empty.",
        type: "error",
      });
      return;
    }

    startTransition(async () => {
      const res = await updateFaqAction(editingFaq.id, {
        question: editQuestion.trim(),
        answer: editAnswer.trim(),
        category: editCategory.trim() || "General",
        order: Number(editOrder) || 0,
        isActive: editIsActive,
      });

      if (res.success) {
        toast({
          title: "FAQ Updated",
          description: "FAQ details updated successfully.",
        });
        setEditingFaq(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to update FAQ.",
          type: "error",
        });
      }
    });
  };

  const handleToggleActive = (faq: any) => {
    startTransition(async () => {
      const res = await toggleFaqActiveAction(faq.id);
      if (res.success) {
        toast({
          title: "Status Changed",
          description: `FAQ is now ${!faq.isActive ? "Visible" : "Hidden"}.`,
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
    if (!deletingFaq) return;
    startTransition(async () => {
      const res = await deleteFaqAction(deletingFaq.id);
      if (res.success) {
        toast({
          title: "FAQ Removed",
          description: "FAQ permanently deleted from database.",
        });
        setDeletingFaq(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to delete FAQ.",
          type: "error",
        });
      }
    });
  };

  // Filtered FAQs
  const categories = Array.from(
    new Set(["ALL", ...CATEGORY_PRESETS, ...initialFaqs.map((f) => f.category)])
  );

  const filteredFaqs = initialFaqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || faq.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            FAQ Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Publish, edit, and organize customer questions displayed on the public FAQ page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            Total: <strong>{initialFaqs.length}</strong> ({initialFaqs.filter((f) => f.isActive).length} Active)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create FAQ Form */}
        <Card className="border border-slate-200 bg-white lg:col-span-1 h-fit shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
              <Plus className="w-4 h-4 text-rose-500" /> Add New FAQ
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Publish a question & answer pair directly to the live platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            <form onSubmit={handleCreateFaq} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Verification, Privacy, Payments"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="border-slate-200 bg-white text-slate-900 text-xs"
                  />
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {CATEGORY_PRESETS.slice(0, 4).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        newCategory === cat
                          ? "bg-rose-50 text-rose-600 border-rose-300"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Question</label>
                <Input
                  placeholder="e.g. How does profile verification work?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Answer</label>
                <Textarea
                  placeholder="Enter detailed answer here..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={4}
                  className="border-slate-200 bg-white text-slate-900 text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-slate-400" /> Order Priority
                  </label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={newOrder}
                    onChange={(e) => setNewOrder(Number(e.target.value))}
                    className="border-slate-200 bg-white text-slate-900 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Publish Status</label>
                  <button
                    type="button"
                    onClick={() => setNewIsActive(!newIsActive)}
                    className={`w-full h-9 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      newIsActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {newIsActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {newIsActive ? "Active (Live)" : "Draft (Hidden)"}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs h-9 shadow-lg shadow-rose-950/30"
              >
                {isPending ? <Spinner className="w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Publish FAQ
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Existing FAQs List */}
        <Card className="border border-slate-200 bg-white lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
                  <HelpCircle className="w-4 h-4 text-rose-500" /> Active FAQs ({filteredFaqs.length})
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs">
                  Live questions displayed in accordion format on the public website.
                </CardDescription>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search questions & answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-white border-slate-200 text-xs text-slate-900 h-8"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto max-h-[650px]">
            {filteredFaqs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto opacity-50" />
                <p className="text-sm font-medium">No FAQs found.</p>
                <p className="text-xs text-slate-400">
                  Try adjusting your search query or add a new question from the left panel.
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                    faq.isActive
                      ? "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                      : "bg-slate-50 border-slate-200 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                          {faq.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Priority: #{faq.order}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            faq.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {faq.isActive ? "Active" : "Hidden"}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">{faq.question}</h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(faq)}
                        title={faq.isActive ? "Hide FAQ" : "Make Live"}
                        className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 h-7 w-7 p-0"
                      >
                        {faq.isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(faq)}
                        title="Edit FAQ"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-7 w-7 p-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingFaq(faq)}
                        title="Delete FAQ"
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed pl-1 border-l-2 border-slate-200">
                    {faq.answer}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit FAQ Dialog Modal */}
      {editingFaq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-rose-500" /> Edit FAQ
              </h3>
              <button
                onClick={() => setEditingFaq(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Category</label>
                <Input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Question</label>
                <Input
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Answer</label>
                <Textarea
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  rows={4}
                  className="border-slate-200 bg-white text-slate-900 text-xs leading-relaxed"
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
                    {editIsActive ? "Active" : "Hidden"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={() => setEditingFaq(null)}
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
      {deletingFaq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-950/60 text-red-400 border border-red-900/50">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete FAQ</h3>
                <p className="text-xs text-slate-500 mt-0.5">Are you sure you want to permanently delete this FAQ?</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-slate-800">{deletingFaq.question}</p>
              <p className="text-slate-500 truncate">{deletingFaq.answer}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setDeletingFaq(null)}
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
