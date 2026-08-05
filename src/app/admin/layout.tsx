import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = (session.user as any).role;
  if (userRole === "USER") {
    redirect("/error/403");
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 shrink-0 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">
              Admin Workspace
            </span>
            <h2 className="text-xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
              InstantMatrimony
            </h2>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4 text-rose-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
          Logged in as <span className="text-slate-300 font-semibold">{session.user.name}</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
