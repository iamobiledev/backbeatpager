import { getPrismaClient } from "@backbeat/db";
import {
  listShifts,
  resolveScheduleAt,
  type ScheduleSnapshot
} from "@backbeat/domain";

function snapshotFromRecord(
  schedule: Awaited<ReturnType<typeof loadSchedules>>[number]
): ScheduleSnapshot {
  return {
    id: schedule.id,
    layers: schedule.layers.map((layer) => ({
      activeFrom: layer.activeFrom,
      activeUntil: layer.activeUntil,
      anchorInstant: layer.anchorInstant,
      anchorLocalDate: layer.anchorLocalDate.toISOString().slice(0, 10),
      customIntervalMinutes: layer.customIntervalMinutes,
      handoffLocalTime: layer.handoffLocalTime,
      id: layer.id,
      participants: layer.participants
        .filter((participant) => participant.user.active)
        .map((participant) => ({
          position: participant.position,
          userId: participant.userId
        })),
      position: layer.position,
      restrictions: layer.restrictions.map((restriction) => ({
        dayOfWeek: restriction.dayOfWeek,
        endLocalTime: restriction.endLocalTime,
        startLocalTime: restriction.startLocalTime
      })),
      rotationInterval: layer.rotationInterval,
      rotationType: layer.rotationType
    })),
    overrides: schedule.overrides.map((override) => ({
      createdAt: override.createdAt,
      endsAt: override.endsAt,
      id: override.id,
      layerId: override.layerId,
      replacedUserId: override.replacedUserId,
      replacementUserId: override.replacementUserId,
      startsAt: override.startsAt
    })),
    timezone: schedule.timezone
  };
}

async function loadSchedules(prisma = getPrismaClient()) {
  return prisma.schedule.findMany({
    where: { active: true },
    include: {
      layers: {
        orderBy: { position: "asc" },
        include: {
          participants: {
            orderBy: { position: "asc" },
            include: { user: true }
          },
          restrictions: true
        }
      },
      overrides: true,
      team: true
    },
    orderBy: { name: "asc" }
  });
}

export async function getCurrentOnCall(
  now = new Date(),
  prisma = getPrismaClient()
) {
  const schedules = await loadSchedules(prisma);
  const ids = new Set<string>();
  const resolved = schedules.map((schedule) => {
    const onCall = resolveScheduleAt(snapshotFromRecord(schedule), now);
    for (const item of onCall) ids.add(item.userId);
    return { onCall, schedule };
  });
  const users = await prisma.user.findMany({
    where: { id: { in: [...ids] } }
  });
  const byId = new Map(users.map((user) => [user.id, user]));

  return resolved.map(({ onCall, schedule }) => ({
    scheduleId: schedule.id,
    scheduleName: schedule.name,
    teamName: schedule.team.name,
    timezone: schedule.timezone,
    users: onCall.flatMap((entry) => {
      const user = byId.get(entry.userId);
      return user
        ? [
            {
              id: user.id,
              name: user.name,
              slackUserId: user.slackUserId
            }
          ]
        : [];
    })
  }));
}

export async function getDashboardData() {
  const prisma = getPrismaClient();
  const [triggered, acknowledged, services, recentTimeline, onCall] =
    await Promise.all([
      prisma.incident.count({ where: { state: "TRIGGERED" } }),
      prisma.incident.count({ where: { state: "ACKNOWLEDGED" } }),
      prisma.service.count({ where: { active: true } }),
      prisma.incidentTimelineEntry.findMany({
        include: {
          actorUser: true,
          incident: { include: { service: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 12
      }),
      getCurrentOnCall()
    ]);

  return {
    acknowledged,
    onCall,
    recentTimeline,
    services,
    triggered
  };
}

export async function getScheduleCalendars(
  startsAt: Date,
  endsAt: Date,
  prisma = getPrismaClient()
) {
  const schedules = await loadSchedules(prisma);
  const userIds = new Set<string>();
  const calendars = schedules.map((schedule) => {
    const shifts = listShifts(snapshotFromRecord(schedule), startsAt, endsAt);
    for (const shift of shifts) userIds.add(shift.userId);
    return { schedule, shifts };
  });
  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] } }
  });
  const byId = new Map(users.map((user) => [user.id, user]));

  return calendars.map(({ schedule, shifts }) => ({
    id: schedule.id,
    name: schedule.name,
    shifts: shifts.map((shift) => ({
      endsAt: shift.endsAt,
      startsAt: shift.startsAt,
      userId: shift.userId,
      userName: byId.get(shift.userId)?.name ?? "Unknown user"
    })),
    teamName: schedule.team.name,
    timezone: schedule.timezone
  }));
}
