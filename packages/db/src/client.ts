import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/client.js";

type DatabaseDriver = "neon" | "pg";

declare global {
  // Module caching is intentional for Vercel Fluid Compute.
  var backbeatPrisma: PrismaClient | undefined;
}

function requiredDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to access the database");
  }

  return databaseUrl;
}

function resolveDriver(
  databaseUrl: string,
  configuredDriver = process.env.DATABASE_DRIVER
): DatabaseDriver {
  if (configuredDriver === "neon" || configuredDriver === "pg") {
    return configuredDriver;
  }

  const hostname = new URL(databaseUrl).hostname;
  return hostname.endsWith(".neon.tech") ? "neon" : "pg";
}

export function createPrismaClient(
  databaseUrl = requiredDatabaseUrl(),
  driver = resolveDriver(databaseUrl)
): PrismaClient {
  const adapter =
    driver === "neon"
      ? new PrismaNeon({
          connectionString: databaseUrl
        })
      : new PrismaPg({
          connectionString: databaseUrl,
          connectionTimeoutMillis: 10_000,
          idleTimeoutMillis: 5_000,
          max: 5
        });

  return new PrismaClient({ adapter });
}

export function getPrismaClient(): PrismaClient {
  globalThis.backbeatPrisma ??= createPrismaClient();
  return globalThis.backbeatPrisma;
}

export async function disconnectPrismaClient(): Promise<void> {
  if (globalThis.backbeatPrisma) {
    await globalThis.backbeatPrisma.$disconnect();
    globalThis.backbeatPrisma = undefined;
  }
}
