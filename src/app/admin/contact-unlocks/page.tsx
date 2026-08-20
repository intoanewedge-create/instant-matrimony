import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminUnlocksClient } from "./admin-unlocks-client";

export default async function AdminUnlocksPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const unlocks = await prisma.contactUnlock.findMany({
    orderBy: { unlockedAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, publicId: true } },
      targetUser: { select: { id: true, name: true, email: true, publicId: true } },
      membership: { include: { plan: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Contact Unlock Audit Logs</h1>
        <p className="text-xs text-slate-600 mt-1">Audit log of all permanent contact unlocks performed across the platform.</p>
      </div>

      <AdminUnlocksClient initialUnlocks={JSON.parse(JSON.stringify(unlocks))} />
    </div>
  );
}
