export type NotificationChannel = "EMAIL" | "SLACK";

export {
  createSlackActionToken,
  slackIncidentActions,
  verifySlackActionToken
} from "./slack/actions.js";
export type {
  SlackActionPayload,
  SlackIncidentAction
} from "./slack/actions.js";
export { renderSlackIncidentMessage } from "./slack/incident-message.js";
export type {
  IncidentMessageModel,
  IncidentMessageSeverity,
  IncidentMessageState,
  SlackIncidentMessage
} from "./slack/incident-message.js";
export {
  renderIncidentEmail,
  renderIncidentEmailText
} from "./email/incident-email.js";
export type { RenderedIncidentEmail } from "./email/incident-email.js";
export {
  ResendEmailApi,
  sendIncidentEmail,
  withEmailRetry
} from "./email/client.js";
export type {
  EmailApi,
  EmailRetryOptions,
  EmailSendInput
} from "./email/client.js";
export { WebClientSlackApi, withSlackRetry } from "./slack/client.js";
export type {
  SlackApi,
  SlackMessageReference,
  SlackRetryOptions
} from "./slack/client.js";
export {
  deliverIncidentGeneration,
  synchronizeIncidentMessages
} from "./delivery.js";
export type {
  IncidentDeliveryResult,
  NotificationDeliveryDependencies
} from "./delivery.js";
