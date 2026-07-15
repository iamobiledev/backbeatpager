import { PrismaAdapter } from "@auth/prisma-adapter";
import { parseWebEnvironment } from "@backbeat/config";
import { getPrismaClient } from "@backbeat/db";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { emailIsAllowed } from "@/lib/auth-policy";

if (process.env.VERCEL_ENV === "production") {
  parseWebEnvironment(process.env);
}

const prisma = getPrismaClient();

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    authorized({ auth: session, request }) {
      const path = request.nextUrl.pathname;
      if (
        path.startsWith("/api/auth") ||
        path === "/login" ||
        path.startsWith("/_next")
      ) {
        return true;
      }
      if (
        process.env.NODE_ENV !== "production" &&
        process.env.AUTH_TEST_USER_EMAIL
      ) {
        return true;
      }
      return Boolean(session?.user);
    },
    async session({ session, user }) {
      const appUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      if (appUser) {
        session.user.id = appUser.id;
        session.user.role = appUser.role;
        session.user.timezone = appUser.timezone;
      }
      return session;
    },
    async signIn({ profile, user }) {
      const email = user.email?.trim().toLowerCase();
      if (
        !email ||
        !emailIsAllowed(email, {
          ...(process.env.AUTH_GOOGLE_ALLOWED_DOMAIN
            ? { allowedDomain: process.env.AUTH_GOOGLE_ALLOWED_DOMAIN }
            : {}),
          ...(process.env.AUTH_ALLOWED_EMAILS
            ? { allowedEmails: process.env.AUTH_ALLOWED_EMAILS }
            : {})
        })
      ) {
        return false;
      }
      if (
        profile &&
        "email_verified" in profile &&
        profile.email_verified !== true
      ) {
        return false;
      }

      const appUser = await prisma.user.findFirst({
        where: {
          active: true,
          email: { equals: email, mode: "insensitive" }
        }
      });
      return Boolean(appUser);
    }
  },
  pages: {
    error: "/login",
    signIn: "/login"
  },
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true
    })
  ],
  session: {
    strategy: "database"
  },
  trustHost: true
});
