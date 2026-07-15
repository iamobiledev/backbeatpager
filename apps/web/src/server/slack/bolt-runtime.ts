import {
  App,
  type BlockButtonAction,
  type ButtonAction,
  LogLevel
} from "@slack/bolt";
import {
  VercelReceiver,
  createHandler,
  type VercelHandler
} from "@vercel/slack-bolt";

import { processSlackIncidentAction, SlackActionError } from "./actions";
import {
  publishAppHomeForSlackUser,
  registerPhase4Listeners,
  type Phase4Dependencies
} from "./phase4-listeners";

export interface SlackBoltRuntime {
  handler: VercelHandler;
}

function receiptKey(body: unknown, actionId: string): string {
  const record =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const user =
    typeof record.user === "object" && record.user !== null
      ? (record.user as Record<string, unknown>)
      : {};
  const team =
    typeof record.team === "object" && record.team !== null
      ? (record.team as Record<string, unknown>)
      : {};

  const scalar = (value: unknown, fallback: string): string =>
    typeof value === "string" || typeof value === "number"
      ? String(value)
      : fallback;

  return [
    "slack",
    scalar(team.id ?? record.team_id, "unknown-team"),
    scalar(user.id ?? record.user_id, "unknown-user"),
    actionId,
    scalar(record.trigger_id ?? record.action_ts, String(Date.now()))
  ].join(":");
}

function buttonValue(action: ButtonAction): string {
  if (typeof action.value !== "string") {
    throw new SlackActionError(
      "INVALID_ACTION",
      "This Slack action is missing its signed value"
    );
  }
  return action.value;
}

async function safelyRespond(
  respond: ((message: string | object) => Promise<unknown>) | undefined,
  message: string
): Promise<void> {
  if (!respond) return;
  try {
    await respond({ response_type: "ephemeral", text: message });
  } catch {
    // The durable action is authoritative even if an ephemeral response expires.
  }
}

export function createSlackBoltRuntime(
  input: {
    botToken: string;
    signingSecret: string;
    webBaseUrl?: string;
  } & Phase4Dependencies
): SlackBoltRuntime {
  const receiver = new VercelReceiver({
    ackTimeoutMs: 2_500,
    signingSecret: input.signingSecret
  });
  const app = new App({
    authorize() {
      return Promise.resolve({
        botToken: input.botToken
      });
    },
    deferInitialization: true,
    logLevel: LogLevel.INFO,
    receiver,
    signingSecret: input.signingSecret
  });

  const registerAction = (
    actionId:
      | "incident_acknowledge"
      | "incident_escalate"
      | "incident_resolve"
      | "incident_snooze"
  ): void => {
    app.action<BlockButtonAction>(actionId, async (args) => {
      await args.ack();
      try {
        const result = await processSlackIncidentAction(input, {
          actionToken: buttonValue(args.action),
          client: args.client,
          receiptKey: receiptKey(args.body, actionId),
          slackUserId: args.body.user.id
        });
        await safelyRespond(
          args.respond,
          result.duplicate
            ? "That action was already processed."
            : "Incident updated."
        );
        await publishAppHomeForSlackUser(
          input.prisma,
          args.client,
          args.body.user.id,
          input.webBaseUrl
        );
      } catch (error) {
        args.logger.error(error);
        await safelyRespond(
          args.respond,
          error instanceof SlackActionError
            ? error.message
            : "Backbeat Pager could not process that action. It is safe to retry."
        );
      }
    });
  };

  registerAction("incident_acknowledge");
  registerAction("incident_resolve");
  registerAction("incident_escalate");
  registerAction("incident_snooze");

  app.action<BlockButtonAction>("incident_reassign", async (args) => {
    await args.ack();
    try {
      const token = buttonValue(args.action);
      await args.client.views.open({
        trigger_id: args.body.trigger_id,
        view: {
          blocks: [
            {
              block_id: "reassign_user",
              element: {
                action_id: "selected_user",
                type: "users_select"
              },
              label: {
                text: "New assignee",
                type: "plain_text"
              },
              type: "input"
            }
          ],
          callback_id: "incident_reassign_submit",
          close: {
            text: "Cancel",
            type: "plain_text"
          },
          private_metadata: token,
          submit: {
            text: "Reassign",
            type: "plain_text"
          },
          title: {
            text: "Reassign incident",
            type: "plain_text"
          },
          type: "modal"
        }
      });
    } catch (error) {
      args.logger.error(error);
      await safelyRespond(
        args.respond,
        "Backbeat Pager could not open the reassignment dialog."
      );
    }
  });

  app.view("incident_reassign_submit", async (args) => {
    await args.ack();
    const selected =
      args.view.state.values.reassign_user?.selected_user?.selected_user;
    try {
      if (!selected) {
        throw new SlackActionError(
          "INVALID_ACTION",
          "Select a Slack user to reassign this incident"
        );
      }
      await processSlackIncidentAction(input, {
        actionToken: args.view.private_metadata,
        client: args.client,
        receiptKey: receiptKey(args.body, args.view.id),
        reassignSlackUserId: selected,
        slackUserId: args.body.user.id
      });
      await publishAppHomeForSlackUser(
        input.prisma,
        args.client,
        args.body.user.id,
        input.webBaseUrl
      );
    } catch (error) {
      args.logger.error(error);
    }
  });

  registerPhase4Listeners(app, input);

  return {
    handler: createHandler(app, receiver)
  };
}

export function createSlackBoltRuntimeFromEnvironment(
  dependencies: Omit<Phase4Dependencies, "actionSecret" | "webBaseUrl">,
  options: { required?: boolean } = {}
): SlackBoltRuntime | undefined {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  const actionSecret = process.env.SLACK_ACTION_SECRET;
  if (!botToken || !signingSecret || !actionSecret) {
    if (options.required) {
      throw new Error(
        "SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, and SLACK_ACTION_SECRET are required"
      );
    }
    return undefined;
  }

  return createSlackBoltRuntime({
    ...dependencies,
    actionSecret,
    botToken,
    signingSecret,
    ...(process.env.WEB_BASE_URL
      ? { webBaseUrl: process.env.WEB_BASE_URL }
      : {})
  });
}
