import { AlarmClock, BellRing, Blocks, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { getDashboardData } from "@/lib/admin/queries";

function metric(
  label: string,
  value: number,
  icon: typeof BellRing,
  tone: string
) {
  const Icon = icon;
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </div>
        <span
          className={`flex size-10 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
    </Card>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageHeader
        description="Live incident posture, active rotations, and recent response activity."
        title="Response overview"
      >
        <Link
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          href="/incidents"
        >
          View incidents
        </Link>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metric(
          "Triggered incidents",
          data.triggered,
          BellRing,
          "bg-red-500/10 text-red-300"
        )}
        {metric(
          "Acknowledged",
          data.acknowledged,
          CheckCircle2,
          "bg-amber-500/10 text-amber-300"
        )}
        {metric(
          "Active services",
          data.services,
          Blocks,
          "bg-cyan-500/10 text-cyan-300"
        )}
        {metric(
          "Active schedules",
          data.onCall.length,
          AlarmClock,
          "bg-violet-500/10 text-violet-300"
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">On call now</h2>
            <Link className="text-xs text-cyan-400" href="/schedules">
              Manage schedules
            </Link>
          </div>
          <div className="grid gap-3">
            {data.onCall.length > 0 ? (
              data.onCall.map((schedule) => (
                <div
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                  key={schedule.scheduleId}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">
                        {schedule.teamName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {schedule.scheduleName} · {schedule.timezone}
                      </p>
                    </div>
                    <Badge tone={schedule.users.length ? "emerald" : "red"}>
                      {schedule.users.length ? "covered" : "uncovered"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    {schedule.users.length
                      ? schedule.users.map((user) => user.name).join(", ")
                      : "No active layer"}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                description="Create a schedule and add rotation participants."
                title="No active schedules"
              />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-white">Recent activity</h2>
          <div className="grid gap-4">
            {data.recentTimeline.length > 0 ? (
              data.recentTimeline.map((entry) => (
                <div className="flex gap-3" key={entry.id}>
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-cyan-400" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-300">{entry.message}</p>
                    <p className="mt-1 truncate text-xs text-slate-600">
                      #{entry.incident.number} · {entry.incident.service.name} ·{" "}
                      {entry.actorUser?.name ?? entry.actorKind.toLowerCase()} ·{" "}
                      {entry.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                description="Incident lifecycle events will appear here."
                title="No recent activity"
              />
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
