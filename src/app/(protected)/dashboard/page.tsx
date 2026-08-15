import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id as string | undefined;
  const sessionPublicId = (session.user as any).publicId as string | null;

  if (!userId) {
    redirect("/login");
  }

  const userRole = (session.user as any).role;
  if (userRole && userRole !== "USER") {
    redirect("/admin");
  }

  const aggregateRes =
    await container.services.dashboardAggregateService.getDashboardData(userId);

  if (!aggregateRes.success || !aggregateRes.data) {
    redirect("/onboarding");
  }

  const data = aggregateRes.data;

  if (data.profile?.status === "DRAFT") {
    redirect("/onboarding");
  }

  // Prefer publicId from profile DTO (which comes from DB), fall back to session token
  const publicId = data.profile?.publicId || sessionPublicId;

  return (
    <DashboardClient
      profile={data.profile}
      membership={data.membership}
      receivedInterests={data.receivedInterests}
      sentInterests={data.sentInterests}
      suggestions={data.suggestions}
      conversations={data.conversations}
      notifications={data.notifications}
      publicId={publicId}
    />
  );
}
