import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  MapPin,
  GraduationCap,
  Briefcase,
  Lock,
  Ruler,
  HeartHandshake,
  Languages,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicProfileById, PUBLIC_PROFILES } from "@/lib/mock-profiles";

export function generateStaticParams() {
  return PUBLIC_PROFILES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = getPublicProfileById(id);
  if (!profile) return { title: "Profile Not Found | InstantMatrimony" };
  return {
    title: `${profile.name}, ${profile.age} · ${profile.profession} | InstantMatrimony`,
    description: `${profile.religion} ${profile.community} profile from ${profile.city}, ${profile.state}. Register free to view full details and connect.`,
  };
}

export default async function PublicProfilePreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = getPublicProfileById(id);
  if (!profile) notFound();

  const facts = [
    { icon: Ruler, label: "Height", value: profile.height },
    {
      icon: HeartHandshake,
      label: "Marital Status",
      value: profile.maritalStatus,
    },
    { icon: Languages, label: "Mother Tongue", value: profile.motherTongue },
    {
      icon: Sparkles,
      label: "Community",
      value: `${profile.religion} · ${profile.community}`,
    },
    { icon: GraduationCap, label: "Education", value: profile.education },
    { icon: Briefcase, label: "Profession", value: profile.profession },
  ];

  return (
    <div className="flex flex-col w-full py-12 sm:py-16">
      <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          data-testid="preview-back"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: identity */}
          <div className="lg:col-span-4">
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm sticky top-24">
              <div
                className={`relative h-52 bg-gradient-to-br ${profile.tone} flex items-center justify-center`}
              >
                <span className="text-6xl font-extrabold text-white/90">
                  {profile.initials}
                </span>
                {profile.premium && (
                  <span className="absolute top-3 left-3 bg-primary/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                    Premium
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">
                    {profile.name}
                  </h1>
                  {profile.verified && (
                    <BadgeCheck
                      className="h-5 w-5 text-emerald-500"
                      aria-label="Verified"
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.age} yrs · {profile.height}
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  {profile.city}, {profile.state}
                </p>
                <p className="mt-1 text-xs text-emerald-600 font-medium">
                  {profile.lastActive}
                </p>

                <div className="mt-6 space-y-2">
                  <Link href="/register" className="block">
                    <Button
                      variant="accent"
                      className="w-full"
                      data-testid="preview-connect"
                    >
                      <Lock className="h-4 w-4" /> Register to Connect
                    </Button>
                  </Link>
                  <Link href="/login" className="block">
                    <Button
                      variant="outline"
                      className="w-full"
                      data-testid="preview-login"
                    >
                      Already a member? Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: details */}
          <div className="lg:col-span-8 space-y-8">
            {/* About */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">
                About {profile.name}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile.about}
              </p>
            </div>

            {/* Facts */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-6">
                Basic Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <f.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {f.label}
                      </p>
                      <p className="text-sm font-medium text-foreground mt-0.5">
                        {f.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Locked details */}
            <div className="relative bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
              <h2 className="text-lg font-bold text-foreground mb-6">
                Contact & Horoscope Details
              </h2>
              <div
                className="space-y-3 blur-sm select-none pointer-events-none"
                aria-hidden="true"
              >
                <p className="text-sm text-muted-foreground">
                  Phone: +91 •••••• ••••
                </p>
                <p className="text-sm text-muted-foreground">
                  Email: •••••••••@••••.com
                </p>
                <p className="text-sm text-muted-foreground">
                  Annual Income: ₹•• LPA
                </p>
                <p className="text-sm text-muted-foreground">
                  Star / Rashi: •••••••••
                </p>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/70 backdrop-blur-[2px] text-center px-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white mb-3">
                  <Lock className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Contact details are private
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Create a free account and upgrade your membership to view
                  contact information and send an interest.
                </p>
                <Link href="/register" className="mt-4">
                  <Button
                    size="sm"
                    variant="accent"
                    data-testid="preview-unlock"
                  >
                    Register Free to Unlock
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
