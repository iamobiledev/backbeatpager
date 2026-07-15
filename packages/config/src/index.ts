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

const sharedDatabaseSchema = z.object({
  DATABASE_DRIVER: z.enum(["neon", "pg"]).optional(),
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url().optional()
});

/** @deprecated Use appEnvironmentSchema — dual API/web apps are consolidated. */
export const apiEnvironmentSchema = runtimeEnvironmentSchema
  .and(sharedDatabaseSchema)
  .and(
    z.object({
      API_BASE_URL: z.url().optional(),
      CRON_SECRET: z.string().min(32),
      EMAIL_FROM: z.string().min(3).optional(),
      RESEND_API_KEY: z.string().min(1).optional(),
      SLACK_ACTION_SECRET: z.string().min(32).optional(),
      SLACK_BOT_TOKEN: z.string().min(1).optional(),
      SLACK_REQUIRED: z.enum(["true", "false"]).default("false"),
      SLACK_SIGNING_SECRET: z.string().min(1).optional(),
      WEB_BASE_URL: z.url(),
      WORKFLOW_INTERNAL_SECRET: z.string().min(32)
    })
  )
  .superRefine((environment, context) => {
    if (
      environment.SLACK_REQUIRED === "true" &&
      (!environment.SLACK_BOT_TOKEN ||
        !environment.SLACK_SIGNING_SECRET ||
        !environment.SLACK_ACTION_SECRET)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Slack token, signing secret, and action secret are required when SLACK_REQUIRED=true"
      });
    }
    if (
      Boolean(environment.RESEND_API_KEY) !== Boolean(environment.EMAIL_FROM)
    ) {
      context.addIssue({
        code: "custom",
        message: "RESEND_API_KEY and EMAIL_FROM must be configured together"
      });
    }
  });

export const appEnvironmentSchema = runtimeEnvironmentSchema
  .and(sharedDatabaseSchema)
  .and(
    z.object({
      AUTH_ALLOWED_DOMAIN: z.string().min(1).optional(),
      AUTH_ALLOWED_EMAILS: z.string().optional(),
      AUTH_LOGIN_PASSWORD: z.string().min(8),
      AUTH_SECRET: z.string().min(32),
      CRON_SECRET: z.string().min(32),
      EMAIL_FROM: z.string().min(3).optional(),
      RESEND_API_KEY: z.string().min(1).optional(),
      SLACK_ACTION_SECRET: z.string().min(32).optional(),
      SLACK_BOT_TOKEN: z.string().min(1).optional(),
      SLACK_REQUIRED: z.enum(["true", "false"]).default("false"),
      SLACK_SIGNING_SECRET: z.string().min(1).optional(),
      WEB_BASE_URL: z.url(),
      WORKFLOW_INTERNAL_SECRET: z.string().min(32)
    })
  )
  .superRefine((environment, context) => {
    if (
      !environment.AUTH_ALLOWED_DOMAIN &&
      !environment.AUTH_ALLOWED_EMAILS
    ) {
      context.addIssue({
        code: "custom",
        message: "Configure AUTH_ALLOWED_DOMAIN or AUTH_ALLOWED_EMAILS"
      });
    }
    if (
      environment.SLACK_REQUIRED === "true" &&
      (!environment.SLACK_BOT_TOKEN ||
        !environment.SLACK_SIGNING_SECRET ||
        !environment.SLACK_ACTION_SECRET)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Slack token, signing secret, and action secret are required when SLACK_REQUIRED=true"
      });
    }
    if (
      Boolean(environment.RESEND_API_KEY) !== Boolean(environment.EMAIL_FROM)
    ) {
      context.addIssue({
        code: "custom",
        message: "RESEND_API_KEY and EMAIL_FROM must be configured together"
      });
    }
  });

/** @deprecated Use appEnvironmentSchema */
export const webEnvironmentSchema = appEnvironmentSchema;

export type ApiEnvironment = z.infer<typeof apiEnvironmentSchema>;
export type AppEnvironment = z.infer<typeof appEnvironmentSchema>;
export type WebEnvironment = AppEnvironment;

export function parseApiEnvironment(
  environment: Readonly<Record<string, string | undefined>>
): ApiEnvironment {
  return apiEnvironmentSchema.parse(environment);
}

export function parseAppEnvironment(
  environment: Readonly<Record<string, string | undefined>>
): AppEnvironment {
  return appEnvironmentSchema.parse(environment);
}

export function parseWebEnvironment(
  environment: Readonly<Record<string, string | undefined>>
): WebEnvironment {
  return parseAppEnvironment(environment);
}
