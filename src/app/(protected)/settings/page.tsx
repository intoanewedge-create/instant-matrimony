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

  const defaultPreferences = {
    emailMatches: true,
    emailInterests: true,
    emailMessages: true,
    emailSecurity: true,
    browserMatches: true,
    browserInterests: true,
    browserMessages: true,
    browserSecurity: true,
  };

  const serializedPreferences = prefRes.success && prefRes.data
    ? JSON.parse(JSON.stringify(prefRes.data))
    : defaultPreferences;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-slate-50 to-white text-slate-900 pb-12">
      <SettingsClient
        initialPreferences={serializedPreferences}
        userEmail={session.user.email || undefined}
      />
    </div>
  );
}
