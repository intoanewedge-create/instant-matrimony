import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const profile =
    await container.repositories.profileRepository.findByUserId(userId);

  if (!profile) {
    redirect("/onboarding");
  }

  // Compute completion breakdown on every request
  // so it updates automatically after router.refresh()
  const completionBreakdown =
    container.services.completionService.getBreakdown(profile);

  // Ensure JSON serializability by converting dates to ISO strings
  const serializedProfile = JSON.parse(JSON.stringify(profile));

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <ProfileClient
        initialProfile={serializedProfile}
        initialCompletion={completionBreakdown}
      />
    </div>
  );
}
