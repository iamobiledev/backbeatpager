import { getPrismaClient } from "@backbeat/db";
import { getIncidentAnalytics } from "@backbeat/domain";

import { Card, EmptyState, PageHeader, Select } from "@/components/ui";

function duration(seconds: number | null): string {
  if (seconds === null) return "No data";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams: Promise<{ days?: string; team?: string }>;
}) {
  const params = await searchParams;
  const days = [7, 30, 90].includes(Number(params.days))
    ? Number(params.days)
    : 30;
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60_000);
  const prisma = getPrismaClient();
  const [analytics, teams] = await Promise.all([
    getIncidentAnalytics(prisma, {
      from,
      ...(params.team ? { teamId: params.team } : {}),
      to
    }),
    prisma.team.findMany({
      where: { active: true },
      orderBy: { name: "asc" }
    })
  ]);
  const maxDaily = Math.max(
    1,
    ...analytics.incidentsByDay.map((item) => item.count)
  );

  return (
    <>
      <PageHeader
        description="Incident volume, response speed, alert noise, and service hotspots."
        title="Analytics"
      />
      <Card className="mb-6">
        <form className="grid gap-3 sm:grid-cols-3">
          <Select defaultValue={String(days)} name="days">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </Select>
          <Select defaultValue={params.team ?? ""} name="team">
            <option value="">All teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </Select>
          <button
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
            type="submit"
          >
            Update range
          </button>
        </form>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Incidents", String(analytics.incidentCount)],
          ["MTTA", duration(analytics.mttaSeconds)],
          ["MTTR", duration(analytics.mttrSeconds)],
          ["Alerts / incident", analytics.alertsPerIncident.toFixed(1)],
          ["Open now", String(analytics.openCount)]
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="font-semibold text-white">Incidents by day</h2>
          {analytics.incidentsByDay.length ? (
            <div className="mt-6 flex h-48 items-end gap-2">
              {analytics.incidentsByDay.map((item) => (
                <div
                  className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  key={item.day}
                >
                  <span className="text-[10px] text-slate-400">
                    {item.count}
                  </span>
                  <div
                    className="w-full min-w-2 rounded-t bg-cyan-400/70"
                    style={{
                      height: `${Math.max(6, (item.count / maxDaily) * 140)}px`
                    }}
                  />
                  <span className="-rotate-45 text-[9px] whitespace-nowrap text-slate-500">
                    {item.day.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                description="No incidents opened in this range."
                title="No trend data"
              />
            </div>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold text-white">Severity mix</h2>
          <div className="mt-6 grid gap-4">
            {[
              ["Critical", analytics.severity.critical, "bg-red-400"],
              ["Warning", analytics.severity.warning, "bg-amber-400"],
              ["Info", analytics.severity.info, "bg-blue-400"]
            ].map(([label, count, color]) => {
              const numericCount = Number(count);
              return (
                <div key={String(label)}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{label}</span>
                    <span>{numericCount}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-slate-900">
                    <div
                      className={`h-full ${String(color)}`}
                      style={{
                        width: `${analytics.incidentCount ? (numericCount / analytics.incidentCount) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-semibold text-white">Noisiest services</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-slate-500 uppercase">
              <tr>
                <th className="py-2">Service</th>
                <th>Incidents</th>
                <th>Alert occurrences</th>
                <th>Alerts / incident</th>
              </tr>
            </thead>
            <tbody>
              {analytics.services.map((service) => (
                <tr
                  className="border-t border-slate-900"
                  key={service.serviceId}
                >
                  <td className="py-3 font-medium text-white">
                    {service.serviceName}
                  </td>
                  <td>{service.incidentCount}</td>
                  <td>{service.alertOccurrences}</td>
                  <td>
                    {(service.alertOccurrences / service.incidentCount).toFixed(
                      1
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
