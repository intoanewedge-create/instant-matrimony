import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/error/403",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days persistent HTTP-only cookie
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Guest Allowed Routes: Home, About, Contact, FAQ, Membership Plans, Login, Register, Terms, Privacy, Success Stories
      const isGuestAllowedPublicRoute =
        pathname === "/" ||
        pathname === "/about" ||
        pathname === "/contact" ||
        pathname === "/faq" ||
        pathname === "/membership" ||
        pathname === "/terms" ||
        pathname === "/privacy" ||
        pathname === "/legal" ||
        pathname === "/success-stories";

      const isGuestAuthRoute =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password";

      // If route is an auth route (login/register) and user is already logged in, redirect to dashboard
      if (isGuestAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // If route is public guest allowed page, allow access for everyone
      if (isGuestAllowedPublicRoute) {
        return true;
      }

      // All other routes (/browse, /profiles, /search, /messages, /dashboard, /profile, /admin, /onboarding, /settings) require authentication
      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Configured in main auth.ts
} satisfies NextAuthConfig;

