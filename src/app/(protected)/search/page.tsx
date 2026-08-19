import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { prisma } from "@/lib/prisma";
import { SearchClient } from "./search-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  if (!profileResult.success || !profileResult.data) {
    redirect("/onboarding");
  }
  const profile = profileResult.data;

  // Profile approval check
  if (profile.status !== "APPROVED") {
    redirect("/dashboard");
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
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-slate-50 to-white text-slate-900">
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
