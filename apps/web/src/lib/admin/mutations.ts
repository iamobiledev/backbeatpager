import {
  RotationType,
  TeamMembershipRole,
  UserRole,
  type Prisma,
  type PrismaClient
} from "@backbeat/db";
import { generateRoutingKey } from "@backbeat/db/routing-keys";
import { localHandoffToDate } from "@backbeat/domain";
import { z } from "zod";

export interface AdminMutationActor {
  id: string;
  role: UserRole;
}

export class AdminAuthorizationError extends Error {
  constructor() {
    super("Administrator access is required");
    this.name = "AdminAuthorizationError";
  }
}

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const timezoneSchema = z
  .string()
  .trim()
  .min(1)
  .refine((timezone) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }, "Enter a valid IANA timezone");

export const userInputSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  emailNotifications: z.boolean().default(false),
  name: z.string().trim().min(2).max(120),
  role: z.enum(UserRole),
  slackNotifications: z.boolean().default(true),
  slackUserId: z.string().trim().max(30).nullable().default(null),
  timezone: timezoneSchema
});
export type UserInput = z.infer<typeof userInputSchema>;

export const teamInputSchema = z.object({
  description: z.string().trim().max(500).nullable().default(null),
  digestDayOfWeek: z.number().int().min(0).max(6).default(1),
  digestEnabled: z.boolean().default(true),
  digestLocalTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .default("09:00"),
  handoffMessagesEnabled: z.boolean().default(true),
  memberIds: z.array(z.uuid()).default([]),
  name: z.string().trim().min(2).max(120),
  slackChannelId: z.string().trim().max(30).nullable().default(null),
  slug: slugSchema,
  timezone: timezoneSchema
});
export type TeamInput = z.infer<typeof teamInputSchema>;

export const scheduleInputSchema = z
  .object({
    anchorLocalDate: z.iso.date(),
    customIntervalMinutes: z.number().int().positive().nullable().default(null),
    handoffLocalTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    name: z.string().trim().min(2).max(120),
    participantIds: z.array(z.uuid()).min(1),
    restrictions: z
      .array(
        z.object({
          dayOfWeek: z.number().int().min(0).max(6),
          endLocalTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
          startLocalTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)
        })
      )
      .default([]),
    rotationInterval: z.number().int().positive().default(1),
    rotationType: z.enum(RotationType),
    slug: slugSchema,
    teamId: z.uuid(),
    timezone: timezoneSchema
  })
  .refine(
    (input) =>
      input.rotationType !== RotationType.CUSTOM ||
      input.customIntervalMinutes !== null,
    {
      message: "Custom rotations require an interval in minutes",
      path: ["customIntervalMinutes"]
    }
  );
export type ScheduleInput = z.infer<typeof scheduleInputSchema>;

export const policyInputSchema = z.object({
  acknowledgementTimeoutMinutes: z.number().int().positive().nullable(),
  name: z.string().trim().min(2).max(120),
  repeatCount: z.number().int().min(0).max(20),
  slug: slugSchema,
  steps: z
    .array(
      z.object({
        targetId: z.uuid(),
        targetType: z.enum(["schedule", "team", "user"]),
        timeoutMinutes: z.number().int().positive().max(1440)
      })
    )
    .min(1),
  teamId: z.uuid()
});
export type PolicyInput = z.infer<typeof policyInputSchema>;

export const serviceInputSchema = z.object({
  autoCreateIncidentChannel: z.boolean().default(false),
  criticalChannelThresholdMinutes: z.number().int().positive().nullable(),
  escalationPolicyId: z.uuid(),
  incidentChannelsPrivate: z.boolean().default(false),
  name: z.string().trim().min(2).max(120),
  nagCriticalMinutes: z.number().int().positive().nullable(),
  nagWarningMinutes: z.number().int().positive().nullable(),
  slackChannelId: z.string().trim().max(30).nullable().default(null),
  slug: slugSchema,
  teamId: z.uuid()
});
export type ServiceInput = z.infer<typeof serviceInputSchema>;

