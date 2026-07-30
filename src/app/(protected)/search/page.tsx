import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { SearchClient } from "./search-client";

export default async function SearchPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;

  const profileResult = await container.services.profileService.getProfileByUserId(userId);
  if (!profileResult.success) {
    redirect("/onboarding");
  }
  const profile = profileResult.data;

  const defaultGender = profile.gender === "MALE" ? "FEMALE" : "MALE";

  const initialResultsResult = await container.services.searchService.searchMatches(userId, {
    filters: { gender: defaultGender },
    limit: 10,
  });
  
  const initialResults = initialResultsResult.success ? initialResultsResult.data : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SearchClient initialResults={initialResults} defaultGender={defaultGender} />
    </div>
  );
}
