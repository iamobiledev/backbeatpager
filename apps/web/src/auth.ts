import { getPrismaClient } from "@backbeat/db";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { emailIsAllowed } from "@/lib/auth-policy";
import { parseAppEnvironment } from "@backbeat/config";

if (process.env.VERCEL_ENV === "production") {
  parseAppEnvironment(process.env);
}

const prisma = getPrismaClient();

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    authorized({ auth: session, request }) {
      const path = request.nextUrl.pathname;
      if (
        path.startsWith("/api/auth") ||
        path.startsWith("/api/v1") ||
        path.startsWith("/slack") ||
        path.startsWith("/internal") ||
        path === "/health" ||
        path === "/ready" ||
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
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
        const appUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, timezone: true }
        });
        if (appUser) {
          token.role = appUser.role;
          token.timezone = appUser.timezone;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role =
          (token.role as "ADMIN" | "RESPONDER" | undefined) ?? "RESPONDER";
        session.user.timezone =
          typeof token.timezone === "string" ? token.timezone : "UTC";
      }
      return session;
    }
  },
  pages: {
    error: "/login",
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const expectedPassword = process.env.AUTH_LOGIN_PASSWORD;
        if (!expectedPassword || parsed.data.password !== expectedPassword) {
          return null;
        }

        if (
          !emailIsAllowed(email, {
            ...(process.env.AUTH_ALLOWED_DOMAIN
              ? { allowedDomain: process.env.AUTH_ALLOWED_DOMAIN }
              : {}),
            ...(process.env.AUTH_ALLOWED_EMAILS
              ? { allowedEmails: process.env.AUTH_ALLOWED_EMAILS }
              : {})
          })
        ) {
          return null;
        }

        const appUser = await prisma.user.findFirst({
          where: {
            active: true,
            email: { equals: email, mode: "insensitive" }
          }
        });
        if (!appUser) return null;

        return {
          email: appUser.email,
          id: appUser.id,
          name: appUser.name,
          role: appUser.role,
          timezone: appUser.timezone
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  trustHost: true
});
