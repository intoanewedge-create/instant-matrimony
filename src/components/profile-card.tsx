import Link from "next/link";
import {
  BadgeCheck,
  MapPin,
  GraduationCap,
  Briefcase,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicProfile } from "@/lib/mock-profiles";

export function ProfileCard({ profile }: { profile: PublicProfile }) {
  return (
    <div
      data-testid={`profile-card-${profile.id}`}
      className="group flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Avatar header */}
      <div
        className={`relative h-40 bg-gradient-to-br ${profile.tone} flex items-center justify-center`}
      >
        <span className="text-4xl font-extrabold text-white/90 tracking-wide">
          {profile.initials}
        </span>
        {profile.verified && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/90 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
            <BadgeCheck className="h-3 w-3" /> Verified
          </span>
        )}
        {profile.premium && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-primary/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
            Premium
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-grow p-5">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-bold text-foreground">
            {profile.name}
          </h3>
          <span className="text-xs font-medium text-muted-foreground">
            {profile.age} yrs
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {profile.height} · {profile.religion} · {profile.motherTongue}
        </p>

        <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            {profile.city}, {profile.state}
          </li>
          <li className="flex items-center gap-2">
            <GraduationCap className="h-3.5 w-3.5 shrink-0 text-primary" />
            {profile.education}
          </li>
          <li className="flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 shrink-0 text-primary" />
            {profile.profession}
          </li>
        </ul>

        <div className="mt-auto pt-5 flex items-center gap-2">
          <Link href={`/profiles/${profile.id}`} className="flex-grow">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              data-testid={`view-profile-${profile.id}`}
            >
              View Profile
            </Button>
          </Link>
          <Link href="/register" title="Sign up to connect">
            <Button
              size="sm"
              variant="accent"
              data-testid={`connect-${profile.id}`}
            >
              <Lock className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
