"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Heart, ShieldCheck, Sparkles, HelpCircle, PhoneCall, Home, Info, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileNav({
  isLoggedIn,
  dashboardHref = "/dashboard",
  dashboardLabel = "Go to Dashboard",
}: {
  isLoggedIn: boolean;
  dashboardHref?: string;
  dashboardLabel?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        className="text-foreground hover:bg-accent/10 focus:outline-none"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl p-6 flex flex-col space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent/10 transition-colors"
            >
              <Home className="h-4 w-4 text-primary" /> Home
            </Link>

            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent/10 transition-colors"
            >
              <Info className="h-4 w-4 text-primary" /> About Us
            </Link>

            <Link
              href="/browse"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent/10 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-primary" /> Browse Matches
            </Link>

            <Link
              href="/success-stories"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent/10 transition-colors"
            >
              <Heart className="h-4 w-4 text-primary" /> Success Stories
            </Link>

            <Link
              href="/membership"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent/10 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-primary" /> Membership Plans
            </Link>

            <Link
              href="/faq"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent/10 transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-primary" /> FAQ
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent/10 transition-colors"
            >
              <PhoneCall className="h-4 w-4 text-primary" /> Contact Support
            </Link>
          </nav>

          <div className="pt-4 border-t border-border/50 flex flex-col gap-2">
            {isLoggedIn ? (
              <Link href={dashboardHref} onClick={() => setIsOpen(false)}>
                <Button className="w-full font-semibold">{dashboardLabel}</Button>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="accent" className="w-full font-semibold">
                    Register Free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
