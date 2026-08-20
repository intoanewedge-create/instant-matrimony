import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminMembershipsClient } from "./admin-memberships-client";

export default async function AdminMembershipsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [plans, activeMemberships] = await Promise.all([
    prisma.membershipPlan.findMany({
      where: { deletedAt: null },
      orderBy: { price: "asc" },
    }),
    prisma.membership.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        plan: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Membership Plans & Subscriptions</h1>
        <p className="text-xs text-slate-600 mt-1">Configure database-driven membership plans and review active user subscriptions.</p>
      </div>

      <AdminMembershipsClient
        plans={JSON.parse(JSON.stringify(plans))}
        activeMemberships={JSON.parse(JSON.stringify(activeMemberships))}
      />
    </div>
  );
}
