import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  Headphones,
  Settings,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  LogOut,
  UserPlus,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN") {
    redirect("/error/403");
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Create Profile", href: "/admin/profiles/create", icon: UserPlus },
    { label: "Profile Approvals", href: "/admin/profiles", icon: ShieldCheck },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Memberships", href: "/admin/memberships", icon: ShieldCheck },
    { label: "Contact Unlocks", href: "/admin/contact-unlocks", icon: Users },
    { label: "Concierge Cases", href: "/admin/concierge", icon: Headphones },
    { label: "Master Data", href: "/admin/master-data", icon: Settings },
    { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    { label: "Banners", href: "/admin/banners", icon: ImageIcon },
    { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 p-6 flex flex-col justify-between shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-rose-200 bg-rose-50/60 shadow-sm">
              <Image
                src="/InstantMatrimony-Logo.jpeg"
                alt="InstantMatrimony Logo"
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                Admin Workspace
              </span>
              <h2 className="text-base font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                InstantMatrimony
              </h2>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-600 hover:bg-rose-50/80 hover:text-rose-600 transition-all group"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
          <div className="truncate">
            Logged in as <span className="text-slate-800 font-semibold">{session.user.name}</span>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
