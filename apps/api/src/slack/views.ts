import type { PrismaClient } from "@backbeat/db";
import {
  createSlackActionToken,
  type SlackIncidentAction
} from "@backbeat/notifications";
import {
  findNextScheduleChange,
  listShifts,
  resolveScheduleAt,
  type ScheduleSnapshot
} from "@backbeat/domain";
import type {
  Button,
  HomeView,
  KnownBlock,
  MrkdwnElement,
  PlainTextElement
} from "@slack/types";

export interface OnCallUserView {
  name: string;
  slackUserId: string | null;
  userId: string;
}

export interface OnCallScheduleView {
  current: OnCallUserView[];
  next: OnCallUserView[];
  nextChange: Date | null;
  scheduleId: string;
  scheduleName: string;
  teamName: string;
  timezone: string;
}

function formatUser(user: OnCallUserView): string {
  return user.slackUserId ? `<@${user.slackUserId}>` : user.name;
}

function slackDate(date: Date): string {
  return `<!date^${Math.floor(date.getTime() / 1000)}^{date_short_pretty} at {time}|${date.toISOString()}>`;
}

async function scheduleSnapshots(prisma: PrismaClient) {
  const schedules = await prisma.schedule.findMany({
    where: { active: true },
    include: {
      team: true,
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
      overrides: true
    }
  });

  return schedules.map((schedule) => ({
    record: schedule,
    snapshot: {
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
    } satisfies ScheduleSnapshot
  }));
}

export async function getOnCallSchedules(
  prisma: PrismaClient,
  query: string | undefined,
  now = new Date()
): Promise<OnCallScheduleView[]> {
  const loaded = await scheduleSnapshots(prisma);
  const normalized = query?.trim().toLowerCase();
  const filtered = normalized
    ? loaded
        .filter(({ record }) =>
          [record.name, record.slug, record.team.name, record.team.slug].some(
            (value) => value.toLowerCase().includes(normalized)
          )
        )
        .sort((left, right) => {
          const leftExact = [
            left.record.name,
            left.record.slug,
            left.record.team.name,
            left.record.team.slug
          ].some((value) => value.toLowerCase() === normalized);
          const rightExact = [
            right.record.name,
            right.record.slug,
            right.record.team.name,
            right.record.team.slug
          ].some((value) => value.toLowerCase() === normalized);
          return Number(rightExact) - Number(leftExact);
        })
    : loaded;
  const userIds = new Set<string>();
  const resolutions = filtered.map(({ record, snapshot }) => {
    const current = resolveScheduleAt(snapshot, now);
    const nextChange = findNextScheduleChange(snapshot, now);
    const next = nextChange
      ? resolveScheduleAt(snapshot, new Date(nextChange.getTime() + 1))
      : [];
    for (const item of [...current, ...next]) userIds.add(item.userId);
    return { current, next, nextChange, record };
  });
  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] } }
  });
  const usersById = new Map(users.map((user) => [user.id, user]));
  const mapUsers = (ids: Array<{ userId: string }>): OnCallUserView[] =>
    ids.flatMap(({ userId }) => {
      const user = usersById.get(userId);
      return user
        ? [
            {
              name: user.name,
              slackUserId: user.slackUserId,
              userId: user.id
            }
          ]
        : [];
    });

  return resolutions.map(({ current, next, nextChange, record }) => ({
    current: mapUsers(current),
    next: mapUsers(next),
    nextChange,
    scheduleId: record.id,
    scheduleName: record.name,
    teamName: record.team.name,
    timezone: record.timezone
  }));
}

export function renderOnCallBlocks(
  schedules: OnCallScheduleView[]
): KnownBlock[] {
  if (schedules.length === 0) {
    return [
      {
        text: {
          text: "No active on-call schedules matched that query.",
          type: "mrkdwn"
        },
        type: "section"
      }
    ];
  }

  return schedules.flatMap((schedule, index): KnownBlock[] => [
    ...(index > 0 ? [{ type: "divider" as const }] : []),
    {
      text: {
        text: `*${schedule.teamName} · ${schedule.scheduleName}*\nCurrent: ${
          schedule.current.length > 0
            ? schedule.current.map(formatUser).join(", ")
            : "_No active layer_"
        }\n${
          schedule.nextChange
            ? `Next: ${
                schedule.next.length > 0
                  ? schedule.next.map(formatUser).join(", ")
                  : "_No active layer_"
              } · ${slackDate(schedule.nextChange)}`
            : "Next change: _not scheduled_"
        }\nTimezone: \`${schedule.timezone}\``,
        type: "mrkdwn"
      },
      type: "section"
    }
  ]);
}

function quickActionButton(
  action: SlackIncidentAction,
  incident: { id: string; version: number },
  actionSecret: string,
  text: string,
  style?: "danger" | "primary"
): Button {
  return {
    action_id: `incident_${action}`,
    ...(style ? { style } : {}),
    text: { text, type: "plain_text" },
    type: "button",
    value: createSlackActionToken(
      {
        action,
        incidentId: incident.id,
        version: incident.version
      },
      actionSecret
    )
  };
}

