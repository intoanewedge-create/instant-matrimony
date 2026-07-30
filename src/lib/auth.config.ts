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

      const isAdminRoute = pathname.startsWith("/admin");
      const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/search") ||
        pathname.startsWith("/messages") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/onboarding");
      const isGuestAuthRoute =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password";

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        const role = (auth.user as any)?.role;
        return role === "ADMIN" || role === "SUPER_ADMIN";
      }

      if (isProtectedRoute) {
        return isLoggedIn;
      }

      if (isGuestAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Configured in main auth.ts
} satisfies NextAuthConfig;

