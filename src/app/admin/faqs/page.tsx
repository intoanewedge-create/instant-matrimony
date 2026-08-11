"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { HelpCircle, Plus, Trash2, CheckCircle2 } from "lucide-react";

export default function AdminFaqsPage() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState([
    {
      id: "1",
      question: "How does InstantMatrimony verify user profiles?",
      answer: "Profiles are verified through government ID submission and manual admin moderation to ensure safe matchmaking.",
      category: "Verification",
    },
    {
      id: "2",
      question: "How do I upgrade to a Premium Membership?",
      answer: "Navigate to the Memberships page, select your preferred plan (Silver, Gold, Diamond), and pay via UPI using number 9000906292.",
      category: "Payments",
    },
    {
      id: "3",
      question: "Can I keep my contact number private?",
      answer: "Yes, you can configure your contact number visibility to require mutual interest acceptance or unlock tokens.",
      category: "Privacy",
    },
    {
      id: "4",
      question: "Who can I contact for matrimonial concierge assistance?",
      answer: "Our customer support team (చైతన్య) is available via phone and WhatsApp at 8885678080.",
      category: "Support",
    },
  ]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("General");

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast({ title: "Validation Error", description: "Please enter both question and answer." });
      return;
    }
    setFaqs((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        category: newCategory.trim() || "General",
      },
    ]);
    setNewQuestion("");
    setNewAnswer("");
    toast({ title: "FAQ Added", description: "New FAQ published successfully." });
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    toast({ title: "FAQ Removed", description: "FAQ removed from queue." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            FAQ Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, update, and manage frequently asked questions displayed on the public FAQ page.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create FAQ Form */}
        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-500" /> Add New FAQ
            </CardTitle>
            <CardDescription className="text-slate-400">
              Publish a new question & answer pair.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <Input
                placeholder="e.g. Verification, Privacy, Payments"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="border-slate-800 bg-slate-950/60 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Question</label>
              <Input
                placeholder="Enter question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="border-slate-800 bg-slate-950/60 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Answer</label>
              <Textarea
                placeholder="Enter detailed answer..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={4}
                className="border-slate-800 bg-slate-950/60 text-white"
              />
            </div>
            <Button
              onClick={handleAddFaq}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Publish FAQ
            </Button>
          </CardContent>
        </Card>

        {/* Existing FAQs List */}
        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-rose-500" /> Active FAQs ({faqs.length})
            </CardTitle>
            <CardDescription className="text-slate-400">
              Publicly visible answers on the InstantMatrimony website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-900/50 inline-block mb-1">
                      {faq.category}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-200">{faq.question}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="text-slate-500 hover:text-red-400 hover:bg-red-950/30 h-8 w-8 p-0 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
