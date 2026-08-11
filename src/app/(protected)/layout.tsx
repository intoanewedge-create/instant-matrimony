import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Heart, Search, MessageSquare, User, Settings, Sparkles, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { container as appContainer } from "@/lib/container";

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
  const membershipRes = userId
    ? await appContainer.repositories.membershipRepository.findActiveByUserId(userId).catch(() => null) as any
    : null;

  const isPremium = !!membershipRes;
  const planName = membershipRes?.plan?.name || "Free basic";
  const isAdmin = (session.user as any)?.role && (session.user as any).role !== "USER";

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2.5 select-none group">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card border border-rose-500/20 shadow-md shadow-rose-500/10 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/InstantMatrimony-Logo.jpeg"
                alt="InstantMatrimony Logo"
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Instant<span className="text-primary font-extrabold">Matrimony</span>
            </span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              Dashboard
            </Link>
            <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <Search className="w-4 h-4" /> Search Matches
            </Link>
            <Link href="/messages" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> Chat
            </Link>
            <Link href="/dashboard/recommendations" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Recommendations
            </Link>
            <Link href="/interests" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" /> Interests
            </Link>
            <Link href="/dashboard/concierge" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> VIP Concierge
            </Link>
          </nav>

          {/* User Account Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Admin Panel Quick Access */}
            {isAdmin && (
              <Link href="/admin">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold select-none border border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all cursor-pointer">
                  <Shield className="w-3.5 h-3.5" /> Admin Panel
                </span>
              </Link>
            )}

            {/* Theme Switcher */}
            <ThemeToggle />

            {/* Upgrade Premium Badge */}
            <Link href="/dashboard/billing">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold select-none border transition-all cursor-pointer ${
                isPremium 
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20" 
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
              }`}>
                <Shield className="w-3.5 h-3.5" />
                {isPremium ? `${planName}` : "Upgrade"}
              </span>
            </Link>

            <Link href="/profile">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-xl" title="My Profile">
                <User className="w-4.5 h-4.5" />
              </Button>
            </Link>

            <Link href="/settings">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-xl" title="Settings">
                <Settings className="w-4.5 h-4.5" />
              </Button>
            </Link>

            {/* Logout form */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
              className="inline"
            >
              <Button type="submit" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive rounded-xl" title="Logout">
                <LogOut className="w-4.5 h-4.5" />
              </Button>
            </form>
          </div>

        </div>
      </header>

      {/* Main Protected Content Area */}
      <main className="flex-grow flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border border-rose-500/30 bg-card">
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
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/faq" className="hover:text-foreground">FAQ</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

