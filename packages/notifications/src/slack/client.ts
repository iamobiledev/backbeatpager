import { ErrorCode, type WebClient } from "@slack/web-api";

import type { SlackIncidentMessage } from "./incident-message.js";

export interface SlackMessageReference {
  channelId: string;
  messageTs: string;
}

export interface SlackApi {
  createConversation(
    name: string,
    isPrivate: boolean
  ): Promise<{ channelId: string }>;
  inviteUsers(channelId: string, userIds: string[]): Promise<void>;
  lookupUserByEmail(email: string): Promise<{ userId: string } | null>;
  openConversation(userId: string): Promise<{ channelId: string }>;
  pinMessage(channelId: string, messageTs: string): Promise<void>;
  postMessage(
    channelId: string,
    message: SlackIncidentMessage
  ): Promise<SlackMessageReference>;
  updateMessage(
    reference: SlackMessageReference,
    message: SlackIncidentMessage
  ): Promise<void>;
}

export interface SlackRetryOptions {
  maxAttempts?: number;
  sleep?: (milliseconds: number) => Promise<void>;
}

function retryAfterMilliseconds(
  error: unknown,
  attempt: number
): number | null {
  if (typeof error !== "object" || error === null) return null;

  const code = "code" in error ? error.code : undefined;
  const statusCode = "statusCode" in error ? error.statusCode : undefined;
  const retryAfter = "retryAfter" in error ? error.retryAfter : undefined;
  const data = "data" in error ? error.data : undefined;
  const slackError =
    typeof data === "object" && data !== null && "error" in data
      ? data.error
      : undefined;
  const rateLimited =
    code === ErrorCode.RateLimitedError ||
    statusCode === 429 ||
    slackError === "ratelimited";

  if (rateLimited) {
    const retryAfterSeconds =
      typeof retryAfter === "number" && Number.isFinite(retryAfter)
        ? retryAfter
        : 2 ** attempt;
    return Math.max(250, retryAfterSeconds * 1000);
  }
  if (typeof statusCode === "number" && statusCode >= 500 && statusCode < 600) {
    return 2 ** attempt * 1000;
  }
  return null;
}

export async function withSlackRetry<T>(
  operation: () => Promise<T>,
  options: SlackRetryOptions = {}
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
      const delay = retryAfterMilliseconds(error, attempt);
      if (delay === null || attempt === maxAttempts - 1) throw error;
      await sleep(delay);
    }
  }

  throw lastError;
}

export class WebClientSlackApi implements SlackApi {
  constructor(
    private readonly client: WebClient,
    private readonly retryOptions: SlackRetryOptions = {}
  ) {}

  async lookupUserByEmail(email: string): Promise<{ userId: string } | null> {
    try {
      const result = await withSlackRetry(
        () => this.client.users.lookupByEmail({ email }),
        this.retryOptions
      );
      return result.user?.id ? { userId: result.user.id } : null;
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "error" in error.data &&
        error.data.error === "users_not_found"
      ) {
        return null;
      }
      throw error;
    }
  }

  async openConversation(userId: string): Promise<{ channelId: string }> {
    const result = await withSlackRetry(
      () => this.client.conversations.open({ users: userId }),
      this.retryOptions
    );
    if (!result.channel?.id)
      throw new Error("Slack did not return a DM channel");
    return { channelId: result.channel.id };
  }

  async postMessage(
    channelId: string,
    message: SlackIncidentMessage
  ): Promise<SlackMessageReference> {
    const result = await withSlackRetry(
      () =>
        this.client.chat.postMessage({
          attachments: message.attachments,
          blocks: message.blocks,
          channel: channelId,
          text: message.text
        }),
      this.retryOptions
    );
    if (!result.channel || !result.ts) {
      throw new Error("Slack did not return a message reference");
    }
    return { channelId: result.channel, messageTs: result.ts };
  }

  async updateMessage(
    reference: SlackMessageReference,
    message: SlackIncidentMessage
  ): Promise<void> {
    await withSlackRetry(
      () =>
        this.client.chat.update({
          attachments: message.attachments,
          blocks: message.blocks,
          channel: reference.channelId,
          text: message.text,
          ts: reference.messageTs
        }),
      this.retryOptions
    );
  }

  async createConversation(
    name: string,
    isPrivate: boolean
  ): Promise<{ channelId: string }> {
    const result = await withSlackRetry(
      () =>
        this.client.conversations.create({
          is_private: isPrivate,
          name
        }),
      this.retryOptions
    );
    if (!result.channel?.id) {
      throw new Error("Slack did not return the incident channel");
    }
    return { channelId: result.channel.id };
  }

  async inviteUsers(channelId: string, userIds: string[]): Promise<void> {
    if (userIds.length === 0) return;
    await withSlackRetry(
      () =>
        this.client.conversations.invite({
          channel: channelId,
          users: userIds.join(",")
        }),
      this.retryOptions
    );
  }

  async pinMessage(channelId: string, messageTs: string): Promise<void> {
    await withSlackRetry(
      () => this.client.pins.add({ channel: channelId, timestamp: messageTs }),
      this.retryOptions
    );
  }
}
