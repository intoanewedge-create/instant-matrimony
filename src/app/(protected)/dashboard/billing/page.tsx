import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { prisma } from "@/lib/prisma";
import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  let plans: any[] = [];
  let activeMembership: any = null;
  let invoices: any[] = [];
  let orders: any[] = [];
  let payments: any[] = [];

  try {
    const [plansResult, activeMem, invs, ords, pymts] = await Promise.all([
      container.services.membershipService.getPlans().catch(() => ({ success: false, data: [] })),
      container.repositories.membershipRepository.findActiveByUserId(userId).catch(() => null),
      container.repositories.invoiceRepository.findUserInvoices(userId).catch(() => []),
      container.repositories.membershipRepository.findOrdersByUserId(userId).catch(() => []),
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }).catch(() => []),
    ]);

    plans = plansResult.success && plansResult.data ? JSON.parse(JSON.stringify(plansResult.data)) : [];
    activeMembership = activeMem ? JSON.parse(JSON.stringify(activeMem)) : null;
    invoices = JSON.parse(JSON.stringify(invs || []));
    orders = JSON.parse(JSON.stringify(ords || []));
    payments = JSON.parse(JSON.stringify(pymts || []));
  } catch (error) {
    console.error("[BillingPage] Error loading billing data:", error);
  }

  return (
    <BillingClient
      plans={plans}
      activeMembership={activeMembership}
      invoices={invoices}
      orders={orders}
      payments={payments}
    />
  );
}

