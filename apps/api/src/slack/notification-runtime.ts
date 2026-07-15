import {
  ResendEmailApi,
  WebClientSlackApi,
  type NotificationDeliveryDependencies
} from "@backbeat/notifications";
import { WebClient } from "@slack/web-api";

export function createNotificationDeliveryFromEnvironment():
  NotificationDeliveryDependencies | undefined {
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const actionSecret = process.env.SLACK_ACTION_SECRET;
  if (!slackToken || !actionSecret) return undefined;

  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  return {
    actionSecret,
    ...(resendApiKey && emailFrom
      ? {
          email: new ResendEmailApi(resendApiKey),
          emailFrom
        }
      : {}),
    slack: new WebClientSlackApi(new WebClient(slackToken)),
    ...(process.env.WEB_BASE_URL
      ? { webBaseUrl: process.env.WEB_BASE_URL }
      : {})
  };
}
