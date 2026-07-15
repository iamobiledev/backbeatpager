import { getPrismaClient, type UserRole } from "@backbeat/db";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

export interface AppActor {
  email: string;
  id: string;
  name: string;
  role: UserRole;
  timezone: string;
}

async function testActor(): Promise<AppActor | null> {
  const email =
    process.env.NODE_ENV !== "production"
      ? process.env.AUTH_TEST_USER_EMAIL
      : undefined;
  if (!email) return null;

  return getPrismaClient().user.findFirst({
    where: {
      active: true,
      email: { equals: email, mode: "insensitive" }
    },
    select: {
      email: true,
      id: true,
      name: true,
      role: true,
      timezone: true
    }
  });
}

export async function currentActor(): Promise<AppActor | null> {
  const bypass = await testActor();
  if (bypass) return bypass;

  const session = await auth();
  if (!session?.user?.id) return null;
  return getPrismaClient().user.findFirst({
    where: { active: true, id: session.user.id },
    select: {
      email: true,
      id: true,
      name: true,
      role: true,
      timezone: true
    }
  });
}

export async function requireActor(): Promise<AppActor> {
  const actor = await currentActor();
  if (!actor) redirect("/login");
  return actor;
}

export async function requireAdmin(): Promise<AppActor> {
  const actor = await requireActor();
  if (actor.role !== "ADMIN") redirect("/forbidden");
  return actor;
}

export function assertAdmin(actor: AppActor): void {
  if (actor.role !== "ADMIN") {
    throw new Error("Administrator access is required");
  }
}