export async function buildIncidentListBlocks(
  prisma: PrismaClient,
  actionSecret: string,
  includeResolved: boolean,
  limit = 20
): Promise<KnownBlock[]> {
  const incidents = await prisma.incident.findMany({
    where: includeResolved ? {} : { state: { not: "RESOLVED" } },
    orderBy: { openedAt: "desc" },
    take: Math.min(Math.max(limit, 1), 50),
    include: { assignee: true, service: true }
  });
  if (incidents.length === 0) {
    return [
      {
        text: { text: "No incidents found.", type: "mrkdwn" },
        type: "section"
      }
    ];
  }

  return incidents.flatMap((incident, index): KnownBlock[] => [
    ...(index > 0 ? [{ type: "divider" as const }] : []),
    {
      text: {
        text: `*#${incident.number} · ${incident.service.name}* · \`${incident.state.toLowerCase()}\`\n${incident.summary}\nAssignee: ${
          incident.assignee?.slackUserId
            ? `<@${incident.assignee.slackUserId}>`
            : (incident.assignee?.name ?? "Unassigned")
        }`,
        type: "mrkdwn"
      },
      type: "section"
    },
    ...(incident.state !== "RESOLVED"
      ? [
          {
            block_id: `incident_list_actions_${incident.id}`,
            elements: [
              ...(incident.state === "TRIGGERED"
                ? [
                    quickActionButton(
                      "acknowledge",
                      incident,
                      actionSecret,
                      "Acknowledge",
                      "primary"
                    )
                  ]
                : []),
              quickActionButton(
                "resolve",
                incident,
                actionSecret,
                "Resolve",
                "danger"
              ),
              quickActionButton("escalate", incident, actionSecret, "Escalate")
            ],
            type: "actions" as const
          }
        ]
      : [])
  ]);
}

function markdown(text: string): MrkdwnElement {
  return { text, type: "mrkdwn" };
}

function plainText(text: string): PlainTextElement {
  return { text, type: "plain_text" };
}

export async function buildAppHomeView(
  prisma: PrismaClient,
  userId: string,
  webBaseUrl: string | undefined,
  now = new Date()
): Promise<HomeView> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { memberships: true }
  });
  const loaded = await scheduleSnapshots(prisma);
  const upcoming = loaded.flatMap(({ record, snapshot }) =>
    listShifts(snapshot, now, new Date(now.getTime() + 14 * 24 * 60 * 60_000))
      .filter((shift) => shift.userId === userId)
      .slice(0, 3)
      .map((shift) => ({
        endsAt: shift.endsAt,
        scheduleName: record.name,
        startsAt: shift.startsAt,
        teamName: record.team.name
      }))
  );
  const teamIds = user.memberships.map((membership) => membership.teamId);
  const [assigned, teamIncidents] = await Promise.all([
    prisma.incident.findMany({
      where: { assigneeId: userId, state: { not: "RESOLVED" } },
      include: { service: true },
      orderBy: { openedAt: "desc" },
      take: 10
    }),
    prisma.incident.findMany({
      where: {
        service: { teamId: { in: teamIds } },
        state: { not: "RESOLVED" }
      },
      include: { service: true },
      orderBy: { openedAt: "desc" },
      take: 10
    })
  ]);
  const blocks: KnownBlock[] = [
    {
      text: plainText(`Welcome, ${user.name}`),
      type: "header"
    },
    {
      text: markdown("*Your upcoming on-call shifts*"),
      type: "section"
    },
    ...(upcoming.length > 0
      ? upcoming.map((shift): KnownBlock => ({
          text: markdown(
            `*${shift.teamName} · ${shift.scheduleName}*\n${slackDate(shift.startsAt)} → ${slackDate(shift.endsAt)}`
          ),
          type: "section"
        }))
      : [
          {
            text: markdown("_No shifts in the next 14 days._"),
            type: "section" as const
          }
        ]),
    { type: "divider" },
    {
      text: markdown("*Incidents assigned to you*"),
      type: "section"
    },
    {
      text: markdown(
        assigned.length > 0
          ? assigned
              .map(
                (incident) =>
                  `• *#${incident.number}* ${incident.service.name} — ${incident.summary}`
              )
              .join("\n")
          : "_No assigned open incidents._"
      ),
      type: "section"
    },
    {
      text: markdown("*Your teams' open incidents*"),
      type: "section"
    },
    {
      text: markdown(
        teamIncidents.length > 0
          ? teamIncidents
              .map(
                (incident) =>
                  `• *#${incident.number}* ${incident.service.name} — ${incident.summary}`
              )
              .join("\n")
          : "_Your teams have no open incidents._"
      ),
      type: "section"
    }
  ];
  if (webBaseUrl) {
    blocks.push({
      elements: [
        {
          text: plainText("Open schedules"),
          type: "button",
          url: `${webBaseUrl.replace(/\/$/, "")}/schedules`
        },
        {
          text: plainText("Open incidents"),
          type: "button",
          url: `${webBaseUrl.replace(/\/$/, "")}/incidents`
        }
      ],
      type: "actions"
    });
  }

  return {
    blocks,
    type: "home"
  };
}
