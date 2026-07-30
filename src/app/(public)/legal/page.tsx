"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Scale } from "lucide-react";
import { getPageBySlugAction } from "@/lib/actions/cms.actions";

export default function Legal() {
  const [termsContent, setTermsContent] = useState<string | null>(null);
  const [privacyContent, setPrivacyContent] = useState<string | null>(null);
  const [refundContent, setRefundContent] = useState<string | null>(null);

  useEffect(() => {
    getPageBySlugAction("terms").then((res) => {
      if (res.success && res.data && res.data.status === "PUBLISHED") {
        setTermsContent(res.data.content);
      }
    });
    getPageBySlugAction("privacy-policy").then((res) => {
      if (res.success && res.data && res.data.status === "PUBLISHED") {
        setPrivacyContent(res.data.content);
      }
    });
    getPageBySlugAction("refund-policy").then((res) => {
      if (res.success && res.data && res.data.status === "PUBLISHED") {
        setRefundContent(res.data.content);
      }
    });
  }, []);

  const parseMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        return <h1 key={idx} className="text-xl font-bold text-foreground mt-4 mb-2">{trimmed.replace("# ", "")}</h1>;
      }
      if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
        return <h2 key={idx} className="text-lg font-bold text-foreground mt-4 mb-2">{trimmed.replace(/^##* /, "")}</h2>;
      }
      if (trimmed === "") return <div key={idx} className="h-2" />;
      return <p key={idx} className="my-2">{trimmed}</p>;
    });
  };

  return (
    <div className="flex flex-col w-full py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4 text-primary">
            <Scale className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Legal Resources
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed">
            Please read our Terms of Service, Privacy Policy, and Refund details carefully.
          </p>
        </div>

        {/* Legal Tabs */}
        <div className="bg-card border border-border/40 p-6 sm:p-8 rounded-2xl shadow-sm">
          <Tabs defaultValue="terms">
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 max-w-md w-full">
                <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                <TabsTrigger value="refunds">Refunds & Cancel</TabsTrigger>
              </TabsList>
            </div>

            {/* Terms of Service Content */}
            <TabsContent value="terms" className="mt-8 text-sm text-muted-foreground leading-relaxed space-y-4">
              {termsContent ? (
                <div className="prose dark:prose-invert max-w-none">{parseMarkdown(termsContent)}</div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
                  <p>
                    By registering on InstantMatrimony, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must not use our services.
                  </p>
                  <h2 className="text-lg font-bold text-foreground mt-6">2. Eligibility</h2>
                  <p>
                    You must be of legal marriageable age in India (21 years for males and females) to register as a member. The portal is intended solely for marital connections and not for dating or casual relationships.
                  </p>
                  <h2 className="text-lg font-bold text-foreground mt-6">3. Content Moderation</h2>
                  <p>
                    We reserve the right to review, edit, or reject profile descriptions, photos, and partner preferences that contain inappropriate language or violate verification guidelines.
                  </p>
                </>
              )}
            </TabsContent>

            {/* Privacy Policy Content */}
            <TabsContent value="privacy" className="mt-8 text-sm text-muted-foreground leading-relaxed space-y-4">
              {privacyContent ? (
                <div className="prose dark:prose-invert max-w-none">{parseMarkdown(privacyContent)}</div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-foreground">1. Information Collection</h2>
                  <p>
                    We collect personal information including full name, birth date, religion, community, education, career details, and photos to publish your matrimonial profile.
                  </p>
                  <h2 className="text-lg font-bold text-foreground mt-6">2. Document Safety</h2>
                  <p>
                    Identity proofs submitted for profile verification are encrypted and stored in secure file stores. They are deleted immediately upon validation and are never shared with other users.
                  </p>
                  <h2 className="text-lg font-bold text-foreground mt-6">3. Data Sharing</h2>
                  <p>
                    We do not sell, rent, or trade your personal information to third-party advertising companies. Your contact details are hidden by default.
                  </p>
                </>
              )}
            </TabsContent>

            {/* Refund Policy Content */}
            <TabsContent value="refunds" className="mt-8 text-sm text-muted-foreground leading-relaxed space-y-4">
              {refundContent ? (
                <div className="prose dark:prose-invert max-w-none">{parseMarkdown(refundContent)}</div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-foreground">1. Upgrade Charges</h2>
                  <p>
                    All upgrade payments for premium tiers (Silver, Gold, Platinum, Diamond) are billed upfront.
                  </p>
                  <h2 className="text-lg font-bold text-foreground mt-6">2. Refund Request Window</h2>
                  <p>
                    Refunds are eligible only if requested within 48 hours of payment, and provided you have not unlocked any contact phone numbers, sent chat queries, or utilized advisor search tokens.
                  </p>
                  <h2 className="text-lg font-bold text-foreground mt-6">3. Processing Times</h2>
                  <p>
                    Approved refunds will be credited back to your original source of payment within 5 to 7 business days.
                  </p>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
