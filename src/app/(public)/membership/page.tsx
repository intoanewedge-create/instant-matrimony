import { auth } from "@/lib/auth";
import { container } from "@/lib/container";
import { prisma } from "@/lib/prisma";
import { websiteSettingsService, DEFAULT_BRANDING_SETTINGS } from "@/lib/services/website-settings.service";
import { MembershipClient } from "./membership-client";

export default async function MembershipPage() {
  const session = await auth();
  const user = session?.user || null;
  const userId = (session?.user as any)?.id;

  let activeMembership = null;
  let pendingPayments: any[] = [];

  if (userId) {
    [activeMembership, pendingPayments] = await Promise.all([
      prisma.membership.findFirst({
        where: { userId, status: "ACTIVE", endDate: { gte: new Date() } },
        include: { plan: true },
      }),
      prisma.payment.findMany({
        where: { userId, status: "PENDING" },
        orderBy: { createdAt: "desc" },
      }),
    ]);
  }

  const [plansRes, settingsRes] = await Promise.all([
    container.services.membershipService.getPlans(),
    websiteSettingsService.getSettings().catch(() => null),
  ]);

  const plans = plansRes.success && plansRes.data ? plansRes.data : [];
  const settings = (settingsRes && settingsRes.success && settingsRes.data) ? settingsRes.data : DEFAULT_BRANDING_SETTINGS;
  const paymentNumber = settings.paymentNumber || "9000906292";

  return (
    <div className="flex flex-col w-full py-12 bg-gradient-to-b from-rose-50/40 via-slate-50 to-white text-slate-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <MembershipClient
          plans={JSON.parse(JSON.stringify(plans))}
          user={user}
          paymentNumber={paymentNumber}
          activeMembership={activeMembership ? JSON.parse(JSON.stringify(activeMembership)) : null}
          pendingPayments={JSON.parse(JSON.stringify(pendingPayments))}
        />
      </div>
    </div>
  );
}
