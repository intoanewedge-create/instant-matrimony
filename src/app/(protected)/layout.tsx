import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { container as appContainer } from "@/lib/container";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id as string | undefined;
  const publicId = (session.user as any).publicId as string | null;

  const membershipRes = userId
    ? await appContainer.repositories.membershipRepository
        .findActiveByUserId(userId)
        .catch(() => null) as any
    : null;

  const isPremium = !!membershipRes;
  const planName = membershipRes?.plan?.name || "Free Member";
  const isAdmin = (session.user as any)?.role && (session.user as any).role !== "USER";
  const userName = session.user.name || "User";

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F8F9FA", color: "#111827" }}>
      {/* Top Navigation Header */}
      <DashboardNav
        userName={userName}
        publicId={publicId}
        isPremium={isPremium}
        planName={planName}
        isAdmin={isAdmin}
        signOutAction={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-5 mt-auto" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs gap-4" style={{ color: "#6B7280" }}>
          <div className="flex items-center space-x-2.5">
            <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border" style={{ borderColor: "#FECDD3" }}>
              <Image
                src="/InstantMatrimony-Logo.jpeg"
                alt="InstantMatrimony Logo"
                width={24}
                height={24}
                className="object-cover w-full h-full"
              />
            </div>
            <span>© {new Date().getFullYear()} InstantMatrimony. All rights reserved.</span>
          </div>
          <div className="flex space-x-4">
            <Link href="/about" className="hover:text-rose-600 transition-colors">About</Link>
            <Link href="/faq" className="hover:text-rose-600 transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-rose-600 transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-rose-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-rose-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
