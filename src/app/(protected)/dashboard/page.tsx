import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  console.log("SESSION USER:", session?.user);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id as string | undefined;

  if (!userId) {
    redirect("/login");
  }

  console.log("USER ID:", userId);

  const aggregateRes =
    await container.services.dashboardAggregateService.getDashboardData(userId);

  console.log("AGGREGATE RESULT:", aggregateRes);

  if (!aggregateRes.success) {
    redirect("/onboarding");
  }

  const data = aggregateRes.data;

  console.log("PROFILE STATUS:", data.profile.status);

  if (data.profile.status === "DRAFT") {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardClient
        profile={data.profile}
        membership={data.membership}
        receivedInterests={data.receivedInterests}
        sentInterests={data.sentInterests}
        suggestions={data.suggestions}
        conversations={data.conversations}
        notifications={data.notifications}
      />
    </div>
  );
}
