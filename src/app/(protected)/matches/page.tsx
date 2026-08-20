import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { MatchesClient } from "./matches-client";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id as string;

  const { searchMatchesAction } = await import("@/lib/actions/search.actions");

  // Search initial matches for user using the Action to enforce gender filters
  const searchResult = await searchMatchesAction({
    filters: { category: "all" },
    page: 1,
    limit: 12,
    sortBy: "bestMatch",
  }).catch(() => ({ success: false, error: "Failed to fetch matches", data: [], totalRecords: 0, page: 1, totalPages: 1 }));

  const initialData = searchResult.success
    ? searchResult
    : { data: [], totalRecords: 0, page: 1, totalPages: 1 };

  return <MatchesClient initialResults={initialData} />;
}
