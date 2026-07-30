import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;

  const prefRes = await container.services.notificationService.getPreferences(userId);
  if (!prefRes.success) {
    redirect("/dashboard");
  }

  // Ensure serializability
  const serializedPreferences = JSON.parse(JSON.stringify(prefRes.data));

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <SettingsClient initialPreferences={serializedPreferences} />
    </div>
  );
}
