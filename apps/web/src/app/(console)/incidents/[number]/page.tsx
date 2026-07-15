import { getPrismaClient } from "@backbeat/db";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { incidentAction } from "@/app/(console)/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge, Card, Input, PageHeader } from "@/components/ui";

export default async function IncidentDetailPage({
  params
}: {
  params: Promise<{ number: string }>;
}) {
  const number = Number((await params).number);
  if (!Number.isInteger(number) || number <= 0) notFound();

  const incident = await getPrismaClient().incident.findUnique({
    where: { number },
    include: {
      alerts: {
        include: {
          alert: {
            include: {
              occurrences: {
                orderBy: { receivedAt: "desc" },
                take: 10
              }
            }
          }
        }
      },
      assignee: true,
      currentStep: true,
      notificationLogs: {
        orderBy: { createdAt: "desc" }
      },
      service: { include: { team: true } },
      slackMessages: true,
      timelineEntries: {
        include: { actorUser: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });
  if (!incident) notFound();

  return (
    <>
      <Link
        className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white"
        href="/incidents"
      >
        <ArrowLeft className="size-4" /> Back to incidents
      </Link>
      <PageHeader
        description={`${incident.service.team.name} · ${incident.service.name} · ${incident.source}`}
        title={`#${incident.number} ${incident.summary}`}
      >
        <Badge
          tone={
            incident.state === "TRIGGERED"
              ? "red"
              : incident.state === "ACKNOWLEDGED"
                ? "amber"
                : "emerald"
          }
        >
          {incident.state.toLowerCase()}
        </Badge>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Card>
            <h2 className="font-semibold text-white">Timeline</h2>
            <div className="mt-5 grid gap-5">
              {incident.timelineEntries.map((entry) => (
                <div className="relative pl-6" key={entry.id}>
                  <span className="absolute top-1.5 left-0 size-2 rounded-full bg-cyan-400" />
                  <p className="text-sm text-slate-300">{entry.message}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {entry.actorUser?.name ??
                      entry.slackUserId ??
                      entry.actorKind.toLowerCase()}{" "}
                    · {entry.createdAt.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-white">Alert payloads</h2>
            <div className="mt-4 grid gap-4">
              {incident.alerts.map(({ alert }) => (
                <details
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                  key={alert.id}
                >
                  <summary className="cursor-pointer text-sm text-slate-300">
                    {alert.source} · {alert.occurrenceCount} occurrences ·{" "}
                    {alert.status.toLowerCase()}
                  </summary>
                  <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-slate-400">
                    {JSON.stringify(alert.latestPayload, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-white">Notification attempts</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead className="text-slate-600 uppercase">
                  <tr>
                    <th className="py-2">Channel</th>
                    <th>Target</th>
                    <th>Status</th>
                    <th>Attempts</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {incident.notificationLogs.map((log) => (
                    <tr className="border-t border-slate-900" key={log.id}>
                      <td className="py-3">{log.channel.toLowerCase()}</td>
                      <td>{log.targetAddress}</td>
                      <td>{log.status.toLowerCase()}</td>
                      <td>{log.attempt}</td>
                      <td>{log.createdAt.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="grid content-start gap-4">
          <Card>
            <h2 className="font-semibold text-white">Incident details</h2>
            <dl className="mt-4 grid gap-4 text-sm">
              <div>
                <dt className="text-xs text-slate-600">Severity</dt>
                <dd className="mt-1 text-slate-300">
                  {incident.severity.toLowerCase()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-600">Assignee</dt>
                <dd className="mt-1 text-slate-300">
                  {incident.assignee?.name ?? "Unassigned"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-600">Escalation</dt>
                <dd className="mt-1 text-slate-300">
                  loop {incident.currentEscalationLoop + 1} · step{" "}
                  {incident.currentStep?.position !== undefined
                    ? incident.currentStep.position + 1
                    : "complete"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-600">Opened</dt>
                <dd className="mt-1 text-slate-300">
                  {incident.openedAt.toLocaleString()}
                </dd>
              </div>
            </dl>
            {incident.sourceUrl ? (
              <a
                className="mt-5 inline-flex items-center gap-2 text-xs text-cyan-400"
                href={incident.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open source <ExternalLink className="size-3" />
              </a>
            ) : null}
          </Card>

          {incident.state !== "RESOLVED" ? (
            <Card>
              <h2 className="mb-4 font-semibold text-white">Actions</h2>
              {incident.state === "TRIGGERED" ? (
                <form action={incidentAction} className="mb-3">
                  <input name="action" type="hidden" value="acknowledge" />
                  <input name="incidentId" type="hidden" value={incident.id} />
                  <input name="number" type="hidden" value={incident.number} />
                  <input
                    name="version"
                    type="hidden"
                    value={incident.version}
                  />
                  <SubmitButton>Acknowledge</SubmitButton>
                </form>
              ) : null}
              <form action={incidentAction} className="grid gap-3">
                <input name="action" type="hidden" value="resolve" />
                <input name="incidentId" type="hidden" value={incident.id} />
                <input name="number" type="hidden" value={incident.number} />
                <input name="version" type="hidden" value={incident.version} />
                <Input name="note" placeholder="Optional resolution note" />
                <SubmitButton destructive>Resolve incident</SubmitButton>
              </form>
            </Card>
          ) : null}

          {incident.slackMessages.length ? (
            <Card>
              <h2 className="font-semibold text-white">Slack projections</h2>
              <ul className="mt-3 grid gap-2 text-xs text-slate-500">
                {incident.slackMessages.map((message) => (
                  <li key={message.id}>
                    {message.destination.toLowerCase()} · {message.channelId} ·{" "}
                    {message.messageTs}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </aside>
      </div>
    </>
  );
}
