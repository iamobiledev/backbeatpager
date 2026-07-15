"use client";

import { useActionState } from "react";

import {
  createServiceAction,
  rotateServiceKeyAction,
  updateServiceAction,
  type SecretActionState
} from "@/app/(console)/actions";
import { SubmitButton } from "@/components/submit-button";
import { Field, Input, Select } from "@/components/ui";

const initialState: SecretActionState = {
  error: null,
  routingKey: null,
  success: false
};

interface ServiceFormOptions {
  policies: Array<{ id: string; name: string; teamId: string }>;
  teams: Array<{ id: string; name: string }>;
}

function Fields({
  existing,
  policies,
  teams
}: ServiceFormOptions & {
  existing?: {
    autoCreateIncidentChannel: boolean;
    criticalChannelThresholdMinutes: number | null;
    escalationPolicyId: string;
    id: string;
    incidentChannelsPrivate: boolean;
    name: string;
    nagCriticalMinutes: number | null;
    nagWarningMinutes: number | null;
    slackChannelId: string | null;
    slug: string;
    teamId: string;
  };
}) {
  return (
    <>
      {existing ? <input name="id" type="hidden" value={existing.id} /> : null}
      <Field label="Name">
        <Input defaultValue={existing?.name} name="name" required />
      </Field>
      <Field label="Slug">
        <Input defaultValue={existing?.slug} name="slug" required />
      </Field>
      <Field label="Team">
        <Select defaultValue={existing?.teamId} name="teamId" required>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Escalation policy">
        <Select
          defaultValue={existing?.escalationPolicyId}
          name="escalationPolicyId"
          required
        >
          {policies.map((policy) => (
            <option key={policy.id} value={policy.id}>
              {policy.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Slack channel ID">
        <Input
          defaultValue={existing?.slackChannelId ?? ""}
          name="slackChannelId"
          placeholder="C0123456789"
        />
      </Field>
      <Field label="Critical nag minutes">
        <Input
          defaultValue={existing?.nagCriticalMinutes ?? 5}
          min={1}
          name="nagCriticalMinutes"
          type="number"
        />
      </Field>
      <Field label="Warning nag minutes">
        <Input
          defaultValue={existing?.nagWarningMinutes ?? 15}
          min={1}
          name="nagWarningMinutes"
          type="number"
        />
      </Field>
      <Field label="Critical channel threshold minutes">
        <Input
          defaultValue={existing?.criticalChannelThresholdMinutes ?? undefined}
          min={1}
          name="criticalChannelThresholdMinutes"
          type="number"
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          defaultChecked={existing?.autoCreateIncidentChannel ?? false}
          name="autoCreateIncidentChannel"
          type="checkbox"
        />
        Auto-create critical incident channel
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          defaultChecked={existing?.incidentChannelsPrivate ?? false}
          name="incidentChannelsPrivate"
          type="checkbox"
        />
        Private incident channels
      </label>
    </>
  );
}

export function CreateServiceForm({ policies, teams }: ServiceFormOptions) {
  const [state, action] = useActionState(createServiceAction, initialState);
  return (
    <div>
      <form
        action={action}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Fields policies={policies} teams={teams} />
        <div className="self-end">
          <SubmitButton>Create service</SubmitButton>
        </div>
      </form>
      {state.routingKey ? (
        <div
          aria-live="polite"
          className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4"
        >
          <p className="text-sm font-semibold text-amber-200">
            Copy this routing key now. It will not be shown again.
          </p>
          <code className="mt-2 block rounded bg-slate-950 p-3 text-xs break-all text-amber-100">
            {state.routingKey}
          </code>
        </div>
      ) : null}
      {state.error ? (
        <p className="mt-3 text-sm text-red-300">{state.error}</p>
      ) : null}
    </div>
  );
}

export function EditServiceForm({
  existing,
  policies,
  teams
}: ServiceFormOptions & {
  existing: Parameters<typeof Fields>[0]["existing"] & { id: string };
}) {
  return (
    <form action={updateServiceAction} className="grid gap-3 sm:grid-cols-2">
      <Fields existing={existing} policies={policies} teams={teams} />
      <div className="sm:col-span-2">
        <SubmitButton>Save service</SubmitButton>
      </div>
    </form>
  );
}

export function RotateServiceKeyForm({ serviceId }: { serviceId: string }) {
  const [state, action] = useActionState(rotateServiceKeyAction, initialState);
  return (
    <div>
      <form action={action}>
        <input name="id" type="hidden" value={serviceId} />
        <SubmitButton destructive>Rotate routing key</SubmitButton>
      </form>
      {state.routingKey ? (
        <div
          aria-live="polite"
          className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3"
        >
          <p className="text-xs text-amber-200">Copy this key now:</p>
          <code className="mt-2 block text-xs break-all text-amber-100">
            {state.routingKey}
          </code>
        </div>
      ) : null}
      {state.error ? (
        <p className="mt-2 text-xs text-red-300">{state.error}</p>
      ) : null}
    </div>
  );
}
