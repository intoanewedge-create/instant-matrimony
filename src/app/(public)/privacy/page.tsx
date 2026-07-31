import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | InstantMatrimony",
  description:
    "Learn how InstantMatrimony collects, uses, protects and shares your personal information across our matrimony platform.",
};

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect personal information you provide during registration and profile creation, including your full name, date of birth, gender, religion, community, mother tongue, education, career details, location and photos. This information is used solely to publish your matrimonial profile and to help you find suitable matches.",
  },
  {
    title: "2. How We Use Your Information",
    body: "Your information is used to display your profile to other verified members, generate compatible match recommendations, verify your identity, process membership upgrades and provide customer support. We may send you service-related notifications and match alerts.",
  },
  {
    title: "3. Document & Identity Safety",
    body: "Identity proofs submitted for verification are encrypted and stored securely. They are used only to validate your account, are never displayed to other members and are removed once verification is complete.",
  },
  {
    title: "4. Privacy Controls",
    body: "You control who can view your profile photo, contact details and horoscope. Contact information is hidden by default and revealed only to members you approve or to premium members as per your privacy settings.",
  },
  {
    title: "5. Data Sharing",
    body: "We do not sell, rent or trade your personal information to third-party advertisers. Limited data may be shared with trusted service providers (such as payment gateways and communication services) strictly to operate the platform, under confidentiality obligations.",
  },
  {
    title: "6. Cookies & Analytics",
    body: "We use cookies and similar technologies to keep you signed in, remember preferences and understand how the platform is used so we can improve it. You can control cookies through your browser settings.",
  },
  {
    title: "7. Data Retention & Your Rights",
    body: "You may edit, hide or delete your profile at any time. Upon account deletion, your personal data is removed from active systems in accordance with applicable law. You can request access to, or correction of, the personal information we hold about you.",
  },
  {
    title: "8. Contact Us",
    body: "For any privacy questions or requests, contact our support team at support@instantmatrimony.com.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col w-full py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4 text-primary">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed">
            Your privacy matters to us. This policy explains what data we
            collect and how we protect it.
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
