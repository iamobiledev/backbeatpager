import { getPrismaClient } from "@backbeat/db";
import {
  dispatchIncidentWorkflow,
  evaluateIncidentWake,
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

  return evaluateIncidentWake(getPrismaClient(), input);
}

async function startNextGenerationStep(
  input: IncidentWorkflowInput
): Promise<void> {
  "use step";

  await dispatchIncidentWorkflow(
    getPrismaClient(),
    vercelIncidentWorkflowStarter,
    input
  );
}

export async function incidentGenerationWorkflow(
  input: IncidentWorkflowInput
): Promise<void> {
  "use workflow";

  while (true) {
    const result = await evaluateWakeStep(input);
    if (result.nextGeneration !== null) {
      await startNextGenerationStep({
        generation: result.nextGeneration,
        incidentId: input.incidentId
      });
      return;
    }
    if (result.done) return;

    await sleep(result.sleepUntil);
  }
}

export const vercelIncidentWorkflowStarter: IncidentWorkflowStarter = {
  async startIncidentGeneration(input) {
    const run = await start(incidentGenerationWorkflow, [input]);
    return { runId: run.runId };
  }
};
