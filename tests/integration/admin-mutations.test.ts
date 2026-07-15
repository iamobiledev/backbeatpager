import {
  RotationType,
  UserRole,
  type PrismaClient
} from "../../packages/db/src/index.js";
import { createPrismaClient } from "../../packages/db/src/client.js";
import { verifyRoutingKey } from "../../packages/db/src/routing-keys.js";
import {
  AdminAuthorizationError,
  createEscalationPolicy,
  createSchedule,
  createScheduleOverride,
  createService,
  createTeam,
  createUser,
  rotateServiceRoutingKey,
  updateEscalationPolicy,
  updateSchedule,
  updateService,
  updateSlackChannels,
  updateTeam,
  updateUser
} from "../../apps/web/src/lib/admin/mutations.js";
import { getScheduleCalendars } from "../../apps/web/src/lib/admin/queries.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;

describeDatabase("admin mutations", () => {
  let prisma: PrismaClient;
  let adminId: string;
  let responderId: string;

  beforeAll(async () => {
    prisma = createPrismaClient(testDatabaseUrl, "pg");
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Team", "OutboxEvent", "WorkflowRun", "SlackInteractionReceipt", "VerificationToken" CASCADE'
    );
    const admin = await prisma.user.create({
      data: {
        email: "admin-mutations@example.com",
        name: "Admin Mutations",
        role: UserRole.ADMIN,
        timezone: "UTC"
      }
    });
    const responder = await prisma.user.create({
      data: {
        email: "responder-mutations@example.com",
        name: "Responder Mutations",
        role: UserRole.RESPONDER,
        timezone: "UTC"
      }
    });
    adminId = admin.id;
    responderId = responder.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("rejects responder configuration changes", async () => {
    await expect(
      createUser(
        prisma,
        { id: responderId, role: UserRole.RESPONDER },
        {
          email: "forbidden@example.com",
          emailNotifications: false,
          name: "Forbidden",
          role: UserRole.RESPONDER,
          slackNotifications: true,
          slackUserId: null,
          timezone: "UTC"
        }
      )
    ).rejects.toBeInstanceOf(AdminAuthorizationError);
  });

  it("creates an audited configuration from user through service", async () => {
    const actor = { id: adminId, role: UserRole.ADMIN };
    const user = await createUser(prisma, actor, {
      email: "new-responder@example.com",
      emailNotifications: true,
      name: "New Responder",
      role: UserRole.RESPONDER,
      slackNotifications: true,
      slackUserId: "U_NEW",
      timezone: "America/New_York"
    });
    await updateUser(prisma, actor, user.id, {
      email: user.email,
      emailNotifications: true,
      name: "Renamed Responder",
      role: UserRole.RESPONDER,
      slackNotifications: true,
      slackUserId: "U_NEW",
      timezone: "America/New_York"
    });
    const team = await createTeam(prisma, actor, {
      description: "Admin test team",
      digestDayOfWeek: 1,
      digestEnabled: true,
      digestLocalTime: "09:00",
      handoffMessagesEnabled: true,
      memberIds: [user.id],
      name: "Admin Team",
      slackChannelId: "C_ADMIN",
      slug: "admin-team",
      timezone: "America/New_York"
    });
    const schedule = await createSchedule(prisma, actor, {
      anchorLocalDate: "2026-03-08",
      customIntervalMinutes: null,
      handoffLocalTime: "02:30",
      name: "Admin Primary",
      participantIds: [user.id],
      restrictions: [
        {
          dayOfWeek: 1,
          endLocalTime: "17:00",
          startLocalTime: "09:00"
        }
      ],
      rotationInterval: 1,
      rotationType: RotationType.WEEKLY,
      slug: "admin-primary",
      teamId: team.id,
      timezone: "America/New_York"
    });
    const policy = await createEscalationPolicy(prisma, actor, {
      acknowledgementTimeoutMinutes: 30,
      name: "Admin Policy",
      repeatCount: 1,
      slug: "admin-policy",
      steps: [
        {
          targetId: schedule.id,
          targetType: "schedule",
          timeoutMinutes: 5
        },
        {
          targetId: team.id,
          targetType: "team",
          timeoutMinutes: 10
        }
      ],
      teamId: team.id
    });
    const created = await createService(prisma, actor, {
      autoCreateIncidentChannel: true,
      criticalChannelThresholdMinutes: 10,
      escalationPolicyId: policy.id,
      incidentChannelsPrivate: false,
      nagCriticalMinutes: 5,
      nagWarningMinutes: 15,
      name: "Admin Service",
      slackChannelId: "C_SERVICE",
      slug: "admin-service",
      teamId: team.id
    });
    await updateTeam(prisma, actor, team.id, {
      description: "Updated admin test team",
      digestDayOfWeek: 5,
      digestEnabled: true,
      digestLocalTime: "10:00",
      handoffMessagesEnabled: true,
      memberIds: [user.id],
      name: "Admin Team Updated",
      slackChannelId: "C_ADMIN",
      slug: "admin-team",
      timezone: "America/New_York"
    });
    await updateSchedule(prisma, actor, schedule.id, {
      anchorLocalDate: "2026-03-08",
      customIntervalMinutes: null,
      handoffLocalTime: "03:00",
      name: "Admin Primary Updated",
      participantIds: [user.id],
      restrictions: [],
      rotationInterval: 1,
      rotationType: RotationType.WEEKLY,
      slug: "admin-primary",
      teamId: team.id,
      timezone: "America/New_York"
    });
    await updateEscalationPolicy(prisma, actor, policy.id, {
      acknowledgementTimeoutMinutes: null,
      name: "Admin Policy Updated",
      repeatCount: 2,
      slug: "admin-policy",
      steps: [
        {
          targetId: schedule.id,
          targetType: "schedule",
          timeoutMinutes: 7
        }
      ],
      teamId: team.id
    });
    await updateService(prisma, actor, created.service.id, {
      autoCreateIncidentChannel: false,
      criticalChannelThresholdMinutes: null,
      escalationPolicyId: policy.id,
      incidentChannelsPrivate: false,
      nagCriticalMinutes: 3,
      nagWarningMinutes: null,
      name: "Admin Service Updated",
      slackChannelId: "C_SERVICE",
      slug: "admin-service",
      teamId: team.id
    });

    expect(created.routingKey).toMatch(/^bbp_/);
    expect(created.service.routingKeyHash).not.toContain(created.routingKey);
    await expect(
      verifyRoutingKey(created.service.routingKeyHash, created.routingKey)
    ).resolves.toBe(true);
    expect(
      await prisma.escalationStep.count({
        where: { policyId: policy.id }
      })
    ).toBe(1);
    expect(
      await prisma.auditLog.count({
        where: { actorUserId: adminId }
      })
    ).toBeGreaterThanOrEqual(6);

    const rotated = await rotateServiceRoutingKey(
      prisma,
      actor,
      created.service.id
    );
    expect(rotated).not.toBe(created.routingKey);
    await updateSlackChannels(prisma, actor, {
      services: [{ id: created.service.id, slackChannelId: "C_UPDATED" }],
      teams: [{ id: team.id, slackChannelId: "C_TEAM_UPDATED" }]
    });
    await expect(
      prisma.service.findUniqueOrThrow({ where: { id: created.service.id } })
    ).resolves.toMatchObject({ slackChannelId: "C_UPDATED" });

    const override = await createScheduleOverride(prisma, actor, {
      endsAt: new Date("2026-04-01T12:00:00.000Z"),
      reason: "Admin UI test",
      replacedUserId: user.id,
      replacementUserId: responderId,
      scheduleId: schedule.id,
      startsAt: new Date("2026-04-01T10:00:00.000Z")
    });
    expect(override.createdById).toBe(adminId);

    const calendars = await getScheduleCalendars(
      new Date("2026-03-09T00:00:00.000Z"),
      new Date("2026-03-16T00:00:00.000Z"),
      prisma
    );
    expect(calendars[0]?.shifts.length).toBeGreaterThan(0);
  });
});
