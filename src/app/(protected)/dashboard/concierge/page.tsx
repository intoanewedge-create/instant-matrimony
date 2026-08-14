import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { conciergeService } from "@/lib/services/concierge.service";
import { UserConciergeClient } from "./user-concierge-client";
import { container } from "@/lib/container";

export default async function UserConciergePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;

  const profileResult = await container.services.profileService.getProfileByUserId(userId);
  if (!profileResult.success) {
    redirect("/onboarding");
  }
  if (profileResult.data.status !== "APPROVED") {
    redirect("/dashboard");
  }

  const caseRes = await conciergeService.getUserCase(userId);
  const caseData = caseRes.success ? caseRes.data : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-slate-50 to-white text-slate-900 py-8">
      <UserConciergeClient caseData={JSON.parse(JSON.stringify(caseData))} />
    </div>
  );
}
