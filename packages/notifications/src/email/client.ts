import { Resend } from "resend";

import {
  renderIncidentEmail,
  type RenderedIncidentEmail
} from "./incident-email.js";
import type { IncidentMessageModel } from "../slack/incident-message.js";

export interface EmailSendInput extends RenderedIncidentEmail {
  from: string;
  idempotencyKey: string;
  to: string;
}

export interface EmailApi {
  send(input: EmailSendInput): Promise<{ messageId: string }>;
}

export interface EmailRetryOptions {
  maxAttempts?: number;
  sleep?: (milliseconds: number) => Promise<void>;
}

function statusFromError(error: unknown): number | null {
  if (typeof error !== "object" || error === null) return null;
  if ("statusCode" in error && typeof error.statusCode === "number") {
    return error.statusCode;
  }
  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }
  return null;
}

export async function withEmailRetry<T>(
  operation: () => Promise<T>,
  options: EmailRetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 4;
  const sleep =
    options.sleep ??
    ((milliseconds: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, milliseconds)));

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const status = statusFromError(error);
      const retryable = status === 429 || (status !== null && status >= 500);
      if (!retryable || attempt === maxAttempts - 1) throw error;
      await sleep(2 ** attempt * 1000);
    }
  }

  throw lastError;
}

export class ResendEmailApi implements EmailApi {
  private readonly resend: Resend;

  constructor(
    apiKey: string,
    private readonly retryOptions: EmailRetryOptions = {}
  ) {
    this.resend = new Resend(apiKey);
  }

  async send(input: EmailSendInput): Promise<{ messageId: string }> {
    return withEmailRetry(async () => {
      const response = await this.resend.emails.send(
        {
          from: input.from,
          html: input.html,
          subject: input.subject,
          text: input.text,
          to: input.to
        },
        {
          idempotencyKey: input.idempotencyKey
        }
      );
      if (response.error) {
        const error = new Error(response.error.message);
        Object.assign(error, {
          statusCode:
            "statusCode" in response.error
              ? response.error.statusCode
              : undefined
        });
        throw error;
      }
      if (!response.data?.id) throw new Error("Resend returned no message ID");
      return { messageId: response.data.id };
    }, this.retryOptions);
  }
}

export async function sendIncidentEmail(
  api: EmailApi,
  incident: IncidentMessageModel,
  input: {
    from: string;
    idempotencyKey: string;
    to: string;
  }
): Promise<{ messageId: string }> {
  const rendered = await renderIncidentEmail(incident);
  return api.send({ ...rendered, ...input });
}
