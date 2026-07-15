import type { Prisma } from "@backbeat/db";

import {
  resolveScheduleAt,
  type ScheduleSnapshot
} from "../schedules/resolve.js";

export async function expandEscalationTargets(
  transaction: Prisma.TransactionClient,
  stepId: string,
  at: Date
): Promise<string[]> {
  const step = await transaction.escalationStep.findUnique({
    where: { id: stepId },
    include: {
      targets: {
        orderBy: { position: "asc" },
        include: {
          schedule: {
            include: {
              layers: {
                orderBy: { position: "asc" },
                include: {
                  participants: {
                    orderBy: { position: "asc" },
                    include: {
                      user: {
                        select: { active: true }
                      }
                    }
                  },
                  restrictions: true
                }
              },
              overrides: true
            }
          },
          team: {
            include: {
              memberships: {
                include: {
                  user: {
                    select: { active: true }
                  }
                }
              }
            }
          },
          user: {
            select: { active: true }
          }
        }
      }
    }
  });

  if (!step) {
    throw new Error(`Escalation step ${stepId} does not exist`);
  }

  const users = new Set<string>();

  for (const target of step.targets) {
    if (target.userId && target.user?.active) {
      users.add(target.userId);
    }

    if (target.team) {
      for (const membership of target.team.memberships) {
        if (membership.user.active) users.add(membership.userId);
      }
    }

    if (target.schedule?.active) {
      const schedule: ScheduleSnapshot = {
        id: target.schedule.id,
        timezone: target.schedule.timezone,
        layers: target.schedule.layers
          .map((layer) => ({
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
          }))
          .filter(
            (layer) =>
              (!layer.activeFrom || layer.activeFrom <= at) &&
              (!layer.activeUntil || at < layer.activeUntil)
          ),
        overrides: target.schedule.overrides.map((override) => ({
          createdAt: override.createdAt,
          endsAt: override.endsAt,
          id: override.id,
          layerId: override.layerId,
          replacedUserId: override.replacedUserId,
          replacementUserId: override.replacementUserId,
          startsAt: override.startsAt
        }))
      };

      for (const onCall of resolveScheduleAt(schedule, at)) {
        users.add(onCall.userId);
      }
    }
  }

  return [...users];
}
