import type { PrismaClient } from "@backbeat/db";

export interface AnalyticsQuery {
  from: Date;
  teamId?: string;
  to: Date;
}

export interface ServiceAnalytics {
  alertOccurrences: number;
  incidentCount: number;
  serviceId: string;
  serviceName: string;
}

export interface IncidentAnalytics {
  acknowledgedCount: number;
  alertOccurrences: number;
  alertsPerIncident: number;
  incidentCount: number;
  incidentsByDay: Array<{ count: number; day: string }>;
  mttaSeconds: number | null;
  mttrSeconds: number | null;
  openCount: number;
  resolvedCount: number;
  services: ServiceAnalytics[];
  severity: {
    critical: number;
    info: number;
    warning: number;
  };
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function getIncidentAnalytics(
  prisma: PrismaClient,
  query: AnalyticsQuery
): Promise<IncidentAnalytics> {
  if (query.to <= query.from) {
    throw new Error("Analytics range must end after it starts");
  }

  const incidents = await prisma.incident.findMany({
    where: {
      openedAt: {
        gte: query.from,
        lt: query.to
      },
      ...(query.teamId ? { service: { teamId: query.teamId } } : {})
    },
    include: {
      alerts: {
        include: {
          alert: {
            select: { occurrenceCount: true }
          }
        }
      },
      service: {
        select: { id: true, name: true }
      }
    }
  });
  const serviceMap = new Map<string, ServiceAnalytics>();
  const dayMap = new Map<string, number>();
  const mtta: number[] = [];
  const mttr: number[] = [];
  let alertOccurrences = 0;
  let critical = 0;
  let warning = 0;
  let info = 0;

  for (const incident of incidents) {
    const occurrences = incident.alerts.reduce(
      (sum, linked) => sum + linked.alert.occurrenceCount,
      0
    );
    alertOccurrences += occurrences;
    const service = serviceMap.get(incident.service.id) ?? {
      alertOccurrences: 0,
      incidentCount: 0,
      serviceId: incident.service.id,
      serviceName: incident.service.name
    };
    service.alertOccurrences += occurrences;
    service.incidentCount += 1;
    serviceMap.set(incident.service.id, service);

    const day = incident.openedAt.toISOString().slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
    if (incident.acknowledgedAt) {
      mtta.push(
        (incident.acknowledgedAt.getTime() - incident.openedAt.getTime()) / 1000
      );
    }
    if (incident.resolvedAt) {
      mttr.push(
        (incident.resolvedAt.getTime() - incident.openedAt.getTime()) / 1000
      );
    }
    if (incident.severity === "CRITICAL") critical += 1;
    else if (incident.severity === "WARNING") warning += 1;
    else info += 1;
  }

  return {
    acknowledgedCount: incidents.filter(
      (incident) => incident.acknowledgedAt !== null
    ).length,
    alertOccurrences,
    alertsPerIncident:
      incidents.length > 0 ? alertOccurrences / incidents.length : 0,
    incidentCount: incidents.length,
    incidentsByDay: [...dayMap.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([day, count]) => ({ count, day })),
    mttaSeconds: average(mtta),
    mttrSeconds: average(mttr),
    openCount: incidents.filter((incident) => incident.state !== "RESOLVED")
      .length,
    resolvedCount: incidents.filter((incident) => incident.state === "RESOLVED")
      .length,
    services: [...serviceMap.values()].sort(
      (left, right) =>
        right.alertOccurrences - left.alertOccurrences ||
        right.incidentCount - left.incidentCount
    ),
    severity: { critical, info, warning }
  };
}
