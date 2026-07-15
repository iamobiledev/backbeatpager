import { getPrismaClient } from "@backbeat/db";

import {
  createOverrideAction,
  createScheduleAction,
  deleteOverrideAction,
  toggleEntityAction,
  updateScheduleAction
} from "@/app/(console)/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge, Card, Field, Input, PageHeader, Select } from "@/components/ui";
import { getScheduleCalendars } from "@/lib/admin/queries";
import { requireActor } from "@/lib/authz";

const days = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 }
];

function localInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default async function SchedulesPage() {
  const actor = await requireActor();
  const prisma = getPrismaClient();
  const rangeStart = new Date();
  const rangeEnd = new Date(rangeStart.getTime() + 14 * 24 * 60 * 60_000);
  const [schedules, teams, users, overrides, calendars] = await Promise.all([
    prisma.schedule.findMany({
      include: {
        layers: {
          include: {
            participants: true,
            restrictions: true
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
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" }
    }),
    prisma.scheduleOverride.findMany({
      include: {
        replacementUser: true,
        replacedUser: true,
        schedule: true
      },
      orderBy: { startsAt: "asc" },
      where: { endsAt: { gte: new Date() } }
    }),
    getScheduleCalendars(rangeStart, rangeEnd)
  ]);
  const isAdmin = actor.role === "ADMIN";

  const scheduleForm = (
    action: (form: FormData) => Promise<void>,
    existing?: (typeof schedules)[number]
  ) => {
    const layer = existing?.layers[0];
    return (
      <form
        action={action}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {existing ? (
          <input name="id" type="hidden" value={existing.id} />
        ) : null}
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
        <Field label="Timezone">
          <Input
            defaultValue={existing?.timezone ?? "UTC"}
            name="timezone"
            required
          />
        </Field>
        <Field label="Rotation">
          <Select
            defaultValue={layer?.rotationType ?? "WEEKLY"}
            name="rotationType"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="CUSTOM">Custom minutes</option>
          </Select>
        </Field>
        <Field label="Rotation interval">
          <Input
            defaultValue={layer?.rotationInterval ?? 1}
            min={1}
            name="rotationInterval"
            type="number"
          />
        </Field>
        <Field label="Custom interval minutes">
          <Input
            defaultValue={layer?.customIntervalMinutes ?? undefined}
            min={1}
            name="customIntervalMinutes"
            type="number"
          />
        </Field>
        <Field label="Handoff time">
          <Input
            defaultValue={layer?.handoffLocalTime ?? "09:00"}
            name="handoffLocalTime"
            type="time"
          />
        </Field>
        <Field label="Anchor date">
          <Input
            defaultValue={
              layer?.anchorLocalDate.toISOString().slice(0, 10) ??
              new Date().toISOString().slice(0, 10)
            }
            name="anchorLocalDate"
            type="date"
          />
        </Field>
        <fieldset className="md:col-span-2 xl:col-span-3">
          <legend className="mb-2 text-sm font-medium text-slate-300">
            Rotation participants (selection order)
          </legend>
          <div className="flex flex-wrap gap-2">
            {users.map((user) => (
              <label
                className="rounded-lg border border-slate-800 px-3 py-2 text-xs"
                key={user.id}
              >
                <input
                  defaultChecked={layer?.participants.some(
                    (participant) => participant.userId === user.id
                  )}
                  name="participantIds"
                  type="checkbox"
                  value={user.id}
                />{" "}
                {user.name}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="grid gap-3 rounded-xl border border-slate-800 p-3 md:col-span-2 xl:col-span-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              defaultChecked={Boolean(layer?.restrictions.length)}
              name="restrictionEnabled"
              type="checkbox"
            />
            Restrict this layer to selected local hours
          </label>
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <label className="text-xs" key={day.value}>
                <input
                  defaultChecked={layer?.restrictions.some(
                    (restriction) => restriction.dayOfWeek === day.value
                  )}
                  name="restrictionDays"
                  type="checkbox"
                  value={day.value}
                />{" "}
                {day.label}
              </label>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Restriction starts">
              <Input
                defaultValue={layer?.restrictions[0]?.startLocalTime ?? "09:00"}
                name="restrictionStart"
                type="time"
              />
            </Field>
            <Field label="Restriction ends">
              <Input
                defaultValue={layer?.restrictions[0]?.endLocalTime ?? "17:00"}
                name="restrictionEnd"
                type="time"
              />
            </Field>
          </div>
        </fieldset>
        <div>
          <SubmitButton>
            {existing ? "Save schedule" : "Create schedule"}
          </SubmitButton>
        </div>
      </form>
    );
  };

  return (
    <>
      <PageHeader
        description="Timezone-correct rotation layers, restrictions, temporary coverage, and the next 14 days."
        title="Schedules"
      />
      {isAdmin && teams.length > 0 && users.length > 0 ? (
        <Card className="mb-6">
          <h2 className="mb-4 font-semibold text-white">Create schedule</h2>
          {scheduleForm(createScheduleAction)}
        </Card>
      ) : null}

      <Card className="mb-6">
        <h2 className="font-semibold text-white">14-day rotation calendar</h2>
        <p className="mt-1 text-xs text-slate-500">
          {rangeStart.toLocaleDateString()} → {rangeEnd.toLocaleDateString()}
        </p>
        <div className="mt-5 grid gap-5">
          {calendars.map((calendar) => (
            <div key={calendar.id}>
              <div className="mb-2 flex justify-between text-xs">
                <span className="font-medium text-slate-300">
                  {calendar.teamName} · {calendar.name}
                </span>
                <span className="text-slate-600">{calendar.timezone}</span>
              </div>
              <div className="relative h-12 overflow-hidden rounded-lg bg-slate-900">
                {calendar.shifts.map((shift, index) => {
                  const total = rangeEnd.getTime() - rangeStart.getTime();
                  const left =
                    ((shift.startsAt.getTime() - rangeStart.getTime()) /
                      total) *
                    100;
                  const width =
                    ((shift.endsAt.getTime() - shift.startsAt.getTime()) /
                      total) *
                    100;
                  return (
                    <div
                      className={`absolute inset-y-1 flex min-w-10 items-center overflow-hidden rounded-md px-2 text-[10px] font-medium ${
                        index % 2 === 0
                          ? "bg-cyan-400/20 text-cyan-200"
                          : "bg-violet-400/20 text-violet-200"
                      }`}
                      key={`${shift.userId}-${shift.startsAt.toISOString()}`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${shift.userName}: ${shift.startsAt.toISOString()} – ${shift.endsAt.toISOString()}`}
                    >
                      {shift.userName}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white">{schedule.name}</h2>
                  <Badge tone={schedule.active ? "emerald" : "red"}>
                    {schedule.active ? "active" : "inactive"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {schedule.team.name} · {schedule.timezone}
                </p>
              </div>
              {isAdmin ? (
                <form action={toggleEntityAction}>
                  <input name="entity" type="hidden" value="Schedule" />
                  <input name="id" type="hidden" value={schedule.id} />
                  <input
                    name="active"
                    type="hidden"
                    value={String(!schedule.active)}
                  />
                  <button className="text-xs text-slate-500" type="submit">
                    {schedule.active ? "Deactivate" : "Activate"}
                  </button>
                </form>
              ) : null}
            </div>
            {schedule.layers.map((layer) => (
              <div
                className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3"
                key={layer.id}
              >
                <p className="text-sm text-slate-300">
                  {layer.name} · {layer.rotationType.toLowerCase()} every{" "}
                  {layer.rotationInterval} · handoff {layer.handoffLocalTime}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {layer.participants.length} participants ·{" "}
                  {layer.restrictions.length} restrictions
                </p>
              </div>
            ))}
            {isAdmin ? (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-cyan-400">
                  Edit primary layer
                </summary>
                <div className="mt-4 rounded-xl border border-slate-800 p-4">
                  {scheduleForm(updateScheduleAction, schedule)}
                </div>
              </details>
            ) : null}
          </Card>
        ))}
      </div>

      {isAdmin ? (
        <Card className="mt-6">
          <h2 className="mb-4 font-semibold text-white">Create override</h2>
          <form
            action={createOverrideAction}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <Field label="Schedule">
              <Select name="scheduleId">
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.team.name} · {schedule.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Replacement">
              <Select name="replacementUserId">
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Replacing (optional)">
              <Select defaultValue="" name="replacedUserId">
                <option value="">Whole layer</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Starts">
              <Input
                defaultValue={localInput(new Date())}
                name="startsAt"
                type="datetime-local"
              />
            </Field>
            <Field label="Ends">
              <Input
                defaultValue={localInput(
                  new Date(Date.now() + 4 * 60 * 60_000)
                )}
                name="endsAt"
                type="datetime-local"
              />
            </Field>
            <Field label="Reason">
              <Input name="reason" placeholder="Vacation coverage" />
            </Field>
            <div className="self-end">
              <SubmitButton>Create override</SubmitButton>
            </div>
          </form>
          <div className="mt-6 grid gap-2">
            {overrides.map((override) => (
              <div
                className="flex flex-col justify-between gap-3 rounded-xl bg-slate-900/60 px-4 py-3 text-sm sm:flex-row sm:items-center"
                key={override.id}
              >
                <span>
                  <strong className="text-white">
                    {override.replacementUser.name}
                  </strong>{" "}
                  covers {override.replacedUser?.name ?? "the layer"} on{" "}
                  {override.schedule.name}
                  <span className="ml-2 text-xs text-slate-600">
                    {override.startsAt.toLocaleString()} →{" "}
                    {override.endsAt.toLocaleString()}
                  </span>
                </span>
                <form action={deleteOverrideAction}>
                  <input name="id" type="hidden" value={override.id} />
                  <button className="text-xs text-red-300" type="submit">
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </>
  );
}
