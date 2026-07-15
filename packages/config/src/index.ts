import { z } from "zod";

export const runtimeEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  VERCEL_REGION: z.string().min(1).optional()
});

export type RuntimeEnvironment = z.infer<typeof runtimeEnvironmentSchema>;

export function parseRuntimeEnvironment(
  environment: Readonly<Record<string, string | undefined>>
): RuntimeEnvironment {
  return runtimeEnvironmentSchema.parse(environment);
}
