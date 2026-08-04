import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { conciergeService } from "@/lib/services/concierge.service";
import { prisma } from "@/lib/prisma";
import { AdminConciergeClient } from "./admin-concierge-client";

export default async function AdminConciergePage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [casesRes, admins] = await Promise.all([
    conciergeService.getCases(),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const cases = casesRes.success ? casesRes.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">VIP Concierge Case Management</h1>
        <p className="text-xs text-slate-400 mt-1">Dedicated Relationship Manager matchmaking system for Plan 2 VIP Concierge subscribers.</p>
      </div>

      <AdminConciergeClient
        initialCases={JSON.parse(JSON.stringify(cases))}
        admins={JSON.parse(JSON.stringify(admins))}
      />
    </div>
  );
}
