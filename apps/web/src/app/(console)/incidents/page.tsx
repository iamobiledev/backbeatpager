import { getPrismaClient, type IncidentState } from "@backbeat/db";
import Link from "next/link";

import {
  Badge,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Table
} from "@/components/ui";

export default async function IncidentsPage({
  searchParams
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    service?: string;
    state?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 25;
  const state =
    params.state &&
    ["TRIGGERED", "ACKNOWLEDGED", "RESOLVED"].includes(params.state)
      ? (params.state as IncidentState)
      : undefined;
  const prisma = getPrismaClient();
  const where = {
    ...(state ? { state } : {}),
    ...(params.service ? { serviceId: params.service } : {}),
    ...(params.q
      ? {
          OR: [
            { summary: { contains: params.q, mode: "insensitive" as const } },
            { dedupKey: { contains: params.q, mode: "insensitive" as const } }
          ]
        }
      : {})
  };
  const [incidents, total, services] = await Promise.all([
    prisma.incident.findMany({
      where,
      include: { assignee: true, service: true },
      orderBy: { openedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.incident.count({ where }),
    prisma.service.findMany({ orderBy: { name: "asc" } })
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHeader
        description="Search, filter, and inspect every alert group and lifecycle transition."
        title="Incidents"
      />
      <Card className="mb-6">
        <form className="grid gap-3 sm:grid-cols-4">
          <Input
            defaultValue={params.q}
            name="q"
            placeholder="Search summary or dedup key"
          />
          <Select defaultValue={params.state ?? ""} name="state">
            <option value="">All states</option>
            <option value="TRIGGERED">Triggered</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </Select>
          <Select defaultValue={params.service ?? ""} name="service">
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </Select>
          <button
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            type="submit"
          >
            Apply filters
          </button>
        </form>
      </Card>
      <Card>
        {incidents.length ? (
          <>
            <Table>
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase">
                  <th className="px-3 py-3">Incident</th>
                  <th className="px-3 py-3">Service</th>
                  <th className="px-3 py-3">State</th>
                  <th className="px-3 py-3">Severity</th>
                  <th className="px-3 py-3">Assignee</th>
                  <th className="px-3 py-3">Opened</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr className="border-b border-slate-900" key={incident.id}>
                    <td className="px-3 py-4">
                      <Link
                        className="font-medium text-white hover:text-cyan-300"
                        href={`/incidents/${incident.number}`}
                      >
                        #{incident.number} {incident.summary}
                      </Link>
                      <p className="mt-1 text-xs text-slate-600">
                        {incident.dedupKey}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-slate-400">
                      {incident.service.name}
                    </td>
                    <td className="px-3 py-4">
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
                    </td>
                    <td className="px-3 py-4 text-slate-400">
                      {incident.severity.toLowerCase()}
                    </td>
                    <td className="px-3 py-4 text-slate-400">
                      {incident.assignee?.name ?? "Unassigned"}
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-500">
                      {incident.openedAt.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>
                {total} incidents · page {page} of {pages}
              </span>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Link
                    className="rounded border border-slate-700 px-3 py-1.5"
                    href={{
                      pathname: "/incidents",
                      query: { ...params, page: page - 1 }
                    }}
                  >
                    Previous
                  </Link>
                ) : null}
                {page < pages ? (
                  <Link
                    className="rounded border border-slate-700 px-3 py-1.5"
                    href={{
                      pathname: "/incidents",
                      query: { ...params, page: page + 1 }
                    }}
                  >
                    Next
                  </Link>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            description="Try a different state, service, or search term."
            title="No incidents matched"
          />
        )}
      </Card>
    </>
  );
}
