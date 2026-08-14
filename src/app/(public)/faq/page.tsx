import { prisma } from "@/lib/prisma";
import { FaqClient } from "./faq-client";
import { CmsPageRenderer } from "@/components/cms-page-renderer";

export const dynamic = "force-dynamic";

const DEFAULT_FAQS = [
  {
    question: "How does profile verification work on InstantMatrimony?",
    answer: "Every user completes phone/email OTP verification and can submit a government-issued photo ID (Aadhaar, PAN, or Passport). Once submitted, our moderation team verifies the details before applying the 'Verified' badge.",
    category: "Verification",
  },
  {
    question: "Can I hide my profile photos or contact details?",
    answer: "Yes! Under Account Settings, you can configure your photo privacy to 'Visible to all', 'Visible only to accepted matches', or 'Request permission'. Contact details are locked and only revealed to users with an active premium plan when you accept their connection request.",
    category: "Privacy",
  },
  {
    question: "What benefits do premium membership plans offer?",
    answer: "Our Standard Plan (₹1,000 / 30 Days) includes 5 contact unlocks upon accepted interest and chat with eligible interest connections. Our VIP Concierge Plan (₹5,00,000 / Valid Till Marriage) provides dedicated Relationship Manager assistance, priority listings, and comprehensive matrimonial matchmaking.",
    category: "Memberships",
  },
  {
    question: "How do I upgrade to a premium membership?",
    answer: "Go to the Membership page, select between our Standard Plan (₹1,000) or VIP Concierge Plan (₹5,00,000), and submit payment via UPI or Bank Transfer. Once verified, your membership features are activated immediately.",
    category: "Payments",
  },
  {
    question: "What is your refund policy?",
    answer: "We offer refunds if requested within 48 hours of purchase, provided you have not unlocked profile contact numbers or initiated messages. Please email support@instantmatrimony.com for billing support.",
    category: "Payments",
  },
  {
    question: "How can I block or report abusive profiles?",
    answer: "Every profile page has simple 'Block' and 'Report' buttons. Blocking hides your profile immediately. Reporting sends an alert to our admin moderation queue, and action is taken within 12 hours.",
    category: "Safety",
  },
];

export default async function FAQPage() {
  // 1. Check for CMS Page override
  let cmsPage: any = null;
  try {
    cmsPage = await prisma.cmsPage.findUnique({
      where: { slug: "faq" },
    });
  } catch (e) {
    // Graceful fallback to FAQs table
  }

  if (cmsPage && cmsPage.status === "PUBLISHED" && cmsPage.content?.trim()) {
    return (
      <CmsPageRenderer
        title={cmsPage.title}
        content={cmsPage.content}
        seoTitle={cmsPage.seoTitle}
      />
    );
  }

  // 2. Fetch FAQs from database
  let faqs: any[] = [];
  try {
    const dbFaqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    if (dbFaqs && dbFaqs.length > 0) {
      faqs = dbFaqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category || "General",
      }));
    }
  } catch (e) {
    // If DB query fails, fall back to defaults
  }

  if (faqs.length === 0) {
    faqs = DEFAULT_FAQS;
  }

  return <FaqClient faqs={faqs} />;
}
