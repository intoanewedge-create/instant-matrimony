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
  cookies: {
    sessionToken: {
      name: "instant-matrimony-session",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      },
    },
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // 1. Installer Route Protection
      if (pathname === "/installer") {
        try {
          const statusRes = await fetch(new URL("/api/installer/status", nextUrl.origin));
          if (statusRes.ok) {
            const data = await statusRes.json();
            if (data.isInstalled) {
              return Response.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", nextUrl));
            }
          }
        } catch {
          return Response.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", nextUrl));
        }
        return true;
      }

      // Guest Allowed Routes: Home, About, Contact, FAQ, Membership Plans, Terms, Privacy, Legal, Success Stories, Verify Email, Offline, Browse, Find, Public Profile Previews, Blog, Error, Maintenance
      const isGuestAllowedPublicRoute =
        pathname === "/" ||
        pathname === "/about" ||
        pathname === "/contact" ||
        pathname === "/faq" ||
        pathname === "/membership" ||
        pathname === "/terms" ||
        pathname === "/privacy" ||
        pathname === "/legal" ||
        pathname === "/success-stories" ||
        pathname === "/verify-email" ||
        pathname === "/offline" ||
        pathname === "/browse" ||
        pathname === "/find" ||
        pathname === "/blog" ||
        pathname.startsWith("/blog/") ||
        pathname.startsWith("/profiles/") ||
        pathname.startsWith("/error") ||
        pathname === "/maintenance";

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

      // Enforce admin route authorization
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/login", nextUrl));
        }
        const role = (auth?.user as any)?.role;
        if (role === "USER") {
          return Response.redirect(new URL("/error/403", nextUrl));
        }
        return true;
      }

      // All other routes (/dashboard, /profile, /search, /messages, /favorites, /interests, /settings, /onboarding) require authentication
      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Configured in main auth.ts
} satisfies NextAuthConfig;


