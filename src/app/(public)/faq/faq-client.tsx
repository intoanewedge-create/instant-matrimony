"use client";

import React, { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { HelpCircle, Search, Sparkles, Filter } from "lucide-react";

interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
}

export function FaqClient({ faqs }: { faqs: FaqItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = Array.from(
    new Set(["ALL", ...faqs.map((f) => f.category || "General")])
  );

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (faq.category && faq.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "ALL" || (faq.category || "General").toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col w-full py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4 text-primary">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
              <HelpCircle className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed max-w-2xl mx-auto">
            Got questions? We're here to help. Explore detailed answers regarding profile verification, privacy safeguards, memberships, and matrimonial safety.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-4 mb-10">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by keywords (e.g. verification, privacy, gold plan, refund)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-sm bg-card border-border/60 shadow-sm rounded-xl"
            />
          </div>

          {categories.length > 2 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Categories:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground border border-border/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Collapsible Accordion */}
        <div className="bg-card border border-border/40 p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-medium">No matching questions found.</p>
              <p className="text-xs">Try searching for other terms like verification, photos, or membership.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible={true} className="w-full">
              {filteredFaqs.map((item, idx) => (
                <AccordionItem key={item.id || idx} value={`faq-${idx}`}>
                  <AccordionTrigger value={`faq-${idx}`} className="text-left hover:text-rose-500 font-semibold py-4 text-sm sm:text-base">
                    <span className="flex items-center gap-2">
                      {item.category && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border/40 hidden sm:inline-block">
                          {item.category}
                        </span>
                      )}
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent value={`faq-${idx}`} className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Support Help Banner */}
        <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-rose-500/10 border border-rose-500/20 space-y-2">
          <Sparkles className="w-6 h-6 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-foreground">Still have questions?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Our relationship advisors and dedicated support team are ready to assist you 24/7.
          </p>
          <div className="pt-2">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-500 shadow-md transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
