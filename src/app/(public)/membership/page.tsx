import { auth } from "@/lib/auth";
import { container } from "@/lib/container";
import { MembershipClient } from "./membership-client";

export default async function MembershipPage() {
  const session = await auth();
  const user = session?.user || null;

  const plansRes = await container.services.membershipService.getPlans();
  const plans = plansRes.success ? plansRes.data : [];

  return (
    <div className="flex flex-col w-full py-12 bg-slate-950 text-white min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <MembershipClient plans={JSON.parse(JSON.stringify(plans))} user={user} />
      </div>
    </div>
  );
}
