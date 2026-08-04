"use server";

import { auth } from "../auth";
import { container } from "../container";
import { searchFilterSchema } from "../validators/search.validator";

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
