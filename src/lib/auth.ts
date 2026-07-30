import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days persistent JWT token
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        // If email is not verified, restrict access
        if (!user.isEmailVerified) {
          throw new Error("EMAIL_UNVERIFIED");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      if (user && user.id) {
        try {
          const { headers } = await import("next/headers");
          const headersList = await headers();
          const userAgent = headersList.get("user-agent") || "";
          const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "127.0.0.1";
          
          let deviceName = "Unknown Device";
          if (userAgent.includes("Windows")) deviceName = "Windows PC";
          else if (userAgent.includes("Macintosh")) deviceName = "Mac";
          else if (userAgent.includes("iPhone")) deviceName = "iPhone";
          else if (userAgent.includes("Android")) deviceName = "Android Device";
          else if (userAgent.includes("Linux")) deviceName = "Linux PC";

          const { container } = await import("./container");
          await container.services.authService.logLoginSession(user.id, {
            ipAddress,
            userAgent,
            deviceName,
          });
        } catch {
          // Ignore event logging errors so login doesn't crash
        }
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
});