export const overrideInputSchema = z
  .object({
    endsAt: z.coerce.date(),
    reason: z.string().trim().max(500).nullable().default(null),
    replacedUserId: z.uuid().nullable().default(null),
    replacementUserId: z.uuid(),
    scheduleId: z.uuid(),
    startsAt: z.coerce.date()
  })
  .refine((value) => value.endsAt > value.startsAt, {
    message: "Override end must be after start",
    path: ["endsAt"]
  });
export type OverrideInput = z.infer<typeof overrideInputSchema>;

function assertAdministrator(actor: AdminMutationActor): void {
  if (actor.role !== UserRole.ADMIN) throw new AdminAuthorizationError();
}

async function audit(
  transaction: Prisma.TransactionClient,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  changes: Prisma.InputJsonValue
): Promise<void> {
  await transaction.auditLog.create({
    data: {
      action,
      actorUserId: actorId,
      changes,
      entityId,
      entityType
    }
  });
}

export async function createUser(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  rawInput: UserInput
) {
  assertAdministrator(actor);
  const input = userInputSchema.parse(rawInput);
  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.create({
      data: {
        email: input.email,
        name: input.name,
        notificationPreferences: {
          email: input.emailNotifications,
          slack: input.slackNotifications
        },
        role: input.role,
        slackUserId: input.slackUserId,
        timezone: input.timezone
      }
    });
    await audit(transaction, actor.id, "CREATE", "User", user.id, {
      email: user.email,
      role: user.role
    });
    return user;
  });
}

export async function updateUser(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  userId: string,
  rawInput: UserInput
) {
  assertAdministrator(actor);
  const input = userInputSchema.parse(rawInput);
  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.update({
      where: { id: z.uuid().parse(userId) },
      data: {
        email: input.email,
        name: input.name,
        notificationPreferences: {
          email: input.emailNotifications,
          slack: input.slackNotifications
        },
        role: input.role,
        slackUserId: input.slackUserId,
        timezone: input.timezone
      }
    });
    await audit(transaction, actor.id, "UPDATE", "User", user.id, {
      email: user.email,
      role: user.role
    });
    return user;
  });
}

export async function setEntityActive(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  entity: "EscalationPolicy" | "Schedule" | "Service" | "Team" | "User",
  id: string,
  active: boolean
): Promise<void> {
  assertAdministrator(actor);
  const entityId = z.uuid().parse(id);
  await prisma.$transaction(async (transaction) => {
    switch (entity) {
      case "User":
        await transaction.user.update({
          where: { id: entityId },
          data: { active }
        });
        break;
      case "Team":
        await transaction.team.update({
          where: { id: entityId },
          data: { active }
        });
        break;
      case "Service":
        await transaction.service.update({
          where: { id: entityId },
          data: { active }
        });
        break;
      case "Schedule":
        await transaction.schedule.update({
          where: { id: entityId },
          data: { active }
        });
        break;
      case "EscalationPolicy":
        await transaction.escalationPolicy.update({
          where: { id: entityId },
          data: { active }
        });
        break;
    }
    await audit(
      transaction,
      actor.id,
      active ? "ACTIVATE" : "DEACTIVATE",
      entity,
      entityId,
      { active }
    );
  });
}

export async function createTeam(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  rawInput: TeamInput
) {
  assertAdministrator(actor);
  const input = teamInputSchema.parse(rawInput);
  return prisma.$transaction(async (transaction) => {
    const team = await transaction.team.create({
      data: {
        description: input.description,
        digestDayOfWeek: input.digestDayOfWeek,
        digestEnabled: input.digestEnabled,
        digestLocalTime: input.digestLocalTime,
        handoffMessagesEnabled: input.handoffMessagesEnabled,
        name: input.name,
        slackChannelId: input.slackChannelId,
        slug: input.slug,
        timezone: input.timezone,
        memberships: {
          create: input.memberIds.map((userId, position) => ({
            role:
              position === 0
                ? TeamMembershipRole.MANAGER
                : TeamMembershipRole.MEMBER,
            userId
          }))
        }
      }
    });
    await audit(transaction, actor.id, "CREATE", "Team", team.id, {
      memberCount: input.memberIds.length,
      slug: team.slug
    });
    return team;
  });
}

