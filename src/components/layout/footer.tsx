import Link from "next/link";
import Image from "next/image";
import { websiteSettingsService, DEFAULT_BRANDING_SETTINGS } from "@/lib/services/website-settings.service";

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const settingsRes = await websiteSettingsService.getSettings().catch(() => null);
  const settings = (settingsRes && settingsRes.success && settingsRes.data) ? settingsRes.data : DEFAULT_BRANDING_SETTINGS;

  return (
    <footer className="border-t border-border/40 bg-secondary/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
                <Image
                  src="/InstantMatrimony-Logo.jpeg"
                  alt="InstantMatrimony Logo"
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Instant<span className="text-foreground">Matrimony</span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed">
              India's premier matrimonial portal offering safe, secure, and
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
              Contact &amp; Support
            </h3>

            <div className="mt-4 space-y-2 text-sm">
              <p className="font-semibold text-foreground">
                {settings.companyName}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {settings.officeAddress}
              </p>
              <p className="text-muted-foreground pt-1">
                <span className="font-medium text-foreground">Ph (WhatsApp):</span> {settings.contactNumber}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Email:</span> {settings.emailAddress}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/20 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>
            &copy; {currentYear} {settings.websiteName}. All rights reserved. Made
            with love for lifelong connections.
          </p>

          <p className="mt-2 sm:mt-0">Premium SaaS Platform</p>
        </div>
      </div>
    </footer>
  );
}
