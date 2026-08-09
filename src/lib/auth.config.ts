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

      // 1. Setup Status Verification (Redirect to installer if not installed, block installer if installed)
      const isApiOrAsset =
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.includes(".");

      let isInstalled = true;
      if (!isApiOrAsset) {
        try {
          const statusRes = await fetch(new URL("/api/installer/status", nextUrl.origin));
          if (statusRes.ok) {
            const data = await statusRes.json();
            isInstalled = !!data.isInstalled;
          }
        } catch (e) {
          // Default to true on failure to prevent boot loop
          isInstalled = true;
        }
      }

      if (!isInstalled) {
        if (pathname !== "/installer") {
          return Response.redirect(new URL("/installer", nextUrl));
        }
        return true;
      }

      if (pathname === "/installer") {
        return Response.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", nextUrl));
      }

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
        pathname === "/success-stories" ||
        pathname === "/offline";

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

      // All other routes (/browse, /profiles, /search, /messages, /dashboard, /profile, /onboarding, /settings) require authentication
      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Configured in main auth.ts
} satisfies NextAuthConfig;