export async function updateTeam(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  teamId: string,
  rawInput: TeamInput
) {
  assertAdministrator(actor);
  const input = teamInputSchema.parse(rawInput);
  return prisma.$transaction(async (transaction) => {
    const team = await transaction.team.update({
      where: { id: z.uuid().parse(teamId) },
      data: {
        description: input.description,
        digestDayOfWeek: input.digestDayOfWeek,
        digestEnabled: input.digestEnabled,
        digestLocalTime: input.digestLocalTime,
        handoffMessagesEnabled: input.handoffMessagesEnabled,
        name: input.name,
        slackChannelId: input.slackChannelId,
        slug: input.slug,
        timezone: input.timezone,
        memberships: {
          deleteMany: {},
          create: input.memberIds.map((userId, position) => ({
            role:
              position === 0
                ? TeamMembershipRole.MANAGER
                : TeamMembershipRole.MEMBER,
            userId
          }))
        }
      }
    });
    await audit(transaction, actor.id, "UPDATE", "Team", team.id, {
      memberCount: input.memberIds.length,
      slug: team.slug
    });
    return team;
  });
}

export async function createSchedule(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  rawInput: ScheduleInput
) {
  assertAdministrator(actor);
  const input = scheduleInputSchema.parse(rawInput);
  const anchorInstant = localHandoffToDate(
    input.anchorLocalDate,
    input.handoffLocalTime,
    input.timezone
  );
  return prisma.$transaction(async (transaction) => {
    const membershipCount = await transaction.teamMembership.count({
      where: {
        teamId: input.teamId,
        userId: { in: [...new Set(input.participantIds)] }
      }
    });
    if (membershipCount !== new Set(input.participantIds).size) {
      throw new Error("Every schedule participant must belong to the team");
    }
    const schedule = await transaction.schedule.create({
      data: {
        name: input.name,
        slug: input.slug,
        teamId: input.teamId,
        timezone: input.timezone,
        layers: {
          create: {
            anchorInstant,
            anchorLocalDate: new Date(`${input.anchorLocalDate}T00:00:00.000Z`),
            customIntervalMinutes:
              input.rotationType === RotationType.CUSTOM
                ? input.customIntervalMinutes
                : null,
            handoffLocalTime: input.handoffLocalTime,
            name: "Primary",
            position: 0,
            rotationInterval: input.rotationInterval,
            rotationType: input.rotationType,
            participants: {
              create: input.participantIds.map((userId, position) => ({
                position,
                userId
              }))
            },
            restrictions: {
              create: input.restrictions
            }
          }
        }
      }
    });
    await audit(transaction, actor.id, "CREATE", "Schedule", schedule.id, {
      participantCount: input.participantIds.length,
      timezone: input.timezone
    });
    return schedule;
  });
}

export async function updateSchedule(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  scheduleId: string,
  rawInput: ScheduleInput
) {
  assertAdministrator(actor);
  const input = scheduleInputSchema.parse(rawInput);
  const anchorInstant = localHandoffToDate(
    input.anchorLocalDate,
    input.handoffLocalTime,
    input.timezone
  );
  return prisma.$transaction(async (transaction) => {
    const membershipCount = await transaction.teamMembership.count({
      where: {
        teamId: input.teamId,
        userId: { in: [...new Set(input.participantIds)] }
      }
    });
    if (membershipCount !== new Set(input.participantIds).size) {
      throw new Error("Every schedule participant must belong to the team");
    }
    const schedule = await transaction.schedule.update({
      where: { id: z.uuid().parse(scheduleId) },
      data: {
        name: input.name,
        slug: input.slug,
        teamId: input.teamId,
        timezone: input.timezone,
        layers: {
          deleteMany: {},
          create: {
            anchorInstant,
            anchorLocalDate: new Date(`${input.anchorLocalDate}T00:00:00.000Z`),
            customIntervalMinutes:
              input.rotationType === RotationType.CUSTOM
                ? input.customIntervalMinutes
                : null,
            handoffLocalTime: input.handoffLocalTime,
            name: "Primary",
            position: 0,
            rotationInterval: input.rotationInterval,
            rotationType: input.rotationType,
            participants: {
              create: input.participantIds.map((userId, position) => ({
                position,
                userId
              }))
            },
            restrictions: {
              create: input.restrictions
            }
          }
        }
      }
    });
    await audit(transaction, actor.id, "UPDATE", "Schedule", schedule.id, {
      participantCount: input.participantIds.length,
      timezone: input.timezone
    });
    return schedule;
  });
}

