import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "../ui/button";
import { Heart } from "lucide-react";
import { MobileNav } from "./mobile-nav";

export async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 select-none group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
            <Heart className="h-5 w-5 fill-white text-white animate-pulse" />
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
            <Link href="/dashboard" className="hidden sm:inline-block">
              <Button size="sm">Go to Dashboard</Button>
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

          <MobileNav isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </header>
  );
}
