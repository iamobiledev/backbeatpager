import {
  type CommunicationWakeResult,
  type CommunicationWorkflowStarter,
  type DigestWorkflowInput,
  type HandoffWorkflowInput
} from "@backbeat/workflows";
import { sleep } from "workflow";
import { start } from "workflow/api";

async function communicationStep(
  kind: "digest" | "handoff",
  input: DigestWorkflowInput | HandoffWorkflowInput
): Promise<CommunicationWakeResult> {
  "use step";

  const apiBaseUrl = process.env.API_BASE_URL;
  const secret = process.env.WORKFLOW_INTERNAL_SECRET;
  if (!apiBaseUrl || !secret) {
    throw new Error(
      "API_BASE_URL and WORKFLOW_INTERNAL_SECRET are required in Workflow steps"
    );
  }
  const response = await fetch(
    `${apiBaseUrl.replace(/\/$/, "")}/internal/workflows/${kind}`,
    {
      body: JSON.stringify(input),
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json"
      },
      method: "POST"
    }
  );
  if (!response.ok) {
    throw new Error(
      `${kind} Workflow endpoint failed with HTTP ${response.status}`
    );
  }
  return (await response.json()) as CommunicationWakeResult;
}

export async function handoffWorkflow(
  input: HandoffWorkflowInput
): Promise<void> {
  "use workflow";

  while (true) {
    const result = await communicationStep("handoff", input);
    if (result.done) return;
    await sleep(new Date(result.sleepUntil));
  }
}

export async function digestWorkflow(
  input: DigestWorkflowInput
): Promise<void> {
  "use workflow";

  while (true) {
    const result = await communicationStep("digest", input);
    if (result.done) return;
    await sleep(new Date(result.sleepUntil));
  }
}

export const vercelCommunicationWorkflowStarter: CommunicationWorkflowStarter =
  {
    async startDigest(input) {
      const run = await start(digestWorkflow, [input]);
      return { runId: run.runId };
    },
    async startHandoff(input) {
      const run = await start(handoffWorkflow, [input]);
      return { runId: run.runId };
    }
  };
