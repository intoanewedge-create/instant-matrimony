"use server";

import { auth } from "../auth";
import { container } from "../container";
import { searchFilterSchema } from "../validators/search.validator";
import { prisma } from "@/lib/prisma";

export async function searchMatchesAction(params: {
  queryText?: string;
  filters?: any;
  page?: number;
  limit?: number;
  sortBy?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  // Check viewer's profile status
  const profileRes = await container.services.profileService.getProfileByUserId(userId);
  if (!profileRes.success || profileRes.data?.status !== "APPROVED") {
    return { success: false, error: "Only members with APPROVED profiles can search." };
  }

  const filtersVal = params.filters || {};
  const result = searchFilterSchema.safeParse(filtersVal);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const serviceResult = await container.services.searchService.searchMatches(userId, {
    queryText: params.queryText,
    filters: result.data,
    page: params.page,
    limit: params.limit,
    sortBy: params.sortBy,
  });
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true, ...serviceResult.data };
}

export async function getSearchSuggestionsAction(query: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const res = await container.services.searchService.getSuggestions(query);
  if (!res.success) {
    return { success: false, error: res.error };
  }
  return { success: true, suggestions: res.data };
}

export async function getRecentlyViewedProfilesAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized", data: [] };
  }
  const userId = session.user.id;

  try {
    const selfProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { gender: true },
    });
    const uG = selfProfile?.gender?.toUpperCase();
    const targetGender = uG === "MALE" ? "FEMALE" : uG === "FEMALE" ? "MALE" : "NONE";

    const rawVisits = await prisma.profileVisitor.findMany({
      where: {
        visitorId: userId,
        visited: {
          isActive: true,
          deletedAt: null,
          profile: {
            status: "APPROVED",
            deletedAt: null,
            gender: targetGender,
          },
        },
      },
      include: {
        visited: {
          select: {
            id: true,
            publicId: true,
            name: true,
            profile: {
              include: {
                photos: { where: { deletedAt: null } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    const seenUserIds = new Set<string>();
    const deduplicatedProfiles: any[] = [];

    for (const visit of rawVisits) {
      if (visit.visited?.profile && !seenUserIds.has(visit.visitedId)) {
        seenUserIds.add(visit.visitedId);

        // Convert birthdate to age if available
        const prof = visit.visited.profile as any;
        let calculatedAge = prof.age;
        if (!calculatedAge && prof.dateOfBirth) {
          const dob = new Date(prof.dateOfBirth);
          const diffMs = Date.now() - dob.getTime();
          calculatedAge = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
        }

        deduplicatedProfiles.push({
          profile: {
            ...visit.visited.profile,
            user: {
              id: visit.visited.id,
              publicId: visit.visited.publicId,
              name: visit.visited.name,
            },
            age: calculatedAge,
          },
          visitedAt: visit.createdAt,
        });
      }
    }

    const targetUserIds = deduplicatedProfiles.map((p) => p.profile.userId);

    const [favRows, sentInterests, unlockedContacts] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId, favoriteUserId: { in: targetUserIds } },
        select: { favoriteUserId: true },
      }),
      prisma.interest.findMany({
        where: { senderId: userId, receiverId: { in: targetUserIds }, status: { in: ["PENDING", "ACCEPTED"] } },
        select: { receiverId: true },
      }),
      prisma.contactUnlock.findMany({
        where: { userId, targetUserId: { in: targetUserIds } },
        select: { targetUserId: true },
      }),
    ]);

    const favSet = new Set(favRows.map((r) => r.favoriteUserId));
    const interestSet = new Set(sentInterests.map((r) => r.receiverId));
    const unlockSet = new Set(unlockedContacts.map((r) => r.targetUserId));

    const hydrated = deduplicatedProfiles.map((p) => ({
      ...p,
      favorited: favSet.has(p.profile.userId),
      interestSent: interestSet.has(p.profile.userId),
      isUnlocked: unlockSet.has(p.profile.userId),
    }));

    return { success: true, data: hydrated };
  } catch (e: any) {
    return { success: false, error: e.message, data: [] };
  }
}
