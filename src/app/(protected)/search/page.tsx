import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { prisma } from "@/lib/prisma";
import { SearchClient } from "./search-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default async function SearchPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;

  const profileResult =
    await container.services.profileService.getProfileByUserId(userId);
  if (!profileResult.success) {
    redirect("/onboarding");
  }
  const profile = profileResult.data;

  // Profile approval check
  if (profile.status !== "APPROVED") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-amber-800/60 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-amber-300">
              Profile Approval Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-slate-300">
              Search and matchmaking features are strictly restricted to members with <strong className="text-emerald-400">APPROVED</strong> profiles.
            </p>
            <p className="text-xs text-slate-400">
              Current Status: <span className="font-semibold text-amber-400 uppercase">{profile.status}</span>
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg font-semibold text-sm bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const defaultGender = profile.gender === "MALE" ? "FEMALE" : "MALE";

  // Fetch initial raw search results
  const searchRes = await container.services.searchService.searchMatches(userId, {
    filters: { gender: defaultGender },
    page: 1,
    limit: 12,
  });

  const initialData = searchRes.success && searchRes.data ? searchRes.data.data : [];
  const totalRecords = searchRes.success && searchRes.data ? searchRes.data.totalRecords : 0;
  const totalPages = searchRes.success && searchRes.data ? searchRes.data.totalPages : 1;

  // Extract target user IDs for batched DB lookup
  const targetUserIds = initialData
    .map((r: any) => r?.profile?.userId)
    .filter(Boolean);

  // Parallel database query for favorited, interest states, and contact unlocks
  const [favRows, sentInterests, unlockedContacts] = await Promise.all([
    prisma.favorite.findMany({
      where: {
        userId,
        favoriteUserId: { in: targetUserIds },
      },
      select: { favoriteUserId: true },
    }),
    prisma.interest.findMany({
      where: {
        senderId: userId,
        receiverId: { in: targetUserIds },
        status: { in: ["PENDING", "ACCEPTED"] },
      },
      select: { receiverId: true },
    }),
    prisma.contactUnlock.findMany({
      where: {
        userId,
        targetUserId: { in: targetUserIds },
      },
      select: { targetUserId: true },
    }),
  ]);

  const favSet = new Set(favRows.map((r) => r.favoriteUserId));
  const interestSet = new Set(sentInterests.map((r) => r.receiverId));
  const unlockSet = new Set(unlockedContacts.map((r) => r.targetUserId));

  // Hydrate results before passing to client component
  const hydratedResults = initialData.map((r: any) => ({
    ...r,
    favorited: favSet.has(r?.profile?.userId),
    interestSent: interestSet.has(r?.profile?.userId),
    isUnlocked: unlockSet.has(r?.profile?.userId),
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SearchClient
        initialResults={{
          data: hydratedResults,
          totalRecords,
          page: 1,
          totalPages,
        }}
        defaultGender={defaultGender}
      />
    </div>
  );
}
