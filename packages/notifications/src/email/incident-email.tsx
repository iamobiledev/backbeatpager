import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text
} from "@react-email/components";
import { render } from "@react-email/render";

import type { IncidentMessageModel } from "../slack/incident-message.js";

function IncidentEmail({ incident }: { incident: IncidentMessageModel }) {
  const color =
    incident.severity === "CRITICAL"
      ? "#dc2626"
      : incident.severity === "WARNING"
        ? "#d97706"
        : "#2563eb";

  return (
    <Html>
      <Head />
      <Preview>{`Incident #${incident.incidentNumber}: ${incident.summary}`}</Preview>
      <Body
        style={{
          backgroundColor: "#f4f7fb",
          color: "#172033",
          fontFamily: "Arial, sans-serif",
          margin: 0,
          padding: "32px 16px"
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderTop: `5px solid ${color}`,
            borderRadius: "10px",
            margin: "0 auto",
            maxWidth: "600px",
            padding: "28px"
          }}
        >
          <Text
            style={{
              color,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              margin: 0,
              textTransform: "uppercase"
            }}
          >
            {incident.severity} · {incident.state}
          </Text>
          <Heading style={{ fontSize: "26px", margin: "12px 0 8px" }}>
            Incident #{incident.incidentNumber}
          </Heading>
          <Text style={{ fontSize: "18px", lineHeight: "28px", marginTop: 0 }}>
            {incident.summary}
          </Text>
          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />
          <Section>
            <Text>
              <strong>Service:</strong> {incident.serviceName}
              <br />
              <strong>Source:</strong> {incident.source}
              <br />
              <strong>Escalation:</strong>{" "}
              {incident.escalationLabel ?? "Current policy step"}
            </Text>
          </Section>
          {incident.webUrl ? (
            <Button
              href={incident.webUrl}
              style={{
                backgroundColor: "#172033",
                borderRadius: "6px",
                color: "#ffffff",
                display: "inline-block",
                fontWeight: 700,
                marginTop: "16px",
                padding: "12px 18px",
                textDecoration: "none"
              }}
            >
              Open incident
            </Button>
          ) : null}
          <Text
            style={{ color: "#667085", fontSize: "12px", marginTop: "28px" }}
          >
            Sent by Backbeat Pager. Acknowledge and resolve from Slack whenever
            possible.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export interface RenderedIncidentEmail {
  html: string;
  subject: string;
  text: string;
}

export function renderIncidentEmailText(
  incident: IncidentMessageModel
): string {
  return [
    `${incident.severity} incident #${incident.incidentNumber} (${incident.state})`,
    incident.summary,
    `Service: ${incident.serviceName}`,
    `Source: ${incident.source}`,
    incident.escalationLabel ? `Escalation: ${incident.escalationLabel}` : null,
    incident.webUrl ? `Open incident: ${incident.webUrl}` : null
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export async function renderIncidentEmail(
  incident: IncidentMessageModel
): Promise<RenderedIncidentEmail> {
  return {
    html: await render(<IncidentEmail incident={incident} />),
    subject: `[${incident.severity}] Incident #${incident.incidentNumber}: ${incident.summary}`,
    text: renderIncidentEmailText(incident)
  };
}
