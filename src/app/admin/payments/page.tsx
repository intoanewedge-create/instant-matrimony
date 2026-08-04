import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPaymentsClient } from "./admin-payments-client";

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Enrich with user & plan info
  const userIds = Array.from(new Set(payments.map((p) => p.userId).filter(Boolean)));
  const planIds = Array.from(new Set(payments.map((p) => p.planId).filter(Boolean)));

  const [users, plans] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
      select: { id: true, name: true, email: true, phone: true },
    }),
    prisma.membershipPlan.findMany({
      where: { id: { in: planIds as string[] } },
      select: { id: true, name: true, price: true },
    }),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const planMap = new Map(plans.map((p) => [p.id, p]));

  const enrichedPayments = payments.map((p) => ({
    ...p,
    user: p.userId ? userMap.get(p.userId) : null,
    plan: p.planId ? planMap.get(p.planId) : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Payment Verification Queue</h1>
        <p className="text-xs text-slate-400 mt-1">Review UTR references, verify receipts, and activate memberships.</p>
      </div>

      <AdminPaymentsClient initialPayments={JSON.parse(JSON.stringify(enrichedPayments))} />
    </div>
  );
}
