import { getPrismaClient } from "@backbeat/db";

import { toggleEntityAction } from "@/app/(console)/actions";
import { PolicyForm } from "@/components/policy-form";
import { Badge, Card, PageHeader } from "@/components/ui";
import { requireActor } from "@/lib/authz";

export default async function PoliciesPage() {
  const actor = await requireActor();
  const prisma = getPrismaClient();
  const [policies, teams, schedules, users] = await Promise.all([
    prisma.escalationPolicy.findMany({
      include: {
        services: true,
        steps: {
          include: {
            targets: {
              include: { schedule: true, team: true, user: true }
            }
          },
          orderBy: { position: "asc" }
        },
        team: true
      },
      orderBy: [{ active: "desc" }, { name: "asc" }]
    }),
    prisma.team.findMany({
      where: { active: true },
      orderBy: { name: "asc" }
    }),
    prisma.schedule.findMany({
      where: { active: true },
      include: { team: true },
      orderBy: { name: "asc" }
    }),
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" }
    })
  ]);
  const isAdmin = actor.role === "ADMIN";
  const targets = [
    ...schedules.map((schedule) => ({
      label: `Schedule · ${schedule.team.name} / ${schedule.name}`,
      value: `schedule:${schedule.id}`
    })),
    ...teams.map((team) => ({
      label: `Team · ${team.name}`,
      value: `team:${team.id}`
    })),
    ...users.map((user) => ({
      label: `User · ${user.name}`,
      value: `user:${user.id}`
    }))
  ];

  return (
    <>
      <PageHeader
        description="Ordered targets, escalation timeouts, repeat loops, and optional acknowledgement expiry."
        title="Escalation policies"
      />
      {isAdmin && teams.length > 0 && targets.length > 0 ? (
        <Card className="mb-6">
          <h2 className="mb-4 font-semibold text-white">Create policy</h2>
          <PolicyForm targets={targets} teams={teams} />
        </Card>
      ) : null}

      <div className="grid gap-4">
        {policies.map((policy) => (
          <Card key={policy.id}>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white">{policy.name}</h2>
                  <Badge tone={policy.active ? "emerald" : "red"}>
                    {policy.active ? "active" : "inactive"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {policy.team.name} · repeats {policy.repeatCount} · used by{" "}
                  {policy.services.length} services
                </p>
              </div>
              {isAdmin ? (
                <form action={toggleEntityAction}>
                  <input name="entity" type="hidden" value="EscalationPolicy" />
                  <input name="id" type="hidden" value={policy.id} />
                  <input
                    name="active"
                    type="hidden"
                    value={String(!policy.active)}
                  />
                  <button className="text-xs text-slate-500" type="submit">
                    {policy.active ? "Deactivate" : "Activate"}
                  </button>
                </form>
              ) : null}
            </div>
            <ol className="mt-5 grid gap-2">
              {policy.steps.map((step) => (
                <li
                  className="flex items-center gap-3 rounded-xl bg-slate-900/70 px-4 py-3 text-sm"
                  key={step.id}
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-400">
                    {step.position + 1}
                  </span>
                  <span className="text-slate-300">
                    {step.targets
                      .map(
                        (target) =>
                          target.schedule?.name ??
                          target.team?.name ??
                          target.user?.name ??
                          "Unknown target"
                      )
                      .join(", ")}
                  </span>
                  <span className="ml-auto text-xs text-slate-600">
                    {step.timeoutMinutes}m
                  </span>
                </li>
              ))}
            </ol>
            {isAdmin ? (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-cyan-400">
                  Edit policy
                </summary>
                <div className="mt-4 rounded-xl border border-slate-800 p-4">
                  <PolicyForm
                    existing={{
                      acknowledgementTimeoutMinutes:
                        policy.acknowledgementTimeoutMinutes,
                      id: policy.id,
                      name: policy.name,
                      repeatCount: policy.repeatCount,
                      slug: policy.slug,
                      steps: policy.steps.map((step) => {
                        const target = step.targets[0];
                        return {
                          target: target?.userId
                            ? `user:${target.userId}`
                            : target?.scheduleId
                              ? `schedule:${target.scheduleId}`
                              : `team:${target?.teamId ?? ""}`,
                          timeoutMinutes: step.timeoutMinutes
                        };
                      }),
                      teamId: policy.teamId
                    }}
                    targets={targets}
                    teams={teams}
                  />
                </div>
              </details>
            ) : null}
          </Card>
        ))}
      </div>
    </>
  );
}
