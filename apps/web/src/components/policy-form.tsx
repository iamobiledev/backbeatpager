"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  createPolicyAction,
  updatePolicyAction
} from "@/app/(console)/actions";
import { SubmitButton } from "@/components/submit-button";
import { Field, Input, Select } from "@/components/ui";

interface TargetOption {
  label: string;
  value: string;
}

interface PolicyStepForm {
  target: string;
  timeoutMinutes: number;
}

export function PolicyForm({
  existing,
  targets,
  teams
}: {
  existing?: {
    acknowledgementTimeoutMinutes: number | null;
    id: string;
    name: string;
    repeatCount: number;
    slug: string;
    steps: PolicyStepForm[];
    teamId: string;
  };
  targets: TargetOption[];
  teams: Array<{ id: string; name: string }>;
}) {
  const [steps, setSteps] = useState<PolicyStepForm[]>(
    existing?.steps.length
      ? existing.steps
      : [{ target: targets[0]?.value ?? "", timeoutMinutes: 5 }]
  );

  return (
    <form
      action={existing ? updatePolicyAction : createPolicyAction}
      className="grid gap-4"
    >
      {existing ? <input name="id" type="hidden" value={existing.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <Input defaultValue={existing?.name} name="name" required />
        </Field>
        <Field label="Slug">
          <Input defaultValue={existing?.slug} name="slug" required />
        </Field>
        <Field label="Owning team">
          <Select defaultValue={existing?.teamId} name="teamId" required>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Repeat loops">
          <Input
            defaultValue={existing?.repeatCount ?? 0}
            min={0}
            name="repeatCount"
            type="number"
          />
        </Field>
        <Field label="Acknowledgement timeout minutes (optional)">
          <Input
            defaultValue={existing?.acknowledgementTimeoutMinutes ?? undefined}
            min={1}
            name="acknowledgementTimeoutMinutes"
            type="number"
          />
        </Field>
      </div>
      <fieldset className="grid gap-3">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-semibold text-slate-300">
            Ordered escalation steps
          </legend>
          <button
            className="inline-flex items-center gap-1 text-xs text-cyan-400"
            onClick={() =>
              setSteps((current) => [
                ...current,
                {
                  target: targets[0]?.value ?? "",
                  timeoutMinutes: 5
                }
              ])
            }
            type="button"
          >
            <Plus className="size-3.5" /> Add step
          </button>
        </div>
        {steps.map((step, index) => (
          <div
            className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3 sm:grid-cols-[auto_1fr_160px_auto] sm:items-end"
            key={`${index}-${step.target}`}
          >
            <span className="pb-2 text-xs font-bold text-slate-500">
              {index + 1}
            </span>
            <Field label="Target">
              <Select
                name="target"
                onChange={(event) =>
                  setSteps((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, target: event.target.value }
                        : item
                    )
                  )
                }
                value={step.target}
              >
                {targets.map((target) => (
                  <option key={target.value} value={target.value}>
                    {target.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Timeout minutes">
              <Input
                min={1}
                name="timeoutMinutes"
                onChange={(event) =>
                  setSteps((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            timeoutMinutes: Number(event.target.value)
                          }
                        : item
                    )
                  )
                }
                type="number"
                value={step.timeoutMinutes}
              />
            </Field>
            <button
              aria-label={`Remove step ${index + 1}`}
              className="rounded-lg p-2 text-slate-600 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30"
              disabled={steps.length === 1}
              onClick={() =>
                setSteps((current) =>
                  current.filter((_, itemIndex) => itemIndex !== index)
                )
              }
              type="button"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </fieldset>
      <div>
        <SubmitButton>
          {existing ? "Save policy" : "Create policy"}
        </SubmitButton>
      </div>
    </form>
  );
}
