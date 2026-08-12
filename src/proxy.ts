import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

export const proxy = NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|sw.js|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|js|css|woff|woff2|ttf|json|txt|xml)$).*)",
  ],
};
