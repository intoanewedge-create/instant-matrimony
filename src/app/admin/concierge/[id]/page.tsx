import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { conciergeService } from "@/lib/services/concierge.service";
import { prisma } from "@/lib/prisma";
import { ConciergeDetailClient } from "./concierge-detail-client";

export default async function AdminConciergeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id: caseId } = await params;
  const caseRes = await conciergeService.getCaseById(caseId);

  if (!caseRes.success || !caseRes.data) {
    redirect("/admin/concierge");
  }

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true },
  });

  return (
    <div className="space-y-6">
      <ConciergeDetailClient
        caseData={JSON.parse(JSON.stringify(caseRes.data))}
        admins={JSON.parse(JSON.stringify(admins))}
      />
    </div>
  );
}
