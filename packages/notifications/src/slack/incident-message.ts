import type {
  ActionsBlock,
  Button,
  ContextBlock,
  KnownBlock,
  MessageAttachment,
  SectionBlock
} from "@slack/types";

import { createSlackActionToken, type SlackIncidentAction } from "./actions.js";

export type IncidentMessageState = "ACKNOWLEDGED" | "RESOLVED" | "TRIGGERED";
export type IncidentMessageSeverity = "CRITICAL" | "INFO" | "WARNING";

export interface IncidentMessageModel {
  assigneeSlackUserId?: string;
  escalationLabel?: string;
  incidentId: string;
  incidentNumber: number;
  serviceName: string;
  severity: IncidentMessageSeverity;
  source: string;
  sourceUrl?: string;
  state: IncidentMessageState;
  summary: string;
  webUrl?: string;
}

export interface SlackIncidentMessage {
  attachments: MessageAttachment[];
  blocks: KnownBlock[];
  text: string;
}

function escapeMrkdwn(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function severityColor(severity: IncidentMessageSeverity): string {
  switch (severity) {
    case "CRITICAL":
      return "#E5484D";
    case "WARNING":
      return "#F5A524";
    case "INFO":
      return "#3B82F6";
  }
}

function severityEmoji(severity: IncidentMessageSeverity): string {
  switch (severity) {
    case "CRITICAL":
      return ":rotating_light:";
    case "WARNING":
      return ":warning:";
    case "INFO":
      return ":information_source:";
  }
}

function stateLabel(state: IncidentMessageState): string {
  switch (state) {
    case "TRIGGERED":
      return ":red_circle: Triggered";
    case "ACKNOWLEDGED":
      return ":large_yellow_circle: Acknowledged";
    case "RESOLVED":
      return ":large_green_circle: Resolved";
  }
}

function actionButton(
  action: SlackIncidentAction,
  incidentId: string,
  secret: string,
  text: string,
  style?: "danger" | "primary"
): Button {
  return {
    action_id: `incident_${action}`,
    ...(style ? { style } : {}),
    text: {
      emoji: true,
      text,
      type: "plain_text"
    },
    type: "button",
    value: createSlackActionToken({ action, incidentId }, secret)
  };
}

function actionBlock(
  model: IncidentMessageModel,
  actionSecret: string
): ActionsBlock | null {
  if (model.state === "RESOLVED") return null;

  const elements: Button[] = [];
  if (model.state === "TRIGGERED") {
    elements.push(
      actionButton(
        "acknowledge",
        model.incidentId,
        actionSecret,
        "Acknowledge",
        "primary"
      )
    );
  }
  elements.push(
    actionButton(
      "resolve",
      model.incidentId,
      actionSecret,
      "Resolve",
      "danger"
    ),
    actionButton("escalate", model.incidentId, actionSecret, "Escalate"),
    actionButton("reassign", model.incidentId, actionSecret, "Reassign")
  );
  if (model.state === "TRIGGERED") {
    elements.push(
      actionButton("snooze", model.incidentId, actionSecret, "Snooze 15m")
    );
  }

  return {
    block_id: `incident_actions_${model.incidentId}`,
    elements,
    type: "actions"
  };
}

export function renderSlackIncidentMessage(
  model: IncidentMessageModel,
  actionSecret: string
): SlackIncidentMessage {
  const titleText = `${severityEmoji(model.severity)} Incident #${model.incidentNumber} · ${escapeMrkdwn(model.serviceName)}`;
  const title: SectionBlock = {
    text: {
      text: model.webUrl
        ? `*<${model.webUrl}|${titleText}>*`
        : `*${titleText}*`,
      type: "mrkdwn"
    },
    type: "section"
  };
  const summary: SectionBlock = {
    text: {
      text: escapeMrkdwn(model.summary),
      type: "mrkdwn"
    },
    type: "section"
  };
  const facts: SectionBlock = {
    fields: [
      {
        text: `*Status*\n${stateLabel(model.state)}`,
        type: "mrkdwn"
      },
      {
        text: `*Severity*\n${model.severity.toLowerCase()}`,
        type: "mrkdwn"
      },
      {
        text: `*Assignee*\n${
          model.assigneeSlackUserId
            ? `<@${model.assigneeSlackUserId}>`
            : "Unassigned"
        }`,
        type: "mrkdwn"
      },
      {
        text: `*Source*\n${
          model.sourceUrl
            ? `<${model.sourceUrl}|${escapeMrkdwn(model.source)}>`
            : escapeMrkdwn(model.source)
        }`,
        type: "mrkdwn"
      }
    ],
    type: "section"
  };
  const context: ContextBlock = {
    elements: [
      {
        text: model.escalationLabel
          ? `Escalation: ${escapeMrkdwn(model.escalationLabel)}`
          : "Managed by Backbeat Pager",
        type: "mrkdwn"
      }
    ],
    type: "context"
  };
  const blocks: KnownBlock[] = [title, summary, facts, context];
  const actions = actionBlock(model, actionSecret);
  if (actions) blocks.push(actions);

  return {
    attachments: [
      {
        blocks,
        color: severityColor(model.severity),
        fallback: `Incident #${model.incidentNumber}: ${model.summary}`
      }
    ],
    blocks: [],
    text: `Incident #${model.incidentNumber} [${model.state}] ${model.summary}`
  };
}
