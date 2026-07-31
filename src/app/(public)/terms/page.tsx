import type { Metadata } from "next";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | InstantMatrimony",
  description:
    "Read the Terms & Conditions governing the use of InstantMatrimony, including eligibility, member conduct, payments and account termination.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By registering on or using InstantMatrimony, you agree to comply with and be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use our services.",
  },
  {
    title: "2. Eligibility",
    body: "You must be of legal marriageable age in India to register as a member. The platform is intended solely for individuals genuinely seeking a matrimonial alliance and not for dating, casual or unlawful relationships.",
  },
  {
    title: "3. Account & Profile Responsibility",
    body: "You are responsible for providing accurate, current and complete information in your profile and for maintaining the confidentiality of your login credentials. Impersonation, fake profiles and misrepresentation are strictly prohibited.",
  },
  {
    title: "4. Member Conduct",
    body: "Members must interact respectfully. Harassment, abusive language, solicitation, sharing of obscene content or attempts to defraud other members will result in immediate suspension and possible legal action.",
  },
  {
    title: "5. Content Moderation",
    body: "We reserve the right to review, edit, reject or remove profile descriptions, photos and partner preferences that contain inappropriate content or violate our verification and community guidelines.",
  },
  {
    title: "6. Membership & Payments",
    body: "Premium membership plans (Silver, Gold, Platinum and Diamond) are billed upfront and grant access to features as described on the Membership page. Prices and features may change with prior notice.",
  },
  {
    title: "7. Refunds & Cancellation",
    body: "Refund eligibility is governed by our refund policy. Refunds are considered only within the stated window and provided premium features such as contact reveals have not been substantially used.",
  },
  {
    title: "8. Limitation of Liability",
    body: "InstantMatrimony is a platform that facilitates introductions. We do not guarantee marriage, compatibility or the accuracy of member-provided information. Members are advised to independently verify details before making any commitment.",
  },
  {
    title: "9. Account Termination",
    body: "We may suspend or terminate accounts that violate these terms, engage in fraudulent activity or misuse the platform, without prior notice and without refund where applicable.",
  },
  {
    title: "10. Contact",
    body: "For questions regarding these Terms & Conditions, please contact support@instantmatrimony.com.",
  },
];

export default function TermsAndConditions() {
  return (
    <div className="flex flex-col w-full py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4 text-primary">
            <Scale className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Terms &amp; Conditions
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed">
            Please read these terms carefully before using InstantMatrimony.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: January 2026
          </p>
        </div>

        <div className="bg-card border border-border/40 p-6 sm:p-10 rounded-2xl shadow-sm space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-foreground">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
