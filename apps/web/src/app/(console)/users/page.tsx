import { getPrismaClient } from "@backbeat/db";

import {
  createUserAction,
  toggleEntityAction,
  updateUserAction
} from "@/app/(console)/actions";
import { SubmitButton } from "@/components/submit-button";
import {
  Badge,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Table
} from "@/components/ui";
import { requireActor } from "@/lib/authz";

function preference(value: unknown, key: "email" | "slack"): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    key in value &&
    (value as Record<string, unknown>)[key] === true
  );
}

export default async function UsersPage() {
  const actor = await requireActor();
  const users = await getPrismaClient().user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }]
  });
  const isAdmin = actor.role === "ADMIN";

  return (
    <>
      <PageHeader
        description="Responders, administrator roles, timezones, Slack mapping, and notification preferences."
        title="Users"
      />
      {isAdmin ? (
        <Card className="mb-6">
          <h2 className="mb-4 font-semibold text-white">Add user</h2>
          <form
            action={createUserAction}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <Field label="Name">
              <Input name="name" placeholder="Alice Engineer" required />
            </Field>
            <Field label="Work email">
              <Input
                name="email"
                placeholder="alice@example.com"
                required
                type="email"
              />
            </Field>
            <Field label="Timezone">
              <Input name="timezone" defaultValue="UTC" required />
            </Field>
            <Field label="Role">
              <Select defaultValue="RESPONDER" name="role">
                <option value="RESPONDER">Responder</option>
                <option value="ADMIN">Administrator</option>
              </Select>
            </Field>
            <Field label="Slack user ID (optional)">
              <Input name="slackUserId" placeholder="U0123456789" />
            </Field>
            <label className="flex items-center gap-2 self-end py-2 text-sm text-slate-300">
              <input defaultChecked name="slackNotifications" type="checkbox" />
              Slack notifications
            </label>
            <label className="flex items-center gap-2 self-end py-2 text-sm text-slate-300">
              <input name="emailNotifications" type="checkbox" />
              Email notifications
            </label>
            <div className="self-end">
              <SubmitButton>Add user</SubmitButton>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        <Table>
          <thead>
            <tr className="border-b border-slate-800 text-xs tracking-wider text-slate-500 uppercase">
              <th className="px-3 py-3">User</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Timezone</th>
              <th className="px-3 py-3">Slack</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr className="border-b border-slate-900" key={user.id}>
                <td className="px-3 py-4">
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </td>
                <td className="px-3 py-4">
                  <Badge tone={user.role === "ADMIN" ? "cyan" : "slate"}>
                    {user.role.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-3 py-4 text-slate-400">{user.timezone}</td>
                <td className="px-3 py-4 text-slate-400">
                  {user.slackUserId ?? "Unmapped"}
                </td>
                <td className="px-3 py-4">
                  <Badge tone={user.active ? "emerald" : "red"}>
                    {user.active ? "active" : "inactive"}
                  </Badge>
                </td>
                <td className="px-3 py-4">
                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <details>
                        <summary className="cursor-pointer text-xs text-cyan-400">
                          Edit
                        </summary>
                        <form
                          action={updateUserAction}
                          className="absolute right-8 z-10 mt-2 grid w-80 gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 shadow-xl"
                        >
                          <input name="id" type="hidden" value={user.id} />
                          <Input
                            defaultValue={user.name}
                            name="name"
                            required
                          />
                          <Input
                            defaultValue={user.email}
                            name="email"
                            required
                            type="email"
                          />
                          <Input
                            defaultValue={user.timezone}
                            name="timezone"
                            required
                          />
                          <Select defaultValue={user.role} name="role">
                            <option value="RESPONDER">Responder</option>
                            <option value="ADMIN">Administrator</option>
                          </Select>
                          <Input
                            defaultValue={user.slackUserId ?? ""}
                            name="slackUserId"
                            placeholder="Slack user ID"
                          />
                          <label className="flex gap-2 text-xs">
                            <input
                              defaultChecked={
                                preference(
                                  user.notificationPreferences,
                                  "slack"
                                ) ||
                                !(
                                  typeof user.notificationPreferences ===
                                    "object" &&
                                  user.notificationPreferences !== null &&
                                  "slack" in user.notificationPreferences
                                )
                              }
                              name="slackNotifications"
                              type="checkbox"
                            />
                            Slack notifications
                          </label>
                          <label className="flex gap-2 text-xs">
                            <input
                              defaultChecked={preference(
                                user.notificationPreferences,
                                "email"
                              )}
                              name="emailNotifications"
                              type="checkbox"
                            />
                            Email notifications
                          </label>
                          <SubmitButton>Save</SubmitButton>
                        </form>
                      </details>
                      <form action={toggleEntityAction}>
                        <input name="entity" type="hidden" value="User" />
                        <input name="id" type="hidden" value={user.id} />
                        <input
                          name="active"
                          type="hidden"
                          value={String(!user.active)}
                        />
                        <button
                          className="text-xs text-slate-500 hover:text-white"
                          type="submit"
                        >
                          {user.active ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">Read only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
