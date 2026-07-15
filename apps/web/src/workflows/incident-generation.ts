import {
  type IncidentWakeResult,
  type IncidentWorkflowInput,
  type IncidentWorkflowStarter
} from "@backbeat/workflows";
import { sleep } from "workflow";
import { start } from "workflow/api";

async function evaluateWakeStep(
  input: IncidentWorkflowInput
): Promise<IncidentWakeResult> {
  "use step";

  const appBaseUrl =
    process.env.WEB_BASE_URL ??
    process.env.API_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  const secret = process.env.WORKFLOW_INTERNAL_SECRET;
  if (!appBaseUrl || !secret) {
    throw new Error(
      "WEB_BASE_URL and WORKFLOW_INTERNAL_SECRET are required in Workflow steps"
    );
  }

  const response = await fetch(
    `${appBaseUrl.replace(/\/$/, "")}/internal/workflows/wake`,
    {
    body: JSON.stringify(input),
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json"
    },
    method: "POST"
  });
  if (!response.ok) {
    throw new Error(
      `Incident wake endpoint failed with HTTP ${response.status}`
    );
  }

  return (await response.json()) as IncidentWakeResult;
}

export async function incidentGenerationWorkflow(
  input: IncidentWorkflowInput
): Promise<void> {
  "use workflow";

  while (true) {
    const result = await evaluateWakeStep(input);
    if (result.nextGeneration !== null) return;
    if (result.done) return;

    await sleep(new Date(result.sleepUntil));
  }
}

export const vercelIncidentWorkflowStarter: IncidentWorkflowStarter = {
  async startIncidentGeneration(input) {
    const run = await start(incidentGenerationWorkflow, [input]);
    return { runId: run.runId };
  }
};
