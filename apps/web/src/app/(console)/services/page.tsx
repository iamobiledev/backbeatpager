import { getPrismaClient } from "@backbeat/db";

import { toggleEntityAction } from "@/app/(console)/actions";
import {
  CreateServiceForm,
  EditServiceForm,
  RotateServiceKeyForm
} from "@/components/service-forms";
import { Badge, Card, PageHeader } from "@/components/ui";
import { requireActor } from "@/lib/authz";

function nagInterval(value: unknown, severity: string): number | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const interval = (value as Record<string, unknown>)[severity];
  return typeof interval === "number" ? interval : null;
}

export default async function ServicesPage() {
  const actor = await requireActor();
  const prisma = getPrismaClient();
  const [services, teams, policies] = await Promise.all([
    prisma.service.findMany({
      include: { escalationPolicy: true, team: true },
      orderBy: [{ active: "desc" }, { name: "asc" }]
    }),
    prisma.team.findMany({
      where: { active: true },
      orderBy: { name: "asc" }
    }),
    prisma.escalationPolicy.findMany({
      where: { active: true },
      orderBy: { name: "asc" }
    })
  ]);
  const isAdmin = actor.role === "ADMIN";

  return (
    <>
      <PageHeader
        description="Alert routing, ownership, policies, Slack channels, nag intervals, and incident-channel behavior."
        title="Services"
      />
      {isAdmin && teams.length > 0 && policies.length > 0 ? (
        <Card className="mb-6">
          <h2 className="mb-4 font-semibold text-white">Create service</h2>
          <CreateServiceForm
            policies={policies.map((policy) => ({
              id: policy.id,
              name: policy.name,
              teamId: policy.teamId
            }))}
            teams={teams}
          />
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {services.map((service) => (
          <Card key={service.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white">{service.name}</h2>
                  <Badge tone={service.active ? "emerald" : "red"}>
                    {service.active ? "active" : "inactive"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {service.team.name} · {service.slug}
                </p>
              </div>
              {isAdmin ? (
                <form action={toggleEntityAction}>
                  <input name="entity" type="hidden" value="Service" />
                  <input name="id" type="hidden" value={service.id} />
                  <input
                    name="active"
                    type="hidden"
                    value={String(!service.active)}
                  />
                  <button className="text-xs text-slate-500" type="submit">
                    {service.active ? "Deactivate" : "Activate"}
                  </button>
                </form>
              ) : null}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-slate-600">Escalation</dt>
                <dd className="mt-1 text-slate-300">
                  {service.escalationPolicy.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-600">Slack channel</dt>
                <dd className="mt-1 text-slate-300">
                  {service.slackChannelId ?? "Not mapped"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-600">Routing prefix</dt>
                <dd className="mt-1 font-mono text-xs text-slate-300">
                  {service.routingKeyPrefix}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-600">Nag intervals</dt>
                <dd className="mt-1 text-slate-300">
                  critical{" "}
                  {nagInterval(service.nagIntervals, "CRITICAL") ?? "off"}m ·
                  warning{" "}
                  {nagInterval(service.nagIntervals, "WARNING") ?? "off"}m
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              {service.autoCreateIncidentChannel ? (
                <Badge tone="amber">
                  incident channel after{" "}
                  {service.criticalChannelThresholdMinutes ?? "?"}m
                </Badge>
              ) : (
                <Badge>no auto channel</Badge>
              )}
              {service.incidentChannelsPrivate ? (
                <Badge>private channels</Badge>
              ) : null}
            </div>
            {isAdmin ? (
              <div className="mt-5 grid gap-4">
                <details>
                  <summary className="cursor-pointer text-xs text-cyan-400">
                    Edit service
                  </summary>
                  <div className="mt-3 rounded-xl border border-slate-800 p-4">
                    <EditServiceForm
                      existing={{
                        autoCreateIncidentChannel:
                          service.autoCreateIncidentChannel,
                        criticalChannelThresholdMinutes:
                          service.criticalChannelThresholdMinutes,
                        escalationPolicyId: service.escalationPolicyId,
                        id: service.id,
                        incidentChannelsPrivate:
                          service.incidentChannelsPrivate,
                        nagCriticalMinutes: nagInterval(
                          service.nagIntervals,
                          "CRITICAL"
                        ),
                        nagWarningMinutes: nagInterval(
                          service.nagIntervals,
                          "WARNING"
                        ),
                        name: service.name,
                        slackChannelId: service.slackChannelId,
                        slug: service.slug,
                        teamId: service.teamId
                      }}
                      policies={policies.map((policy) => ({
                        id: policy.id,
                        name: policy.name,
                        teamId: policy.teamId
                      }))}
                      teams={teams}
                    />
                  </div>
                </details>
                <details>
                  <summary className="cursor-pointer text-xs text-amber-300">
                    Rotate routing key
                  </summary>
                  <div className="mt-3">
                    <RotateServiceKeyForm serviceId={service.id} />
                  </div>
                </details>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </>
  );
}
