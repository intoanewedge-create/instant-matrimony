import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionService } from "@/lib/services/permission.service";
import { Avatar } from "@/components/ui/avatar";
import {
  Heart,
  LayoutDashboard,
  Users,
  ShieldAlert,
  Megaphone,
  BarChart3,
  FileText,
  History,
  Settings,
  Search,
  LogOut,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Load user role directly from Prisma to ensure fresh security state
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, role: true },
  });

  if (!user) {
    redirect("/login");
  }

  const role = user.role as any;
  const adminName = user.name || "Administrator";

  // Check if role is an operator role (any role other than standard USER)
  const isOperator = [
    "SUPER_ADMIN",
    "ADMIN",
    "FINANCE",
    "MODERATOR",
    "MARKETING_MANAGER",
    "CONTENT_MANAGER",
    "CUSTOMER_SUPPORT",
    "OPERATIONS",
    "ANALYST",
  ].includes(role);

  if (!isOperator) {
    redirect("/");
  }

  // Permission helpers for rendering navigation items dynamically
  const canViewAnalytics = permissionService.hasPermission(role, "VIEW_ANALYTICS");
  const canExportReports = permissionService.hasPermission(role, "EXPORT_REPORTS");
  const canManageModeration = permissionService.hasPermission(role, "MANAGE_MODERATION");
  const canManageVerification = permissionService.hasPermission(role, "MANAGE_VERIFICATION");
  const canManageMarketing = permissionService.hasPermission(role, "MANAGE_MARKETING");
  const canManageCms = permissionService.hasPermission(role, "MANAGE_CMS");
  const canManageSystem = permissionService.hasPermission(role, "MANAGE_SYSTEM");

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Panel */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900 select-none">
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-850">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-primary to-rose-400 bg-clip-text text-transparent">
              Instant<span className="text-foreground text-white">Admin</span>
            </span>
          </Link>
        </div>

        {/* Dynamic Navigation Sidebar */}
        <nav className="flex-1 py-6 px-4 space-y-1 text-xs font-bold text-slate-400">
          <Link
            href="/admin"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Operational Console</span>
          </Link>

          {canViewAnalytics && (
            <Link
              href="/admin/analytics"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Business Intelligence</span>
            </Link>
          )}

          {canViewAnalytics && (
            <Link
              href="/admin/search"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Global Search</span>
            </Link>
          )}

          {canManageModeration && (
            <Link
              href="/admin/moderation"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Profile Moderation</span>
            </Link>
          )}

          {canManageVerification && (
            <Link
              href="/admin/verification"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Verification & Media</span>
            </Link>
          )}

          {canManageMarketing && (
            <Link
              href="/admin/marketing"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
            >
              <Megaphone className="h-4 w-4" />
              <span>Marketing Campaigns</span>
            </Link>
          )}

          {canManageCms && (
            <Link
              href="/admin/cms"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>CMS Editorial</span>
            </Link>
          )}

          {canExportReports && (
            <Link
              href="/admin/reports"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Reports & Exports</span>
            </Link>
          )}

          {canManageSystem && (
            <Link
              href="/admin/audit"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
            >
              <History className="h-4 w-4" />
              <span>Compliance Timeline</span>
            </Link>
          )}

          {canManageSystem && (
            <Link
              href="/admin/settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Portal Settings</span>
            </Link>
          )}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-slate-850">
          <Link
            href="/api/auth/signout"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/5 transition-colors font-bold text-xs"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-850 bg-slate-900 flex items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-300 tracking-wide uppercase select-none">
              Secure Enterprise Portal
            </span>
          </div>

          <div className="flex items-center space-x-4 select-none">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-extrabold text-white">{adminName}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">{role}</p>
            </div>
            <Avatar fallback={adminName} size="sm" className="bg-primary/20 text-primary font-extrabold" />
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-grow bg-slate-950 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
