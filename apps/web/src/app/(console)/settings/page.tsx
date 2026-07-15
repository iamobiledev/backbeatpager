import { getPrismaClient } from "@backbeat/db";

import { updateChannelsAction } from "@/app/(console)/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge, Card, Field, Input, PageHeader } from "@/components/ui";
import { requireActor } from "@/lib/authz";

export default async function SettingsPage() {
  const actor = await requireActor();
  const [teams, services] = await Promise.all([
    getPrismaClient().team.findMany({ orderBy: { name: "asc" } }),
    getPrismaClient().service.findMany({
      include: { team: true },
      orderBy: { name: "asc" }
    })
  ]);
  const isAdmin = actor.role === "ADMIN";
  const slackConfigured = Boolean(
    process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET
  );

  return (
    <>
      <PageHeader
        description="Slack HTTP integration health and channel routing for team communication and incident projections."
        title="Settings"
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-600">Slack mode</p>
          <div className="mt-2">
            <Badge tone="cyan">HTTP / Vercel Receiver</Badge>
          </div>
        </Card>
        <Card>
          <p className="text-xs text-slate-600">Credentials</p>
          <div className="mt-2">
            <Badge tone={slackConfigured ? "emerald" : "amber"}>
              {slackConfigured ? "configured in this project" : "API-owned"}
            </Badge>
          </div>
        </Card>
        <Card>
          <p className="text-xs text-slate-600">Callback</p>
          <p className="mt-2 truncate font-mono text-xs text-slate-300">
            {process.env.API_BASE_URL
              ? `${process.env.API_BASE_URL}/slack/events`
              : "Set API_BASE_URL"}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white">Channel mappings</h2>
            <p className="mt-1 text-sm text-slate-500">
              Team channels receive handoffs/digests. Service channels receive
              canonical incident messages.
            </p>
          </div>
          {!isAdmin ? <Badge>read only</Badge> : null}
        </div>
        <form action={updateChannelsAction} className="mt-6 grid gap-7">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-slate-300">
              Team channels
            </legend>
            <div className="grid gap-3 md:grid-cols-2">
              {teams.map((team) => (
                <Field key={team.id} label={team.name}>
                  <Input
                    defaultValue={team.slackChannelId ?? ""}
                    disabled={!isAdmin}
                    name={`team:${team.id}`}
                    placeholder="C0123456789"
                  />
                </Field>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-slate-300">
              Service channels
            </legend>
            <div className="grid gap-3 md:grid-cols-2">
              {services.map((service) => (
                <Field
                  key={service.id}
                  label={`${service.team.name} · ${service.name}`}
                >
                  <Input
                    defaultValue={service.slackChannelId ?? ""}
                    disabled={!isAdmin}
                    name={`service:${service.id}`}
                    placeholder="C0123456789"
                  />
                </Field>
              ))}
            </div>
          </fieldset>
          {isAdmin ? (
            <div>
              <SubmitButton>Save channel mappings</SubmitButton>
            </div>
          ) : null}
        </form>
      </Card>
    </>
  );
}
