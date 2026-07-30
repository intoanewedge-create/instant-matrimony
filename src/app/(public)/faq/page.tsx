"use client";

import React, { useState, useEffect } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { getPageBySlugAction } from "@/lib/actions/cms.actions";
import { CmsPageRenderer } from "@/components/cms-page-renderer";

export default function FAQ() {
  const [cmsPage, setCmsPage] = useState<any | null>(null);

  useEffect(() => {
    getPageBySlugAction("faq").then((res) => {
      if (res.success && res.data && res.data.status === "PUBLISHED") {
        setCmsPage(res.data);
      }
    });
  }, []);

  if (cmsPage) {
    return (
      <CmsPageRenderer
        title={cmsPage.title}
        content={cmsPage.content}
        seoTitle={cmsPage.seoTitle}
      />
    );
  }

  const faqData = [
    {
      q: "How does profile verification work on InstantMatrimony?",
      a: "Every user is required to complete mobile OTP verification and submit a government-issued photo ID (like Aadhaar, PAN card, or Passport). Once submitted, our operations team manually reviews the document before applying the 'Verified' badge to the profile."
    },
    {
      q: "Can I hide my profile photos or contact details?",
      a: "Yes! Your privacy is our priority. Under Account Settings, you can configure your photo settings to 'Visible to all', 'Visible only to accepted matches', or 'Request permission'. Similarly, contact details are locked and only revealed to users who have a valid premium plan and whose connection request you've accepted."
    },
    {
      q: "What benefits do premium membership plans offer?",
      a: "Premium plans (Silver, Gold, Platinum, Diamond) allow you to view verified contact numbers, initiate direct chat messages, highlight your profile in search listings, and access dedicated relationship advisors who help search matches manually."
    },
    {
      q: "How do I upgrade to a premium membership?",
      a: "Go to the Membership page, select the plan that fits your requirements (Silver, Gold, Platinum, or Diamond), and click Upgrade. You can make a secure payment using Razorpay, Stripe, or Net Banking. Your plan features are activated instantly."
    },
    {
      q: "What is your refund policy?",
      a: "We offer refunds if requested within 48 hours of purchase, provided you have not viewed any profile contact details or sent message prompts. Please review our legal document terms or email support@instantmatrimony.com for assistance."
    },
    {
      q: "How can I block or report abusive profiles?",
      a: "Every profile page has simple 'Block User' and 'Report Abuse' buttons. Blocking will hide your profile from that user. Reporting a profile sends an alert to our admin moderation queue, and we take action (including account suspensions) within 12 hours."
    }
  ];

  return (
    <div className="flex flex-col w-full py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4 text-primary">
            <HelpCircle className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed">
            Need help? Explore responses to common queries relating to verification, privacy controls, and memberships.
          </p>
        </div>

        {/* Collapsible Accordion */}
        <div className="bg-card border border-border/40 p-6 sm:p-8 rounded-2xl shadow-sm">
          <Accordion type="single" collapsible={true}>
            {faqData.map((item, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger value={`faq-${idx}`}>
                  {item.q}
                </AccordionTrigger>
                <AccordionContent value={`faq-${idx}`}>
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>
    </div>
  );
}
