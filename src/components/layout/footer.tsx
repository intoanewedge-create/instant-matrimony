import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-secondary/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-4 w-4 fill-white text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Instant<span className="text-foreground">Matrimony</span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed">
              India's premium matrimonial portal offering safe, secure, and
              compatibility-based match finding for lifelong unions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Company
            </h3>

            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/browse"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Browse Profiles
                </Link>
              </li>

              <li>
                <Link
                  href="/find"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Search Matches
                </Link>
              </li>

              <li>
                <Link
                  href="/success-stories"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Success Stories
                </Link>
              </li>

              <li>
                <Link
                  href="/membership"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Membership Plans
                </Link>
              </li>

              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Help & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Legal
            </h3>

            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/legal"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Refund &amp; Cancellation
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Safety Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Support
            </h3>

            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Have questions? Our relationship managers are here to assist you
              24/7.
            </p>

            <p className="mt-2 text-sm font-medium text-foreground">
              Email: support@instantmatrimony.com
            </p>

            <p className="text-sm font-medium text-foreground">
              Phone: +91 8885678080
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-border/20 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>
            &copy; {currentYear} InstantMatrimony. All rights reserved. Made
            with love for lifelong connections.
          </p>

          <p className="mt-2 sm:mt-0">Premium SaaS Platform</p>
        </div>
      </div>
    </footer>
  );
}