export async function createScheduleOverride(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  rawInput: OverrideInput
) {
  assertAdministrator(actor);
  const input = overrideInputSchema.parse(rawInput);
  return prisma.$transaction(async (transaction) => {
    const created = await transaction.scheduleOverride.create({
      data: {
        createdById: actor.id,
        endsAt: input.endsAt,
        reason: input.reason,
        replacedUserId: input.replacedUserId,
        replacementUserId: input.replacementUserId,
        scheduleId: input.scheduleId,
        startsAt: input.startsAt
      }
    });
    await audit(
      transaction,
      actor.id,
      "CREATE",
      "ScheduleOverride",
      created.id,
      {
        endsAt: input.endsAt.toISOString(),
        scheduleId: input.scheduleId,
        startsAt: input.startsAt.toISOString()
      }
    );
    return created;
  });
}

export async function deleteScheduleOverride(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  overrideId: string
): Promise<void> {
  assertAdministrator(actor);
  await prisma.$transaction(async (transaction) => {
    const id = z.uuid().parse(overrideId);
    await transaction.scheduleOverride.delete({ where: { id } });
    await audit(transaction, actor.id, "DELETE", "ScheduleOverride", id, {});
  });
}

export async function createEscalationPolicy(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  rawInput: PolicyInput
) {
  assertAdministrator(actor);
  const input = policyInputSchema.parse(rawInput);
  return prisma.$transaction(async (transaction) => {
    const policy = await transaction.escalationPolicy.create({
      data: {
        acknowledgementTimeoutMinutes: input.acknowledgementTimeoutMinutes,
        name: input.name,
        repeatCount: input.repeatCount,
        slug: input.slug,
        teamId: input.teamId,
        steps: {
          create: input.steps.map((step, position) => ({
            position,
            timeoutMinutes: step.timeoutMinutes,
            targets: {
              create: {
                position: 0,
                ...(step.targetType === "user"
                  ? { userId: step.targetId }
                  : step.targetType === "schedule"
                    ? { scheduleId: step.targetId }
                    : { teamId: step.targetId })
              }
            }
          }))
        }
      }
    });
    await audit(
      transaction,
      actor.id,
      "CREATE",
      "EscalationPolicy",
      policy.id,
      {
        repeatCount: input.repeatCount,
        stepCount: input.steps.length
      }
    );
    return policy;
  });
}

export async function updateEscalationPolicy(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  policyId: string,
  rawInput: PolicyInput
) {
  assertAdministrator(actor);
  const input = policyInputSchema.parse(rawInput);
  return prisma.$transaction(async (transaction) => {
    const policy = await transaction.escalationPolicy.update({
      where: { id: z.uuid().parse(policyId) },
      data: {
        acknowledgementTimeoutMinutes: input.acknowledgementTimeoutMinutes,
        name: input.name,
        repeatCount: input.repeatCount,
        slug: input.slug,
        teamId: input.teamId,
        steps: {
          deleteMany: {},
          create: input.steps.map((step, position) => ({
            position,
            timeoutMinutes: step.timeoutMinutes,
            targets: {
              create: {
                position: 0,
                ...(step.targetType === "user"
                  ? { userId: step.targetId }
                  : step.targetType === "schedule"
                    ? { scheduleId: step.targetId }
                    : { teamId: step.targetId })
              }
            }
          }))
        }
      }
    });
    await audit(
      transaction,
      actor.id,
      "UPDATE",
      "EscalationPolicy",
      policy.id,
      {
        repeatCount: input.repeatCount,
        stepCount: input.steps.length
      }
    );
    return policy;
  });
}

