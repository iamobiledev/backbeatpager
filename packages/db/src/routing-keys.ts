import { randomBytes } from "node:crypto";

import { hash, verify } from "@node-rs/argon2";

const ROUTING_KEY_PATTERN =
  /^(?<prefix>bbp_[a-f0-9]{12})\.(?<secret>[A-Za-z0-9_-]{43})$/;

export interface GeneratedRoutingKey {
  hash: string;
  prefix: string;
  routingKey: string;
}

export interface ParsedRoutingKey {
  prefix: string;
}

export function parseRoutingKey(routingKey: string): ParsedRoutingKey | null {
  const match = ROUTING_KEY_PATTERN.exec(routingKey);
  const prefix = match?.groups?.prefix;

  return prefix ? { prefix } : null;
}

export async function hashRoutingKey(routingKey: string): Promise<string> {
  if (!parseRoutingKey(routingKey)) {
    throw new Error("Cannot hash a malformed routing key");
  }

  return hash(routingKey, {
    algorithm: 2,
    memoryCost: 19_456,
    outputLen: 32,
    parallelism: 1,
    timeCost: 2
  });
}

export async function verifyRoutingKey(
  storedHash: string,
  candidate: string
): Promise<boolean> {
  if (!parseRoutingKey(candidate)) {
    return false;
  }

  try {
    return await verify(storedHash, candidate);
  } catch {
    return false;
  }
}

export async function generateRoutingKey(): Promise<GeneratedRoutingKey> {
  const prefix = `bbp_${randomBytes(6).toString("hex")}`;
  const secret = randomBytes(32).toString("base64url");
  const routingKey = `${prefix}.${secret}`;

  return {
    hash: await hashRoutingKey(routingKey),
    prefix,
    routingKey
  };
}
