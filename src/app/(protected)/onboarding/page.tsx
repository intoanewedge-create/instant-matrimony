import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as any).role;
  if (userRole && userRole !== "USER") {
    redirect("/admin");
  }

  const userId = (session.user as any).id;

  const result = await container.services.profileService.getProfileByUserId(userId);
  // If profile is not found, render onboarding with null so the user can create one.
  // Do NOT redirect to /login — that causes an infinite redirect loop
  const profile = result.success ? result.data : null;

  return (
    <div className="flex-grow flex flex-col bg-gradient-to-b from-rose-50/40 via-slate-50 to-white text-slate-900 min-h-screen">
      <OnboardingWizard initialProfile={profile} />
    </div>
  );
}
