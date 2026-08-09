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

  const plansResult = await container.services.membershipService.getPlans();
  const activeMembership = await container.repositories.membershipRepository.findActiveByUserId(userId);
  const invoices = await container.repositories.invoiceRepository.findUserInvoices(userId);
  const orders = await container.repositories.membershipRepository.findOrdersByUserId(userId);
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const plans = plansResult.success ? plansResult.data : [];

  return (
    <BillingClient
      plans={plans}
      activeMembership={activeMembership}
      invoices={invoices}
      orders={orders}
      payments={JSON.parse(JSON.stringify(payments))}
    />
  );
}
