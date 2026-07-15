export interface EscalationCursor {
  loop: number;
  position: number;
}

export interface EscalationStepDefinition {
  id: string;
  position: number;
  timeoutMinutes: number;
}

export type EscalationAdvance =
  | {
      exhausted: false;
      next: EscalationCursor;
      step: EscalationStepDefinition;
    }
  | {
      exhausted: true;
      next: null;
      step: null;
    };

export function firstEscalationStep(
  steps: EscalationStepDefinition[]
): EscalationAdvance {
  const sorted = [...steps].sort(
    (left, right) => left.position - right.position
  );
  const step = sorted[0];

  return step
    ? {
        exhausted: false,
        next: { loop: 0, position: step.position },
        step
      }
    : { exhausted: true, next: null, step: null };
}

export function advanceEscalationCursor(
  steps: EscalationStepDefinition[],
  current: EscalationCursor,
  repeatCount: number
): EscalationAdvance {
  const sorted = [...steps].sort(
    (left, right) => left.position - right.position
  );
  const nextStep = sorted.find((step) => step.position > current.position);

  if (nextStep) {
    return {
      exhausted: false,
      next: { loop: current.loop, position: nextStep.position },
      step: nextStep
    };
  }

  const firstStep = sorted[0];
  if (firstStep && current.loop < repeatCount) {
    return {
      exhausted: false,
      next: { loop: current.loop + 1, position: firstStep.position },
      step: firstStep
    };
  }

  return { exhausted: true, next: null, step: null };
}
