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
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;

        const remember = (user as any).rememberMe === true;
        token.rememberMe = remember;

        const nowSeconds = Math.floor(Date.now() / 1000);
        const maxAge = remember
          ? 30 * 24 * 60 * 60 // 30 days
          : 24 * 60 * 60; // 1 day

        (token as any).exp = nowSeconds + maxAge;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }

      if (token && (token as any).exp) {
        session.expires = new Date(
          ((token as any).exp as number) * 1000,
        ).toISOString() as any;
      }

      return session;
    },

    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // 0. Static files, images, API routes, and public asset bypass
      if (
        pathname.includes(".") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/uploads") ||
        pathname.startsWith("/api")
      ) {
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

      // If route is an auth route (login/register) and user is already logged in, redirect based on role
      if (isGuestAuthRoute) {
        if (isLoggedIn) {
          const role = (auth?.user as any)?.role;
          return Response.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", nextUrl));
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
        if (role !== "ADMIN") {
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
