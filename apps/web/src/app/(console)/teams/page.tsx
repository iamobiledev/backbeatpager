import { getPrismaClient } from "@backbeat/db";

import {
  createTeamAction,
  toggleEntityAction,
  updateTeamAction
} from "@/app/(console)/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge, Card, Field, Input, PageHeader, Select } from "@/components/ui";
import { requireActor } from "@/lib/authz";

export default async function TeamsPage() {
  const actor = await requireActor();
  const prisma = getPrismaClient();
  const [teams, users] = await Promise.all([
    prisma.team.findMany({
      include: {
        memberships: { include: { user: true } },
        services: true,
        schedules: true
      },
      orderBy: [{ active: "desc" }, { name: "asc" }]
    }),
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" }
    })
  ]);
  const isAdmin = actor.role === "ADMIN";

  return (
    <>
      <PageHeader
        description="Ownership groups, responder membership, Slack channels, and scheduled team communication."
        title="Teams"
      />
      {isAdmin ? (
        <Card className="mb-6">
          <h2 className="mb-4 font-semibold text-white">Create team</h2>
          <form action={createTeamAction} className="grid gap-4 lg:grid-cols-3">
            <Field label="Name">
              <Input name="name" placeholder="Payments" required />
            </Field>
            <Field label="Slug">
              <Input name="slug" placeholder="payments" required />
            </Field>
            <Field label="Timezone">
              <Input defaultValue="UTC" name="timezone" required />
            </Field>
            <Field label="Slack channel ID">
              <Input name="slackChannelId" placeholder="C0123456789" />
            </Field>
            <Field label="Weekly digest day">
              <Select defaultValue="1" name="digestDayOfWeek">
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
              </Select>
            </Field>
            <Field label="Digest time">
              <Input defaultValue="09:00" name="digestLocalTime" type="time" />
            </Field>
            <Field label="Description">
              <Input name="description" placeholder="Team responsibility" />
            </Field>
            <fieldset className="lg:col-span-2">
              <legend className="mb-2 text-sm font-medium text-slate-300">
                Members (first selected member is manager)
              </legend>
              <div className="flex flex-wrap gap-3">
                {users.map((user) => (
                  <label
                    className="flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-xs"
                    key={user.id}
                  >
                    <input name="memberIds" type="checkbox" value={user.id} />
                    {user.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex items-center gap-5 lg:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  defaultChecked
                  name="handoffMessagesEnabled"
                  type="checkbox"
                />
                Handoff messages
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input defaultChecked name="digestEnabled" type="checkbox" />
                Weekly digest
              </label>
            </div>
            <div className="self-end">
              <SubmitButton>Create team</SubmitButton>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {teams.map((team) => (
          <Card key={team.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white">{team.name}</h2>
                  <Badge tone={team.active ? "emerald" : "red"}>
                    {team.active ? "active" : "inactive"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {team.slug} · {team.timezone} ·{" "}
                  {team.slackChannelId ?? "No Slack channel"}
                </p>
              </div>
              {isAdmin ? (
                <form action={toggleEntityAction}>
                  <input name="entity" type="hidden" value="Team" />
                  <input name="id" type="hidden" value={team.id} />
                  <input
                    name="active"
                    type="hidden"
                    value={String(!team.active)}
                  />
                  <button className="text-xs text-slate-500" type="submit">
                    {team.active ? "Deactivate" : "Activate"}
                  </button>
                </form>
              ) : null}
            </div>
            <p className="mt-4 text-sm text-slate-400">
              {team.description ?? "No description"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {team.memberships.map((membership) => (
                <Badge
                  key={membership.id}
                  tone={membership.role === "MANAGER" ? "cyan" : "slate"}
                >
                  {membership.user.name}
                </Badge>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-600">
              {team.services.length} services · {team.schedules.length}{" "}
              schedules · digest {team.digestEnabled ? "enabled" : "disabled"}
            </p>
            {isAdmin ? (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-cyan-400">
                  Edit team
                </summary>
                <form
                  action={updateTeamAction}
                  className="mt-3 grid gap-3 rounded-xl bg-slate-900/60 p-4 sm:grid-cols-2"
                >
                  <input name="id" type="hidden" value={team.id} />
                  <Input defaultValue={team.name} name="name" required />
                  <Input defaultValue={team.slug} name="slug" required />
                  <Input
                    defaultValue={team.timezone}
                    name="timezone"
                    required
                  />
                  <Input
                    defaultValue={team.slackChannelId ?? ""}
                    name="slackChannelId"
                    placeholder="Slack channel"
                  />
                  <Input
                    defaultValue={team.description ?? ""}
                    name="description"
                    placeholder="Description"
                  />
                  <Input
                    defaultValue={team.digestLocalTime}
                    name="digestLocalTime"
                    type="time"
                  />
                  <input
                    name="digestDayOfWeek"
                    type="hidden"
                    value={team.digestDayOfWeek}
                  />
                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    {users.map((user) => (
                      <label className="text-xs" key={user.id}>
                        <input
                          defaultChecked={team.memberships.some(
                            (membership) => membership.userId === user.id
                          )}
                          name="memberIds"
                          type="checkbox"
                          value={user.id}
                        />{" "}
                        {user.name}
                      </label>
                    ))}
                  </div>
                  <label className="text-xs">
                    <input
                      defaultChecked={team.handoffMessagesEnabled}
                      name="handoffMessagesEnabled"
                      type="checkbox"
                    />{" "}
                    Handoff messages
                  </label>
                  <label className="text-xs">
                    <input
                      defaultChecked={team.digestEnabled}
                      name="digestEnabled"
                      type="checkbox"
                    />{" "}
                    Weekly digest
                  </label>
                  <div className="sm:col-span-2">
                    <SubmitButton>Save team</SubmitButton>
                  </div>
                </form>
              </details>
            ) : null}
          </Card>
        ))}
      </div>
    </>
  );
}
