import { auth } from "@/lib/auth";
import { container } from "@/lib/container";
import { websiteSettingsService, DEFAULT_BRANDING_SETTINGS } from "@/lib/services/website-settings.service";
import { MembershipClient } from "./membership-client";

export default async function MembershipPage() {
  const session = await auth();
  const user = session?.user || null;

  const [plansRes, settingsRes] = await Promise.all([
    container.services.membershipService.getPlans(),
    websiteSettingsService.getSettings().catch(() => null),
  ]);

  const plans = plansRes.success && plansRes.data ? plansRes.data : [];
  const settings = (settingsRes && settingsRes.success && settingsRes.data) ? settingsRes.data : DEFAULT_BRANDING_SETTINGS;
  const paymentNumber = settings.paymentNumber || "9000906292";

  return (
    <div className="flex flex-col w-full py-12 bg-slate-950 text-white min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <MembershipClient
          plans={JSON.parse(JSON.stringify(plans))}
          user={user}
          paymentNumber={paymentNumber}
        />
      </div>
    </div>
  );
}