export async function createService(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  rawInput: ServiceInput
) {
  assertAdministrator(actor);
  const input = serviceInputSchema.parse(rawInput);
  const routingKey = await generateRoutingKey();
  const service = await prisma.$transaction(async (transaction) => {
    const policy = await transaction.escalationPolicy.findFirst({
      where: {
        active: true,
        id: input.escalationPolicyId,
        teamId: input.teamId
      }
    });
    if (!policy) {
      throw new Error("Escalation policy must belong to the service team");
    }
    const created = await transaction.service.create({
      data: {
        autoCreateIncidentChannel: input.autoCreateIncidentChannel,
        criticalChannelThresholdMinutes: input.criticalChannelThresholdMinutes,
        escalationPolicyId: input.escalationPolicyId,
        incidentChannelsPrivate: input.incidentChannelsPrivate,
        name: input.name,
        nagIntervals: {
          CRITICAL: input.nagCriticalMinutes,
          INFO: null,
          WARNING: input.nagWarningMinutes
        },
        routingKeyHash: routingKey.hash,
        routingKeyPrefix: routingKey.prefix,
        slackChannelId: input.slackChannelId,
        slug: input.slug,
        teamId: input.teamId
      }
    });
    await audit(transaction, actor.id, "CREATE", "Service", created.id, {
      escalationPolicyId: input.escalationPolicyId,
      slug: input.slug,
      teamId: input.teamId
    });
    return created;
  });
  return { routingKey: routingKey.routingKey, service };
}

export async function updateService(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  serviceId: string,
  rawInput: ServiceInput
) {
  assertAdministrator(actor);
  const input = serviceInputSchema.parse(rawInput);
  return prisma.$transaction(async (transaction) => {
    const policy = await transaction.escalationPolicy.findFirst({
      where: {
        active: true,
        id: input.escalationPolicyId,
        teamId: input.teamId
      }
    });
    if (!policy) {
      throw new Error("Escalation policy must belong to the service team");
    }
    const service = await transaction.service.update({
      where: { id: z.uuid().parse(serviceId) },
      data: {
        autoCreateIncidentChannel: input.autoCreateIncidentChannel,
        criticalChannelThresholdMinutes: input.criticalChannelThresholdMinutes,
        escalationPolicyId: input.escalationPolicyId,
        incidentChannelsPrivate: input.incidentChannelsPrivate,
        name: input.name,
        nagIntervals: {
          CRITICAL: input.nagCriticalMinutes,
          INFO: null,
          WARNING: input.nagWarningMinutes
        },
        slackChannelId: input.slackChannelId,
        slug: input.slug,
        teamId: input.teamId
      }
    });
    await audit(transaction, actor.id, "UPDATE", "Service", service.id, {
      escalationPolicyId: input.escalationPolicyId,
      teamId: input.teamId
    });
    return service;
  });
}

export async function rotateServiceRoutingKey(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  serviceId: string
) {
  assertAdministrator(actor);
  const routingKey = await generateRoutingKey();
  const id = z.uuid().parse(serviceId);
  await prisma.$transaction(async (transaction) => {
    await transaction.service.update({
      where: { id },
      data: {
        routingKeyHash: routingKey.hash,
        routingKeyPrefix: routingKey.prefix
      }
    });
    await audit(transaction, actor.id, "ROTATE_KEY", "Service", id, {
      routingKeyPrefix: routingKey.prefix
    });
  });
  return routingKey.routingKey;
}

export async function updateSlackChannels(
  prisma: PrismaClient,
  actor: AdminMutationActor,
  input: {
    services: Array<{ id: string; slackChannelId: string | null }>;
    teams: Array<{ id: string; slackChannelId: string | null }>;
  }
): Promise<void> {
  assertAdministrator(actor);
  await prisma.$transaction(async (transaction) => {
    for (const team of input.teams) {
      await transaction.team.update({
        where: { id: z.uuid().parse(team.id) },
        data: { slackChannelId: team.slackChannelId }
      });
    }
    for (const service of input.services) {
      await transaction.service.update({
        where: { id: z.uuid().parse(service.id) },
        data: { slackChannelId: service.slackChannelId }
      });
    }
    await audit(transaction, actor.id, "UPDATE_CHANNELS", "Settings", "slack", {
      serviceCount: input.services.length,
      teamCount: input.teams.length
    });
  });
}
