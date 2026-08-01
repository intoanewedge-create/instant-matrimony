import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { prisma } from "@/lib/prisma";
import { SearchClient } from "./search-client";

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

  const defaultGender = profile.gender === "MALE" ? "FEMALE" : "MALE";

  // Fetch initial raw search results
  const initialResultsResult =
    await container.services.searchService.searchMatches(userId, {
      filters: { gender: defaultGender },
      limit: 10,
    });
  const initialResults = initialResultsResult.success
    ? initialResultsResult.data
    : [];

  // Extract target user IDs for batched DB lookup
  const targetUserIds = initialResults
    .map((r: any) => r?.profile?.userId)
    .filter(Boolean);

  // Parallel database query for favorited and interest states
  const [favRows, sentInterests] = await Promise.all([
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
  ]);

  // Use Sets for O(1) lookup speed during hydration
  const favSet = new Set(favRows.map((r) => r.favoriteUserId));
  const interestSet = new Set(sentInterests.map((r) => r.receiverId));

  // Hydrate results before passing to client component
  const hydratedResults = initialResults.map((r: any) => ({
    ...r,
    favorited: favSet.has(r?.profile?.userId),
    interestSent: interestSet.has(r?.profile?.userId),
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SearchClient
        initialResults={hydratedResults}
        defaultGender={defaultGender}
      />
    </div>
  );
}
