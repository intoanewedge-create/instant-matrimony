"use server";

import { auth } from "../auth";
import { container } from "../container";
import { searchFiltersSchema } from "../validators/search.validator";

export async function searchMatchesAction(params: {
  queryText?: string;
  filters?: any;
  cursor?: string;
  limit?: number;
  sortBy?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  const filtersVal = params.filters || {};
  const result = searchFiltersSchema.safeParse(filtersVal);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const serviceResult = await container.services.searchService.searchMatches(userId, {
    queryText: params.queryText,
    filters: result.data,
    cursor: params.cursor,
    limit: params.limit,
    sortBy: params.sortBy,
  });
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true, results: serviceResult.data };
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

