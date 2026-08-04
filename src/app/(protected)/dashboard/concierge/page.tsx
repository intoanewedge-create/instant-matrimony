import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { conciergeService } from "@/lib/services/concierge.service";
import { UserConciergeClient } from "./user-concierge-client";

export default async function UserConciergePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;

  const caseRes = await conciergeService.getUserCase(userId);
  const caseData = caseRes.success ? caseRes.data : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8">
      <UserConciergeClient caseData={JSON.parse(JSON.stringify(caseData))} />
    </div>
  );
}
