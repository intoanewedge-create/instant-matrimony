import type { Metadata } from "next";
import Link from "next/link";
import { Users2, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/profile-card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Browse Verified Profiles | InstantMatrimony",
  description:
    "Explore a preview of verified matrimony profiles across communities, religions and regions. Register free to connect and view full details.",
};

export default async function BrowseProfiles() {
  const profiles = await prisma.profile.findMany({
    where: { status: "APPROVED", deletedAt: null },
    take: 24,
    include: {
      user: { select: { name: true, publicId: true } },
      photos: { where: { deletedAt: null } }
    }
  });

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/5 via-transparent to-background py-16 sm:py-20 border-b border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
            <Users2 className="h-3.5 w-3.5" />
            <span>Sample Verified Profiles</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground max-w-3xl">
            Browse Genuine Profiles
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            Get a glimpse of the verified members on InstantMatrimony. Register
            free to unlock contact details, send interests and start
            conversations securely.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/find">
              <Button variant="accent" data-testid="browse-goto-search">
                <Search className="h-4 w-4" /> Refine with Search
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" data-testid="browse-register">
                Register Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm font-medium text-muted-foreground">
              Showing {profiles.length} sample profiles
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <ShieldCheck className="h-4 w-4" /> Identity checked
            </span>
          </div>

          <div
            data-testid="browse-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary/30 border-t border-border/30">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Ready to see more?
          </h2>
          <p className="text-sm text-muted-foreground mt-3">
            Thousands of verified profiles are waiting. Create your free profile
            to access the full member directory.
          </p>
          <div className="mt-6">
            <Link href="/register">
              <Button
                size="lg"
                variant="accent"
                data-testid="browse-cta-register"
              >
                Create Free Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
