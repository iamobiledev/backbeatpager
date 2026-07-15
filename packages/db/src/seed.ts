import {
  RotationType,
  TeamMembershipRole,
  UserRole
} from "./generated/client.js";
import { createPrismaClient } from "./client.js";
import { generateRoutingKey } from "./routing-keys.js";

const prisma = createPrismaClient();

async function seed(): Promise<void> {
  const routingKey = await generateRoutingKey();

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    create: {
      email: "admin@example.com",
      name: "Demo Admin",
      role: UserRole.ADMIN,
      timezone: "UTC"
    },
    update: {
      active: true,
      name: "Demo Admin",
      role: UserRole.ADMIN,
      timezone: "UTC"
    }
  });

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    create: {
      email: "alice@example.com",
      name: "Alice Oncall",
      role: UserRole.RESPONDER,
      slackUserId: process.env.DEMO_ALICE_SLACK_USER_ID ?? null,
      timezone: "America/New_York"
    },
    update: {
      active: true,
      name: "Alice Oncall",
      role: UserRole.RESPONDER,
      slackUserId: process.env.DEMO_ALICE_SLACK_USER_ID ?? null,
      timezone: "America/New_York"
    }
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    create: {
      email: "bob@example.com",
      name: "Bob Backup",
      role: UserRole.RESPONDER,
      slackUserId: process.env.DEMO_BOB_SLACK_USER_ID ?? null,
      timezone: "America/Los_Angeles"
    },
    update: {
      active: true,
      name: "Bob Backup",
      role: UserRole.RESPONDER,
      slackUserId: process.env.DEMO_BOB_SLACK_USER_ID ?? null,
      timezone: "America/Los_Angeles"
    }
  });

  const team = await prisma.team.upsert({
    where: { slug: "payments" },
    create: {
      name: "Payments",
      slug: "payments",
      description: "Demo payments engineering team",
      slackChannelId: process.env.DEMO_PAYMENTS_SLACK_CHANNEL_ID ?? null,
      timezone: "UTC"
    },
    update: {
      active: true,
      description: "Demo payments engineering team",
      name: "Payments",
      slackChannelId: process.env.DEMO_PAYMENTS_SLACK_CHANNEL_ID ?? null,
      timezone: "UTC"
    }
  });

  await Promise.all([
    prisma.teamMembership.upsert({
      where: {
        teamId_userId: { teamId: team.id, userId: admin.id }
      },
      create: {
        role: TeamMembershipRole.MANAGER,
        teamId: team.id,
        userId: admin.id
      },
      update: { role: TeamMembershipRole.MANAGER }
    }),
    prisma.teamMembership.upsert({
      where: {
        teamId_userId: { teamId: team.id, userId: alice.id }
      },
      create: {
        role: TeamMembershipRole.MEMBER,
        teamId: team.id,
        userId: alice.id
      },
      update: { role: TeamMembershipRole.MEMBER }
    }),
    prisma.teamMembership.upsert({
      where: {
        teamId_userId: { teamId: team.id, userId: bob.id }
      },
      create: {
        role: TeamMembershipRole.MEMBER,
        teamId: team.id,
        userId: bob.id
      },
      update: { role: TeamMembershipRole.MEMBER }
    })
  ]);

  const schedule = await prisma.schedule.upsert({
    where: {
      teamId_slug: { teamId: team.id, slug: "primary" }
    },
    create: {
      name: "Payments Primary",
      slug: "primary",
      teamId: team.id,
      timezone: "UTC",
      layers: {
        create: {
          anchorInstant: new Date("2026-01-05T09:00:00.000Z"),
          anchorLocalDate: new Date("2026-01-05T00:00:00.000Z"),
          handoffLocalTime: "09:00",
          name: "Primary rotation",
          position: 0,
          rotationInterval: 1,
          rotationType: RotationType.WEEKLY,
          participants: {
            create: [
              { position: 0, userId: alice.id },
              { position: 1, userId: bob.id }
            ]
          }
        }
      }
    },
    update: {
      active: true,
      name: "Payments Primary",
      timezone: "UTC",
      layers: {
        deleteMany: {},
        create: {
          anchorInstant: new Date("2026-01-05T09:00:00.000Z"),
          anchorLocalDate: new Date("2026-01-05T00:00:00.000Z"),
          handoffLocalTime: "09:00",
          name: "Primary rotation",
          position: 0,
          rotationInterval: 1,
          rotationType: RotationType.WEEKLY,
          participants: {
            create: [
              { position: 0, userId: alice.id },
              { position: 1, userId: bob.id }
            ]
          }
        }
      }
    }
  });

  const policy = await prisma.escalationPolicy.upsert({
    where: {
      teamId_slug: { teamId: team.id, slug: "payments-default" }
    },
    create: {
      name: "Payments Default",
      repeatCount: 1,
      slug: "payments-default",
      teamId: team.id,
      steps: {
        create: [
          {
            position: 0,
            timeoutMinutes: 5,
            targets: {
              create: [{ position: 0, scheduleId: schedule.id }]
            }
          },
          {
            position: 1,
            timeoutMinutes: 10,
            targets: {
              create: [{ position: 0, teamId: team.id }]
            }
          }
        ]
      }
    },
    update: {
      active: true,
      name: "Payments Default",
      repeatCount: 1,
      steps: {
        deleteMany: {},
        create: [
          {
            position: 0,
            timeoutMinutes: 5,
            targets: {
              create: [{ position: 0, scheduleId: schedule.id }]
            }
          },
          {
            position: 1,
            timeoutMinutes: 10,
            targets: {
              create: [{ position: 0, teamId: team.id }]
            }
          }
        ]
      }
    }
  });

  const service = await prisma.service.upsert({
    where: {
      teamId_slug: { teamId: team.id, slug: "payments-api" }
    },
    create: {
      escalationPolicyId: policy.id,
      name: "Payments API",
      nagIntervals: {
        CRITICAL: 5,
        INFO: null,
        WARNING: 15
      },
      routingKeyHash: routingKey.hash,
      routingKeyPrefix: routingKey.prefix,
      slackChannelId: process.env.DEMO_PAYMENTS_SLACK_CHANNEL_ID ?? null,
      slug: "payments-api",
      teamId: team.id
    },
    update: {
      active: true,
      escalationPolicyId: policy.id,
      name: "Payments API",
      nagIntervals: {
        CRITICAL: 5,
        INFO: null,
        WARNING: 15
      },
      routingKeyHash: routingKey.hash,
      routingKeyPrefix: routingKey.prefix,
      slackChannelId: process.env.DEMO_PAYMENTS_SLACK_CHANNEL_ID ?? null
    }
  });

  const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3001";
  const curlPayload = JSON.stringify({
    dedup_key: "demo-payments-api",
    event_action: "trigger",
    payload: {
      custom_details: {
        seeded_service_id: service.id
      },
      severity: "critical",
      source: "backbeatpager-seed",
      summary: "Demo payment authorization failures"
    },
    routing_key: routingKey.routingKey
  });

  console.log("Seeded Backbeat Pager demo data.");
  console.log(`Team: ${team.name}`);
  console.log(`Schedule: ${schedule.name}`);
  console.log(`Service: ${service.name}`);
  console.log(`Routing key (shown once): ${routingKey.routingKey}`);
  console.log(
    `Phase 2 alert command:\ncurl -X POST '${apiBaseUrl}/api/v1/alerts' -H 'content-type: application/json' --data '${curlPayload}'`
  );
}

try {
  await seed();
} finally {
  await prisma.$disconnect();
}
