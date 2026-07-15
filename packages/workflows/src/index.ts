export interface IncidentWorkflowInput {
  generation: number;
  incidentId: string;
}

export interface StartedWorkflow {
  runId: string;
}

export interface IncidentWorkflowStarter {
  startIncidentGeneration(
    input: IncidentWorkflowInput
  ): Promise<StartedWorkflow>;
}

export {
  dispatchIncidentWorkflow,
  reconcileIncidentWorkflows
} from "./dispatch.js";
export type {
  DispatchIncidentWorkflowResult,
  ReconciliationResult
} from "./dispatch.js";
export { evaluateIncidentWake } from "./incident-engine.js";
export type { IncidentWakeResult } from "./incident-engine.js";
export {
  dispatchDigestWorkflow,
  dispatchHandoffWorkflow,
  processDigestWake,
  processHandoffWake,
  reconcileCommunicationWorkflows
} from "./communication.js";
export type {
  CommunicationDeliveryDependencies,
  CommunicationReconciliationResult,
  CommunicationWakeResult,
  CommunicationWorkflowStarter,
  DigestWorkflowInput,
  HandoffWorkflowInput
} from "./communication.js";
