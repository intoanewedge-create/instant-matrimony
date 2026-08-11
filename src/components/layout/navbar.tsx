import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { Button } from "../ui/button";
import { MobileNav } from "./mobile-nav";

export async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = isLoggedIn && (session?.user as any)?.role && (session.user as any).role !== "USER";
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";
  const dashboardLabel = isAdmin ? "Admin Panel" : "Go to Dashboard";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2.5 select-none group"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card border border-border/60 shadow-md shadow-primary/10 group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/InstantMatrimony-Logo.jpeg"
              alt="InstantMatrimony Logo"
              width={40}
              height={40}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Instant<span className="text-foreground">Matrimony</span>
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>

          <Link
            href="/about"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            About
          </Link>

          <Link
            href="/browse"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Browse
          </Link>

          <Link
            href="/success-stories"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Stories
          </Link>

          <Link
            href="/membership"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Membership
          </Link>

          <Link
            href="/faq"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            FAQ
          </Link>

          <Link
            href="/contact"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Action Button & Mobile Nav */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {isLoggedIn ? (
            <Link href={dashboardHref} className="hidden sm:inline-block">
              <Button size="sm">{dashboardLabel}</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>

              <Link href="/register" className="hidden sm:inline-block">
                <Button size="sm" variant="accent">
                  Register Free
                </Button>
              </Link>
            </>
          )}

          <MobileNav
            isLoggedIn={isLoggedIn}
            dashboardHref={dashboardHref}
            dashboardLabel={dashboardLabel}
          />
        </div>
      </div>
    </header>
  );
}
