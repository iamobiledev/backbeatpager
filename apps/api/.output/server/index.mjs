globalThis.__nitro_main__ = import.meta.url;
import { i as __toESM } from "./_runtime.mjs";
import { a as NodeResponse, i as toEventHandler, n as HTTPError, o as serve, r as defineHandler, s as toFetchHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { t as PrismaNeonAdapterFactory } from "./_libs/@prisma/adapter-neon+[...].mjs";
import { t as PrismaPgAdapterFactory } from "./_libs/@prisma/adapter-pg+[...].mjs";
import { t as require_helmet } from "./_libs/@fastify/helmet+[...].mjs";
import { t as qi } from "./_libs/js-temporal__polyfill+jsbi.mjs";
import { t as require_fastify } from "./_libs/fastify+[...].mjs";
import { a as record, c as url, i as object, n as array, o as string, r as number, s as unknown, t as _enum } from "./_libs/zod.mjs";
import { a as registerStepFunction, i as resumeWebhook, n as stepEntrypoint, r as start, t as workflowEntrypoint } from "./_libs/@workflow/core+[...].mjs";
import "./_libs/workflow.mjs";
import { createHash } from "node:crypto";
import * as path$1 from "node:path";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as runtime from "@prisma/client/runtime/client";
import { promises } from "node:fs";
import { verify } from "@node-rs/argon2";
//#region ../../packages/db/dist/generated/enums.js
const IncidentState = {
	TRIGGERED: "TRIGGERED",
	ACKNOWLEDGED: "ACKNOWLEDGED",
	RESOLVED: "RESOLVED"
};
const Severity = {
	CRITICAL: "CRITICAL",
	WARNING: "WARNING",
	INFO: "INFO"
};
const AlertStatus = {
	TRIGGERED: "TRIGGERED",
	ACKNOWLEDGED: "ACKNOWLEDGED",
	RESOLVED: "RESOLVED"
};
const AlertAction = {
	TRIGGER: "TRIGGER",
	ACKNOWLEDGE: "ACKNOWLEDGE",
	RESOLVE: "RESOLVE"
};
const TimelineEventType = {
	INCIDENT_TRIGGERED: "INCIDENT_TRIGGERED",
	INCIDENT_ACKNOWLEDGED: "INCIDENT_ACKNOWLEDGED",
	INCIDENT_RESOLVED: "INCIDENT_RESOLVED",
	INCIDENT_RETRIGGERED: "INCIDENT_RETRIGGERED",
	INCIDENT_REASSIGNED: "INCIDENT_REASSIGNED",
	INCIDENT_SNOOZED: "INCIDENT_SNOOZED",
	NOTE_ADDED: "NOTE_ADDED",
	ESCALATION_STARTED: "ESCALATION_STARTED",
	ESCALATION_ADVANCED: "ESCALATION_ADVANCED",
	ESCALATION_EXHAUSTED: "ESCALATION_EXHAUSTED",
	ACKNOWLEDGEMENT_EXPIRED: "ACKNOWLEDGEMENT_EXPIRED",
	NOTIFICATION_QUEUED: "NOTIFICATION_QUEUED",
	NOTIFICATION_SENT: "NOTIFICATION_SENT",
	NOTIFICATION_FAILED: "NOTIFICATION_FAILED",
	INCIDENT_CHANNEL_CREATED: "INCIDENT_CHANNEL_CREATED",
	SLACK_MESSAGE_UPDATED: "SLACK_MESSAGE_UPDATED"
};
const ActorKind = {
	SYSTEM: "SYSTEM",
	USER: "USER",
	SLACK_USER: "SLACK_USER",
	INTEGRATION: "INTEGRATION"
};
const OutboxStatus = {
	PENDING: "PENDING",
	DISPATCHED: "DISPATCHED",
	FAILED: "FAILED"
};
const WorkflowKind = {
	INCIDENT_GENERATION: "INCIDENT_GENERATION",
	MESSAGE_SYNC: "MESSAGE_SYNC",
	HANDOFF: "HANDOFF",
	DIGEST: "DIGEST",
	RECONCILIATION: "RECONCILIATION"
};
const WorkflowStatus = {
	PENDING: "PENDING",
	RUNNING: "RUNNING",
	SLEEPING: "SLEEPING",
	SUCCEEDED: "SUCCEEDED",
	FAILED: "FAILED",
	STALE: "STALE"
};
//#endregion
//#region ../../packages/db/dist/generated/internal/class.js
const config = {
	"previewFeatures": [],
	"clientVersion": "7.8.0",
	"engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
	"activeProvider": "postgresql",
	"inlineSchema": "generator client {\n  provider = \"prisma-client\"\n  output   = \"../src/generated\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\nenum UserRole {\n  ADMIN\n  RESPONDER\n}\n\nenum TeamMembershipRole {\n  MANAGER\n  MEMBER\n}\n\nenum RotationType {\n  DAILY\n  WEEKLY\n  CUSTOM\n}\n\nenum IncidentState {\n  TRIGGERED\n  ACKNOWLEDGED\n  RESOLVED\n}\n\nenum Severity {\n  CRITICAL\n  WARNING\n  INFO\n}\n\nenum AlertStatus {\n  TRIGGERED\n  ACKNOWLEDGED\n  RESOLVED\n}\n\nenum AlertAction {\n  TRIGGER\n  ACKNOWLEDGE\n  RESOLVE\n}\n\nenum TimelineEventType {\n  INCIDENT_TRIGGERED\n  INCIDENT_ACKNOWLEDGED\n  INCIDENT_RESOLVED\n  INCIDENT_RETRIGGERED\n  INCIDENT_REASSIGNED\n  INCIDENT_SNOOZED\n  NOTE_ADDED\n  ESCALATION_STARTED\n  ESCALATION_ADVANCED\n  ESCALATION_EXHAUSTED\n  ACKNOWLEDGEMENT_EXPIRED\n  NOTIFICATION_QUEUED\n  NOTIFICATION_SENT\n  NOTIFICATION_FAILED\n  INCIDENT_CHANNEL_CREATED\n  SLACK_MESSAGE_UPDATED\n}\n\nenum ActorKind {\n  SYSTEM\n  USER\n  SLACK_USER\n  INTEGRATION\n}\n\nenum NotificationChannel {\n  SLACK\n  EMAIL\n}\n\nenum NotificationStatus {\n  PENDING\n  RETRYING\n  SENT\n  FAILED\n  SKIPPED\n}\n\nenum SlackMessageDestination {\n  DM\n  SERVICE_CHANNEL\n  INCIDENT_CHANNEL\n}\n\nenum SlackInteractionStatus {\n  RECEIVED\n  PROCESSING\n  SUCCEEDED\n  FAILED\n}\n\nenum OutboxStatus {\n  PENDING\n  DISPATCHED\n  FAILED\n}\n\nenum WorkflowKind {\n  INCIDENT_GENERATION\n  MESSAGE_SYNC\n  HANDOFF\n  DIGEST\n  RECONCILIATION\n}\n\nenum WorkflowStatus {\n  PENDING\n  RUNNING\n  SLEEPING\n  SUCCEEDED\n  FAILED\n  STALE\n}\n\nmodel User {\n  id                      String                  @id @default(uuid()) @db.Uuid\n  name                    String\n  email                   String                  @unique\n  slackUserId             String?                 @unique\n  timezone                String                  @default(\"UTC\")\n  role                    UserRole                @default(RESPONDER)\n  active                  Boolean                 @default(true)\n  notificationPreferences Json                    @default(\"{}\")\n  createdAt               DateTime                @default(now()) @db.Timestamptz(3)\n  updatedAt               DateTime                @updatedAt @db.Timestamptz(3)\n  accounts                Account[]\n  sessions                Session[]\n  memberships             TeamMembership[]\n  scheduleParticipants    ScheduleParticipant[]\n  replacementOverrides    ScheduleOverride[]      @relation(\"OverrideReplacement\")\n  replacedOverrides       ScheduleOverride[]      @relation(\"OverrideReplaced\")\n  createdOverrides        ScheduleOverride[]      @relation(\"OverrideCreator\")\n  escalationTargets       EscalationTarget[]\n  assignedIncidents       Incident[]              @relation(\"IncidentAssignee\")\n  timelineEntries         IncidentTimelineEntry[]\n  notificationLogs        NotificationLog[]\n  slackMessages           SlackMessage[]\n  auditLogs               AuditLog[]\n\n  @@index([active])\n}\n\nmodel Account {\n  id                String  @id @default(uuid()) @db.Uuid\n  userId            String  @db.Uuid\n  type              String\n  provider          String\n  providerAccountId String\n  refreshToken      String? @map(\"refresh_token\") @db.Text\n  accessToken       String? @map(\"access_token\") @db.Text\n  expiresAt         Int?    @map(\"expires_at\")\n  tokenType         String? @map(\"token_type\")\n  scope             String?\n  idToken           String? @map(\"id_token\") @db.Text\n  sessionState      String? @map(\"session_state\")\n  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([provider, providerAccountId])\n  @@index([userId])\n}\n\nmodel Session {\n  id           String   @id @default(uuid()) @db.Uuid\n  sessionToken String   @unique\n  userId       String   @db.Uuid\n  expires      DateTime @db.Timestamptz(3)\n  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([expires])\n}\n\nmodel VerificationToken {\n  identifier String\n  token      String   @unique\n  expires    DateTime @db.Timestamptz(3)\n\n  @@unique([identifier, token])\n}\n\nmodel Team {\n  id                     String             @id @default(uuid()) @db.Uuid\n  name                   String\n  slug                   String             @unique\n  description            String?\n  slackChannelId         String?\n  timezone               String             @default(\"UTC\")\n  handoffMessagesEnabled Boolean            @default(true)\n  digestEnabled          Boolean            @default(true)\n  digestDayOfWeek        Int                @default(1)\n  digestLocalTime        String             @default(\"09:00\")\n  active                 Boolean            @default(true)\n  createdAt              DateTime           @default(now()) @db.Timestamptz(3)\n  updatedAt              DateTime           @updatedAt @db.Timestamptz(3)\n  memberships            TeamMembership[]\n  services               Service[]\n  schedules              Schedule[]\n  escalationPolicies     EscalationPolicy[]\n  escalationTargets      EscalationTarget[] @relation(\"EscalationTargetTeam\")\n\n  @@index([active])\n}\n\nmodel TeamMembership {\n  id        String             @id @default(uuid()) @db.Uuid\n  teamId    String             @db.Uuid\n  userId    String             @db.Uuid\n  role      TeamMembershipRole @default(MEMBER)\n  createdAt DateTime           @default(now()) @db.Timestamptz(3)\n  team      Team               @relation(fields: [teamId], references: [id], onDelete: Cascade)\n  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([teamId, userId])\n  @@index([userId])\n}\n\nmodel Service {\n  id                              String           @id @default(uuid()) @db.Uuid\n  teamId                          String           @db.Uuid\n  escalationPolicyId              String           @db.Uuid\n  name                            String\n  slug                            String\n  description                     String?\n  routingKeyPrefix                String           @unique\n  routingKeyHash                  String\n  slackChannelId                  String?\n  sourceLinkTemplate              String?\n  autoCreateIncidentChannel       Boolean          @default(false)\n  incidentChannelsPrivate         Boolean          @default(false)\n  criticalChannelThresholdMinutes Int?\n  nagIntervals                    Json             @default(\"{}\")\n  active                          Boolean          @default(true)\n  createdAt                       DateTime         @default(now()) @db.Timestamptz(3)\n  updatedAt                       DateTime         @updatedAt @db.Timestamptz(3)\n  team                            Team             @relation(fields: [teamId], references: [id], onDelete: Restrict)\n  escalationPolicy                EscalationPolicy @relation(fields: [escalationPolicyId], references: [id], onDelete: Restrict)\n  alerts                          Alert[]\n  incidents                       Incident[]\n\n  @@unique([teamId, slug])\n  @@index([escalationPolicyId])\n  @@index([active])\n}\n\nmodel Schedule {\n  id                String             @id @default(uuid()) @db.Uuid\n  teamId            String             @db.Uuid\n  name              String\n  slug              String\n  timezone          String\n  active            Boolean            @default(true)\n  createdAt         DateTime           @default(now()) @db.Timestamptz(3)\n  updatedAt         DateTime           @updatedAt @db.Timestamptz(3)\n  team              Team               @relation(fields: [teamId], references: [id], onDelete: Restrict)\n  layers            ScheduleLayer[]\n  overrides         ScheduleOverride[]\n  escalationTargets EscalationTarget[]\n\n  @@unique([teamId, slug])\n  @@index([teamId, active])\n}\n\nmodel ScheduleLayer {\n  id                    String                @id @default(uuid()) @db.Uuid\n  scheduleId            String                @db.Uuid\n  name                  String\n  position              Int\n  rotationType          RotationType\n  rotationInterval      Int                   @default(1)\n  customIntervalMinutes Int?\n  handoffLocalTime      String\n  anchorLocalDate       DateTime              @db.Date\n  anchorInstant         DateTime              @db.Timestamptz(3)\n  activeFrom            DateTime?             @db.Timestamptz(3)\n  activeUntil           DateTime?             @db.Timestamptz(3)\n  createdAt             DateTime              @default(now()) @db.Timestamptz(3)\n  updatedAt             DateTime              @updatedAt @db.Timestamptz(3)\n  schedule              Schedule              @relation(fields: [scheduleId], references: [id], onDelete: Cascade)\n  participants          ScheduleParticipant[]\n  restrictions          ScheduleRestriction[]\n  overrides             ScheduleOverride[]\n\n  @@unique([scheduleId, position])\n  @@index([scheduleId, activeFrom, activeUntil])\n}\n\nmodel ScheduleParticipant {\n  id        String        @id @default(uuid()) @db.Uuid\n  layerId   String        @db.Uuid\n  userId    String        @db.Uuid\n  position  Int\n  createdAt DateTime      @default(now()) @db.Timestamptz(3)\n  layer     ScheduleLayer @relation(fields: [layerId], references: [id], onDelete: Cascade)\n  user      User          @relation(fields: [userId], references: [id], onDelete: Restrict)\n\n  @@unique([layerId, position])\n  @@unique([layerId, userId])\n  @@index([userId])\n}\n\nmodel ScheduleRestriction {\n  id             String        @id @default(uuid()) @db.Uuid\n  layerId        String        @db.Uuid\n  dayOfWeek      Int\n  startLocalTime String\n  endLocalTime   String\n  layer          ScheduleLayer @relation(fields: [layerId], references: [id], onDelete: Cascade)\n\n  @@unique([layerId, dayOfWeek, startLocalTime, endLocalTime])\n  @@index([layerId, dayOfWeek])\n}\n\nmodel ScheduleOverride {\n  id                String         @id @default(uuid()) @db.Uuid\n  scheduleId        String         @db.Uuid\n  layerId           String?        @db.Uuid\n  replacementUserId String         @db.Uuid\n  replacedUserId    String?        @db.Uuid\n  createdById       String?        @db.Uuid\n  startsAt          DateTime       @db.Timestamptz(3)\n  endsAt            DateTime       @db.Timestamptz(3)\n  reason            String?\n  createdAt         DateTime       @default(now()) @db.Timestamptz(3)\n  updatedAt         DateTime       @updatedAt @db.Timestamptz(3)\n  schedule          Schedule       @relation(fields: [scheduleId], references: [id], onDelete: Cascade)\n  layer             ScheduleLayer? @relation(fields: [layerId], references: [id], onDelete: Cascade)\n  replacementUser   User           @relation(\"OverrideReplacement\", fields: [replacementUserId], references: [id], onDelete: Restrict)\n  replacedUser      User?          @relation(\"OverrideReplaced\", fields: [replacedUserId], references: [id], onDelete: Restrict)\n  createdBy         User?          @relation(\"OverrideCreator\", fields: [createdById], references: [id], onDelete: SetNull)\n\n  @@index([scheduleId, startsAt, endsAt])\n  @@index([layerId, startsAt, endsAt])\n  @@index([replacementUserId])\n}\n\nmodel EscalationPolicy {\n  id                            String           @id @default(uuid()) @db.Uuid\n  teamId                        String           @db.Uuid\n  name                          String\n  slug                          String\n  repeatCount                   Int              @default(0)\n  acknowledgementTimeoutMinutes Int?\n  active                        Boolean          @default(true)\n  createdAt                     DateTime         @default(now()) @db.Timestamptz(3)\n  updatedAt                     DateTime         @updatedAt @db.Timestamptz(3)\n  team                          Team             @relation(fields: [teamId], references: [id], onDelete: Restrict)\n  steps                         EscalationStep[]\n  services                      Service[]\n\n  @@unique([teamId, slug])\n  @@index([teamId, active])\n}\n\nmodel EscalationStep {\n  id             String             @id @default(uuid()) @db.Uuid\n  policyId       String             @db.Uuid\n  position       Int\n  timeoutMinutes Int\n  policy         EscalationPolicy   @relation(fields: [policyId], references: [id], onDelete: Cascade)\n  targets        EscalationTarget[]\n  incidents      Incident[]         @relation(\"IncidentCurrentStep\")\n\n  @@unique([policyId, position])\n}\n\nmodel EscalationTarget {\n  id         String         @id @default(uuid()) @db.Uuid\n  stepId     String         @db.Uuid\n  position   Int\n  userId     String?        @db.Uuid\n  scheduleId String?        @db.Uuid\n  teamId     String?        @db.Uuid\n  step       EscalationStep @relation(fields: [stepId], references: [id], onDelete: Cascade)\n  user       User?          @relation(fields: [userId], references: [id], onDelete: Restrict)\n  schedule   Schedule?      @relation(fields: [scheduleId], references: [id], onDelete: Restrict)\n  team       Team?          @relation(\"EscalationTargetTeam\", fields: [teamId], references: [id], onDelete: Restrict)\n\n  @@unique([stepId, position])\n  @@index([userId])\n  @@index([scheduleId])\n  @@index([teamId])\n}\n\nmodel Alert {\n  id              String            @id @default(uuid()) @db.Uuid\n  serviceId       String            @db.Uuid\n  dedupKey        String\n  status          AlertStatus\n  severity        Severity\n  source          String\n  latestPayload   Json\n  occurrenceCount Int               @default(1)\n  firstSeenAt     DateTime          @default(now()) @db.Timestamptz(3)\n  lastSeenAt      DateTime          @default(now()) @db.Timestamptz(3)\n  createdAt       DateTime          @default(now()) @db.Timestamptz(3)\n  updatedAt       DateTime          @updatedAt @db.Timestamptz(3)\n  service         Service           @relation(fields: [serviceId], references: [id], onDelete: Restrict)\n  occurrences     AlertOccurrence[]\n  incidents       IncidentAlert[]\n\n  @@unique([serviceId, dedupKey])\n  @@index([serviceId, status])\n  @@index([lastSeenAt])\n}\n\nmodel AlertOccurrence {\n  id          String      @id @default(uuid()) @db.Uuid\n  alertId     String      @db.Uuid\n  action      AlertAction\n  payload     Json\n  requestId   String?     @unique\n  requestHash String?\n  receivedAt  DateTime    @default(now()) @db.Timestamptz(3)\n  alert       Alert       @relation(fields: [alertId], references: [id], onDelete: Cascade)\n\n  @@index([alertId, receivedAt])\n}\n\nmodel Incident {\n  id                        String                  @id @default(uuid()) @db.Uuid\n  number                    Int                     @unique @default(autoincrement())\n  serviceId                 String                  @db.Uuid\n  dedupKey                  String\n  state                     IncidentState           @default(TRIGGERED)\n  severity                  Severity\n  summary                   String\n  source                    String\n  sourceUrl                 String?\n  assigneeId                String?                 @db.Uuid\n  currentStepId             String?                 @db.Uuid\n  currentEscalationLoop     Int                     @default(0)\n  currentEscalationPosition Int                     @default(0)\n  escalationDeadline        DateTime?               @db.Timestamptz(3)\n  escalationGeneration      Int                     @default(0)\n  nagDeadline               DateTime?               @db.Timestamptz(3)\n  nagGeneration             Int                     @default(0)\n  snoozedUntil              DateTime?               @db.Timestamptz(3)\n  acknowledgementExpiresAt  DateTime?               @db.Timestamptz(3)\n  incidentSlackChannelId    String?\n  incidentStatusMessageTs   String?\n  openedAt                  DateTime                @default(now()) @db.Timestamptz(3)\n  acknowledgedAt            DateTime?               @db.Timestamptz(3)\n  resolvedAt                DateTime?               @db.Timestamptz(3)\n  version                   Int                     @default(0)\n  createdAt                 DateTime                @default(now()) @db.Timestamptz(3)\n  updatedAt                 DateTime                @updatedAt @db.Timestamptz(3)\n  service                   Service                 @relation(fields: [serviceId], references: [id], onDelete: Restrict)\n  assignee                  User?                   @relation(\"IncidentAssignee\", fields: [assigneeId], references: [id], onDelete: SetNull)\n  currentStep               EscalationStep?         @relation(\"IncidentCurrentStep\", fields: [currentStepId], references: [id], onDelete: SetNull)\n  alerts                    IncidentAlert[]\n  timelineEntries           IncidentTimelineEntry[]\n  notificationLogs          NotificationLog[]\n  slackMessages             SlackMessage[]\n\n  @@index([state, openedAt])\n  @@index([serviceId, openedAt])\n  @@index([assigneeId, state])\n  @@index([escalationDeadline])\n  @@index([nagDeadline])\n}\n\nmodel IncidentAlert {\n  incidentId String   @db.Uuid\n  alertId    String   @db.Uuid\n  linkedAt   DateTime @default(now()) @db.Timestamptz(3)\n  incident   Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)\n  alert      Alert    @relation(fields: [alertId], references: [id], onDelete: Restrict)\n\n  @@id([incidentId, alertId])\n  @@index([alertId])\n}\n\nmodel IncidentTimelineEntry {\n  id             String            @id @default(uuid()) @db.Uuid\n  incidentId     String            @db.Uuid\n  type           TimelineEventType\n  actorKind      ActorKind\n  actorUserId    String?           @db.Uuid\n  slackUserId    String?\n  message        String\n  metadata       Json              @default(\"{}\")\n  idempotencyKey String?           @unique\n  createdAt      DateTime          @default(now()) @db.Timestamptz(3)\n  incident       Incident          @relation(fields: [incidentId], references: [id], onDelete: Cascade)\n  actorUser      User?             @relation(fields: [actorUserId], references: [id], onDelete: SetNull)\n\n  @@index([incidentId, createdAt])\n}\n\nmodel NotificationLog {\n  id                String              @id @default(uuid()) @db.Uuid\n  incidentId        String              @db.Uuid\n  targetUserId      String?             @db.Uuid\n  channel           NotificationChannel\n  targetAddress     String\n  status            NotificationStatus  @default(PENDING)\n  attempt           Int                 @default(0)\n  idempotencyKey    String              @unique\n  providerMessageId String?\n  slackChannelId    String?\n  slackMessageTs    String?\n  errorCode         String?\n  errorMessage      String?\n  queuedAt          DateTime            @default(now()) @db.Timestamptz(3)\n  attemptedAt       DateTime?           @db.Timestamptz(3)\n  deliveredAt       DateTime?           @db.Timestamptz(3)\n  createdAt         DateTime            @default(now()) @db.Timestamptz(3)\n  updatedAt         DateTime            @updatedAt @db.Timestamptz(3)\n  incident          Incident            @relation(fields: [incidentId], references: [id], onDelete: Cascade)\n  targetUser        User?               @relation(fields: [targetUserId], references: [id], onDelete: SetNull)\n\n  @@index([incidentId, createdAt])\n  @@index([status, queuedAt])\n  @@index([targetUserId])\n}\n\nmodel SlackMessage {\n  id             String                  @id @default(uuid()) @db.Uuid\n  incidentId     String                  @db.Uuid\n  targetUserId   String?                 @db.Uuid\n  destination    SlackMessageDestination\n  destinationKey String                  @unique\n  channelId      String\n  messageTs      String\n  renderVersion  Int                     @default(0)\n  createdAt      DateTime                @default(now()) @db.Timestamptz(3)\n  updatedAt      DateTime                @updatedAt @db.Timestamptz(3)\n  incident       Incident                @relation(fields: [incidentId], references: [id], onDelete: Cascade)\n  targetUser     User?                   @relation(fields: [targetUserId], references: [id], onDelete: SetNull)\n\n  @@unique([channelId, messageTs])\n  @@index([incidentId, destination])\n}\n\nmodel SlackInteractionReceipt {\n  id              String                 @id @default(uuid()) @db.Uuid\n  receiptKey      String                 @unique\n  interactionType String\n  slackUserId     String?\n  status          SlackInteractionStatus @default(RECEIVED)\n  payload         Json?\n  result          Json?\n  errorMessage    String?\n  receivedAt      DateTime               @default(now()) @db.Timestamptz(3)\n  processedAt     DateTime?              @db.Timestamptz(3)\n\n  @@index([status, receivedAt])\n}\n\nmodel OutboxEvent {\n  id             String       @id @default(uuid()) @db.Uuid\n  idempotencyKey String       @unique\n  kind           String\n  payload        Json\n  status         OutboxStatus @default(PENDING)\n  availableAt    DateTime     @default(now()) @db.Timestamptz(3)\n  dispatchedAt   DateTime?    @db.Timestamptz(3)\n  attempts       Int          @default(0)\n  lastError      String?\n  createdAt      DateTime     @default(now()) @db.Timestamptz(3)\n  updatedAt      DateTime     @updatedAt @db.Timestamptz(3)\n\n  @@index([status, availableAt])\n}\n\nmodel WorkflowRun {\n  id             String         @id @default(uuid()) @db.Uuid\n  logicalKey     String         @unique\n  kind           WorkflowKind\n  entityId       String\n  generation     Int\n  vercelRunId    String?        @unique\n  status         WorkflowStatus @default(PENDING)\n  expectedWakeAt DateTime?      @db.Timestamptz(3)\n  startedAt      DateTime?      @db.Timestamptz(3)\n  finishedAt     DateTime?      @db.Timestamptz(3)\n  lastError      String?\n  createdAt      DateTime       @default(now()) @db.Timestamptz(3)\n  updatedAt      DateTime       @updatedAt @db.Timestamptz(3)\n\n  @@index([kind, entityId, generation])\n  @@index([status, expectedWakeAt])\n}\n\nmodel AuditLog {\n  id          String   @id @default(uuid()) @db.Uuid\n  actorUserId String?  @db.Uuid\n  action      String\n  entityType  String\n  entityId    String\n  changes     Json     @default(\"{}\")\n  requestId   String?\n  createdAt   DateTime @default(now()) @db.Timestamptz(3)\n  actorUser   User?    @relation(fields: [actorUserId], references: [id], onDelete: SetNull)\n\n  @@index([entityType, entityId, createdAt])\n  @@index([actorUserId, createdAt])\n}\n",
	"runtimeDataModel": {
		"models": {},
		"enums": {},
		"types": {}
	},
	"parameterizationSchema": {
		"strings": [],
		"graph": ""
	}
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slackUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"timezone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"enum\",\"type\":\"UserRole\"},{\"name\":\"active\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"notificationPreferences\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"accounts\",\"kind\":\"object\",\"type\":\"Account\",\"relationName\":\"AccountToUser\"},{\"name\":\"sessions\",\"kind\":\"object\",\"type\":\"Session\",\"relationName\":\"SessionToUser\"},{\"name\":\"memberships\",\"kind\":\"object\",\"type\":\"TeamMembership\",\"relationName\":\"TeamMembershipToUser\"},{\"name\":\"scheduleParticipants\",\"kind\":\"object\",\"type\":\"ScheduleParticipant\",\"relationName\":\"ScheduleParticipantToUser\"},{\"name\":\"replacementOverrides\",\"kind\":\"object\",\"type\":\"ScheduleOverride\",\"relationName\":\"OverrideReplacement\"},{\"name\":\"replacedOverrides\",\"kind\":\"object\",\"type\":\"ScheduleOverride\",\"relationName\":\"OverrideReplaced\"},{\"name\":\"createdOverrides\",\"kind\":\"object\",\"type\":\"ScheduleOverride\",\"relationName\":\"OverrideCreator\"},{\"name\":\"escalationTargets\",\"kind\":\"object\",\"type\":\"EscalationTarget\",\"relationName\":\"EscalationTargetToUser\"},{\"name\":\"assignedIncidents\",\"kind\":\"object\",\"type\":\"Incident\",\"relationName\":\"IncidentAssignee\"},{\"name\":\"timelineEntries\",\"kind\":\"object\",\"type\":\"IncidentTimelineEntry\",\"relationName\":\"IncidentTimelineEntryToUser\"},{\"name\":\"notificationLogs\",\"kind\":\"object\",\"type\":\"NotificationLog\",\"relationName\":\"NotificationLogToUser\"},{\"name\":\"slackMessages\",\"kind\":\"object\",\"type\":\"SlackMessage\",\"relationName\":\"SlackMessageToUser\"},{\"name\":\"auditLogs\",\"kind\":\"object\",\"type\":\"AuditLog\",\"relationName\":\"AuditLogToUser\"}],\"dbName\":null},\"Account\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"provider\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"providerAccountId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"refreshToken\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"refresh_token\"},{\"name\":\"accessToken\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"access_token\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"expires_at\"},{\"name\":\"tokenType\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"token_type\"},{\"name\":\"scope\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"idToken\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"id_token\"},{\"name\":\"sessionState\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"session_state\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"AccountToUser\"}],\"dbName\":null},\"Session\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sessionToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expires\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"SessionToUser\"}],\"dbName\":null},\"VerificationToken\":{\"fields\":[{\"name\":\"identifier\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expires\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Team\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slug\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slackChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"timezone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"handoffMessagesEnabled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"digestEnabled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"digestDayOfWeek\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"digestLocalTime\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"active\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"memberships\",\"kind\":\"object\",\"type\":\"TeamMembership\",\"relationName\":\"TeamToTeamMembership\"},{\"name\":\"services\",\"kind\":\"object\",\"type\":\"Service\",\"relationName\":\"ServiceToTeam\"},{\"name\":\"schedules\",\"kind\":\"object\",\"type\":\"Schedule\",\"relationName\":\"ScheduleToTeam\"},{\"name\":\"escalationPolicies\",\"kind\":\"object\",\"type\":\"EscalationPolicy\",\"relationName\":\"EscalationPolicyToTeam\"},{\"name\":\"escalationTargets\",\"kind\":\"object\",\"type\":\"EscalationTarget\",\"relationName\":\"EscalationTargetTeam\"}],\"dbName\":null},\"TeamMembership\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"teamId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"enum\",\"type\":\"TeamMembershipRole\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"team\",\"kind\":\"object\",\"type\":\"Team\",\"relationName\":\"TeamToTeamMembership\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"TeamMembershipToUser\"}],\"dbName\":null},\"Service\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"teamId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"escalationPolicyId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slug\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"routingKeyPrefix\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"routingKeyHash\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slackChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sourceLinkTemplate\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"autoCreateIncidentChannel\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"incidentChannelsPrivate\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"criticalChannelThresholdMinutes\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"nagIntervals\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"active\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"team\",\"kind\":\"object\",\"type\":\"Team\",\"relationName\":\"ServiceToTeam\"},{\"name\":\"escalationPolicy\",\"kind\":\"object\",\"type\":\"EscalationPolicy\",\"relationName\":\"EscalationPolicyToService\"},{\"name\":\"alerts\",\"kind\":\"object\",\"type\":\"Alert\",\"relationName\":\"AlertToService\"},{\"name\":\"incidents\",\"kind\":\"object\",\"type\":\"Incident\",\"relationName\":\"IncidentToService\"}],\"dbName\":null},\"Schedule\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"teamId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slug\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"timezone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"active\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"team\",\"kind\":\"object\",\"type\":\"Team\",\"relationName\":\"ScheduleToTeam\"},{\"name\":\"layers\",\"kind\":\"object\",\"type\":\"ScheduleLayer\",\"relationName\":\"ScheduleToScheduleLayer\"},{\"name\":\"overrides\",\"kind\":\"object\",\"type\":\"ScheduleOverride\",\"relationName\":\"ScheduleToScheduleOverride\"},{\"name\":\"escalationTargets\",\"kind\":\"object\",\"type\":\"EscalationTarget\",\"relationName\":\"EscalationTargetToSchedule\"}],\"dbName\":null},\"ScheduleLayer\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"scheduleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"position\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"rotationType\",\"kind\":\"enum\",\"type\":\"RotationType\"},{\"name\":\"rotationInterval\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"customIntervalMinutes\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"handoffLocalTime\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"anchorLocalDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"anchorInstant\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"activeFrom\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"activeUntil\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"schedule\",\"kind\":\"object\",\"type\":\"Schedule\",\"relationName\":\"ScheduleToScheduleLayer\"},{\"name\":\"participants\",\"kind\":\"object\",\"type\":\"ScheduleParticipant\",\"relationName\":\"ScheduleLayerToScheduleParticipant\"},{\"name\":\"restrictions\",\"kind\":\"object\",\"type\":\"ScheduleRestriction\",\"relationName\":\"ScheduleLayerToScheduleRestriction\"},{\"name\":\"overrides\",\"kind\":\"object\",\"type\":\"ScheduleOverride\",\"relationName\":\"ScheduleLayerToScheduleOverride\"}],\"dbName\":null},\"ScheduleParticipant\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"layerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"position\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"layer\",\"kind\":\"object\",\"type\":\"ScheduleLayer\",\"relationName\":\"ScheduleLayerToScheduleParticipant\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"ScheduleParticipantToUser\"}],\"dbName\":null},\"ScheduleRestriction\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"layerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"dayOfWeek\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"startLocalTime\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"endLocalTime\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"layer\",\"kind\":\"object\",\"type\":\"ScheduleLayer\",\"relationName\":\"ScheduleLayerToScheduleRestriction\"}],\"dbName\":null},\"ScheduleOverride\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"scheduleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"layerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"replacementUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"replacedUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdById\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"startsAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"endsAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"reason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"schedule\",\"kind\":\"object\",\"type\":\"Schedule\",\"relationName\":\"ScheduleToScheduleOverride\"},{\"name\":\"layer\",\"kind\":\"object\",\"type\":\"ScheduleLayer\",\"relationName\":\"ScheduleLayerToScheduleOverride\"},{\"name\":\"replacementUser\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"OverrideReplacement\"},{\"name\":\"replacedUser\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"OverrideReplaced\"},{\"name\":\"createdBy\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"OverrideCreator\"}],\"dbName\":null},\"EscalationPolicy\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"teamId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slug\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"repeatCount\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"acknowledgementTimeoutMinutes\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"active\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"team\",\"kind\":\"object\",\"type\":\"Team\",\"relationName\":\"EscalationPolicyToTeam\"},{\"name\":\"steps\",\"kind\":\"object\",\"type\":\"EscalationStep\",\"relationName\":\"EscalationPolicyToEscalationStep\"},{\"name\":\"services\",\"kind\":\"object\",\"type\":\"Service\",\"relationName\":\"EscalationPolicyToService\"}],\"dbName\":null},\"EscalationStep\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"policyId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"position\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"timeoutMinutes\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"policy\",\"kind\":\"object\",\"type\":\"EscalationPolicy\",\"relationName\":\"EscalationPolicyToEscalationStep\"},{\"name\":\"targets\",\"kind\":\"object\",\"type\":\"EscalationTarget\",\"relationName\":\"EscalationStepToEscalationTarget\"},{\"name\":\"incidents\",\"kind\":\"object\",\"type\":\"Incident\",\"relationName\":\"IncidentCurrentStep\"}],\"dbName\":null},\"EscalationTarget\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stepId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"position\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"scheduleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"teamId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"step\",\"kind\":\"object\",\"type\":\"EscalationStep\",\"relationName\":\"EscalationStepToEscalationTarget\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"EscalationTargetToUser\"},{\"name\":\"schedule\",\"kind\":\"object\",\"type\":\"Schedule\",\"relationName\":\"EscalationTargetToSchedule\"},{\"name\":\"team\",\"kind\":\"object\",\"type\":\"Team\",\"relationName\":\"EscalationTargetTeam\"}],\"dbName\":null},\"Alert\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"serviceId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"dedupKey\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"AlertStatus\"},{\"name\":\"severity\",\"kind\":\"enum\",\"type\":\"Severity\"},{\"name\":\"source\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"latestPayload\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"occurrenceCount\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"firstSeenAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"lastSeenAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"service\",\"kind\":\"object\",\"type\":\"Service\",\"relationName\":\"AlertToService\"},{\"name\":\"occurrences\",\"kind\":\"object\",\"type\":\"AlertOccurrence\",\"relationName\":\"AlertToAlertOccurrence\"},{\"name\":\"incidents\",\"kind\":\"object\",\"type\":\"IncidentAlert\",\"relationName\":\"AlertToIncidentAlert\"}],\"dbName\":null},\"AlertOccurrence\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"alertId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"action\",\"kind\":\"enum\",\"type\":\"AlertAction\"},{\"name\":\"payload\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"requestId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"requestHash\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"receivedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"alert\",\"kind\":\"object\",\"type\":\"Alert\",\"relationName\":\"AlertToAlertOccurrence\"}],\"dbName\":null},\"Incident\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"number\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"serviceId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"dedupKey\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"state\",\"kind\":\"enum\",\"type\":\"IncidentState\"},{\"name\":\"severity\",\"kind\":\"enum\",\"type\":\"Severity\"},{\"name\":\"summary\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"source\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sourceUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"assigneeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"currentStepId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"currentEscalationLoop\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"currentEscalationPosition\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"escalationDeadline\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"escalationGeneration\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"nagDeadline\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"nagGeneration\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"snoozedUntil\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"acknowledgementExpiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"incidentSlackChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"incidentStatusMessageTs\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"openedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"acknowledgedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"resolvedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"version\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"service\",\"kind\":\"object\",\"type\":\"Service\",\"relationName\":\"IncidentToService\"},{\"name\":\"assignee\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"IncidentAssignee\"},{\"name\":\"currentStep\",\"kind\":\"object\",\"type\":\"EscalationStep\",\"relationName\":\"IncidentCurrentStep\"},{\"name\":\"alerts\",\"kind\":\"object\",\"type\":\"IncidentAlert\",\"relationName\":\"IncidentToIncidentAlert\"},{\"name\":\"timelineEntries\",\"kind\":\"object\",\"type\":\"IncidentTimelineEntry\",\"relationName\":\"IncidentToIncidentTimelineEntry\"},{\"name\":\"notificationLogs\",\"kind\":\"object\",\"type\":\"NotificationLog\",\"relationName\":\"IncidentToNotificationLog\"},{\"name\":\"slackMessages\",\"kind\":\"object\",\"type\":\"SlackMessage\",\"relationName\":\"IncidentToSlackMessage\"}],\"dbName\":null},\"IncidentAlert\":{\"fields\":[{\"name\":\"incidentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"alertId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"linkedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"incident\",\"kind\":\"object\",\"type\":\"Incident\",\"relationName\":\"IncidentToIncidentAlert\"},{\"name\":\"alert\",\"kind\":\"object\",\"type\":\"Alert\",\"relationName\":\"AlertToIncidentAlert\"}],\"dbName\":null},\"IncidentTimelineEntry\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"incidentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"enum\",\"type\":\"TimelineEventType\"},{\"name\":\"actorKind\",\"kind\":\"enum\",\"type\":\"ActorKind\"},{\"name\":\"actorUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slackUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"message\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"metadata\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"idempotencyKey\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"incident\",\"kind\":\"object\",\"type\":\"Incident\",\"relationName\":\"IncidentToIncidentTimelineEntry\"},{\"name\":\"actorUser\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"IncidentTimelineEntryToUser\"}],\"dbName\":null},\"NotificationLog\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"incidentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"targetUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"channel\",\"kind\":\"enum\",\"type\":\"NotificationChannel\"},{\"name\":\"targetAddress\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"NotificationStatus\"},{\"name\":\"attempt\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"idempotencyKey\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"providerMessageId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slackChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slackMessageTs\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"errorCode\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"errorMessage\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"queuedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"attemptedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"deliveredAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"incident\",\"kind\":\"object\",\"type\":\"Incident\",\"relationName\":\"IncidentToNotificationLog\"},{\"name\":\"targetUser\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"NotificationLogToUser\"}],\"dbName\":null},\"SlackMessage\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"incidentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"targetUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"destination\",\"kind\":\"enum\",\"type\":\"SlackMessageDestination\"},{\"name\":\"destinationKey\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"channelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"messageTs\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"renderVersion\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"incident\",\"kind\":\"object\",\"type\":\"Incident\",\"relationName\":\"IncidentToSlackMessage\"},{\"name\":\"targetUser\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"SlackMessageToUser\"}],\"dbName\":null},\"SlackInteractionReceipt\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"receiptKey\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"interactionType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slackUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"SlackInteractionStatus\"},{\"name\":\"payload\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"result\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"errorMessage\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"receivedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"processedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"OutboxEvent\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"idempotencyKey\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"kind\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"payload\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"OutboxStatus\"},{\"name\":\"availableAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"dispatchedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"attempts\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"lastError\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"WorkflowRun\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"logicalKey\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"kind\",\"kind\":\"enum\",\"type\":\"WorkflowKind\"},{\"name\":\"entityId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"generation\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"vercelRunId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"WorkflowStatus\"},{\"name\":\"expectedWakeAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"startedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"finishedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"lastError\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"AuditLog\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"actorUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"action\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"entityType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"entityId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"changes\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"requestId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"actorUser\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"AuditLogToUser\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
	strings: JSON.parse("[\"where\",\"orderBy\",\"cursor\",\"user\",\"accounts\",\"sessions\",\"memberships\",\"team\",\"policy\",\"step\",\"schedule\",\"layer\",\"participants\",\"restrictions\",\"replacementUser\",\"replacedUser\",\"createdBy\",\"overrides\",\"_count\",\"layers\",\"escalationTargets\",\"targets\",\"service\",\"assignee\",\"currentStep\",\"incident\",\"alert\",\"occurrences\",\"incidents\",\"alerts\",\"actorUser\",\"timelineEntries\",\"targetUser\",\"notificationLogs\",\"slackMessages\",\"steps\",\"services\",\"escalationPolicy\",\"schedules\",\"escalationPolicies\",\"scheduleParticipants\",\"replacementOverrides\",\"replacedOverrides\",\"createdOverrides\",\"assignedIncidents\",\"auditLogs\",\"User.findUnique\",\"User.findUniqueOrThrow\",\"User.findFirst\",\"User.findFirstOrThrow\",\"User.findMany\",\"data\",\"User.createOne\",\"User.createMany\",\"User.createManyAndReturn\",\"User.updateOne\",\"User.updateMany\",\"User.updateManyAndReturn\",\"create\",\"update\",\"User.upsertOne\",\"User.deleteOne\",\"User.deleteMany\",\"having\",\"_min\",\"_max\",\"User.groupBy\",\"User.aggregate\",\"Account.findUnique\",\"Account.findUniqueOrThrow\",\"Account.findFirst\",\"Account.findFirstOrThrow\",\"Account.findMany\",\"Account.createOne\",\"Account.createMany\",\"Account.createManyAndReturn\",\"Account.updateOne\",\"Account.updateMany\",\"Account.updateManyAndReturn\",\"Account.upsertOne\",\"Account.deleteOne\",\"Account.deleteMany\",\"_avg\",\"_sum\",\"Account.groupBy\",\"Account.aggregate\",\"Session.findUnique\",\"Session.findUniqueOrThrow\",\"Session.findFirst\",\"Session.findFirstOrThrow\",\"Session.findMany\",\"Session.createOne\",\"Session.createMany\",\"Session.createManyAndReturn\",\"Session.updateOne\",\"Session.updateMany\",\"Session.updateManyAndReturn\",\"Session.upsertOne\",\"Session.deleteOne\",\"Session.deleteMany\",\"Session.groupBy\",\"Session.aggregate\",\"VerificationToken.findUnique\",\"VerificationToken.findUniqueOrThrow\",\"VerificationToken.findFirst\",\"VerificationToken.findFirstOrThrow\",\"VerificationToken.findMany\",\"VerificationToken.createOne\",\"VerificationToken.createMany\",\"VerificationToken.createManyAndReturn\",\"VerificationToken.updateOne\",\"VerificationToken.updateMany\",\"VerificationToken.updateManyAndReturn\",\"VerificationToken.upsertOne\",\"VerificationToken.deleteOne\",\"VerificationToken.deleteMany\",\"VerificationToken.groupBy\",\"VerificationToken.aggregate\",\"Team.findUnique\",\"Team.findUniqueOrThrow\",\"Team.findFirst\",\"Team.findFirstOrThrow\",\"Team.findMany\",\"Team.createOne\",\"Team.createMany\",\"Team.createManyAndReturn\",\"Team.updateOne\",\"Team.updateMany\",\"Team.updateManyAndReturn\",\"Team.upsertOne\",\"Team.deleteOne\",\"Team.deleteMany\",\"Team.groupBy\",\"Team.aggregate\",\"TeamMembership.findUnique\",\"TeamMembership.findUniqueOrThrow\",\"TeamMembership.findFirst\",\"TeamMembership.findFirstOrThrow\",\"TeamMembership.findMany\",\"TeamMembership.createOne\",\"TeamMembership.createMany\",\"TeamMembership.createManyAndReturn\",\"TeamMembership.updateOne\",\"TeamMembership.updateMany\",\"TeamMembership.updateManyAndReturn\",\"TeamMembership.upsertOne\",\"TeamMembership.deleteOne\",\"TeamMembership.deleteMany\",\"TeamMembership.groupBy\",\"TeamMembership.aggregate\",\"Service.findUnique\",\"Service.findUniqueOrThrow\",\"Service.findFirst\",\"Service.findFirstOrThrow\",\"Service.findMany\",\"Service.createOne\",\"Service.createMany\",\"Service.createManyAndReturn\",\"Service.updateOne\",\"Service.updateMany\",\"Service.updateManyAndReturn\",\"Service.upsertOne\",\"Service.deleteOne\",\"Service.deleteMany\",\"Service.groupBy\",\"Service.aggregate\",\"Schedule.findUnique\",\"Schedule.findUniqueOrThrow\",\"Schedule.findFirst\",\"Schedule.findFirstOrThrow\",\"Schedule.findMany\",\"Schedule.createOne\",\"Schedule.createMany\",\"Schedule.createManyAndReturn\",\"Schedule.updateOne\",\"Schedule.updateMany\",\"Schedule.updateManyAndReturn\",\"Schedule.upsertOne\",\"Schedule.deleteOne\",\"Schedule.deleteMany\",\"Schedule.groupBy\",\"Schedule.aggregate\",\"ScheduleLayer.findUnique\",\"ScheduleLayer.findUniqueOrThrow\",\"ScheduleLayer.findFirst\",\"ScheduleLayer.findFirstOrThrow\",\"ScheduleLayer.findMany\",\"ScheduleLayer.createOne\",\"ScheduleLayer.createMany\",\"ScheduleLayer.createManyAndReturn\",\"ScheduleLayer.updateOne\",\"ScheduleLayer.updateMany\",\"ScheduleLayer.updateManyAndReturn\",\"ScheduleLayer.upsertOne\",\"ScheduleLayer.deleteOne\",\"ScheduleLayer.deleteMany\",\"ScheduleLayer.groupBy\",\"ScheduleLayer.aggregate\",\"ScheduleParticipant.findUnique\",\"ScheduleParticipant.findUniqueOrThrow\",\"ScheduleParticipant.findFirst\",\"ScheduleParticipant.findFirstOrThrow\",\"ScheduleParticipant.findMany\",\"ScheduleParticipant.createOne\",\"ScheduleParticipant.createMany\",\"ScheduleParticipant.createManyAndReturn\",\"ScheduleParticipant.updateOne\",\"ScheduleParticipant.updateMany\",\"ScheduleParticipant.updateManyAndReturn\",\"ScheduleParticipant.upsertOne\",\"ScheduleParticipant.deleteOne\",\"ScheduleParticipant.deleteMany\",\"ScheduleParticipant.groupBy\",\"ScheduleParticipant.aggregate\",\"ScheduleRestriction.findUnique\",\"ScheduleRestriction.findUniqueOrThrow\",\"ScheduleRestriction.findFirst\",\"ScheduleRestriction.findFirstOrThrow\",\"ScheduleRestriction.findMany\",\"ScheduleRestriction.createOne\",\"ScheduleRestriction.createMany\",\"ScheduleRestriction.createManyAndReturn\",\"ScheduleRestriction.updateOne\",\"ScheduleRestriction.updateMany\",\"ScheduleRestriction.updateManyAndReturn\",\"ScheduleRestriction.upsertOne\",\"ScheduleRestriction.deleteOne\",\"ScheduleRestriction.deleteMany\",\"ScheduleRestriction.groupBy\",\"ScheduleRestriction.aggregate\",\"ScheduleOverride.findUnique\",\"ScheduleOverride.findUniqueOrThrow\",\"ScheduleOverride.findFirst\",\"ScheduleOverride.findFirstOrThrow\",\"ScheduleOverride.findMany\",\"ScheduleOverride.createOne\",\"ScheduleOverride.createMany\",\"ScheduleOverride.createManyAndReturn\",\"ScheduleOverride.updateOne\",\"ScheduleOverride.updateMany\",\"ScheduleOverride.updateManyAndReturn\",\"ScheduleOverride.upsertOne\",\"ScheduleOverride.deleteOne\",\"ScheduleOverride.deleteMany\",\"ScheduleOverride.groupBy\",\"ScheduleOverride.aggregate\",\"EscalationPolicy.findUnique\",\"EscalationPolicy.findUniqueOrThrow\",\"EscalationPolicy.findFirst\",\"EscalationPolicy.findFirstOrThrow\",\"EscalationPolicy.findMany\",\"EscalationPolicy.createOne\",\"EscalationPolicy.createMany\",\"EscalationPolicy.createManyAndReturn\",\"EscalationPolicy.updateOne\",\"EscalationPolicy.updateMany\",\"EscalationPolicy.updateManyAndReturn\",\"EscalationPolicy.upsertOne\",\"EscalationPolicy.deleteOne\",\"EscalationPolicy.deleteMany\",\"EscalationPolicy.groupBy\",\"EscalationPolicy.aggregate\",\"EscalationStep.findUnique\",\"EscalationStep.findUniqueOrThrow\",\"EscalationStep.findFirst\",\"EscalationStep.findFirstOrThrow\",\"EscalationStep.findMany\",\"EscalationStep.createOne\",\"EscalationStep.createMany\",\"EscalationStep.createManyAndReturn\",\"EscalationStep.updateOne\",\"EscalationStep.updateMany\",\"EscalationStep.updateManyAndReturn\",\"EscalationStep.upsertOne\",\"EscalationStep.deleteOne\",\"EscalationStep.deleteMany\",\"EscalationStep.groupBy\",\"EscalationStep.aggregate\",\"EscalationTarget.findUnique\",\"EscalationTarget.findUniqueOrThrow\",\"EscalationTarget.findFirst\",\"EscalationTarget.findFirstOrThrow\",\"EscalationTarget.findMany\",\"EscalationTarget.createOne\",\"EscalationTarget.createMany\",\"EscalationTarget.createManyAndReturn\",\"EscalationTarget.updateOne\",\"EscalationTarget.updateMany\",\"EscalationTarget.updateManyAndReturn\",\"EscalationTarget.upsertOne\",\"EscalationTarget.deleteOne\",\"EscalationTarget.deleteMany\",\"EscalationTarget.groupBy\",\"EscalationTarget.aggregate\",\"Alert.findUnique\",\"Alert.findUniqueOrThrow\",\"Alert.findFirst\",\"Alert.findFirstOrThrow\",\"Alert.findMany\",\"Alert.createOne\",\"Alert.createMany\",\"Alert.createManyAndReturn\",\"Alert.updateOne\",\"Alert.updateMany\",\"Alert.updateManyAndReturn\",\"Alert.upsertOne\",\"Alert.deleteOne\",\"Alert.deleteMany\",\"Alert.groupBy\",\"Alert.aggregate\",\"AlertOccurrence.findUnique\",\"AlertOccurrence.findUniqueOrThrow\",\"AlertOccurrence.findFirst\",\"AlertOccurrence.findFirstOrThrow\",\"AlertOccurrence.findMany\",\"AlertOccurrence.createOne\",\"AlertOccurrence.createMany\",\"AlertOccurrence.createManyAndReturn\",\"AlertOccurrence.updateOne\",\"AlertOccurrence.updateMany\",\"AlertOccurrence.updateManyAndReturn\",\"AlertOccurrence.upsertOne\",\"AlertOccurrence.deleteOne\",\"AlertOccurrence.deleteMany\",\"AlertOccurrence.groupBy\",\"AlertOccurrence.aggregate\",\"Incident.findUnique\",\"Incident.findUniqueOrThrow\",\"Incident.findFirst\",\"Incident.findFirstOrThrow\",\"Incident.findMany\",\"Incident.createOne\",\"Incident.createMany\",\"Incident.createManyAndReturn\",\"Incident.updateOne\",\"Incident.updateMany\",\"Incident.updateManyAndReturn\",\"Incident.upsertOne\",\"Incident.deleteOne\",\"Incident.deleteMany\",\"Incident.groupBy\",\"Incident.aggregate\",\"IncidentAlert.findUnique\",\"IncidentAlert.findUniqueOrThrow\",\"IncidentAlert.findFirst\",\"IncidentAlert.findFirstOrThrow\",\"IncidentAlert.findMany\",\"IncidentAlert.createOne\",\"IncidentAlert.createMany\",\"IncidentAlert.createManyAndReturn\",\"IncidentAlert.updateOne\",\"IncidentAlert.updateMany\",\"IncidentAlert.updateManyAndReturn\",\"IncidentAlert.upsertOne\",\"IncidentAlert.deleteOne\",\"IncidentAlert.deleteMany\",\"IncidentAlert.groupBy\",\"IncidentAlert.aggregate\",\"IncidentTimelineEntry.findUnique\",\"IncidentTimelineEntry.findUniqueOrThrow\",\"IncidentTimelineEntry.findFirst\",\"IncidentTimelineEntry.findFirstOrThrow\",\"IncidentTimelineEntry.findMany\",\"IncidentTimelineEntry.createOne\",\"IncidentTimelineEntry.createMany\",\"IncidentTimelineEntry.createManyAndReturn\",\"IncidentTimelineEntry.updateOne\",\"IncidentTimelineEntry.updateMany\",\"IncidentTimelineEntry.updateManyAndReturn\",\"IncidentTimelineEntry.upsertOne\",\"IncidentTimelineEntry.deleteOne\",\"IncidentTimelineEntry.deleteMany\",\"IncidentTimelineEntry.groupBy\",\"IncidentTimelineEntry.aggregate\",\"NotificationLog.findUnique\",\"NotificationLog.findUniqueOrThrow\",\"NotificationLog.findFirst\",\"NotificationLog.findFirstOrThrow\",\"NotificationLog.findMany\",\"NotificationLog.createOne\",\"NotificationLog.createMany\",\"NotificationLog.createManyAndReturn\",\"NotificationLog.updateOne\",\"NotificationLog.updateMany\",\"NotificationLog.updateManyAndReturn\",\"NotificationLog.upsertOne\",\"NotificationLog.deleteOne\",\"NotificationLog.deleteMany\",\"NotificationLog.groupBy\",\"NotificationLog.aggregate\",\"SlackMessage.findUnique\",\"SlackMessage.findUniqueOrThrow\",\"SlackMessage.findFirst\",\"SlackMessage.findFirstOrThrow\",\"SlackMessage.findMany\",\"SlackMessage.createOne\",\"SlackMessage.createMany\",\"SlackMessage.createManyAndReturn\",\"SlackMessage.updateOne\",\"SlackMessage.updateMany\",\"SlackMessage.updateManyAndReturn\",\"SlackMessage.upsertOne\",\"SlackMessage.deleteOne\",\"SlackMessage.deleteMany\",\"SlackMessage.groupBy\",\"SlackMessage.aggregate\",\"SlackInteractionReceipt.findUnique\",\"SlackInteractionReceipt.findUniqueOrThrow\",\"SlackInteractionReceipt.findFirst\",\"SlackInteractionReceipt.findFirstOrThrow\",\"SlackInteractionReceipt.findMany\",\"SlackInteractionReceipt.createOne\",\"SlackInteractionReceipt.createMany\",\"SlackInteractionReceipt.createManyAndReturn\",\"SlackInteractionReceipt.updateOne\",\"SlackInteractionReceipt.updateMany\",\"SlackInteractionReceipt.updateManyAndReturn\",\"SlackInteractionReceipt.upsertOne\",\"SlackInteractionReceipt.deleteOne\",\"SlackInteractionReceipt.deleteMany\",\"SlackInteractionReceipt.groupBy\",\"SlackInteractionReceipt.aggregate\",\"OutboxEvent.findUnique\",\"OutboxEvent.findUniqueOrThrow\",\"OutboxEvent.findFirst\",\"OutboxEvent.findFirstOrThrow\",\"OutboxEvent.findMany\",\"OutboxEvent.createOne\",\"OutboxEvent.createMany\",\"OutboxEvent.createManyAndReturn\",\"OutboxEvent.updateOne\",\"OutboxEvent.updateMany\",\"OutboxEvent.updateManyAndReturn\",\"OutboxEvent.upsertOne\",\"OutboxEvent.deleteOne\",\"OutboxEvent.deleteMany\",\"OutboxEvent.groupBy\",\"OutboxEvent.aggregate\",\"WorkflowRun.findUnique\",\"WorkflowRun.findUniqueOrThrow\",\"WorkflowRun.findFirst\",\"WorkflowRun.findFirstOrThrow\",\"WorkflowRun.findMany\",\"WorkflowRun.createOne\",\"WorkflowRun.createMany\",\"WorkflowRun.createManyAndReturn\",\"WorkflowRun.updateOne\",\"WorkflowRun.updateMany\",\"WorkflowRun.updateManyAndReturn\",\"WorkflowRun.upsertOne\",\"WorkflowRun.deleteOne\",\"WorkflowRun.deleteMany\",\"WorkflowRun.groupBy\",\"WorkflowRun.aggregate\",\"AuditLog.findUnique\",\"AuditLog.findUniqueOrThrow\",\"AuditLog.findFirst\",\"AuditLog.findFirstOrThrow\",\"AuditLog.findMany\",\"AuditLog.createOne\",\"AuditLog.createMany\",\"AuditLog.createManyAndReturn\",\"AuditLog.updateOne\",\"AuditLog.updateMany\",\"AuditLog.updateManyAndReturn\",\"AuditLog.upsertOne\",\"AuditLog.deleteOne\",\"AuditLog.deleteMany\",\"AuditLog.groupBy\",\"AuditLog.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"actorUserId\",\"action\",\"entityType\",\"entityId\",\"changes\",\"requestId\",\"createdAt\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"string_contains\",\"string_starts_with\",\"string_ends_with\",\"array_starts_with\",\"array_ends_with\",\"array_contains\",\"logicalKey\",\"WorkflowKind\",\"kind\",\"generation\",\"vercelRunId\",\"WorkflowStatus\",\"status\",\"expectedWakeAt\",\"startedAt\",\"finishedAt\",\"lastError\",\"updatedAt\",\"idempotencyKey\",\"payload\",\"OutboxStatus\",\"availableAt\",\"dispatchedAt\",\"attempts\",\"receiptKey\",\"interactionType\",\"slackUserId\",\"SlackInteractionStatus\",\"result\",\"errorMessage\",\"receivedAt\",\"processedAt\",\"incidentId\",\"targetUserId\",\"SlackMessageDestination\",\"destination\",\"destinationKey\",\"channelId\",\"messageTs\",\"renderVersion\",\"NotificationChannel\",\"channel\",\"targetAddress\",\"NotificationStatus\",\"attempt\",\"providerMessageId\",\"slackChannelId\",\"slackMessageTs\",\"errorCode\",\"queuedAt\",\"attemptedAt\",\"deliveredAt\",\"TimelineEventType\",\"type\",\"ActorKind\",\"actorKind\",\"message\",\"metadata\",\"alertId\",\"linkedAt\",\"number\",\"serviceId\",\"dedupKey\",\"IncidentState\",\"state\",\"Severity\",\"severity\",\"summary\",\"source\",\"sourceUrl\",\"assigneeId\",\"currentStepId\",\"currentEscalationLoop\",\"currentEscalationPosition\",\"escalationDeadline\",\"escalationGeneration\",\"nagDeadline\",\"nagGeneration\",\"snoozedUntil\",\"acknowledgementExpiresAt\",\"incidentSlackChannelId\",\"incidentStatusMessageTs\",\"openedAt\",\"acknowledgedAt\",\"resolvedAt\",\"version\",\"AlertAction\",\"requestHash\",\"AlertStatus\",\"latestPayload\",\"occurrenceCount\",\"firstSeenAt\",\"lastSeenAt\",\"stepId\",\"position\",\"userId\",\"scheduleId\",\"teamId\",\"policyId\",\"timeoutMinutes\",\"name\",\"slug\",\"repeatCount\",\"acknowledgementTimeoutMinutes\",\"active\",\"layerId\",\"replacementUserId\",\"replacedUserId\",\"createdById\",\"startsAt\",\"endsAt\",\"reason\",\"dayOfWeek\",\"startLocalTime\",\"endLocalTime\",\"RotationType\",\"rotationType\",\"rotationInterval\",\"customIntervalMinutes\",\"handoffLocalTime\",\"anchorLocalDate\",\"anchorInstant\",\"activeFrom\",\"activeUntil\",\"timezone\",\"escalationPolicyId\",\"description\",\"routingKeyPrefix\",\"routingKeyHash\",\"sourceLinkTemplate\",\"autoCreateIncidentChannel\",\"incidentChannelsPrivate\",\"criticalChannelThresholdMinutes\",\"nagIntervals\",\"TeamMembershipRole\",\"role\",\"handoffMessagesEnabled\",\"digestEnabled\",\"digestDayOfWeek\",\"digestLocalTime\",\"every\",\"some\",\"none\",\"identifier\",\"token\",\"expires\",\"identifier_token\",\"sessionToken\",\"provider\",\"providerAccountId\",\"refreshToken\",\"accessToken\",\"expiresAt\",\"tokenType\",\"scope\",\"idToken\",\"sessionState\",\"email\",\"UserRole\",\"notificationPreferences\",\"teamId_slug\",\"serviceId_dedupKey\",\"channelId_messageTs\",\"incidentId_alertId\",\"layerId_dayOfWeek_startLocalTime_endLocalTime\",\"layerId_position\",\"layerId_userId\",\"scheduleId_position\",\"stepId_position\",\"policyId_position\",\"teamId_userId\",\"provider_providerAccountId\",\"is\",\"isNot\",\"connectOrCreate\",\"upsert\",\"createMany\",\"set\",\"disconnect\",\"delete\",\"connect\",\"updateMany\",\"deleteMany\",\"increment\",\"decrement\",\"multiply\",\"divide\"]"),
	graph: "0A74AaADGgQAALMHACAFAAC0BwAgBgAA6wYAIBQAAO8GACAfAACfBwAgIQAAoAcAICIAAKEHACAoAACvBwAgKQAAhQcAICoAAIUHACArAACFBwAgLAAAtQcAIC0AALYHACDWAwAAsQcAMNcDAAAcABDYAwAAsQcAMNkDAQAAAAHgA0AAngYAIf0DQACeBgAhhgQBAAAAAdAEAQCYBgAh1AQgAOoGACHoBAEAmAYAIfMEAACyB4sFIokFAQAAAAGLBQAApQYAIAEAAAABACAQAwAApQcAINYDAADHBwAw1wMAAAMAENgDAADHBwAw2QMBAJcGACGhBAEAmAYAIcsEAQCXBgAhgAUBAJgGACGBBQEAmAYAIYIFAQCbBgAhgwUBAJsGACGEBQIA_wYAIYUFAQCbBgAhhgUBAJsGACGHBQEAmwYAIYgFAQCbBgAhCAMAAOoMACCCBQAAyAcAIIMFAADIBwAghAUAAMgHACCFBQAAyAcAIIYFAADIBwAghwUAAMgHACCIBQAAyAcAIBEDAAClBwAg1gMAAMcHADDXAwAAAwAQ2AMAAMcHADDZAwEAAAABoQQBAJgGACHLBAEAlwYAIYAFAQCYBgAhgQUBAJgGACGCBQEAmwYAIYMFAQCbBgAhhAUCAP8GACGFBQEAmwYAIYYFAQCbBgAhhwUBAJsGACGIBQEAmwYAIZcFAADGBwAgAwAAAAMAIAEAAAQAMAIAAAUAIAgDAAClBwAg1gMAAMUHADDXAwAABwAQ2AMAAMUHADDZAwEAlwYAIcsEAQCXBgAh_QRAAJ4GACH_BAEAmAYAIQEDAADqDAAgCAMAAKUHACDWAwAAxQcAMNcDAAAHABDYAwAAxQcAMNkDAQAAAAHLBAEAlwYAIf0EQACeBgAh_wQBAAAAAQMAAAAHACABAAAIADACAAAJACAKAwAApQcAIAcAAIAHACDWAwAAwwcAMNcDAAALABDYAwAAwwcAMNkDAQCXBgAh4ANAAJ4GACHLBAEAlwYAIc0EAQCXBgAh8wQAAMQH8wQiAgMAAOoMACAHAADrDAAgCwMAAKUHACAHAACABwAg1gMAAMMHADDXAwAACwAQ2AMAAMMHADDZAwEAAAAB4ANAAJ4GACHLBAEAlwYAIc0EAQCXBgAh8wQAAMQH8wQilgUAAMIHACADAAAACwAgAQAADAAwAgAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIBgHAACABwAgHAAAtQcAIB0AAMEHACAlAAC-BwAg1gMAAMAHADDXAwAAEAAQ2AMAAMAHADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACGaBAEAmwYAIc0EAQCXBgAh0AQBAJgGACHRBAEAmAYAIdQEIADqBgAh6QQBAJcGACHqBAEAmwYAIesEAQCYBgAh7AQBAJgGACHtBAEAmwYAIe4EIADqBgAh7wQgAOoGACHwBAIA_wYAIfEEAAClBgAgCAcAAOsMACAcAADlDAAgHQAA-AwAICUAAPcMACCaBAAAyAcAIOoEAADIBwAg7QQAAMgHACDwBAAAyAcAIBkHAACABwAgHAAAtQcAIB0AAMEHACAlAAC-BwAg1gMAAMAHADDXAwAAEAAQ2AMAAMAHADDZAwEAAAAB4ANAAJ4GACH9A0AAngYAIZoEAQCbBgAhzQQBAJcGACHQBAEAmAYAIdEEAQCYBgAh1AQgAOoGACHpBAEAlwYAIeoEAQCbBgAh6wQBAAAAAewEAQCYBgAh7QQBAJsGACHuBCAA6gYAIe8EIADqBgAh8AQCAP8GACHxBAAApQYAIIwFAAC_BwAgAwAAABAAIAEAABEAMAIAABIAIAoIAAC-BwAgFQAA7wYAIBwAALUHACDWAwAAvQcAMNcDAAAUABDYAwAAvQcAMNkDAQCXBgAhygQCAJoGACHOBAEAlwYAIc8EAgCaBgAhAwgAAPcMACAVAAC1CwAgHAAA5QwAIAsIAAC-BwAgFQAA7wYAIBwAALUHACDWAwAAvQcAMNcDAAAUABDYAwAAvQcAMNkDAQAAAAHKBAIAmgYAIc4EAQCXBgAhzwQCAJoGACGVBQAAvAcAIAMAAAAUACABAAAVADACAAAWACANAwAA-wYAIAcAALsHACAJAAC5BwAgCgAAugcAINYDAAC4BwAw1wMAABgAENgDAAC4BwAw2QMBAJcGACHJBAEAlwYAIcoEAgCaBgAhywQBAPoGACHMBAEA-gYAIc0EAQD6BgAhBwMAAOoMACAHAADrDAAgCQAA8wwAIAoAAPQMACDLBAAAyAcAIMwEAADIBwAgzQQAAMgHACAOAwAA-wYAIAcAALsHACAJAAC5BwAgCgAAugcAINYDAAC4BwAw1wMAABgAENgDAAC4BwAw2QMBAAAAAckEAQCXBgAhygQCAJoGACHLBAEA-gYAIcwEAQD6BgAhzQQBAPoGACGUBQAAtwcAIAMAAAAYACABAAAZADACAAAaACAaBAAAswcAIAUAALQHACAGAADrBgAgFAAA7wYAIB8AAJ8HACAhAACgBwAgIgAAoQcAICgAAK8HACApAACFBwAgKgAAhQcAICsAAIUHACAsAAC1BwAgLQAAtgcAINYDAACxBwAw1wMAABwAENgDAACxBwAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhhgQBAJsGACHQBAEAmAYAIdQEIADqBgAh6AQBAJgGACHzBAAAsgeLBSKJBQEAmAYAIYsFAAClBgAgAQAAABwAIA8HAACABwAgEQAAhQcAIBMAAIQHACAUAADvBgAg1gMAAIMHADDXAwAAHgAQ2AMAAIMHADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACHNBAEAlwYAIdAEAQCYBgAh0QQBAJgGACHUBCAA6gYAIegEAQCYBgAhAQAAAB4AIBUKAACjBwAgDAAArwcAIA0AALAHACARAACFBwAg1gMAAK0HADDXAwAAIAAQ2AMAAK0HADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACHKBAIAmgYAIcwEAQCXBgAh0AQBAJgGACHgBAAArgfgBCLhBAIAmgYAIeIEAgD_BgAh4wQBAJgGACHkBEAAngYAIeUEQACeBgAh5gRAAJ0GACHnBEAAnQYAIQcKAAD0DAAgDAAA4wwAIA0AAPYMACARAADkDAAg4gQAAMgHACDmBAAAyAcAIOcEAADIBwAgFgoAAKMHACAMAACvBwAgDQAAsAcAIBEAAIUHACDWAwAArQcAMNcDAAAgABDYAwAArQcAMNkDAQAAAAHgA0AAngYAIf0DQACeBgAhygQCAJoGACHMBAEAlwYAIdAEAQCYBgAh4AQAAK4H4AQi4QQCAJoGACHiBAIA_wYAIeMEAQCYBgAh5ARAAJ4GACHlBEAAngYAIeYEQACdBgAh5wRAAJ0GACGTBQAArAcAIAMAAAAgACABAAAhADACAAAiACAKAwAApQcAIAsAAKgHACDWAwAAqwcAMNcDAAAkABDYAwAAqwcAMNkDAQCXBgAh4ANAAJ4GACHKBAIAmgYAIcsEAQCXBgAh1QQBAJcGACECAwAA6gwAIAsAAPUMACAMAwAApQcAIAsAAKgHACDWAwAAqwcAMNcDAAAkABDYAwAAqwcAMNkDAQAAAAHgA0AAngYAIcoEAgCaBgAhywQBAJcGACHVBAEAlwYAIZEFAACpBwAgkgUAAKoHACADAAAAJAAgAQAAJQAwAgAAJgAgCQsAAKgHACDWAwAApwcAMNcDAAAoABDYAwAApwcAMNkDAQCXBgAh1QQBAJcGACHcBAIAmgYAId0EAQCYBgAh3gQBAJgGACEBCwAA9QwAIAoLAACoBwAg1gMAAKcHADDXAwAAKAAQ2AMAAKcHADDZAwEAAAAB1QQBAJcGACHcBAIAmgYAId0EAQCYBgAh3gQBAJgGACGQBQAApgcAIAMAAAAoACABAAApADACAAAqACATCgAAowcAIAsAAKQHACAOAAClBwAgDwAA-wYAIBAAAPsGACDWAwAAogcAMNcDAAAsABDYAwAAogcAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIcwEAQCXBgAh1QQBAPoGACHWBAEAlwYAIdcEAQD6BgAh2AQBAPoGACHZBEAAngYAIdoEQACeBgAh2wQBAJsGACEJCgAA9AwAIAsAAPUMACAOAADqDAAgDwAA6gwAIBAAAOoMACDVBAAAyAcAINcEAADIBwAg2AQAAMgHACDbBAAAyAcAIBMKAACjBwAgCwAApAcAIA4AAKUHACAPAAD7BgAgEAAA-wYAINYDAACiBwAw1wMAACwAENgDAACiBwAw2QMBAAAAAeADQACeBgAh_QNAAJ4GACHMBAEAlwYAIdUEAQD6BgAh1gQBAJcGACHXBAEA-gYAIdgEAQD6BgAh2QRAAJ4GACHaBEAAngYAIdsEAQCbBgAhAwAAACwAIAEAAC0AMAIAAC4AIAEAAAAgACABAAAAHAAgAQAAABwAIAEAAAAkACABAAAAKAAgAQAAACwAIAMAAAAsACABAAAtADACAAAuACADAAAAGAAgAQAAGQAwAgAAGgAgAQAAACAAIAEAAAAsACABAAAAGAAgFQYAAOsGACAUAADvBgAgJAAA7AYAICYAAO0GACAnAADuBgAg1gMAAOkGADDXAwAAOwAQ2AMAAOkGADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACGaBAEAmwYAIdAEAQCYBgAh0QQBAJgGACHUBCAA6gYAIegEAQCYBgAh6gQBAJsGACH0BCAA6gYAIfUEIADqBgAh9gQCAJoGACH3BAEAmAYAIQEAAAA7ACAlFgAAigcAIBcAAPsGACAYAACeBwAgHQAAjAcAIB8AAJ8HACAhAACgBwAgIgAAoQcAINYDAACcBwAw1wMAAD0AENgDAACcBwAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhqAQCAJoGACGpBAEAlwYAIaoEAQCYBgAhrAQAAJ0HrAQirgQAAIkHrgQirwQBAJgGACGwBAEAmAYAIbEEAQCbBgAhsgQBAPoGACGzBAEA-gYAIbQEAgCaBgAhtQQCAJoGACG2BEAAnQYAIbcEAgCaBgAhuARAAJ0GACG5BAIAmgYAIboEQACdBgAhuwRAAJ0GACG8BAEAmwYAIb0EAQCbBgAhvgRAAJ4GACG_BEAAnQYAIcAEQACdBgAhwQQCAJoGACESFgAA7gwAIBcAAOoMACAYAADzDAAgHQAA8AwAIB8AAOYMACAhAADnDAAgIgAA6AwAILEEAADIBwAgsgQAAMgHACCzBAAAyAcAILYEAADIBwAguAQAAMgHACC6BAAAyAcAILsEAADIBwAgvAQAAMgHACC9BAAAyAcAIL8EAADIBwAgwAQAAMgHACAlFgAAigcAIBcAAPsGACAYAACeBwAgHQAAjAcAIB8AAJ8HACAhAACgBwAgIgAAoQcAINYDAACcBwAw1wMAAD0AENgDAACcBwAw2QMBAAAAAeADQACeBgAh_QNAAJ4GACGoBAIAAAABqQQBAJcGACGqBAEAmAYAIawEAACdB6wEIq4EAACJB64EIq8EAQCYBgAhsAQBAJgGACGxBAEAmwYAIbIEAQD6BgAhswQBAPoGACG0BAIAmgYAIbUEAgCaBgAhtgRAAJ0GACG3BAIAmgYAIbgEQACdBgAhuQQCAJoGACG6BEAAnQYAIbsEQACdBgAhvAQBAJsGACG9BAEAmwYAIb4EQACeBgAhvwRAAJ0GACHABEAAnQYAIcEEAgCaBgAhAwAAAD0AIAEAAD4AMAIAAD8AIAEAAAAcACABAAAAFAAgCBkAAJAHACAaAACZBwAg1gMAAJsHADDXAwAAQwAQ2AMAAJsHADCMBAEAlwYAIaYEAQCXBgAhpwRAAJ4GACECGQAA8QwAIBoAAPIMACAJGQAAkAcAIBoAAJkHACDWAwAAmwcAMNcDAABDABDYAwAAmwcAMIwEAQCXBgAhpgQBAJcGACGnBEAAngYAIY8FAACaBwAgAwAAAEMAIAEAAEQAMAIAAEUAIAsaAACZBwAg1gMAAJcHADDXAwAARwAQ2AMAAJcHADDZAwEAlwYAIdsDAACYB8MEIt8DAQCbBgAh_wMAAKUGACCKBEAAngYAIaYEAQCXBgAhwwQBAJsGACEDGgAA8gwAIN8DAADIBwAgwwQAAMgHACALGgAAmQcAINYDAACXBwAw1wMAAEcAENgDAACXBwAw2QMBAAAAAdsDAACYB8MEIt8DAQAAAAH_AwAApQYAIIoEQACeBgAhpgQBAJcGACHDBAEAmwYAIQMAAABHACABAABIADACAABJACADAAAAQwAgAQAARAAwAgAARQAgAQAAAEcAIAEAAABDACAPGQAAkAcAIB4AAPsGACDWAwAAlAcAMNcDAABOABDYAwAAlAcAMNkDAQCXBgAh2gMBAPoGACHgA0AAngYAIf4DAQCbBgAhhgQBAJsGACGMBAEAlwYAIaEEAACVB6EEIqMEAACWB6MEIqQEAQCYBgAhpQQAAKUGACAFGQAA8QwAIB4AAOoMACDaAwAAyAcAIP4DAADIBwAghgQAAMgHACAPGQAAkAcAIB4AAPsGACDWAwAAlAcAMNcDAABOABDYAwAAlAcAMNkDAQAAAAHaAwEA-gYAIeADQACeBgAh_gMBAAAAAYYEAQCbBgAhjAQBAJcGACGhBAAAlQehBCKjBAAAlgejBCKkBAEAmAYAIaUEAAClBgAgAwAAAE4AIAEAAE8AMAIAAFAAIAEAAAAcACAXGQAAkAcAICAAAPsGACDWAwAAkQcAMNcDAABTABDYAwAAkQcAMNkDAQCXBgAh4ANAAJ4GACH4AwAAkweYBCL9A0AAngYAIf4DAQCYBgAhiQQBAJsGACGMBAEAlwYAIY0EAQD6BgAhlQQAAJIHlQQilgQBAJgGACGYBAIAmgYAIZkEAQCbBgAhmgQBAJsGACGbBAEAmwYAIZwEAQCbBgAhnQRAAJ4GACGeBEAAnQYAIZ8EQACdBgAhChkAAPEMACAgAADqDAAgiQQAAMgHACCNBAAAyAcAIJkEAADIBwAgmgQAAMgHACCbBAAAyAcAIJwEAADIBwAgngQAAMgHACCfBAAAyAcAIBcZAACQBwAgIAAA-wYAINYDAACRBwAw1wMAAFMAENgDAACRBwAw2QMBAAAAAeADQACeBgAh-AMAAJMHmAQi_QNAAJ4GACH-AwEAAAABiQQBAJsGACGMBAEAlwYAIY0EAQD6BgAhlQQAAJIHlQQilgQBAJgGACGYBAIAmgYAIZkEAQCbBgAhmgQBAJsGACGbBAEAmwYAIZwEAQCbBgAhnQRAAJ4GACGeBEAAnQYAIZ8EQACdBgAhAwAAAFMAIAEAAFQAMAIAAFUAIAEAAAAcACAPGQAAkAcAICAAAPsGACDWAwAAjgcAMNcDAABYABDYAwAAjgcAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIYwEAQCXBgAhjQQBAPoGACGPBAAAjwePBCKQBAEAmAYAIZEEAQCYBgAhkgQBAJgGACGTBAIAmgYAIQMZAADxDAAgIAAA6gwAII0EAADIBwAgEBkAAJAHACAgAAD7BgAg1gMAAI4HADDXAwAAWAAQ2AMAAI4HADDZAwEAAAAB4ANAAJ4GACH9A0AAngYAIYwEAQCXBgAhjQQBAPoGACGPBAAAjwePBCKQBAEAAAABkQQBAJgGACGSBAEAmAYAIZMEAgCaBgAhjgUAAI0HACADAAAAWAAgAQAAWQAwAgAAWgAgAQAAABwAIAEAAABDACABAAAATgAgAQAAAFMAIAEAAABYACABAAAAGAAgAQAAAD0AIAMAAAAQACABAAARADACAAASACABAAAAFAAgAQAAABAAIBIWAACKBwAgGwAAiwcAIBwAAIwHACDWAwAAhwcAMNcDAABmABDYAwAAhwcAMNkDAQCXBgAh4ANAAJ4GACH4AwAAiAfFBCL9A0AAngYAIakEAQCXBgAhqgQBAJgGACGuBAAAiQeuBCKwBAEAmAYAIcUEAAClBgAgxgQCAJoGACHHBEAAngYAIcgEQACeBgAhAxYAAO4MACAbAADvDAAgHAAA8AwAIBMWAACKBwAgGwAAiwcAIBwAAIwHACDWAwAAhwcAMNcDAABmABDYAwAAhwcAMNkDAQAAAAHgA0AAngYAIfgDAACIB8UEIv0DQACeBgAhqQQBAJcGACGqBAEAmAYAIa4EAACJB64EIrAEAQCYBgAhxQQAAKUGACDGBAIAmgYAIccEQACeBgAhyARAAJ4GACGNBQAAhgcAIAMAAABmACABAABnADACAABoACADAAAAPQAgAQAAPgAwAgAAPwAgAQAAAGYAIAEAAAA9ACAEBwAA6wwAIBEAAOQMACATAADtDAAgFAAAtQsAIBAHAACABwAgEQAAhQcAIBMAAIQHACAUAADvBgAg1gMAAIMHADDXAwAAHgAQ2AMAAIMHADDZAwEAAAAB4ANAAJ4GACH9A0AAngYAIc0EAQCXBgAh0AQBAJgGACHRBAEAmAYAIdQEIADqBgAh6AQBAJgGACGMBQAAggcAIAMAAAAeACABAABtADACAABuACAPBwAAgAcAICMAAIEHACAkAADsBgAg1gMAAP4GADDXAwAAcAAQ2AMAAP4GADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACHNBAEAlwYAIdAEAQCYBgAh0QQBAJgGACHSBAIAmgYAIdMEAgD_BgAh1AQgAOoGACEEBwAA6wwAICMAAOwMACAkAACyCwAg0wQAAMgHACAQBwAAgAcAICMAAIEHACAkAADsBgAg1gMAAP4GADDXAwAAcAAQ2AMAAP4GADDZAwEAAAAB4ANAAJ4GACH9A0AAngYAIc0EAQCXBgAh0AQBAJgGACHRBAEAmAYAIdIEAgCaBgAh0wQCAP8GACHUBCAA6gYAIYwFAAD9BgAgAwAAAHAAIAEAAHEAMAIAAHIAIAMAAAAYACABAAAZADACAAAaACABAAAACwAgAQAAABAAIAEAAAAeACABAAAAcAAgAQAAABgAIAMAAAAkACABAAAlADACAAAmACADAAAALAAgAQAALQAwAgAALgAgAwAAACwAIAEAAC0AMAIAAC4AIAMAAAAsACABAAAtADACAAAuACADAAAAGAAgAQAAGQAwAgAAGgAgAwAAAD0AIAEAAD4AMAIAAD8AIAMAAABOACABAABPADACAABQACADAAAAUwAgAQAAVAAwAgAAVQAgAwAAAFgAIAEAAFkAMAIAAFoAIAweAAD7BgAg1gMAAPkGADDXAwAAgwEAENgDAAD5BgAw2QMBAJcGACHaAwEA-gYAIdsDAQCYBgAh3AMBAJgGACHdAwEAmAYAId4DAAClBgAg3wMBAJsGACHgA0AAngYAIQMeAADqDAAg2gMAAMgHACDfAwAAyAcAIAweAAD7BgAg1gMAAPkGADDXAwAAgwEAENgDAAD5BgAw2QMBAAAAAdoDAQD6BgAh2wMBAJgGACHcAwEAmAYAId0DAQCYBgAh3gMAAKUGACDfAwEAmwYAIeADQACeBgAhAwAAAIMBACABAACEAQAwAgAAhQEAIAEAAAAcACABAAAAAwAgAQAAAAcAIAEAAAALACABAAAAJAAgAQAAACwAIAEAAAAsACABAAAALAAgAQAAABgAIAEAAAA9ACABAAAATgAgAQAAAFMAIAEAAABYACABAAAAgwEAIAEAAAABACAOBAAA4QwAIAUAAOIMACAGAACxCwAgFAAAtQsAIB8AAOYMACAhAADnDAAgIgAA6AwAICgAAOMMACApAADkDAAgKgAA5AwAICsAAOQMACAsAADlDAAgLQAA6QwAIIYEAADIBwAgAwAAABwAIAEAAJYBADACAAABACADAAAAHAAgAQAAlgEAMAIAAAEAIAMAAAAcACABAACWAQAwAgAAAQAgFwQAANQMACAFAADVDAAgBgAA1gwAIBQAANsMACAfAADdDAAgIQAA3gwAICIAAN8MACAoAADXDAAgKQAA2AwAICoAANkMACArAADaDAAgLAAA3AwAIC0AAOAMACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGGBAEAAAAB0AQBAAAAAdQEIAAAAAHoBAEAAAAB8wQAAACLBQKJBQEAAAABiwWAAAAAAQEzAACaAQAgCtkDAQAAAAHgA0AAAAAB_QNAAAAAAYYEAQAAAAHQBAEAAAAB1AQgAAAAAegEAQAAAAHzBAAAAIsFAokFAQAAAAGLBYAAAAABATMAAJwBADABMwAAnAEAMBcEAADJCwAgBQAAygsAIAYAAMsLACAUAADQCwAgHwAA0gsAICEAANMLACAiAADUCwAgKAAAzAsAICkAAM0LACAqAADOCwAgKwAAzwsAICwAANELACAtAADVCwAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhhgQBAM0HACHQBAEAzAcAIdQEIACrCQAh6AQBAMwHACHzBAAAyAuLBSKJBQEAzAcAIYsFgAAAAAECAAAAAQAgMwAAnwEAIArZAwEAzAcAIeADQADOBwAh_QNAAM4HACGGBAEAzQcAIdAEAQDMBwAh1AQgAKsJACHoBAEAzAcAIfMEAADIC4sFIokFAQDMBwAhiwWAAAAAAQIAAAAcACAzAAChAQAgAgAAABwAIDMAAKEBACADAAAAAQAgOgAAmgEAIDsAAJ8BACABAAAAAQAgAQAAABwAIAQSAADFCwAgQAAAxwsAIEEAAMYLACCGBAAAyAcAIA3WAwAA9QYAMNcDAACoAQAQ2AMAAPUGADDZAwEA-AUAIeADQAD9BQAh_QNAAP0FACGGBAEA_AUAIdAEAQD6BQAh1AQgANYGACHoBAEA-gUAIfMEAAD2BosFIokFAQD6BQAhiwUAAPsFACADAAAAHAAgAQAApwEAMD8AAKgBACADAAAAHAAgAQAAlgEAMAIAAAEAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgDQMAAMQLACDZAwEAAAABoQQBAAAAAcsEAQAAAAGABQEAAAABgQUBAAAAAYIFAQAAAAGDBQEAAAABhAUCAAAAAYUFAQAAAAGGBQEAAAABhwUBAAAAAYgFAQAAAAEBMwAAsAEAIAzZAwEAAAABoQQBAAAAAcsEAQAAAAGABQEAAAABgQUBAAAAAYIFAQAAAAGDBQEAAAABhAUCAAAAAYUFAQAAAAGGBQEAAAABhwUBAAAAAYgFAQAAAAEBMwAAsgEAMAEzAACyAQAwDQMAAMMLACDZAwEAzAcAIaEEAQDMBwAhywQBAMwHACGABQEAzAcAIYEFAQDMBwAhggUBAM0HACGDBQEAzQcAIYQFAgCqCQAhhQUBAM0HACGGBQEAzQcAIYcFAQDNBwAhiAUBAM0HACECAAAABQAgMwAAtQEAIAzZAwEAzAcAIaEEAQDMBwAhywQBAMwHACGABQEAzAcAIYEFAQDMBwAhggUBAM0HACGDBQEAzQcAIYQFAgCqCQAhhQUBAM0HACGGBQEAzQcAIYcFAQDNBwAhiAUBAM0HACECAAAAAwAgMwAAtwEAIAIAAAADACAzAAC3AQAgAwAAAAUAIDoAALABACA7AAC1AQAgAQAAAAUAIAEAAAADACAMEgAAvgsAIEAAAMELACBBAADACwAgUgAAvwsAIFMAAMILACCCBQAAyAcAIIMFAADIBwAghAUAAMgHACCFBQAAyAcAIIYFAADIBwAghwUAAMgHACCIBQAAyAcAIA_WAwAA9AYAMNcDAAC-AQAQ2AMAAPQGADDZAwEA-AUAIaEEAQD6BQAhywQBAPgFACGABQEA-gUAIYEFAQD6BQAhggUBAPwFACGDBQEA_AUAIYQFAgDVBgAhhQUBAPwFACGGBQEA_AUAIYcFAQD8BQAhiAUBAPwFACEDAAAAAwAgAQAAvQEAMD8AAL4BACADAAAAAwAgAQAABAAwAgAABQAgAQAAAAkAIAEAAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACAFAwAAvQsAINkDAQAAAAHLBAEAAAAB_QRAAAAAAf8EAQAAAAEBMwAAxgEAIATZAwEAAAABywQBAAAAAf0EQAAAAAH_BAEAAAABATMAAMgBADABMwAAyAEAMAUDAAC8CwAg2QMBAMwHACHLBAEAzAcAIf0EQADOBwAh_wQBAMwHACECAAAACQAgMwAAywEAIATZAwEAzAcAIcsEAQDMBwAh_QRAAM4HACH_BAEAzAcAIQIAAAAHACAzAADNAQAgAgAAAAcAIDMAAM0BACADAAAACQAgOgAAxgEAIDsAAMsBACABAAAACQAgAQAAAAcAIAMSAAC5CwAgQAAAuwsAIEEAALoLACAH1gMAAPMGADDXAwAA1AEAENgDAADzBgAw2QMBAPgFACHLBAEA-AUAIf0EQAD9BQAh_wQBAPoFACEDAAAABwAgAQAA0wEAMD8AANQBACADAAAABwAgAQAACAAwAgAACQAgB9YDAADxBgAw1wMAANoBABDYAwAA8QYAMPsEAQCYBgAh_AQBAAAAAf0EQACeBgAh_gQAAPIGACABAAAA1wEAIAEAAADXAQAgBtYDAADxBgAw1wMAANoBABDYAwAA8QYAMPsEAQCYBgAh_AQBAJgGACH9BEAAngYAIQADAAAA2gEAIAEAANsBADACAADXAQAgAwAAANoBACABAADbAQAwAgAA1wEAIAMAAADaAQAgAQAA2wEAMAIAANcBACAD-wQBAAAAAfwEAQAAAAH9BEAAAAABATMAAN8BACAD-wQBAAAAAfwEAQAAAAH9BEAAAAABATMAAOEBADABMwAA4QEAMAP7BAEAzAcAIfwEAQDMBwAh_QRAAM4HACECAAAA1wEAIDMAAOQBACAD-wQBAMwHACH8BAEAzAcAIf0EQADOBwAhAgAAANoBACAzAADmAQAgAgAAANoBACAzAADmAQAgAwAAANcBACA6AADfAQAgOwAA5AEAIAEAAADXAQAgAQAAANoBACADEgAAtgsAIEAAALgLACBBAAC3CwAgBtYDAADwBgAw1wMAAO0BABDYAwAA8AYAMPsEAQD6BQAh_AQBAPoFACH9BEAA_QUAIQMAAADaAQAgAQAA7AEAMD8AAO0BACADAAAA2gEAIAEAANsBADACAADXAQAgFQYAAOsGACAUAADvBgAgJAAA7AYAICYAAO0GACAnAADuBgAg1gMAAOkGADDXAwAAOwAQ2AMAAOkGADDZAwEAAAAB4ANAAJ4GACH9A0AAngYAIZoEAQCbBgAh0AQBAJgGACHRBAEAAAAB1AQgAOoGACHoBAEAmAYAIeoEAQCbBgAh9AQgAOoGACH1BCAA6gYAIfYEAgCaBgAh9wQBAJgGACEBAAAA8AEAIAEAAADwAQAgBwYAALELACAUAAC1CwAgJAAAsgsAICYAALMLACAnAAC0CwAgmgQAAMgHACDqBAAAyAcAIAMAAAA7ACABAADzAQAwAgAA8AEAIAMAAAA7ACABAADzAQAwAgAA8AEAIAMAAAA7ACABAADzAQAwAgAA8AEAIBIGAACsCwAgFAAAsAsAICQAAK0LACAmAACuCwAgJwAArwsAINkDAQAAAAHgA0AAAAAB_QNAAAAAAZoEAQAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHoBAEAAAAB6gQBAAAAAfQEIAAAAAH1BCAAAAAB9gQCAAAAAfcEAQAAAAEBMwAA9wEAIA3ZAwEAAAAB4ANAAAAAAf0DQAAAAAGaBAEAAAAB0AQBAAAAAdEEAQAAAAHUBCAAAAAB6AQBAAAAAeoEAQAAAAH0BCAAAAAB9QQgAAAAAfYEAgAAAAH3BAEAAAABATMAAPkBADABMwAA-QEAMBIGAADxCgAgFAAA9QoAICQAAPIKACAmAADzCgAgJwAA9AoAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIZoEAQDNBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6AQBAMwHACHqBAEAzQcAIfQEIACrCQAh9QQgAKsJACH2BAIA1wcAIfcEAQDMBwAhAgAAAPABACAzAAD8AQAgDdkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIZoEAQDNBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6AQBAMwHACHqBAEAzQcAIfQEIACrCQAh9QQgAKsJACH2BAIA1wcAIfcEAQDMBwAhAgAAADsAIDMAAP4BACACAAAAOwAgMwAA_gEAIAMAAADwAQAgOgAA9wEAIDsAAPwBACABAAAA8AEAIAEAAAA7ACAHEgAA7AoAIEAAAO8KACBBAADuCgAgUgAA7QoAIFMAAPAKACCaBAAAyAcAIOoEAADIBwAgENYDAADoBgAw1wMAAIUCABDYAwAA6AYAMNkDAQD4BQAh4ANAAP0FACH9A0AA_QUAIZoEAQD8BQAh0AQBAPoFACHRBAEA-gUAIdQEIADWBgAh6AQBAPoFACHqBAEA_AUAIfQEIADWBgAh9QQgANYGACH2BAIAiwYAIfcEAQD6BQAhAwAAADsAIAEAAIQCADA_AACFAgAgAwAAADsAIAEAAPMBADACAADwAQAgAQAAAA0AIAEAAAANACADAAAACwAgAQAADAAwAgAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAMAAAALACABAAAMADACAAANACAHAwAA6woAIAcAAOoKACDZAwEAAAAB4ANAAAAAAcsEAQAAAAHNBAEAAAAB8wQAAADzBAIBMwAAjQIAIAXZAwEAAAAB4ANAAAAAAcsEAQAAAAHNBAEAAAAB8wQAAADzBAIBMwAAjwIAMAEzAACPAgAwBwMAAOkKACAHAADoCgAg2QMBAMwHACHgA0AAzgcAIcsEAQDMBwAhzQQBAMwHACHzBAAA5wrzBCICAAAADQAgMwAAkgIAIAXZAwEAzAcAIeADQADOBwAhywQBAMwHACHNBAEAzAcAIfMEAADnCvMEIgIAAAALACAzAACUAgAgAgAAAAsAIDMAAJQCACADAAAADQAgOgAAjQIAIDsAAJICACABAAAADQAgAQAAAAsAIAMSAADkCgAgQAAA5goAIEEAAOUKACAI1gMAAOQGADDXAwAAmwIAENgDAADkBgAw2QMBAPgFACHgA0AA_QUAIcsEAQD4BQAhzQQBAPgFACHzBAAA5QbzBCIDAAAACwAgAQAAmgIAMD8AAJsCACADAAAACwAgAQAADAAwAgAADQAgAQAAABIAIAEAAAASACADAAAAEAAgAQAAEQAwAgAAEgAgAwAAABAAIAEAABEAMAIAABIAIAMAAAAQACABAAARADACAAASACAVBwAA0wkAIBwAANUJACAdAADUCQAgJQAA4woAINkDAQAAAAHgA0AAAAAB_QNAAAAAAZoEAQAAAAHNBAEAAAAB0AQBAAAAAdEEAQAAAAHUBCAAAAAB6QQBAAAAAeoEAQAAAAHrBAEAAAAB7AQBAAAAAe0EAQAAAAHuBCAAAAAB7wQgAAAAAfAEAgAAAAHxBIAAAAABATMAAKMCACAR2QMBAAAAAeADQAAAAAH9A0AAAAABmgQBAAAAAc0EAQAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHpBAEAAAAB6gQBAAAAAesEAQAAAAHsBAEAAAAB7QQBAAAAAe4EIAAAAAHvBCAAAAAB8AQCAAAAAfEEgAAAAAEBMwAApQIAMAEzAAClAgAwFQcAALoJACAcAAC8CQAgHQAAuwkAICUAAOIKACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGaBAEAzQcAIc0EAQDMBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6QQBAMwHACHqBAEAzQcAIesEAQDMBwAh7AQBAMwHACHtBAEAzQcAIe4EIACrCQAh7wQgAKsJACHwBAIAqgkAIfEEgAAAAAECAAAAEgAgMwAAqAIAIBHZAwEAzAcAIeADQADOBwAh_QNAAM4HACGaBAEAzQcAIc0EAQDMBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6QQBAMwHACHqBAEAzQcAIesEAQDMBwAh7AQBAMwHACHtBAEAzQcAIe4EIACrCQAh7wQgAKsJACHwBAIAqgkAIfEEgAAAAAECAAAAEAAgMwAAqgIAIAIAAAAQACAzAACqAgAgAwAAABIAIDoAAKMCACA7AACoAgAgAQAAABIAIAEAAAAQACAJEgAA3QoAIEAAAOAKACBBAADfCgAgUgAA3goAIFMAAOEKACCaBAAAyAcAIOoEAADIBwAg7QQAAMgHACDwBAAAyAcAIBTWAwAA4wYAMNcDAACxAgAQ2AMAAOMGADDZAwEA-AUAIeADQAD9BQAh_QNAAP0FACGaBAEA_AUAIc0EAQD4BQAh0AQBAPoFACHRBAEA-gUAIdQEIADWBgAh6QQBAPgFACHqBAEA_AUAIesEAQD6BQAh7AQBAPoFACHtBAEA_AUAIe4EIADWBgAh7wQgANYGACHwBAIA1QYAIfEEAAD7BQAgAwAAABAAIAEAALACADA_AACxAgAgAwAAABAAIAEAABEAMAIAABIAIAEAAABuACABAAAAbgAgAwAAAB4AIAEAAG0AMAIAAG4AIAMAAAAeACABAABtADACAABuACADAAAAHgAgAQAAbQAwAgAAbgAgDAcAANkKACARAADbCgAgEwAA2goAIBQAANwKACDZAwEAAAAB4ANAAAAAAf0DQAAAAAHNBAEAAAAB0AQBAAAAAdEEAQAAAAHUBCAAAAAB6AQBAAAAAQEzAAC5AgAgCNkDAQAAAAHgA0AAAAAB_QNAAAAAAc0EAQAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHoBAEAAAABATMAALsCADABMwAAuwIAMAwHAAC3CgAgEQAAuQoAIBMAALgKACAUAAC6CgAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhzQQBAMwHACHQBAEAzAcAIdEEAQDMBwAh1AQgAKsJACHoBAEAzAcAIQIAAABuACAzAAC-AgAgCNkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIc0EAQDMBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6AQBAMwHACECAAAAHgAgMwAAwAIAIAIAAAAeACAzAADAAgAgAwAAAG4AIDoAALkCACA7AAC-AgAgAQAAAG4AIAEAAAAeACADEgAAtAoAIEAAALYKACBBAAC1CgAgC9YDAADiBgAw1wMAAMcCABDYAwAA4gYAMNkDAQD4BQAh4ANAAP0FACH9A0AA_QUAIc0EAQD4BQAh0AQBAPoFACHRBAEA-gUAIdQEIADWBgAh6AQBAPoFACEDAAAAHgAgAQAAxgIAMD8AAMcCACADAAAAHgAgAQAAbQAwAgAAbgAgAQAAACIAIAEAAAAiACADAAAAIAAgAQAAIQAwAgAAIgAgAwAAACAAIAEAACEAMAIAACIAIAMAAAAgACABAAAhADACAAAiACASCgAAsAoAIAwAALEKACANAACyCgAgEQAAswoAINkDAQAAAAHgA0AAAAAB_QNAAAAAAcoEAgAAAAHMBAEAAAAB0AQBAAAAAeAEAAAA4AQC4QQCAAAAAeIEAgAAAAHjBAEAAAAB5ARAAAAAAeUEQAAAAAHmBEAAAAAB5wRAAAAAAQEzAADPAgAgDtkDAQAAAAHgA0AAAAAB_QNAAAAAAcoEAgAAAAHMBAEAAAAB0AQBAAAAAeAEAAAA4AQC4QQCAAAAAeIEAgAAAAHjBAEAAAAB5ARAAAAAAeUEQAAAAAHmBEAAAAAB5wRAAAAAAQEzAADRAgAwATMAANECADASCgAAiAoAIAwAAIkKACANAACKCgAgEQAAiwoAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIcoEAgDXBwAhzAQBAMwHACHQBAEAzAcAIeAEAACHCuAEIuEEAgDXBwAh4gQCAKoJACHjBAEAzAcAIeQEQADOBwAh5QRAAM4HACHmBEAA2QcAIecEQADZBwAhAgAAACIAIDMAANQCACAO2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhygQCANcHACHMBAEAzAcAIdAEAQDMBwAh4AQAAIcK4AQi4QQCANcHACHiBAIAqgkAIeMEAQDMBwAh5ARAAM4HACHlBEAAzgcAIeYEQADZBwAh5wRAANkHACECAAAAIAAgMwAA1gIAIAIAAAAgACAzAADWAgAgAwAAACIAIDoAAM8CACA7AADUAgAgAQAAACIAIAEAAAAgACAIEgAAggoAIEAAAIUKACBBAACECgAgUgAAgwoAIFMAAIYKACDiBAAAyAcAIOYEAADIBwAg5wQAAMgHACAR1gMAAN4GADDXAwAA3QIAENgDAADeBgAw2QMBAPgFACHgA0AA_QUAIf0DQAD9BQAhygQCAIsGACHMBAEA-AUAIdAEAQD6BQAh4AQAAN8G4AQi4QQCAIsGACHiBAIA1QYAIeMEAQD6BQAh5ARAAP0FACHlBEAA_QUAIeYEQACNBgAh5wRAAI0GACEDAAAAIAAgAQAA3AIAMD8AAN0CACADAAAAIAAgAQAAIQAwAgAAIgAgAQAAACYAIAEAAAAmACADAAAAJAAgAQAAJQAwAgAAJgAgAwAAACQAIAEAACUAMAIAACYAIAMAAAAkACABAAAlADACAAAmACAHAwAAgQoAIAsAAIAKACDZAwEAAAAB4ANAAAAAAcoEAgAAAAHLBAEAAAAB1QQBAAAAAQEzAADlAgAgBdkDAQAAAAHgA0AAAAABygQCAAAAAcsEAQAAAAHVBAEAAAABATMAAOcCADABMwAA5wIAMAcDAAD_CQAgCwAA_gkAINkDAQDMBwAh4ANAAM4HACHKBAIA1wcAIcsEAQDMBwAh1QQBAMwHACECAAAAJgAgMwAA6gIAIAXZAwEAzAcAIeADQADOBwAhygQCANcHACHLBAEAzAcAIdUEAQDMBwAhAgAAACQAIDMAAOwCACACAAAAJAAgMwAA7AIAIAMAAAAmACA6AADlAgAgOwAA6gIAIAEAAAAmACABAAAAJAAgBRIAAPkJACBAAAD8CQAgQQAA-wkAIFIAAPoJACBTAAD9CQAgCNYDAADdBgAw1wMAAPMCABDYAwAA3QYAMNkDAQD4BQAh4ANAAP0FACHKBAIAiwYAIcsEAQD4BQAh1QQBAPgFACEDAAAAJAAgAQAA8gIAMD8AAPMCACADAAAAJAAgAQAAJQAwAgAAJgAgAQAAACoAIAEAAAAqACADAAAAKAAgAQAAKQAwAgAAKgAgAwAAACgAIAEAACkAMAIAACoAIAMAAAAoACABAAApADACAAAqACAGCwAA-AkAINkDAQAAAAHVBAEAAAAB3AQCAAAAAd0EAQAAAAHeBAEAAAABATMAAPsCACAF2QMBAAAAAdUEAQAAAAHcBAIAAAAB3QQBAAAAAd4EAQAAAAEBMwAA_QIAMAEzAAD9AgAwBgsAAPcJACDZAwEAzAcAIdUEAQDMBwAh3AQCANcHACHdBAEAzAcAId4EAQDMBwAhAgAAACoAIDMAAIADACAF2QMBAMwHACHVBAEAzAcAIdwEAgDXBwAh3QQBAMwHACHeBAEAzAcAIQIAAAAoACAzAACCAwAgAgAAACgAIDMAAIIDACADAAAAKgAgOgAA-wIAIDsAAIADACABAAAAKgAgAQAAACgAIAUSAADyCQAgQAAA9QkAIEEAAPQJACBSAADzCQAgUwAA9gkAIAjWAwAA3AYAMNcDAACJAwAQ2AMAANwGADDZAwEA-AUAIdUEAQD4BQAh3AQCAIsGACHdBAEA-gUAId4EAQD6BQAhAwAAACgAIAEAAIgDADA_AACJAwAgAwAAACgAIAEAACkAMAIAACoAIAEAAAAuACABAAAALgAgAwAAACwAIAEAAC0AMAIAAC4AIAMAAAAsACABAAAtADACAAAuACADAAAALAAgAQAALQAwAgAALgAgEAoAAO0JACALAADuCQAgDgAA7wkAIA8AAPAJACAQAADxCQAg2QMBAAAAAeADQAAAAAH9A0AAAAABzAQBAAAAAdUEAQAAAAHWBAEAAAAB1wQBAAAAAdgEAQAAAAHZBEAAAAAB2gRAAAAAAdsEAQAAAAEBMwAAkQMAIAvZAwEAAAAB4ANAAAAAAf0DQAAAAAHMBAEAAAAB1QQBAAAAAdYEAQAAAAHXBAEAAAAB2AQBAAAAAdkEQAAAAAHaBEAAAAAB2wQBAAAAAQEzAACTAwAwATMAAJMDADABAAAAIAAgAQAAABwAIAEAAAAcACAQCgAA6AkAIAsAAOkJACAOAADqCQAgDwAA6wkAIBAAAOwJACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACHMBAEAzAcAIdUEAQDNBwAh1gQBAMwHACHXBAEAzQcAIdgEAQDNBwAh2QRAAM4HACHaBEAAzgcAIdsEAQDNBwAhAgAAAC4AIDMAAJkDACAL2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhzAQBAMwHACHVBAEAzQcAIdYEAQDMBwAh1wQBAM0HACHYBAEAzQcAIdkEQADOBwAh2gRAAM4HACHbBAEAzQcAIQIAAAAsACAzAACbAwAgAgAAACwAIDMAAJsDACABAAAAIAAgAQAAABwAIAEAAAAcACADAAAALgAgOgAAkQMAIDsAAJkDACABAAAALgAgAQAAACwAIAcSAADlCQAgQAAA5wkAIEEAAOYJACDVBAAAyAcAINcEAADIBwAg2AQAAMgHACDbBAAAyAcAIA7WAwAA2wYAMNcDAAClAwAQ2AMAANsGADDZAwEA-AUAIeADQAD9BQAh_QNAAP0FACHMBAEA-AUAIdUEAQD5BQAh1gQBAPgFACHXBAEA-QUAIdgEAQD5BQAh2QRAAP0FACHaBEAA_QUAIdsEAQD8BQAhAwAAACwAIAEAAKQDADA_AAClAwAgAwAAACwAIAEAAC0AMAIAAC4AIAEAAAByACABAAAAcgAgAwAAAHAAIAEAAHEAMAIAAHIAIAMAAABwACABAABxADACAAByACADAAAAcAAgAQAAcQAwAgAAcgAgDAcAAOIJACAjAADjCQAgJAAA5AkAINkDAQAAAAHgA0AAAAAB_QNAAAAAAc0EAQAAAAHQBAEAAAAB0QQBAAAAAdIEAgAAAAHTBAIAAAAB1AQgAAAAAQEzAACtAwAgCdkDAQAAAAHgA0AAAAAB_QNAAAAAAc0EAQAAAAHQBAEAAAAB0QQBAAAAAdIEAgAAAAHTBAIAAAAB1AQgAAAAAQEzAACvAwAwATMAAK8DADAMBwAArAkAICMAAK0JACAkAACuCQAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhzQQBAMwHACHQBAEAzAcAIdEEAQDMBwAh0gQCANcHACHTBAIAqgkAIdQEIACrCQAhAgAAAHIAIDMAALIDACAJ2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhzQQBAMwHACHQBAEAzAcAIdEEAQDMBwAh0gQCANcHACHTBAIAqgkAIdQEIACrCQAhAgAAAHAAIDMAALQDACACAAAAcAAgMwAAtAMAIAMAAAByACA6AACtAwAgOwAAsgMAIAEAAAByACABAAAAcAAgBhIAAKUJACBAAACoCQAgQQAApwkAIFIAAKYJACBTAACpCQAg0wQAAMgHACAM1gMAANQGADDXAwAAuwMAENgDAADUBgAw2QMBAPgFACHgA0AA_QUAIf0DQAD9BQAhzQQBAPgFACHQBAEA-gUAIdEEAQD6BQAh0gQCAIsGACHTBAIA1QYAIdQEIADWBgAhAwAAAHAAIAEAALoDADA_AAC7AwAgAwAAAHAAIAEAAHEAMAIAAHIAIAEAAAAWACABAAAAFgAgAwAAABQAIAEAABUAMAIAABYAIAMAAAAUACABAAAVADACAAAWACADAAAAFAAgAQAAFQAwAgAAFgAgBwgAAKIJACAVAACjCQAgHAAApAkAINkDAQAAAAHKBAIAAAABzgQBAAAAAc8EAgAAAAEBMwAAwwMAIATZAwEAAAABygQCAAAAAc4EAQAAAAHPBAIAAAABATMAAMUDADABMwAAxQMAMAcIAACHCQAgFQAAiAkAIBwAAIkJACDZAwEAzAcAIcoEAgDXBwAhzgQBAMwHACHPBAIA1wcAIQIAAAAWACAzAADIAwAgBNkDAQDMBwAhygQCANcHACHOBAEAzAcAIc8EAgDXBwAhAgAAABQAIDMAAMoDACACAAAAFAAgMwAAygMAIAMAAAAWACA6AADDAwAgOwAAyAMAIAEAAAAWACABAAAAFAAgBRIAAIIJACBAAACFCQAgQQAAhAkAIFIAAIMJACBTAACGCQAgB9YDAADTBgAw1wMAANEDABDYAwAA0wYAMNkDAQD4BQAhygQCAIsGACHOBAEA-AUAIc8EAgCLBgAhAwAAABQAIAEAANADADA_AADRAwAgAwAAABQAIAEAABUAMAIAABYAIAEAAAAaACABAAAAGgAgAwAAABgAIAEAABkAMAIAABoAIAMAAAAYACABAAAZADACAAAaACADAAAAGAAgAQAAGQAwAgAAGgAgCgMAAP8IACAHAACBCQAgCQAA_ggAIAoAAIAJACDZAwEAAAAByQQBAAAAAcoEAgAAAAHLBAEAAAABzAQBAAAAAc0EAQAAAAEBMwAA2QMAIAbZAwEAAAAByQQBAAAAAcoEAgAAAAHLBAEAAAABzAQBAAAAAc0EAQAAAAEBMwAA2wMAMAEzAADbAwAwAQAAABwAIAEAAAAeACABAAAAOwAgCgMAAPsIACAHAAD9CAAgCQAA-ggAIAoAAPwIACDZAwEAzAcAIckEAQDMBwAhygQCANcHACHLBAEAzQcAIcwEAQDNBwAhzQQBAM0HACECAAAAGgAgMwAA4QMAIAbZAwEAzAcAIckEAQDMBwAhygQCANcHACHLBAEAzQcAIcwEAQDNBwAhzQQBAM0HACECAAAAGAAgMwAA4wMAIAIAAAAYACAzAADjAwAgAQAAABwAIAEAAAAeACABAAAAOwAgAwAAABoAIDoAANkDACA7AADhAwAgAQAAABoAIAEAAAAYACAIEgAA9QgAIEAAAPgIACBBAAD3CAAgUgAA9ggAIFMAAPkIACDLBAAAyAcAIMwEAADIBwAgzQQAAMgHACAJ1gMAANIGADDXAwAA7QMAENgDAADSBgAw2QMBAPgFACHJBAEA-AUAIcoEAgCLBgAhywQBAPkFACHMBAEA-QUAIc0EAQD5BQAhAwAAABgAIAEAAOwDADA_AADtAwAgAwAAABgAIAEAABkAMAIAABoAIAEAAABoACABAAAAaAAgAwAAAGYAIAEAAGcAMAIAAGgAIAMAAABmACABAABnADACAABoACADAAAAZgAgAQAAZwAwAgAAaAAgDxYAAPIIACAbAADzCAAgHAAA9AgAINkDAQAAAAHgA0AAAAAB-AMAAADFBAL9A0AAAAABqQQBAAAAAaoEAQAAAAGuBAAAAK4EArAEAQAAAAHFBIAAAAABxgQCAAAAAccEQAAAAAHIBEAAAAABATMAAPUDACAM2QMBAAAAAeADQAAAAAH4AwAAAMUEAv0DQAAAAAGpBAEAAAABqgQBAAAAAa4EAAAArgQCsAQBAAAAAcUEgAAAAAHGBAIAAAABxwRAAAAAAcgEQAAAAAEBMwAA9wMAMAEzAAD3AwAwDxYAANoIACAbAADbCAAgHAAA3AgAINkDAQDMBwAh4ANAAM4HACH4AwAA2QjFBCL9A0AAzgcAIakEAQDMBwAhqgQBAMwHACGuBAAAjwiuBCKwBAEAzAcAIcUEgAAAAAHGBAIA1wcAIccEQADOBwAhyARAAM4HACECAAAAaAAgMwAA-gMAIAzZAwEAzAcAIeADQADOBwAh-AMAANkIxQQi_QNAAM4HACGpBAEAzAcAIaoEAQDMBwAhrgQAAI8IrgQisAQBAMwHACHFBIAAAAABxgQCANcHACHHBEAAzgcAIcgEQADOBwAhAgAAAGYAIDMAAPwDACACAAAAZgAgMwAA_AMAIAMAAABoACA6AAD1AwAgOwAA-gMAIAEAAABoACABAAAAZgAgBRIAANQIACBAAADXCAAgQQAA1ggAIFIAANUIACBTAADYCAAgD9YDAADOBgAw1wMAAIMEABDYAwAAzgYAMNkDAQD4BQAh4ANAAP0FACH4AwAAzwbFBCL9A0AA_QUAIakEAQD4BQAhqgQBAPoFACGuBAAAxQauBCKwBAEA-gUAIcUEAAD7BQAgxgQCAIsGACHHBEAA_QUAIcgEQAD9BQAhAwAAAGYAIAEAAIIEADA_AACDBAAgAwAAAGYAIAEAAGcAMAIAAGgAIAEAAABJACABAAAASQAgAwAAAEcAIAEAAEgAMAIAAEkAIAMAAABHACABAABIADACAABJACADAAAARwAgAQAASAAwAgAASQAgCBoAANMIACDZAwEAAAAB2wMAAADDBALfAwEAAAAB_wOAAAAAAYoEQAAAAAGmBAEAAAABwwQBAAAAAQEzAACLBAAgB9kDAQAAAAHbAwAAAMMEAt8DAQAAAAH_A4AAAAABigRAAAAAAaYEAQAAAAHDBAEAAAABATMAAI0EADABMwAAjQQAMAgaAADSCAAg2QMBAMwHACHbAwAA0QjDBCLfAwEAzQcAIf8DgAAAAAGKBEAAzgcAIaYEAQDMBwAhwwQBAM0HACECAAAASQAgMwAAkAQAIAfZAwEAzAcAIdsDAADRCMMEIt8DAQDNBwAh_wOAAAAAAYoEQADOBwAhpgQBAMwHACHDBAEAzQcAIQIAAABHACAzAACSBAAgAgAAAEcAIDMAAJIEACADAAAASQAgOgAAiwQAIDsAAJAEACABAAAASQAgAQAAAEcAIAUSAADOCAAgQAAA0AgAIEEAAM8IACDfAwAAyAcAIMMEAADIBwAgCtYDAADKBgAw1wMAAJkEABDYAwAAygYAMNkDAQD4BQAh2wMAAMsGwwQi3wMBAPwFACH_AwAA-wUAIIoEQAD9BQAhpgQBAPgFACHDBAEA_AUAIQMAAABHACABAACYBAAwPwAAmQQAIAMAAABHACABAABIADACAABJACABAAAAPwAgAQAAAD8AIAMAAAA9ACABAAA-ADACAAA_ACADAAAAPQAgAQAAPgAwAgAAPwAgAwAAAD0AIAEAAD4AMAIAAD8AICIWAADHCAAgFwAAyAgAIBgAAMkIACAdAADKCAAgHwAAywgAICEAAMwIACAiAADNCAAg2QMBAAAAAeADQAAAAAH9A0AAAAABqAQCAAAAAakEAQAAAAGqBAEAAAABrAQAAACsBAKuBAAAAK4EAq8EAQAAAAGwBAEAAAABsQQBAAAAAbIEAQAAAAGzBAEAAAABtAQCAAAAAbUEAgAAAAG2BEAAAAABtwQCAAAAAbgEQAAAAAG5BAIAAAABugRAAAAAAbsEQAAAAAG8BAEAAAABvQQBAAAAAb4EQAAAAAG_BEAAAAABwARAAAAAAcEEAgAAAAEBMwAAoQQAIBvZAwEAAAAB4ANAAAAAAf0DQAAAAAGoBAIAAAABqQQBAAAAAaoEAQAAAAGsBAAAAKwEAq4EAAAArgQCrwQBAAAAAbAEAQAAAAGxBAEAAAABsgQBAAAAAbMEAQAAAAG0BAIAAAABtQQCAAAAAbYEQAAAAAG3BAIAAAABuARAAAAAAbkEAgAAAAG6BEAAAAABuwRAAAAAAbwEAQAAAAG9BAEAAAABvgRAAAAAAb8EQAAAAAHABEAAAAABwQQCAAAAAQEzAACjBAAwATMAAKMEADABAAAAHAAgAQAAABQAICIWAACQCAAgFwAAkQgAIBgAAJIIACAdAACTCAAgHwAAlAgAICEAAJUIACAiAACWCAAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhqAQCANcHACGpBAEAzAcAIaoEAQDMBwAhrAQAAI4IrAQirgQAAI8IrgQirwQBAMwHACGwBAEAzAcAIbEEAQDNBwAhsgQBAM0HACGzBAEAzQcAIbQEAgDXBwAhtQQCANcHACG2BEAA2QcAIbcEAgDXBwAhuARAANkHACG5BAIA1wcAIboEQADZBwAhuwRAANkHACG8BAEAzQcAIb0EAQDNBwAhvgRAAM4HACG_BEAA2QcAIcAEQADZBwAhwQQCANcHACECAAAAPwAgMwAAqAQAIBvZAwEAzAcAIeADQADOBwAh_QNAAM4HACGoBAIA1wcAIakEAQDMBwAhqgQBAMwHACGsBAAAjgisBCKuBAAAjwiuBCKvBAEAzAcAIbAEAQDMBwAhsQQBAM0HACGyBAEAzQcAIbMEAQDNBwAhtAQCANcHACG1BAIA1wcAIbYEQADZBwAhtwQCANcHACG4BEAA2QcAIbkEAgDXBwAhugRAANkHACG7BEAA2QcAIbwEAQDNBwAhvQQBAM0HACG-BEAAzgcAIb8EQADZBwAhwARAANkHACHBBAIA1wcAIQIAAAA9ACAzAACqBAAgAgAAAD0AIDMAAKoEACABAAAAHAAgAQAAABQAIAMAAAA_ACA6AAChBAAgOwAAqAQAIAEAAAA_ACABAAAAPQAgEBIAAIkIACBAAACMCAAgQQAAiwgAIFIAAIoIACBTAACNCAAgsQQAAMgHACCyBAAAyAcAILMEAADIBwAgtgQAAMgHACC4BAAAyAcAILoEAADIBwAguwQAAMgHACC8BAAAyAcAIL0EAADIBwAgvwQAAMgHACDABAAAyAcAIB7WAwAAwwYAMNcDAACzBAAQ2AMAAMMGADDZAwEA-AUAIeADQAD9BQAh_QNAAP0FACGoBAIAiwYAIakEAQD4BQAhqgQBAPoFACGsBAAAxAasBCKuBAAAxQauBCKvBAEA-gUAIbAEAQD6BQAhsQQBAPwFACGyBAEA-QUAIbMEAQD5BQAhtAQCAIsGACG1BAIAiwYAIbYEQACNBgAhtwQCAIsGACG4BEAAjQYAIbkEAgCLBgAhugRAAI0GACG7BEAAjQYAIbwEAQD8BQAhvQQBAPwFACG-BEAA_QUAIb8EQACNBgAhwARAAI0GACHBBAIAiwYAIQMAAAA9ACABAACyBAAwPwAAswQAIAMAAAA9ACABAAA-ADACAAA_ACABAAAARQAgAQAAAEUAIAMAAABDACABAABEADACAABFACADAAAAQwAgAQAARAAwAgAARQAgAwAAAEMAIAEAAEQAMAIAAEUAIAUZAACHCAAgGgAAiAgAIIwEAQAAAAGmBAEAAAABpwRAAAAAAQEzAAC7BAAgA4wEAQAAAAGmBAEAAAABpwRAAAAAAQEzAAC9BAAwATMAAL0EADAFGQAAhQgAIBoAAIYIACCMBAEAzAcAIaYEAQDMBwAhpwRAAM4HACECAAAARQAgMwAAwAQAIAOMBAEAzAcAIaYEAQDMBwAhpwRAAM4HACECAAAAQwAgMwAAwgQAIAIAAABDACAzAADCBAAgAwAAAEUAIDoAALsEACA7AADABAAgAQAAAEUAIAEAAABDACADEgAAgggAIEAAAIQIACBBAACDCAAgBtYDAADCBgAw1wMAAMkEABDYAwAAwgYAMIwEAQD4BQAhpgQBAPgFACGnBEAA_QUAIQMAAABDACABAADIBAAwPwAAyQQAIAMAAABDACABAABEADACAABFACABAAAAUAAgAQAAAFAAIAMAAABOACABAABPADACAABQACADAAAATgAgAQAATwAwAgAAUAAgAwAAAE4AIAEAAE8AMAIAAFAAIAwZAACACAAgHgAAgQgAINkDAQAAAAHaAwEAAAAB4ANAAAAAAf4DAQAAAAGGBAEAAAABjAQBAAAAAaEEAAAAoQQCowQAAACjBAKkBAEAAAABpQSAAAAAAQEzAADRBAAgCtkDAQAAAAHaAwEAAAAB4ANAAAAAAf4DAQAAAAGGBAEAAAABjAQBAAAAAaEEAAAAoQQCowQAAACjBAKkBAEAAAABpQSAAAAAAQEzAADTBAAwATMAANMEADABAAAAHAAgDBkAAP4HACAeAAD_BwAg2QMBAMwHACHaAwEAzQcAIeADQADOBwAh_gMBAM0HACGGBAEAzQcAIYwEAQDMBwAhoQQAAPwHoQQiowQAAP0HowQipAQBAMwHACGlBIAAAAABAgAAAFAAIDMAANcEACAK2QMBAMwHACHaAwEAzQcAIeADQADOBwAh_gMBAM0HACGGBAEAzQcAIYwEAQDMBwAhoQQAAPwHoQQiowQAAP0HowQipAQBAMwHACGlBIAAAAABAgAAAE4AIDMAANkEACACAAAATgAgMwAA2QQAIAEAAAAcACADAAAAUAAgOgAA0QQAIDsAANcEACABAAAAUAAgAQAAAE4AIAYSAAD5BwAgQAAA-wcAIEEAAPoHACDaAwAAyAcAIP4DAADIBwAghgQAAMgHACAN1gMAALsGADDXAwAA4QQAENgDAAC7BgAw2QMBAPgFACHaAwEA-QUAIeADQAD9BQAh_gMBAPwFACGGBAEA_AUAIYwEAQD4BQAhoQQAALwGoQQiowQAAL0GowQipAQBAPoFACGlBAAA-wUAIAMAAABOACABAADgBAAwPwAA4QQAIAMAAABOACABAABPADACAABQACABAAAAVQAgAQAAAFUAIAMAAABTACABAABUADACAABVACADAAAAUwAgAQAAVAAwAgAAVQAgAwAAAFMAIAEAAFQAMAIAAFUAIBQZAAD3BwAgIAAA-AcAINkDAQAAAAHgA0AAAAAB-AMAAACYBAL9A0AAAAAB_gMBAAAAAYkEAQAAAAGMBAEAAAABjQQBAAAAAZUEAAAAlQQClgQBAAAAAZgEAgAAAAGZBAEAAAABmgQBAAAAAZsEAQAAAAGcBAEAAAABnQRAAAAAAZ4EQAAAAAGfBEAAAAABATMAAOkEACAS2QMBAAAAAeADQAAAAAH4AwAAAJgEAv0DQAAAAAH-AwEAAAABiQQBAAAAAYwEAQAAAAGNBAEAAAABlQQAAACVBAKWBAEAAAABmAQCAAAAAZkEAQAAAAGaBAEAAAABmwQBAAAAAZwEAQAAAAGdBEAAAAABngRAAAAAAZ8EQAAAAAEBMwAA6wQAMAEzAADrBAAwAQAAABwAIBQZAAD1BwAgIAAA9gcAINkDAQDMBwAh4ANAAM4HACH4AwAA9AeYBCL9A0AAzgcAIf4DAQDMBwAhiQQBAM0HACGMBAEAzAcAIY0EAQDNBwAhlQQAAPMHlQQilgQBAMwHACGYBAIA1wcAIZkEAQDNBwAhmgQBAM0HACGbBAEAzQcAIZwEAQDNBwAhnQRAAM4HACGeBEAA2QcAIZ8EQADZBwAhAgAAAFUAIDMAAO8EACAS2QMBAMwHACHgA0AAzgcAIfgDAAD0B5gEIv0DQADOBwAh_gMBAMwHACGJBAEAzQcAIYwEAQDMBwAhjQQBAM0HACGVBAAA8weVBCKWBAEAzAcAIZgEAgDXBwAhmQQBAM0HACGaBAEAzQcAIZsEAQDNBwAhnAQBAM0HACGdBEAAzgcAIZ4EQADZBwAhnwRAANkHACECAAAAUwAgMwAA8QQAIAIAAABTACAzAADxBAAgAQAAABwAIAMAAABVACA6AADpBAAgOwAA7wQAIAEAAABVACABAAAAUwAgDRIAAO4HACBAAADxBwAgQQAA8AcAIFIAAO8HACBTAADyBwAgiQQAAMgHACCNBAAAyAcAIJkEAADIBwAgmgQAAMgHACCbBAAAyAcAIJwEAADIBwAgngQAAMgHACCfBAAAyAcAIBXWAwAAtAYAMNcDAAD5BAAQ2AMAALQGADDZAwEA-AUAIeADQAD9BQAh-AMAALYGmAQi_QNAAP0FACH-AwEA-gUAIYkEAQD8BQAhjAQBAPgFACGNBAEA-QUAIZUEAAC1BpUEIpYEAQD6BQAhmAQCAIsGACGZBAEA_AUAIZoEAQD8BQAhmwQBAPwFACGcBAEA_AUAIZ0EQAD9BQAhngRAAI0GACGfBEAAjQYAIQMAAABTACABAAD4BAAwPwAA-QQAIAMAAABTACABAABUADACAABVACABAAAAWgAgAQAAAFoAIAMAAABYACABAABZADACAABaACADAAAAWAAgAQAAWQAwAgAAWgAgAwAAAFgAIAEAAFkAMAIAAFoAIAwZAADsBwAgIAAA7QcAINkDAQAAAAHgA0AAAAAB_QNAAAAAAYwEAQAAAAGNBAEAAAABjwQAAACPBAKQBAEAAAABkQQBAAAAAZIEAQAAAAGTBAIAAAABATMAAIEFACAK2QMBAAAAAeADQAAAAAH9A0AAAAABjAQBAAAAAY0EAQAAAAGPBAAAAI8EApAEAQAAAAGRBAEAAAABkgQBAAAAAZMEAgAAAAEBMwAAgwUAMAEzAACDBQAwAQAAABwAIAwZAADqBwAgIAAA6wcAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYwEAQDMBwAhjQQBAM0HACGPBAAA6QePBCKQBAEAzAcAIZEEAQDMBwAhkgQBAMwHACGTBAIA1wcAIQIAAABaACAzAACHBQAgCtkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYwEAQDMBwAhjQQBAM0HACGPBAAA6QePBCKQBAEAzAcAIZEEAQDMBwAhkgQBAMwHACGTBAIA1wcAIQIAAABYACAzAACJBQAgAgAAAFgAIDMAAIkFACABAAAAHAAgAwAAAFoAIDoAAIEFACA7AACHBQAgAQAAAFoAIAEAAABYACAGEgAA5AcAIEAAAOcHACBBAADmBwAgUgAA5QcAIFMAAOgHACCNBAAAyAcAIA3WAwAAsAYAMNcDAACRBQAQ2AMAALAGADDZAwEA-AUAIeADQAD9BQAh_QNAAP0FACGMBAEA-AUAIY0EAQD5BQAhjwQAALEGjwQikAQBAPoFACGRBAEA-gUAIZIEAQD6BQAhkwQCAIsGACEDAAAAWAAgAQAAkAUAMD8AAJEFACADAAAAWAAgAQAAWQAwAgAAWgAgDdYDAACtBgAw1wMAAJcFABDYAwAArQYAMNkDAQAAAAH4AwAArgaIBCL_AwAArwYAIIQEAQAAAAGFBAEAmAYAIYYEAQCbBgAhiAQAAK8GACCJBAEAmwYAIYoEQACeBgAhiwRAAJ0GACEBAAAAlAUAIAEAAACUBQAgDdYDAACtBgAw1wMAAJcFABDYAwAArQYAMNkDAQCXBgAh-AMAAK4GiAQi_wMAAK8GACCEBAEAmAYAIYUEAQCYBgAhhgQBAJsGACGIBAAArwYAIIkEAQCbBgAhigRAAJ4GACGLBEAAnQYAIQX_AwAAyAcAIIYEAADIBwAgiAQAAMgHACCJBAAAyAcAIIsEAADIBwAgAwAAAJcFACABAACYBQAwAgAAlAUAIAMAAACXBQAgAQAAmAUAMAIAAJQFACADAAAAlwUAIAEAAJgFADACAACUBQAgCtkDAQAAAAH4AwAAAIgEAv8DgAAAAAGEBAEAAAABhQQBAAAAAYYEAQAAAAGIBIAAAAABiQQBAAAAAYoEQAAAAAGLBEAAAAABATMAAJwFACAK2QMBAAAAAfgDAAAAiAQC_wOAAAAAAYQEAQAAAAGFBAEAAAABhgQBAAAAAYgEgAAAAAGJBAEAAAABigRAAAAAAYsEQAAAAAEBMwAAngUAMAEzAACeBQAwCtkDAQDMBwAh-AMAAOMHiAQi_wOAAAAAAYQEAQDMBwAhhQQBAMwHACGGBAEAzQcAIYgEgAAAAAGJBAEAzQcAIYoEQADOBwAhiwRAANkHACECAAAAlAUAIDMAAKEFACAK2QMBAMwHACH4AwAA4weIBCL_A4AAAAABhAQBAMwHACGFBAEAzAcAIYYEAQDNBwAhiASAAAAAAYkEAQDNBwAhigRAAM4HACGLBEAA2QcAIQIAAACXBQAgMwAAowUAIAIAAACXBQAgMwAAowUAIAMAAACUBQAgOgAAnAUAIDsAAKEFACABAAAAlAUAIAEAAACXBQAgCBIAAOAHACBAAADiBwAgQQAA4QcAIP8DAADIBwAghgQAAMgHACCIBAAAyAcAIIkEAADIBwAgiwQAAMgHACAN1gMAAKcGADDXAwAAqgUAENgDAACnBgAw2QMBAPgFACH4AwAAqAaIBCL_AwAAqQYAIIQEAQD6BQAhhQQBAPoFACGGBAEA_AUAIYgEAACpBgAgiQQBAPwFACGKBEAA_QUAIYsEQACNBgAhAwAAAJcFACABAACpBQAwPwAAqgUAIAMAAACXBQAgAQAAmAUAMAIAAJQFACAO1gMAAKQGADDXAwAAsAUAENgDAACkBgAw2QMBAAAAAeADQACeBgAh9AMBAJgGACH4AwAApgaBBCL8AwEAmwYAIf0DQACeBgAh_gMBAAAAAf8DAAClBgAggQRAAJ4GACGCBEAAnQYAIYMEAgCaBgAhAQAAAK0FACABAAAArQUAIA7WAwAApAYAMNcDAACwBQAQ2AMAAKQGADDZAwEAlwYAIeADQACeBgAh9AMBAJgGACH4AwAApgaBBCL8AwEAmwYAIf0DQACeBgAh_gMBAJgGACH_AwAApQYAIIEEQACeBgAhggRAAJ0GACGDBAIAmgYAIQL8AwAAyAcAIIIEAADIBwAgAwAAALAFACABAACxBQAwAgAArQUAIAMAAACwBQAgAQAAsQUAMAIAAK0FACADAAAAsAUAIAEAALEFADACAACtBQAgC9kDAQAAAAHgA0AAAAAB9AMBAAAAAfgDAAAAgQQC_AMBAAAAAf0DQAAAAAH-AwEAAAAB_wOAAAAAAYEEQAAAAAGCBEAAAAABgwQCAAAAAQEzAAC1BQAgC9kDAQAAAAHgA0AAAAAB9AMBAAAAAfgDAAAAgQQC_AMBAAAAAf0DQAAAAAH-AwEAAAAB_wOAAAAAAYEEQAAAAAGCBEAAAAABgwQCAAAAAQEzAAC3BQAwATMAALcFADAL2QMBAMwHACHgA0AAzgcAIfQDAQDMBwAh-AMAAN8HgQQi_AMBAM0HACH9A0AAzgcAIf4DAQDMBwAh_wOAAAAAAYEEQADOBwAhggRAANkHACGDBAIA1wcAIQIAAACtBQAgMwAAugUAIAvZAwEAzAcAIeADQADOBwAh9AMBAMwHACH4AwAA3weBBCL8AwEAzQcAIf0DQADOBwAh_gMBAMwHACH_A4AAAAABgQRAAM4HACGCBEAA2QcAIYMEAgDXBwAhAgAAALAFACAzAAC8BQAgAgAAALAFACAzAAC8BQAgAwAAAK0FACA6AAC1BQAgOwAAugUAIAEAAACtBQAgAQAAALAFACAHEgAA2gcAIEAAAN0HACBBAADcBwAgUgAA2wcAIFMAAN4HACD8AwAAyAcAIIIEAADIBwAgDtYDAACgBgAw1wMAAMMFABDYAwAAoAYAMNkDAQD4BQAh4ANAAP0FACH0AwEA-gUAIfgDAAChBoEEIvwDAQD8BQAh_QNAAP0FACH-AwEA-gUAIf8DAAD7BQAggQRAAP0FACGCBEAAjQYAIYMEAgCLBgAhAwAAALAFACABAADCBQAwPwAAwwUAIAMAAACwBQAgAQAAsQUAMAIAAK0FACAQ1gMAAJYGADDXAwAAyQUAENgDAACWBgAw2QMBAAAAAd0DAQCYBgAh4ANAAJ4GACHyAwEAAAAB9AMAAJkG9AMi9QMCAJoGACH2AwEAAAAB-AMAAJwG-AMi-QNAAJ0GACH6A0AAnQYAIfsDQACdBgAh_AMBAJsGACH9A0AAngYAIQEAAADGBQAgAQAAAMYFACAQ1gMAAJYGADDXAwAAyQUAENgDAACWBgAw2QMBAJcGACHdAwEAmAYAIeADQACeBgAh8gMBAJgGACH0AwAAmQb0AyL1AwIAmgYAIfYDAQCbBgAh-AMAAJwG-AMi-QNAAJ0GACH6A0AAnQYAIfsDQACdBgAh_AMBAJsGACH9A0AAngYAIQX2AwAAyAcAIPkDAADIBwAg-gMAAMgHACD7AwAAyAcAIPwDAADIBwAgAwAAAMkFACABAADKBQAwAgAAxgUAIAMAAADJBQAgAQAAygUAMAIAAMYFACADAAAAyQUAIAEAAMoFADACAADGBQAgDdkDAQAAAAHdAwEAAAAB4ANAAAAAAfIDAQAAAAH0AwAAAPQDAvUDAgAAAAH2AwEAAAAB-AMAAAD4AwL5A0AAAAAB-gNAAAAAAfsDQAAAAAH8AwEAAAAB_QNAAAAAAQEzAADOBQAgDdkDAQAAAAHdAwEAAAAB4ANAAAAAAfIDAQAAAAH0AwAAAPQDAvUDAgAAAAH2AwEAAAAB-AMAAAD4AwL5A0AAAAAB-gNAAAAAAfsDQAAAAAH8AwEAAAAB_QNAAAAAAQEzAADQBQAwATMAANAFADAN2QMBAMwHACHdAwEAzAcAIeADQADOBwAh8gMBAMwHACH0AwAA1gf0AyL1AwIA1wcAIfYDAQDNBwAh-AMAANgH-AMi-QNAANkHACH6A0AA2QcAIfsDQADZBwAh_AMBAM0HACH9A0AAzgcAIQIAAADGBQAgMwAA0wUAIA3ZAwEAzAcAId0DAQDMBwAh4ANAAM4HACHyAwEAzAcAIfQDAADWB_QDIvUDAgDXBwAh9gMBAM0HACH4AwAA2Af4AyL5A0AA2QcAIfoDQADZBwAh-wNAANkHACH8AwEAzQcAIf0DQADOBwAhAgAAAMkFACAzAADVBQAgAgAAAMkFACAzAADVBQAgAwAAAMYFACA6AADOBQAgOwAA0wUAIAEAAADGBQAgAQAAAMkFACAKEgAA0QcAIEAAANQHACBBAADTBwAgUgAA0gcAIFMAANUHACD2AwAAyAcAIPkDAADIBwAg-gMAAMgHACD7AwAAyAcAIPwDAADIBwAgENYDAACJBgAw1wMAANwFABDYAwAAiQYAMNkDAQD4BQAh3QMBAPoFACHgA0AA_QUAIfIDAQD6BQAh9AMAAIoG9AMi9QMCAIsGACH2AwEA_AUAIfgDAACMBvgDIvkDQACNBgAh-gNAAI0GACH7A0AAjQYAIfwDAQD8BQAh_QNAAP0FACEDAAAAyQUAIAEAANsFADA_AADcBQAgAwAAAMkFACABAADKBQAwAgAAxgUAIAEAAACFAQAgAQAAAIUBACADAAAAgwEAIAEAAIQBADACAACFAQAgAwAAAIMBACABAACEAQAwAgAAhQEAIAMAAACDAQAgAQAAhAEAMAIAAIUBACAJHgAA0AcAINkDAQAAAAHaAwEAAAAB2wMBAAAAAdwDAQAAAAHdAwEAAAAB3gOAAAAAAd8DAQAAAAHgA0AAAAABATMAAOQFACAI2QMBAAAAAdoDAQAAAAHbAwEAAAAB3AMBAAAAAd0DAQAAAAHeA4AAAAAB3wMBAAAAAeADQAAAAAEBMwAA5gUAMAEzAADmBQAwAQAAABwAIAkeAADPBwAg2QMBAMwHACHaAwEAzQcAIdsDAQDMBwAh3AMBAMwHACHdAwEAzAcAId4DgAAAAAHfAwEAzQcAIeADQADOBwAhAgAAAIUBACAzAADqBQAgCNkDAQDMBwAh2gMBAM0HACHbAwEAzAcAIdwDAQDMBwAh3QMBAMwHACHeA4AAAAAB3wMBAM0HACHgA0AAzgcAIQIAAACDAQAgMwAA7AUAIAIAAACDAQAgMwAA7AUAIAEAAAAcACADAAAAhQEAIDoAAOQFACA7AADqBQAgAQAAAIUBACABAAAAgwEAIAUSAADJBwAgQAAAywcAIEEAAMoHACDaAwAAyAcAIN8DAADIBwAgC9YDAAD3BQAw1wMAAPQFABDYAwAA9wUAMNkDAQD4BQAh2gMBAPkFACHbAwEA-gUAIdwDAQD6BQAh3QMBAPoFACHeAwAA-wUAIN8DAQD8BQAh4ANAAP0FACEDAAAAgwEAIAEAAPMFADA_AAD0BQAgAwAAAIMBACABAACEAQAwAgAAhQEAIAvWAwAA9wUAMNcDAAD0BQAQ2AMAAPcFADDZAwEA-AUAIdoDAQD5BQAh2wMBAPoFACHcAwEA-gUAId0DAQD6BQAh3gMAAPsFACDfAwEA_AUAIeADQAD9BQAhCxIAAP8FACBAAACGBgAgQQAAhgYAIOEDAQAAAAHiAwEAAAAE4wMBAAAABOQDAQAAAAHlAwEAAAAB5gMBAAAAAecDAQAAAAHoAwEAiAYAIQsSAACCBgAgQAAAgwYAIEEAAIMGACDhAwEAAAAB4gMBAAAABeMDAQAAAAXkAwEAAAAB5QMBAAAAAeYDAQAAAAHnAwEAAAAB6AMBAIcGACEOEgAA_wUAIEAAAIYGACBBAACGBgAg4QMBAAAAAeIDAQAAAATjAwEAAAAE5AMBAAAAAeUDAQAAAAHmAwEAAAAB5wMBAAAAAegDAQCFBgAh6QMBAAAAAeoDAQAAAAHrAwEAAAABDxIAAP8FACBAAACEBgAgQQAAhAYAIOEDgAAAAAHkA4AAAAAB5QOAAAAAAeYDgAAAAAHnA4AAAAAB6AOAAAAAAewDAQAAAAHtAwEAAAAB7gMBAAAAAe8DgAAAAAHwA4AAAAAB8QOAAAAAAQ4SAACCBgAgQAAAgwYAIEEAAIMGACDhAwEAAAAB4gMBAAAABeMDAQAAAAXkAwEAAAAB5QMBAAAAAeYDAQAAAAHnAwEAAAAB6AMBAIEGACHpAwEAAAAB6gMBAAAAAesDAQAAAAELEgAA_wUAIEAAAIAGACBBAACABgAg4QNAAAAAAeIDQAAAAATjA0AAAAAE5ANAAAAAAeUDQAAAAAHmA0AAAAAB5wNAAAAAAegDQAD-BQAhCxIAAP8FACBAAACABgAgQQAAgAYAIOEDQAAAAAHiA0AAAAAE4wNAAAAABOQDQAAAAAHlA0AAAAAB5gNAAAAAAecDQAAAAAHoA0AA_gUAIQjhAwIAAAAB4gMCAAAABOMDAgAAAATkAwIAAAAB5QMCAAAAAeYDAgAAAAHnAwIAAAAB6AMCAP8FACEI4QNAAAAAAeIDQAAAAATjA0AAAAAE5ANAAAAAAeUDQAAAAAHmA0AAAAAB5wNAAAAAAegDQACABgAhDhIAAIIGACBAAACDBgAgQQAAgwYAIOEDAQAAAAHiAwEAAAAF4wMBAAAABeQDAQAAAAHlAwEAAAAB5gMBAAAAAecDAQAAAAHoAwEAgQYAIekDAQAAAAHqAwEAAAAB6wMBAAAAAQjhAwIAAAAB4gMCAAAABeMDAgAAAAXkAwIAAAAB5QMCAAAAAeYDAgAAAAHnAwIAAAAB6AMCAIIGACEL4QMBAAAAAeIDAQAAAAXjAwEAAAAF5AMBAAAAAeUDAQAAAAHmAwEAAAAB5wMBAAAAAegDAQCDBgAh6QMBAAAAAeoDAQAAAAHrAwEAAAABDOEDgAAAAAHkA4AAAAAB5QOAAAAAAeYDgAAAAAHnA4AAAAAB6AOAAAAAAewDAQAAAAHtAwEAAAAB7gMBAAAAAe8DgAAAAAHwA4AAAAAB8QOAAAAAAQ4SAAD_BQAgQAAAhgYAIEEAAIYGACDhAwEAAAAB4gMBAAAABOMDAQAAAATkAwEAAAAB5QMBAAAAAeYDAQAAAAHnAwEAAAAB6AMBAIUGACHpAwEAAAAB6gMBAAAAAesDAQAAAAEL4QMBAAAAAeIDAQAAAATjAwEAAAAE5AMBAAAAAeUDAQAAAAHmAwEAAAAB5wMBAAAAAegDAQCGBgAh6QMBAAAAAeoDAQAAAAHrAwEAAAABCxIAAIIGACBAAACDBgAgQQAAgwYAIOEDAQAAAAHiAwEAAAAF4wMBAAAABeQDAQAAAAHlAwEAAAAB5gMBAAAAAecDAQAAAAHoAwEAhwYAIQsSAAD_BQAgQAAAhgYAIEEAAIYGACDhAwEAAAAB4gMBAAAABOMDAQAAAATkAwEAAAAB5QMBAAAAAeYDAQAAAAHnAwEAAAAB6AMBAIgGACEQ1gMAAIkGADDXAwAA3AUAENgDAACJBgAw2QMBAPgFACHdAwEA-gUAIeADQAD9BQAh8gMBAPoFACH0AwAAigb0AyL1AwIAiwYAIfYDAQD8BQAh-AMAAIwG-AMi-QNAAI0GACH6A0AAjQYAIfsDQACNBgAh_AMBAPwFACH9A0AA_QUAIQcSAAD_BQAgQAAAlQYAIEEAAJUGACDhAwAAAPQDAuIDAAAA9AMI4wMAAAD0AwjoAwAAlAb0AyINEgAA_wUAIEAAAP8FACBBAAD_BQAgUgAAkwYAIFMAAP8FACDhAwIAAAAB4gMCAAAABOMDAgAAAATkAwIAAAAB5QMCAAAAAeYDAgAAAAHnAwIAAAAB6AMCAJIGACEHEgAA_wUAIEAAAJEGACBBAACRBgAg4QMAAAD4AwLiAwAAAPgDCOMDAAAA-AMI6AMAAJAG-AMiCxIAAIIGACBAAACPBgAgQQAAjwYAIOEDQAAAAAHiA0AAAAAF4wNAAAAABeQDQAAAAAHlA0AAAAAB5gNAAAAAAecDQAAAAAHoA0AAjgYAIQsSAACCBgAgQAAAjwYAIEEAAI8GACDhA0AAAAAB4gNAAAAABeMDQAAAAAXkA0AAAAAB5QNAAAAAAeYDQAAAAAHnA0AAAAAB6ANAAI4GACEI4QNAAAAAAeIDQAAAAAXjA0AAAAAF5ANAAAAAAeUDQAAAAAHmA0AAAAAB5wNAAAAAAegDQACPBgAhBxIAAP8FACBAAACRBgAgQQAAkQYAIOEDAAAA-AMC4gMAAAD4AwjjAwAAAPgDCOgDAACQBvgDIgThAwAAAPgDAuIDAAAA-AMI4wMAAAD4AwjoAwAAkQb4AyINEgAA_wUAIEAAAP8FACBBAAD_BQAgUgAAkwYAIFMAAP8FACDhAwIAAAAB4gMCAAAABOMDAgAAAATkAwIAAAAB5QMCAAAAAeYDAgAAAAHnAwIAAAAB6AMCAJIGACEI4QMIAAAAAeIDCAAAAATjAwgAAAAE5AMIAAAAAeUDCAAAAAHmAwgAAAAB5wMIAAAAAegDCACTBgAhBxIAAP8FACBAAACVBgAgQQAAlQYAIOEDAAAA9AMC4gMAAAD0AwjjAwAAAPQDCOgDAACUBvQDIgThAwAAAPQDAuIDAAAA9AMI4wMAAAD0AwjoAwAAlQb0AyIQ1gMAAJYGADDXAwAAyQUAENgDAACWBgAw2QMBAJcGACHdAwEAmAYAIeADQACeBgAh8gMBAJgGACH0AwAAmQb0AyL1AwIAmgYAIfYDAQCbBgAh-AMAAJwG-AMi-QNAAJ0GACH6A0AAnQYAIfsDQACdBgAh_AMBAJsGACH9A0AAngYAIQjhAwEAAAAB4gMBAAAABOMDAQAAAATkAwEAAAAB5QMBAAAAAeYDAQAAAAHnAwEAAAAB6AMBAJ8GACEL4QMBAAAAAeIDAQAAAATjAwEAAAAE5AMBAAAAAeUDAQAAAAHmAwEAAAAB5wMBAAAAAegDAQCGBgAh6QMBAAAAAeoDAQAAAAHrAwEAAAABBOEDAAAA9AMC4gMAAAD0AwjjAwAAAPQDCOgDAACVBvQDIgjhAwIAAAAB4gMCAAAABOMDAgAAAATkAwIAAAAB5QMCAAAAAeYDAgAAAAHnAwIAAAAB6AMCAP8FACEL4QMBAAAAAeIDAQAAAAXjAwEAAAAF5AMBAAAAAeUDAQAAAAHmAwEAAAAB5wMBAAAAAegDAQCDBgAh6QMBAAAAAeoDAQAAAAHrAwEAAAABBOEDAAAA-AMC4gMAAAD4AwjjAwAAAPgDCOgDAACRBvgDIgjhA0AAAAAB4gNAAAAABeMDQAAAAAXkA0AAAAAB5QNAAAAAAeYDQAAAAAHnA0AAAAAB6ANAAI8GACEI4QNAAAAAAeIDQAAAAATjA0AAAAAE5ANAAAAAAeUDQAAAAAHmA0AAAAAB5wNAAAAAAegDQACABgAhCOEDAQAAAAHiAwEAAAAE4wMBAAAABOQDAQAAAAHlAwEAAAAB5gMBAAAAAecDAQAAAAHoAwEAnwYAIQ7WAwAAoAYAMNcDAADDBQAQ2AMAAKAGADDZAwEA-AUAIeADQAD9BQAh9AMBAPoFACH4AwAAoQaBBCL8AwEA_AUAIf0DQAD9BQAh_gMBAPoFACH_AwAA-wUAIIEEQAD9BQAhggRAAI0GACGDBAIAiwYAIQcSAAD_BQAgQAAAowYAIEEAAKMGACDhAwAAAIEEAuIDAAAAgQQI4wMAAACBBAjoAwAAogaBBCIHEgAA_wUAIEAAAKMGACBBAACjBgAg4QMAAACBBALiAwAAAIEECOMDAAAAgQQI6AMAAKIGgQQiBOEDAAAAgQQC4gMAAACBBAjjAwAAAIEECOgDAACjBoEEIg7WAwAApAYAMNcDAACwBQAQ2AMAAKQGADDZAwEAlwYAIeADQACeBgAh9AMBAJgGACH4AwAApgaBBCL8AwEAmwYAIf0DQACeBgAh_gMBAJgGACH_AwAApQYAIIEEQACeBgAhggRAAJ0GACGDBAIAmgYAIQzhA4AAAAAB5AOAAAAAAeUDgAAAAAHmA4AAAAAB5wOAAAAAAegDgAAAAAHsAwEAAAAB7QMBAAAAAe4DAQAAAAHvA4AAAAAB8AOAAAAAAfEDgAAAAAEE4QMAAACBBALiAwAAAIEECOMDAAAAgQQI6AMAAKMGgQQiDdYDAACnBgAw1wMAAKoFABDYAwAApwYAMNkDAQD4BQAh-AMAAKgGiAQi_wMAAKkGACCEBAEA-gUAIYUEAQD6BQAhhgQBAPwFACGIBAAAqQYAIIkEAQD8BQAhigRAAP0FACGLBEAAjQYAIQcSAAD_BQAgQAAArAYAIEEAAKwGACDhAwAAAIgEAuIDAAAAiAQI4wMAAACIBAjoAwAAqwaIBCIPEgAAggYAIEAAAKoGACBBAACqBgAg4QOAAAAAAeQDgAAAAAHlA4AAAAAB5gOAAAAAAecDgAAAAAHoA4AAAAAB7AMBAAAAAe0DAQAAAAHuAwEAAAAB7wOAAAAAAfADgAAAAAHxA4AAAAABDOEDgAAAAAHkA4AAAAAB5QOAAAAAAeYDgAAAAAHnA4AAAAAB6AOAAAAAAewDAQAAAAHtAwEAAAAB7gMBAAAAAe8DgAAAAAHwA4AAAAAB8QOAAAAAAQcSAAD_BQAgQAAArAYAIEEAAKwGACDhAwAAAIgEAuIDAAAAiAQI4wMAAACIBAjoAwAAqwaIBCIE4QMAAACIBALiAwAAAIgECOMDAAAAiAQI6AMAAKwGiAQiDdYDAACtBgAw1wMAAJcFABDYAwAArQYAMNkDAQCXBgAh-AMAAK4GiAQi_wMAAK8GACCEBAEAmAYAIYUEAQCYBgAhhgQBAJsGACGIBAAArwYAIIkEAQCbBgAhigRAAJ4GACGLBEAAnQYAIQThAwAAAIgEAuIDAAAAiAQI4wMAAACIBAjoAwAArAaIBCIM4QOAAAAAAeQDgAAAAAHlA4AAAAAB5gOAAAAAAecDgAAAAAHoA4AAAAAB7AMBAAAAAe0DAQAAAAHuAwEAAAAB7wOAAAAAAfADgAAAAAHxA4AAAAABDdYDAACwBgAw1wMAAJEFABDYAwAAsAYAMNkDAQD4BQAh4ANAAP0FACH9A0AA_QUAIYwEAQD4BQAhjQQBAPkFACGPBAAAsQaPBCKQBAEA-gUAIZEEAQD6BQAhkgQBAPoFACGTBAIAiwYAIQcSAAD_BQAgQAAAswYAIEEAALMGACDhAwAAAI8EAuIDAAAAjwQI4wMAAACPBAjoAwAAsgaPBCIHEgAA_wUAIEAAALMGACBBAACzBgAg4QMAAACPBALiAwAAAI8ECOMDAAAAjwQI6AMAALIGjwQiBOEDAAAAjwQC4gMAAACPBAjjAwAAAI8ECOgDAACzBo8EIhXWAwAAtAYAMNcDAAD5BAAQ2AMAALQGADDZAwEA-AUAIeADQAD9BQAh-AMAALYGmAQi_QNAAP0FACH-AwEA-gUAIYkEAQD8BQAhjAQBAPgFACGNBAEA-QUAIZUEAAC1BpUEIpYEAQD6BQAhmAQCAIsGACGZBAEA_AUAIZoEAQD8BQAhmwQBAPwFACGcBAEA_AUAIZ0EQAD9BQAhngRAAI0GACGfBEAAjQYAIQcSAAD_BQAgQAAAugYAIEEAALoGACDhAwAAAJUEAuIDAAAAlQQI4wMAAACVBAjoAwAAuQaVBCIHEgAA_wUAIEAAALgGACBBAAC4BgAg4QMAAACYBALiAwAAAJgECOMDAAAAmAQI6AMAALcGmAQiBxIAAP8FACBAAAC4BgAgQQAAuAYAIOEDAAAAmAQC4gMAAACYBAjjAwAAAJgECOgDAAC3BpgEIgThAwAAAJgEAuIDAAAAmAQI4wMAAACYBAjoAwAAuAaYBCIHEgAA_wUAIEAAALoGACBBAAC6BgAg4QMAAACVBALiAwAAAJUECOMDAAAAlQQI6AMAALkGlQQiBOEDAAAAlQQC4gMAAACVBAjjAwAAAJUECOgDAAC6BpUEIg3WAwAAuwYAMNcDAADhBAAQ2AMAALsGADDZAwEA-AUAIdoDAQD5BQAh4ANAAP0FACH-AwEA_AUAIYYEAQD8BQAhjAQBAPgFACGhBAAAvAahBCKjBAAAvQajBCKkBAEA-gUAIaUEAAD7BQAgBxIAAP8FACBAAADBBgAgQQAAwQYAIOEDAAAAoQQC4gMAAAChBAjjAwAAAKEECOgDAADABqEEIgcSAAD_BQAgQAAAvwYAIEEAAL8GACDhAwAAAKMEAuIDAAAAowQI4wMAAACjBAjoAwAAvgajBCIHEgAA_wUAIEAAAL8GACBBAAC_BgAg4QMAAACjBALiAwAAAKMECOMDAAAAowQI6AMAAL4GowQiBOEDAAAAowQC4gMAAACjBAjjAwAAAKMECOgDAAC_BqMEIgcSAAD_BQAgQAAAwQYAIEEAAMEGACDhAwAAAKEEAuIDAAAAoQQI4wMAAAChBAjoAwAAwAahBCIE4QMAAAChBALiAwAAAKEECOMDAAAAoQQI6AMAAMEGoQQiBtYDAADCBgAw1wMAAMkEABDYAwAAwgYAMIwEAQD4BQAhpgQBAPgFACGnBEAA_QUAIR7WAwAAwwYAMNcDAACzBAAQ2AMAAMMGADDZAwEA-AUAIeADQAD9BQAh_QNAAP0FACGoBAIAiwYAIakEAQD4BQAhqgQBAPoFACGsBAAAxAasBCKuBAAAxQauBCKvBAEA-gUAIbAEAQD6BQAhsQQBAPwFACGyBAEA-QUAIbMEAQD5BQAhtAQCAIsGACG1BAIAiwYAIbYEQACNBgAhtwQCAIsGACG4BEAAjQYAIbkEAgCLBgAhugRAAI0GACG7BEAAjQYAIbwEAQD8BQAhvQQBAPwFACG-BEAA_QUAIb8EQACNBgAhwARAAI0GACHBBAIAiwYAIQcSAAD_BQAgQAAAyQYAIEEAAMkGACDhAwAAAKwEAuIDAAAArAQI4wMAAACsBAjoAwAAyAasBCIHEgAA_wUAIEAAAMcGACBBAADHBgAg4QMAAACuBALiAwAAAK4ECOMDAAAArgQI6AMAAMYGrgQiBxIAAP8FACBAAADHBgAgQQAAxwYAIOEDAAAArgQC4gMAAACuBAjjAwAAAK4ECOgDAADGBq4EIgThAwAAAK4EAuIDAAAArgQI4wMAAACuBAjoAwAAxwauBCIHEgAA_wUAIEAAAMkGACBBAADJBgAg4QMAAACsBALiAwAAAKwECOMDAAAArAQI6AMAAMgGrAQiBOEDAAAArAQC4gMAAACsBAjjAwAAAKwECOgDAADJBqwEIgrWAwAAygYAMNcDAACZBAAQ2AMAAMoGADDZAwEA-AUAIdsDAADLBsMEIt8DAQD8BQAh_wMAAPsFACCKBEAA_QUAIaYEAQD4BQAhwwQBAPwFACEHEgAA_wUAIEAAAM0GACBBAADNBgAg4QMAAADDBALiAwAAAMMECOMDAAAAwwQI6AMAAMwGwwQiBxIAAP8FACBAAADNBgAgQQAAzQYAIOEDAAAAwwQC4gMAAADDBAjjAwAAAMMECOgDAADMBsMEIgThAwAAAMMEAuIDAAAAwwQI4wMAAADDBAjoAwAAzQbDBCIP1gMAAM4GADDXAwAAgwQAENgDAADOBgAw2QMBAPgFACHgA0AA_QUAIfgDAADPBsUEIv0DQAD9BQAhqQQBAPgFACGqBAEA-gUAIa4EAADFBq4EIrAEAQD6BQAhxQQAAPsFACDGBAIAiwYAIccEQAD9BQAhyARAAP0FACEHEgAA_wUAIEAAANEGACBBAADRBgAg4QMAAADFBALiAwAAAMUECOMDAAAAxQQI6AMAANAGxQQiBxIAAP8FACBAAADRBgAgQQAA0QYAIOEDAAAAxQQC4gMAAADFBAjjAwAAAMUECOgDAADQBsUEIgThAwAAAMUEAuIDAAAAxQQI4wMAAADFBAjoAwAA0QbFBCIJ1gMAANIGADDXAwAA7QMAENgDAADSBgAw2QMBAPgFACHJBAEA-AUAIcoEAgCLBgAhywQBAPkFACHMBAEA-QUAIc0EAQD5BQAhB9YDAADTBgAw1wMAANEDABDYAwAA0wYAMNkDAQD4BQAhygQCAIsGACHOBAEA-AUAIc8EAgCLBgAhDNYDAADUBgAw1wMAALsDABDYAwAA1AYAMNkDAQD4BQAh4ANAAP0FACH9A0AA_QUAIc0EAQD4BQAh0AQBAPoFACHRBAEA-gUAIdIEAgCLBgAh0wQCANUGACHUBCAA1gYAIQ0SAACCBgAgQAAAggYAIEEAAIIGACBSAADaBgAgUwAAggYAIOEDAgAAAAHiAwIAAAAF4wMCAAAABeQDAgAAAAHlAwIAAAAB5gMCAAAAAecDAgAAAAHoAwIA2QYAIQUSAAD_BQAgQAAA2AYAIEEAANgGACDhAyAAAAAB6AMgANcGACEFEgAA_wUAIEAAANgGACBBAADYBgAg4QMgAAAAAegDIADXBgAhAuEDIAAAAAHoAyAA2AYAIQ0SAACCBgAgQAAAggYAIEEAAIIGACBSAADaBgAgUwAAggYAIOEDAgAAAAHiAwIAAAAF4wMCAAAABeQDAgAAAAHlAwIAAAAB5gMCAAAAAecDAgAAAAHoAwIA2QYAIQjhAwgAAAAB4gMIAAAABeMDCAAAAAXkAwgAAAAB5QMIAAAAAeYDCAAAAAHnAwgAAAAB6AMIANoGACEO1gMAANsGADDXAwAApQMAENgDAADbBgAw2QMBAPgFACHgA0AA_QUAIf0DQAD9BQAhzAQBAPgFACHVBAEA-QUAIdYEAQD4BQAh1wQBAPkFACHYBAEA-QUAIdkEQAD9BQAh2gRAAP0FACHbBAEA_AUAIQjWAwAA3AYAMNcDAACJAwAQ2AMAANwGADDZAwEA-AUAIdUEAQD4BQAh3AQCAIsGACHdBAEA-gUAId4EAQD6BQAhCNYDAADdBgAw1wMAAPMCABDYAwAA3QYAMNkDAQD4BQAh4ANAAP0FACHKBAIAiwYAIcsEAQD4BQAh1QQBAPgFACER1gMAAN4GADDXAwAA3QIAENgDAADeBgAw2QMBAPgFACHgA0AA_QUAIf0DQAD9BQAhygQCAIsGACHMBAEA-AUAIdAEAQD6BQAh4AQAAN8G4AQi4QQCAIsGACHiBAIA1QYAIeMEAQD6BQAh5ARAAP0FACHlBEAA_QUAIeYEQACNBgAh5wRAAI0GACEHEgAA_wUAIEAAAOEGACBBAADhBgAg4QMAAADgBALiAwAAAOAECOMDAAAA4AQI6AMAAOAG4AQiBxIAAP8FACBAAADhBgAgQQAA4QYAIOEDAAAA4AQC4gMAAADgBAjjAwAAAOAECOgDAADgBuAEIgThAwAAAOAEAuIDAAAA4AQI4wMAAADgBAjoAwAA4QbgBCIL1gMAAOIGADDXAwAAxwIAENgDAADiBgAw2QMBAPgFACHgA0AA_QUAIf0DQAD9BQAhzQQBAPgFACHQBAEA-gUAIdEEAQD6BQAh1AQgANYGACHoBAEA-gUAIRTWAwAA4wYAMNcDAACxAgAQ2AMAAOMGADDZAwEA-AUAIeADQAD9BQAh_QNAAP0FACGaBAEA_AUAIc0EAQD4BQAh0AQBAPoFACHRBAEA-gUAIdQEIADWBgAh6QQBAPgFACHqBAEA_AUAIesEAQD6BQAh7AQBAPoFACHtBAEA_AUAIe4EIADWBgAh7wQgANYGACHwBAIA1QYAIfEEAAD7BQAgCNYDAADkBgAw1wMAAJsCABDYAwAA5AYAMNkDAQD4BQAh4ANAAP0FACHLBAEA-AUAIc0EAQD4BQAh8wQAAOUG8wQiBxIAAP8FACBAAADnBgAgQQAA5wYAIOEDAAAA8wQC4gMAAADzBAjjAwAAAPMECOgDAADmBvMEIgcSAAD_BQAgQAAA5wYAIEEAAOcGACDhAwAAAPMEAuIDAAAA8wQI4wMAAADzBAjoAwAA5gbzBCIE4QMAAADzBALiAwAAAPMECOMDAAAA8wQI6AMAAOcG8wQiENYDAADoBgAw1wMAAIUCABDYAwAA6AYAMNkDAQD4BQAh4ANAAP0FACH9A0AA_QUAIZoEAQD8BQAh0AQBAPoFACHRBAEA-gUAIdQEIADWBgAh6AQBAPoFACHqBAEA_AUAIfQEIADWBgAh9QQgANYGACH2BAIAiwYAIfcEAQD6BQAhFQYAAOsGACAUAADvBgAgJAAA7AYAICYAAO0GACAnAADuBgAg1gMAAOkGADDXAwAAOwAQ2AMAAOkGADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACGaBAEAmwYAIdAEAQCYBgAh0QQBAJgGACHUBCAA6gYAIegEAQCYBgAh6gQBAJsGACH0BCAA6gYAIfUEIADqBgAh9gQCAJoGACH3BAEAmAYAIQLhAyAAAAAB6AMgANgGACED-AQAAAsAIPkEAAALACD6BAAACwAgA_gEAAAQACD5BAAAEAAg-gQAABAAIAP4BAAAHgAg-QQAAB4AIPoEAAAeACAD-AQAAHAAIPkEAABwACD6BAAAcAAgA_gEAAAYACD5BAAAGAAg-gQAABgAIAbWAwAA8AYAMNcDAADtAQAQ2AMAAPAGADD7BAEA-gUAIfwEAQD6BQAh_QRAAP0FACEG1gMAAPEGADDXAwAA2gEAENgDAADxBgAw-wQBAJgGACH8BAEAmAYAIf0EQACeBgAhAvsEAQAAAAH8BAEAAAABB9YDAADzBgAw1wMAANQBABDYAwAA8wYAMNkDAQD4BQAhywQBAPgFACH9BEAA_QUAIf8EAQD6BQAhD9YDAAD0BgAw1wMAAL4BABDYAwAA9AYAMNkDAQD4BQAhoQQBAPoFACHLBAEA-AUAIYAFAQD6BQAhgQUBAPoFACGCBQEA_AUAIYMFAQD8BQAhhAUCANUGACGFBQEA_AUAIYYFAQD8BQAhhwUBAPwFACGIBQEA_AUAIQ3WAwAA9QYAMNcDAACoAQAQ2AMAAPUGADDZAwEA-AUAIeADQAD9BQAh_QNAAP0FACGGBAEA_AUAIdAEAQD6BQAh1AQgANYGACHoBAEA-gUAIfMEAAD2BosFIokFAQD6BQAhiwUAAPsFACAHEgAA_wUAIEAAAPgGACBBAAD4BgAg4QMAAACLBQLiAwAAAIsFCOMDAAAAiwUI6AMAAPcGiwUiBxIAAP8FACBAAAD4BgAgQQAA-AYAIOEDAAAAiwUC4gMAAACLBQjjAwAAAIsFCOgDAAD3BosFIgThAwAAAIsFAuIDAAAAiwUI4wMAAACLBQjoAwAA-AaLBSIMHgAA-wYAINYDAAD5BgAw1wMAAIMBABDYAwAA-QYAMNkDAQCXBgAh2gMBAPoGACHbAwEAmAYAIdwDAQCYBgAh3QMBAJgGACHeAwAApQYAIN8DAQCbBgAh4ANAAJ4GACEI4QMBAAAAAeIDAQAAAAXjAwEAAAAF5AMBAAAAAeUDAQAAAAHmAwEAAAAB5wMBAAAAAegDAQD8BgAhHAQAALMHACAFAAC0BwAgBgAA6wYAIBQAAO8GACAfAACfBwAgIQAAoAcAICIAAKEHACAoAACvBwAgKQAAhQcAICoAAIUHACArAACFBwAgLAAAtQcAIC0AALYHACDWAwAAsQcAMNcDAAAcABDYAwAAsQcAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIYYEAQCbBgAh0AQBAJgGACHUBCAA6gYAIegEAQCYBgAh8wQAALIHiwUiiQUBAJgGACGLBQAApQYAIJgFAAAcACCZBQAAHAAgCOEDAQAAAAHiAwEAAAAF4wMBAAAABeQDAQAAAAHlAwEAAAAB5gMBAAAAAecDAQAAAAHoAwEA_AYAIQLNBAEAAAAB0QQBAAAAAQ8HAACABwAgIwAAgQcAICQAAOwGACDWAwAA_gYAMNcDAABwABDYAwAA_gYAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIc0EAQCXBgAh0AQBAJgGACHRBAEAmAYAIdIEAgCaBgAh0wQCAP8GACHUBCAA6gYAIQjhAwIAAAAB4gMCAAAABeMDAgAAAAXkAwIAAAAB5QMCAAAAAeYDAgAAAAHnAwIAAAAB6AMCAIIGACEXBgAA6wYAIBQAAO8GACAkAADsBgAgJgAA7QYAICcAAO4GACDWAwAA6QYAMNcDAAA7ABDYAwAA6QYAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIZoEAQCbBgAh0AQBAJgGACHRBAEAmAYAIdQEIADqBgAh6AQBAJgGACHqBAEAmwYAIfQEIADqBgAh9QQgAOoGACH2BAIAmgYAIfcEAQCYBgAhmAUAADsAIJkFAAA7ACAD-AQAABQAIPkEAAAUACD6BAAAFAAgAs0EAQAAAAHRBAEAAAABDwcAAIAHACARAACFBwAgEwAAhAcAIBQAAO8GACDWAwAAgwcAMNcDAAAeABDYAwAAgwcAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIc0EAQCXBgAh0AQBAJgGACHRBAEAmAYAIdQEIADqBgAh6AQBAJgGACED-AQAACAAIPkEAAAgACD6BAAAIAAgA_gEAAAsACD5BAAALAAg-gQAACwAIAKpBAEAAAABqgQBAAAAARIWAACKBwAgGwAAiwcAIBwAAIwHACDWAwAAhwcAMNcDAABmABDYAwAAhwcAMNkDAQCXBgAh4ANAAJ4GACH4AwAAiAfFBCL9A0AAngYAIakEAQCXBgAhqgQBAJgGACGuBAAAiQeuBCKwBAEAmAYAIcUEAAClBgAgxgQCAJoGACHHBEAAngYAIcgEQACeBgAhBOEDAAAAxQQC4gMAAADFBAjjAwAAAMUECOgDAADRBsUEIgThAwAAAK4EAuIDAAAArgQI4wMAAACuBAjoAwAAxwauBCIaBwAAgAcAIBwAALUHACAdAADBBwAgJQAAvgcAINYDAADABwAw1wMAABAAENgDAADABwAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhmgQBAJsGACHNBAEAlwYAIdAEAQCYBgAh0QQBAJgGACHUBCAA6gYAIekEAQCXBgAh6gQBAJsGACHrBAEAmAYAIewEAQCYBgAh7QQBAJsGACHuBCAA6gYAIe8EIADqBgAh8AQCAP8GACHxBAAApQYAIJgFAAAQACCZBQAAEAAgA_gEAABHACD5BAAARwAg-gQAAEcAIAP4BAAAQwAg-QQAAEMAIPoEAABDACACkQQBAAAAAZIEAQAAAAEPGQAAkAcAICAAAPsGACDWAwAAjgcAMNcDAABYABDYAwAAjgcAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIYwEAQCXBgAhjQQBAPoGACGPBAAAjwePBCKQBAEAmAYAIZEEAQCYBgAhkgQBAJgGACGTBAIAmgYAIQThAwAAAI8EAuIDAAAAjwQI4wMAAACPBAjoAwAAswaPBCInFgAAigcAIBcAAPsGACAYAACeBwAgHQAAjAcAIB8AAJ8HACAhAACgBwAgIgAAoQcAINYDAACcBwAw1wMAAD0AENgDAACcBwAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhqAQCAJoGACGpBAEAlwYAIaoEAQCYBgAhrAQAAJ0HrAQirgQAAIkHrgQirwQBAJgGACGwBAEAmAYAIbEEAQCbBgAhsgQBAPoGACGzBAEA-gYAIbQEAgCaBgAhtQQCAJoGACG2BEAAnQYAIbcEAgCaBgAhuARAAJ0GACG5BAIAmgYAIboEQACdBgAhuwRAAJ0GACG8BAEAmwYAIb0EAQCbBgAhvgRAAJ4GACG_BEAAnQYAIcAEQACdBgAhwQQCAJoGACGYBQAAPQAgmQUAAD0AIBcZAACQBwAgIAAA-wYAINYDAACRBwAw1wMAAFMAENgDAACRBwAw2QMBAJcGACHgA0AAngYAIfgDAACTB5gEIv0DQACeBgAh_gMBAJgGACGJBAEAmwYAIYwEAQCXBgAhjQQBAPoGACGVBAAAkgeVBCKWBAEAmAYAIZgEAgCaBgAhmQQBAJsGACGaBAEAmwYAIZsEAQCbBgAhnAQBAJsGACGdBEAAngYAIZ4EQACdBgAhnwRAAJ0GACEE4QMAAACVBALiAwAAAJUECOMDAAAAlQQI6AMAALoGlQQiBOEDAAAAmAQC4gMAAACYBAjjAwAAAJgECOgDAAC4BpgEIg8ZAACQBwAgHgAA-wYAINYDAACUBwAw1wMAAE4AENgDAACUBwAw2QMBAJcGACHaAwEA-gYAIeADQACeBgAh_gMBAJsGACGGBAEAmwYAIYwEAQCXBgAhoQQAAJUHoQQiowQAAJYHowQipAQBAJgGACGlBAAApQYAIAThAwAAAKEEAuIDAAAAoQQI4wMAAAChBAjoAwAAwQahBCIE4QMAAACjBALiAwAAAKMECOMDAAAAowQI6AMAAL8GowQiCxoAAJkHACDWAwAAlwcAMNcDAABHABDYAwAAlwcAMNkDAQCXBgAh2wMAAJgHwwQi3wMBAJsGACH_AwAApQYAIIoEQACeBgAhpgQBAJcGACHDBAEAmwYAIQThAwAAAMMEAuIDAAAAwwQI4wMAAADDBAjoAwAAzQbDBCIUFgAAigcAIBsAAIsHACAcAACMBwAg1gMAAIcHADDXAwAAZgAQ2AMAAIcHADDZAwEAlwYAIeADQACeBgAh-AMAAIgHxQQi_QNAAJ4GACGpBAEAlwYAIaoEAQCYBgAhrgQAAIkHrgQisAQBAJgGACHFBAAApQYAIMYEAgCaBgAhxwRAAJ4GACHIBEAAngYAIZgFAABmACCZBQAAZgAgAowEAQAAAAGmBAEAAAABCBkAAJAHACAaAACZBwAg1gMAAJsHADDXAwAAQwAQ2AMAAJsHADCMBAEAlwYAIaYEAQCXBgAhpwRAAJ4GACElFgAAigcAIBcAAPsGACAYAACeBwAgHQAAjAcAIB8AAJ8HACAhAACgBwAgIgAAoQcAINYDAACcBwAw1wMAAD0AENgDAACcBwAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhqAQCAJoGACGpBAEAlwYAIaoEAQCYBgAhrAQAAJ0HrAQirgQAAIkHrgQirwQBAJgGACGwBAEAmAYAIbEEAQCbBgAhsgQBAPoGACGzBAEA-gYAIbQEAgCaBgAhtQQCAJoGACG2BEAAnQYAIbcEAgCaBgAhuARAAJ0GACG5BAIAmgYAIboEQACdBgAhuwRAAJ0GACG8BAEAmwYAIb0EAQCbBgAhvgRAAJ4GACG_BEAAnQYAIcAEQACdBgAhwQQCAJoGACEE4QMAAACsBALiAwAAAKwECOMDAAAArAQI6AMAAMkGrAQiDAgAAL4HACAVAADvBgAgHAAAtQcAINYDAAC9BwAw1wMAABQAENgDAAC9BwAw2QMBAJcGACHKBAIAmgYAIc4EAQCXBgAhzwQCAJoGACGYBQAAFAAgmQUAABQAIAP4BAAATgAg-QQAAE4AIPoEAABOACAD-AQAAFMAIPkEAABTACD6BAAAUwAgA_gEAABYACD5BAAAWAAg-gQAAFgAIBMKAACjBwAgCwAApAcAIA4AAKUHACAPAAD7BgAgEAAA-wYAINYDAACiBwAw1wMAACwAENgDAACiBwAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhzAQBAJcGACHVBAEA-gYAIdYEAQCXBgAh1wQBAPoGACHYBAEA-gYAIdkEQACeBgAh2gRAAJ4GACHbBAEAmwYAIREHAACABwAgEQAAhQcAIBMAAIQHACAUAADvBgAg1gMAAIMHADDXAwAAHgAQ2AMAAIMHADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACHNBAEAlwYAIdAEAQCYBgAh0QQBAJgGACHUBCAA6gYAIegEAQCYBgAhmAUAAB4AIJkFAAAeACAXCgAAowcAIAwAAK8HACANAACwBwAgEQAAhQcAINYDAACtBwAw1wMAACAAENgDAACtBwAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhygQCAJoGACHMBAEAlwYAIdAEAQCYBgAh4AQAAK4H4AQi4QQCAJoGACHiBAIA_wYAIeMEAQCYBgAh5ARAAJ4GACHlBEAAngYAIeYEQACdBgAh5wRAAJ0GACGYBQAAIAAgmQUAACAAIBwEAACzBwAgBQAAtAcAIAYAAOsGACAUAADvBgAgHwAAnwcAICEAAKAHACAiAAChBwAgKAAArwcAICkAAIUHACAqAACFBwAgKwAAhQcAICwAALUHACAtAAC2BwAg1gMAALEHADDXAwAAHAAQ2AMAALEHADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACGGBAEAmwYAIdAEAQCYBgAh1AQgAOoGACHoBAEAmAYAIfMEAACyB4sFIokFAQCYBgAhiwUAAKUGACCYBQAAHAAgmQUAABwAIATVBAEAAAAB3AQCAAAAAd0EAQAAAAHeBAEAAAABCQsAAKgHACDWAwAApwcAMNcDAAAoABDYAwAApwcAMNkDAQCXBgAh1QQBAJcGACHcBAIAmgYAId0EAQCYBgAh3gQBAJgGACEXCgAAowcAIAwAAK8HACANAACwBwAgEQAAhQcAINYDAACtBwAw1wMAACAAENgDAACtBwAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhygQCAJoGACHMBAEAlwYAIdAEAQCYBgAh4AQAAK4H4AQi4QQCAJoGACHiBAIA_wYAIeMEAQCYBgAh5ARAAJ4GACHlBEAAngYAIeYEQACdBgAh5wRAAJ0GACGYBQAAIAAgmQUAACAAIALKBAIAAAAB1QQBAAAAAQLLBAEAAAAB1QQBAAAAAQoDAAClBwAgCwAAqAcAINYDAACrBwAw1wMAACQAENgDAACrBwAw2QMBAJcGACHgA0AAngYAIcoEAgCaBgAhywQBAJcGACHVBAEAlwYAIQLKBAIAAAABzAQBAAAAARUKAACjBwAgDAAArwcAIA0AALAHACARAACFBwAg1gMAAK0HADDXAwAAIAAQ2AMAAK0HADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACHKBAIAmgYAIcwEAQCXBgAh0AQBAJgGACHgBAAArgfgBCLhBAIAmgYAIeIEAgD_BgAh4wQBAJgGACHkBEAAngYAIeUEQACeBgAh5gRAAJ0GACHnBEAAnQYAIQThAwAAAOAEAuIDAAAA4AQI4wMAAADgBAjoAwAA4QbgBCID-AQAACQAIPkEAAAkACD6BAAAJAAgA_gEAAAoACD5BAAAKAAg-gQAACgAIBoEAACzBwAgBQAAtAcAIAYAAOsGACAUAADvBgAgHwAAnwcAICEAAKAHACAiAAChBwAgKAAArwcAICkAAIUHACAqAACFBwAgKwAAhQcAICwAALUHACAtAAC2BwAg1gMAALEHADDXAwAAHAAQ2AMAALEHADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACGGBAEAmwYAIdAEAQCYBgAh1AQgAOoGACHoBAEAmAYAIfMEAACyB4sFIokFAQCYBgAhiwUAAKUGACAE4QMAAACLBQLiAwAAAIsFCOMDAAAAiwUI6AMAAPgGiwUiA_gEAAADACD5BAAAAwAg-gQAAAMAIAP4BAAABwAg-QQAAAcAIPoEAAAHACAD-AQAAD0AIPkEAAA9ACD6BAAAPQAgA_gEAACDAQAg-QQAAIMBACD6BAAAgwEAIALJBAEAAAABygQCAAAAAQ0DAAD7BgAgBwAAuwcAIAkAALkHACAKAAC6BwAg1gMAALgHADDXAwAAGAAQ2AMAALgHADDZAwEAlwYAIckEAQCXBgAhygQCAJoGACHLBAEA-gYAIcwEAQD6BgAhzQQBAPoGACEMCAAAvgcAIBUAAO8GACAcAAC1BwAg1gMAAL0HADDXAwAAFAAQ2AMAAL0HADDZAwEAlwYAIcoEAgCaBgAhzgQBAJcGACHPBAIAmgYAIZgFAAAUACCZBQAAFAAgEQcAAIAHACARAACFBwAgEwAAhAcAIBQAAO8GACDWAwAAgwcAMNcDAAAeABDYAwAAgwcAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIc0EAQCXBgAh0AQBAJgGACHRBAEAmAYAIdQEIADqBgAh6AQBAJgGACGYBQAAHgAgmQUAAB4AIBcGAADrBgAgFAAA7wYAICQAAOwGACAmAADtBgAgJwAA7gYAINYDAADpBgAw1wMAADsAENgDAADpBgAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhmgQBAJsGACHQBAEAmAYAIdEEAQCYBgAh1AQgAOoGACHoBAEAmAYAIeoEAQCbBgAh9AQgAOoGACH1BCAA6gYAIfYEAgCaBgAh9wQBAJgGACGYBQAAOwAgmQUAADsAIALKBAIAAAABzgQBAAAAAQoIAAC-BwAgFQAA7wYAIBwAALUHACDWAwAAvQcAMNcDAAAUABDYAwAAvQcAMNkDAQCXBgAhygQCAJoGACHOBAEAlwYAIc8EAgCaBgAhEQcAAIAHACAjAACBBwAgJAAA7AYAINYDAAD-BgAw1wMAAHAAENgDAAD-BgAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhzQQBAJcGACHQBAEAmAYAIdEEAQCYBgAh0gQCAJoGACHTBAIA_wYAIdQEIADqBgAhmAUAAHAAIJkFAABwACACzQQBAAAAAdEEAQAAAAEYBwAAgAcAIBwAALUHACAdAADBBwAgJQAAvgcAINYDAADABwAw1wMAABAAENgDAADABwAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhmgQBAJsGACHNBAEAlwYAIdAEAQCYBgAh0QQBAJgGACHUBCAA6gYAIekEAQCXBgAh6gQBAJsGACHrBAEAmAYAIewEAQCYBgAh7QQBAJsGACHuBCAA6gYAIe8EIADqBgAh8AQCAP8GACHxBAAApQYAIAP4BAAAZgAg-QQAAGYAIPoEAABmACACywQBAAAAAc0EAQAAAAEKAwAApQcAIAcAAIAHACDWAwAAwwcAMNcDAAALABDYAwAAwwcAMNkDAQCXBgAh4ANAAJ4GACHLBAEAlwYAIc0EAQCXBgAh8wQAAMQH8wQiBOEDAAAA8wQC4gMAAADzBAjjAwAAAPMECOgDAADnBvMEIggDAAClBwAg1gMAAMUHADDXAwAABwAQ2AMAAMUHADDZAwEAlwYAIcsEAQCXBgAh_QRAAJ4GACH_BAEAmAYAIQKABQEAAAABgQUBAAAAARADAAClBwAg1gMAAMcHADDXAwAAAwAQ2AMAAMcHADDZAwEAlwYAIaEEAQCYBgAhywQBAJcGACGABQEAmAYAIYEFAQCYBgAhggUBAJsGACGDBQEAmwYAIYQFAgD_BgAhhQUBAJsGACGGBQEAmwYAIYcFAQCbBgAhiAUBAJsGACEAAAAAAZ0FAQAAAAEBnQUBAAAAAQGdBUAAAAABBzoAAMwOACA7AADPDgAgmgUAAM0OACCbBQAAzg4AIJ4FAAAcACCfBQAAHAAgoAUAAAEAIAM6AADMDgAgmgUAAM0OACCgBQAAAQAgAAAAAAABnQUAAAD0AwIFnQUCAAAAAaMFAgAAAAGkBQIAAAABpQUCAAAAAaYFAgAAAAEBnQUAAAD4AwIBnQVAAAAAAQAAAAAAAZ0FAAAAgQQCAAAAAZ0FAAAAiAQCAAAAAAABnQUAAACPBAIFOgAAxA4AIDsAAMoOACCaBQAAxQ4AIJsFAADJDgAgoAUAAD8AIAc6AADCDgAgOwAAxw4AIJoFAADDDgAgmwUAAMYOACCeBQAAHAAgnwUAABwAIKAFAAABACADOgAAxA4AIJoFAADFDgAgoAUAAD8AIAM6AADCDgAgmgUAAMMOACCgBQAAAQAgAAAAAAABnQUAAACVBAIBnQUAAACYBAIFOgAAug4AIDsAAMAOACCaBQAAuw4AIJsFAAC_DgAgoAUAAD8AIAc6AAC4DgAgOwAAvQ4AIJoFAAC5DgAgmwUAALwOACCeBQAAHAAgnwUAABwAIKAFAAABACADOgAAug4AIJoFAAC7DgAgoAUAAD8AIAM6AAC4DgAgmgUAALkOACCgBQAAAQAgAAAAAZ0FAAAAoQQCAZ0FAAAAowQCBToAALAOACA7AAC2DgAgmgUAALEOACCbBQAAtQ4AIKAFAAA_ACAHOgAArg4AIDsAALMOACCaBQAArw4AIJsFAACyDgAgngUAABwAIJ8FAAAcACCgBQAAAQAgAzoAALAOACCaBQAAsQ4AIKAFAAA_ACADOgAArg4AIJoFAACvDgAgoAUAAAEAIAAAAAU6AACmDgAgOwAArA4AIJoFAACnDgAgmwUAAKsOACCgBQAAPwAgBToAAKQOACA7AACpDgAgmgUAAKUOACCbBQAAqA4AIKAFAABoACADOgAApg4AIJoFAACnDgAgoAUAAD8AIAM6AACkDgAgmgUAAKUOACCgBQAAaAAgAAAAAAABnQUAAACsBAIBnQUAAACuBAIFOgAAlQ4AIDsAAKIOACCaBQAAlg4AIJsFAAChDgAgoAUAABIAIAc6AACTDgAgOwAAnw4AIJoFAACUDgAgmwUAAJ4OACCeBQAAHAAgnwUAABwAIKAFAAABACAHOgAAkQ4AIDsAAJwOACCaBQAAkg4AIJsFAACbDgAgngUAABQAIJ8FAAAUACCgBQAAFgAgCzoAALsIADA7AADACAAwmgUAALwIADCbBQAAvQgAMJwFAAC-CAAgnQUAAL8IADCeBQAAvwgAMJ8FAAC_CAAwoAUAAL8IADChBQAAwQgAMKIFAADCCAAwCzoAAK8IADA7AAC0CAAwmgUAALAIADCbBQAAsQgAMJwFAACyCAAgnQUAALMIADCeBQAAswgAMJ8FAACzCAAwoAUAALMIADChBQAAtQgAMKIFAAC2CAAwCzoAAKMIADA7AACoCAAwmgUAAKQIADCbBQAApQgAMJwFAACmCAAgnQUAAKcIADCeBQAApwgAMJ8FAACnCAAwoAUAAKcIADChBQAAqQgAMKIFAACqCAAwCzoAAJcIADA7AACcCAAwmgUAAJgIADCbBQAAmQgAMJwFAACaCAAgnQUAAJsIADCeBQAAmwgAMJ8FAACbCAAwoAUAAJsIADChBQAAnQgAMKIFAACeCAAwCiAAAO0HACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGNBAEAAAABjwQAAACPBAKQBAEAAAABkQQBAAAAAZIEAQAAAAGTBAIAAAABAgAAAFoAIDoAAKIIACADAAAAWgAgOgAAoggAIDsAAKEIACABMwAAmg4AMBAZAACQBwAgIAAA-wYAINYDAACOBwAw1wMAAFgAENgDAACOBwAw2QMBAAAAAeADQACeBgAh_QNAAJ4GACGMBAEAlwYAIY0EAQD6BgAhjwQAAI8HjwQikAQBAAAAAZEEAQCYBgAhkgQBAJgGACGTBAIAmgYAIY4FAACNBwAgAgAAAFoAIDMAAKEIACACAAAAnwgAIDMAAKAIACAN1gMAAJ4IADDXAwAAnwgAENgDAACeCAAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhjAQBAJcGACGNBAEA-gYAIY8EAACPB48EIpAEAQCYBgAhkQQBAJgGACGSBAEAmAYAIZMEAgCaBgAhDdYDAACeCAAw1wMAAJ8IABDYAwAAnggAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIYwEAQCXBgAhjQQBAPoGACGPBAAAjwePBCKQBAEAmAYAIZEEAQCYBgAhkgQBAJgGACGTBAIAmgYAIQnZAwEAzAcAIeADQADOBwAh_QNAAM4HACGNBAEAzQcAIY8EAADpB48EIpAEAQDMBwAhkQQBAMwHACGSBAEAzAcAIZMEAgDXBwAhCiAAAOsHACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGNBAEAzQcAIY8EAADpB48EIpAEAQDMBwAhkQQBAMwHACGSBAEAzAcAIZMEAgDXBwAhCiAAAO0HACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGNBAEAAAABjwQAAACPBAKQBAEAAAABkQQBAAAAAZIEAQAAAAGTBAIAAAABEiAAAPgHACDZAwEAAAAB4ANAAAAAAfgDAAAAmAQC_QNAAAAAAf4DAQAAAAGJBAEAAAABjQQBAAAAAZUEAAAAlQQClgQBAAAAAZgEAgAAAAGZBAEAAAABmgQBAAAAAZsEAQAAAAGcBAEAAAABnQRAAAAAAZ4EQAAAAAGfBEAAAAABAgAAAFUAIDoAAK4IACADAAAAVQAgOgAArggAIDsAAK0IACABMwAAmQ4AMBcZAACQBwAgIAAA-wYAINYDAACRBwAw1wMAAFMAENgDAACRBwAw2QMBAAAAAeADQACeBgAh-AMAAJMHmAQi_QNAAJ4GACH-AwEAAAABiQQBAJsGACGMBAEAlwYAIY0EAQD6BgAhlQQAAJIHlQQilgQBAJgGACGYBAIAmgYAIZkEAQCbBgAhmgQBAJsGACGbBAEAmwYAIZwEAQCbBgAhnQRAAJ4GACGeBEAAnQYAIZ8EQACdBgAhAgAAAFUAIDMAAK0IACACAAAAqwgAIDMAAKwIACAV1gMAAKoIADDXAwAAqwgAENgDAACqCAAw2QMBAJcGACHgA0AAngYAIfgDAACTB5gEIv0DQACeBgAh_gMBAJgGACGJBAEAmwYAIYwEAQCXBgAhjQQBAPoGACGVBAAAkgeVBCKWBAEAmAYAIZgEAgCaBgAhmQQBAJsGACGaBAEAmwYAIZsEAQCbBgAhnAQBAJsGACGdBEAAngYAIZ4EQACdBgAhnwRAAJ0GACEV1gMAAKoIADDXAwAAqwgAENgDAACqCAAw2QMBAJcGACHgA0AAngYAIfgDAACTB5gEIv0DQACeBgAh_gMBAJgGACGJBAEAmwYAIYwEAQCXBgAhjQQBAPoGACGVBAAAkgeVBCKWBAEAmAYAIZgEAgCaBgAhmQQBAJsGACGaBAEAmwYAIZsEAQCbBgAhnAQBAJsGACGdBEAAngYAIZ4EQACdBgAhnwRAAJ0GACER2QMBAMwHACHgA0AAzgcAIfgDAAD0B5gEIv0DQADOBwAh_gMBAMwHACGJBAEAzQcAIY0EAQDNBwAhlQQAAPMHlQQilgQBAMwHACGYBAIA1wcAIZkEAQDNBwAhmgQBAM0HACGbBAEAzQcAIZwEAQDNBwAhnQRAAM4HACGeBEAA2QcAIZ8EQADZBwAhEiAAAPYHACDZAwEAzAcAIeADQADOBwAh-AMAAPQHmAQi_QNAAM4HACH-AwEAzAcAIYkEAQDNBwAhjQQBAM0HACGVBAAA8weVBCKWBAEAzAcAIZgEAgDXBwAhmQQBAM0HACGaBAEAzQcAIZsEAQDNBwAhnAQBAM0HACGdBEAAzgcAIZ4EQADZBwAhnwRAANkHACESIAAA-AcAINkDAQAAAAHgA0AAAAAB-AMAAACYBAL9A0AAAAAB_gMBAAAAAYkEAQAAAAGNBAEAAAABlQQAAACVBAKWBAEAAAABmAQCAAAAAZkEAQAAAAGaBAEAAAABmwQBAAAAAZwEAQAAAAGdBEAAAAABngRAAAAAAZ8EQAAAAAEKHgAAgQgAINkDAQAAAAHaAwEAAAAB4ANAAAAAAf4DAQAAAAGGBAEAAAABoQQAAAChBAKjBAAAAKMEAqQEAQAAAAGlBIAAAAABAgAAAFAAIDoAALoIACADAAAAUAAgOgAAuggAIDsAALkIACABMwAAmA4AMA8ZAACQBwAgHgAA-wYAINYDAACUBwAw1wMAAE4AENgDAACUBwAw2QMBAAAAAdoDAQD6BgAh4ANAAJ4GACH-AwEAAAABhgQBAJsGACGMBAEAlwYAIaEEAACVB6EEIqMEAACWB6MEIqQEAQCYBgAhpQQAAKUGACACAAAAUAAgMwAAuQgAIAIAAAC3CAAgMwAAuAgAIA3WAwAAtggAMNcDAAC3CAAQ2AMAALYIADDZAwEAlwYAIdoDAQD6BgAh4ANAAJ4GACH-AwEAmwYAIYYEAQCbBgAhjAQBAJcGACGhBAAAlQehBCKjBAAAlgejBCKkBAEAmAYAIaUEAAClBgAgDdYDAAC2CAAw1wMAALcIABDYAwAAtggAMNkDAQCXBgAh2gMBAPoGACHgA0AAngYAIf4DAQCbBgAhhgQBAJsGACGMBAEAlwYAIaEEAACVB6EEIqMEAACWB6MEIqQEAQCYBgAhpQQAAKUGACAJ2QMBAMwHACHaAwEAzQcAIeADQADOBwAh_gMBAM0HACGGBAEAzQcAIaEEAAD8B6EEIqMEAAD9B6MEIqQEAQDMBwAhpQSAAAAAAQoeAAD_BwAg2QMBAMwHACHaAwEAzQcAIeADQADOBwAh_gMBAM0HACGGBAEAzQcAIaEEAAD8B6EEIqMEAAD9B6MEIqQEAQDMBwAhpQSAAAAAAQoeAACBCAAg2QMBAAAAAdoDAQAAAAHgA0AAAAAB_gMBAAAAAYYEAQAAAAGhBAAAAKEEAqMEAAAAowQCpAQBAAAAAaUEgAAAAAEDGgAAiAgAIKYEAQAAAAGnBEAAAAABAgAAAEUAIDoAAMYIACADAAAARQAgOgAAxggAIDsAAMUIACABMwAAlw4AMAkZAACQBwAgGgAAmQcAINYDAACbBwAw1wMAAEMAENgDAACbBwAwjAQBAJcGACGmBAEAlwYAIacEQACeBgAhjwUAAJoHACACAAAARQAgMwAAxQgAIAIAAADDCAAgMwAAxAgAIAbWAwAAwggAMNcDAADDCAAQ2AMAAMIIADCMBAEAlwYAIaYEAQCXBgAhpwRAAJ4GACEG1gMAAMIIADDXAwAAwwgAENgDAADCCAAwjAQBAJcGACGmBAEAlwYAIacEQACeBgAhAqYEAQDMBwAhpwRAAM4HACEDGgAAhggAIKYEAQDMBwAhpwRAAM4HACEDGgAAiAgAIKYEAQAAAAGnBEAAAAABAzoAAJUOACCaBQAAlg4AIKAFAAASACADOgAAkw4AIJoFAACUDgAgoAUAAAEAIAM6AACRDgAgmgUAAJIOACCgBQAAFgAgBDoAALsIADCaBQAAvAgAMJwFAAC-CAAgoAUAAL8IADAEOgAArwgAMJoFAACwCAAwnAUAALIIACCgBQAAswgAMAQ6AACjCAAwmgUAAKQIADCcBQAApggAIKAFAACnCAAwBDoAAJcIADCaBQAAmAgAMJwFAACaCAAgoAUAAJsIADAAAAABnQUAAADDBAIFOgAAjA4AIDsAAI8OACCaBQAAjQ4AIJsFAACODgAgoAUAAGgAIAM6AACMDgAgmgUAAI0OACCgBQAAaAAgAAAAAAABnQUAAADFBAIFOgAAhQ4AIDsAAIoOACCaBQAAhg4AIJsFAACJDgAgoAUAABIAIAs6AADmCAAwOwAA6wgAMJoFAADnCAAwmwUAAOgIADCcBQAA6QgAIJ0FAADqCAAwngUAAOoIADCfBQAA6ggAMKAFAADqCAAwoQUAAOwIADCiBQAA7QgAMAs6AADdCAAwOwAA4QgAMJoFAADeCAAwmwUAAN8IADCcBQAA4AgAIJ0FAAC_CAAwngUAAL8IADCfBQAAvwgAMKAFAAC_CAAwoQUAAOIIADCiBQAAwggAMAMZAACHCAAgjAQBAAAAAacEQAAAAAECAAAARQAgOgAA5QgAIAMAAABFACA6AADlCAAgOwAA5AgAIAEzAACIDgAwAgAAAEUAIDMAAOQIACACAAAAwwgAIDMAAOMIACACjAQBAMwHACGnBEAAzgcAIQMZAACFCAAgjAQBAMwHACGnBEAAzgcAIQMZAACHCAAgjAQBAAAAAacEQAAAAAEG2QMBAAAAAdsDAAAAwwQC3wMBAAAAAf8DgAAAAAGKBEAAAAABwwQBAAAAAQIAAABJACA6AADxCAAgAwAAAEkAIDoAAPEIACA7AADwCAAgATMAAIcOADALGgAAmQcAINYDAACXBwAw1wMAAEcAENgDAACXBwAw2QMBAAAAAdsDAACYB8MEIt8DAQAAAAH_AwAApQYAIIoEQACeBgAhpgQBAJcGACHDBAEAmwYAIQIAAABJACAzAADwCAAgAgAAAO4IACAzAADvCAAgCtYDAADtCAAw1wMAAO4IABDYAwAA7QgAMNkDAQCXBgAh2wMAAJgHwwQi3wMBAJsGACH_AwAApQYAIIoEQACeBgAhpgQBAJcGACHDBAEAmwYAIQrWAwAA7QgAMNcDAADuCAAQ2AMAAO0IADDZAwEAlwYAIdsDAACYB8MEIt8DAQCbBgAh_wMAAKUGACCKBEAAngYAIaYEAQCXBgAhwwQBAJsGACEG2QMBAMwHACHbAwAA0QjDBCLfAwEAzQcAIf8DgAAAAAGKBEAAzgcAIcMEAQDNBwAhBtkDAQDMBwAh2wMAANEIwwQi3wMBAM0HACH_A4AAAAABigRAAM4HACHDBAEAzQcAIQbZAwEAAAAB2wMAAADDBALfAwEAAAAB_wOAAAAAAYoEQAAAAAHDBAEAAAABAzoAAIUOACCaBQAAhg4AIKAFAAASACAEOgAA5ggAMJoFAADnCAAwnAUAAOkIACCgBQAA6ggAMAQ6AADdCAAwmgUAAN4IADCcBQAA4AgAIKAFAAC_CAAwAAAAAAAFOgAA9w0AIDsAAIMOACCaBQAA-A0AIJsFAACCDgAgoAUAABYAIAc6AAD1DQAgOwAAgA4AIJoFAAD2DQAgmwUAAP8NACCeBQAAHAAgnwUAABwAIKAFAAABACAHOgAA8w0AIDsAAP0NACCaBQAA9A0AIJsFAAD8DQAgngUAAB4AIJ8FAAAeACCgBQAAbgAgBzoAAPENACA7AAD6DQAgmgUAAPINACCbBQAA-Q0AIJ4FAAA7ACCfBQAAOwAgoAUAAPABACADOgAA9w0AIJoFAAD4DQAgoAUAABYAIAM6AAD1DQAgmgUAAPYNACCgBQAAAQAgAzoAAPMNACCaBQAA9A0AIKAFAABuACADOgAA8Q0AIJoFAADyDQAgoAUAAPABACAAAAAAAAU6AADqDQAgOwAA7w0AIJoFAADrDQAgmwUAAO4NACCgBQAAcgAgCzoAAJYJADA7AACbCQAwmgUAAJcJADCbBQAAmAkAMJwFAACZCQAgnQUAAJoJADCeBQAAmgkAMJ8FAACaCQAwoAUAAJoJADChBQAAnAkAMKIFAACdCQAwCzoAAIoJADA7AACPCQAwmgUAAIsJADCbBQAAjAkAMJwFAACNCQAgnQUAAI4JADCeBQAAjgkAMJ8FAACOCQAwoAUAAI4JADChBQAAkAkAMKIFAACRCQAwIBYAAMcIACAXAADICAAgHQAAyggAIB8AAMsIACAhAADMCAAgIgAAzQgAINkDAQAAAAHgA0AAAAAB_QNAAAAAAagEAgAAAAGpBAEAAAABqgQBAAAAAawEAAAArAQCrgQAAACuBAKvBAEAAAABsAQBAAAAAbEEAQAAAAGyBAEAAAABtAQCAAAAAbUEAgAAAAG2BEAAAAABtwQCAAAAAbgEQAAAAAG5BAIAAAABugRAAAAAAbsEQAAAAAG8BAEAAAABvQQBAAAAAb4EQAAAAAG_BEAAAAABwARAAAAAAcEEAgAAAAECAAAAPwAgOgAAlQkAIAMAAAA_ACA6AACVCQAgOwAAlAkAIAEzAADtDQAwJRYAAIoHACAXAAD7BgAgGAAAngcAIB0AAIwHACAfAACfBwAgIQAAoAcAICIAAKEHACDWAwAAnAcAMNcDAAA9ABDYAwAAnAcAMNkDAQAAAAHgA0AAngYAIf0DQACeBgAhqAQCAAAAAakEAQCXBgAhqgQBAJgGACGsBAAAnQesBCKuBAAAiQeuBCKvBAEAmAYAIbAEAQCYBgAhsQQBAJsGACGyBAEA-gYAIbMEAQD6BgAhtAQCAJoGACG1BAIAmgYAIbYEQACdBgAhtwQCAJoGACG4BEAAnQYAIbkEAgCaBgAhugRAAJ0GACG7BEAAnQYAIbwEAQCbBgAhvQQBAJsGACG-BEAAngYAIb8EQACdBgAhwARAAJ0GACHBBAIAmgYAIQIAAAA_ACAzAACUCQAgAgAAAJIJACAzAACTCQAgHtYDAACRCQAw1wMAAJIJABDYAwAAkQkAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIagEAgCaBgAhqQQBAJcGACGqBAEAmAYAIawEAACdB6wEIq4EAACJB64EIq8EAQCYBgAhsAQBAJgGACGxBAEAmwYAIbIEAQD6BgAhswQBAPoGACG0BAIAmgYAIbUEAgCaBgAhtgRAAJ0GACG3BAIAmgYAIbgEQACdBgAhuQQCAJoGACG6BEAAnQYAIbsEQACdBgAhvAQBAJsGACG9BAEAmwYAIb4EQACeBgAhvwRAAJ0GACHABEAAnQYAIcEEAgCaBgAhHtYDAACRCQAw1wMAAJIJABDYAwAAkQkAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIagEAgCaBgAhqQQBAJcGACGqBAEAmAYAIawEAACdB6wEIq4EAACJB64EIq8EAQCYBgAhsAQBAJgGACGxBAEAmwYAIbIEAQD6BgAhswQBAPoGACG0BAIAmgYAIbUEAgCaBgAhtgRAAJ0GACG3BAIAmgYAIbgEQACdBgAhuQQCAJoGACG6BEAAnQYAIbsEQACdBgAhvAQBAJsGACG9BAEAmwYAIb4EQACeBgAhvwRAAJ0GACHABEAAnQYAIcEEAgCaBgAhGtkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIagEAgDXBwAhqQQBAMwHACGqBAEAzAcAIawEAACOCKwEIq4EAACPCK4EIq8EAQDMBwAhsAQBAMwHACGxBAEAzQcAIbIEAQDNBwAhtAQCANcHACG1BAIA1wcAIbYEQADZBwAhtwQCANcHACG4BEAA2QcAIbkEAgDXBwAhugRAANkHACG7BEAA2QcAIbwEAQDNBwAhvQQBAM0HACG-BEAAzgcAIb8EQADZBwAhwARAANkHACHBBAIA1wcAISAWAACQCAAgFwAAkQgAIB0AAJMIACAfAACUCAAgIQAAlQgAICIAAJYIACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGoBAIA1wcAIakEAQDMBwAhqgQBAMwHACGsBAAAjgisBCKuBAAAjwiuBCKvBAEAzAcAIbAEAQDMBwAhsQQBAM0HACGyBAEAzQcAIbQEAgDXBwAhtQQCANcHACG2BEAA2QcAIbcEAgDXBwAhuARAANkHACG5BAIA1wcAIboEQADZBwAhuwRAANkHACG8BAEAzQcAIb0EAQDNBwAhvgRAAM4HACG_BEAA2QcAIcAEQADZBwAhwQQCANcHACEgFgAAxwgAIBcAAMgIACAdAADKCAAgHwAAywgAICEAAMwIACAiAADNCAAg2QMBAAAAAeADQAAAAAH9A0AAAAABqAQCAAAAAakEAQAAAAGqBAEAAAABrAQAAACsBAKuBAAAAK4EAq8EAQAAAAGwBAEAAAABsQQBAAAAAbIEAQAAAAG0BAIAAAABtQQCAAAAAbYEQAAAAAG3BAIAAAABuARAAAAAAbkEAgAAAAG6BEAAAAABuwRAAAAAAbwEAQAAAAG9BAEAAAABvgRAAAAAAb8EQAAAAAHABEAAAAABwQQCAAAAAQgDAAD_CAAgBwAAgQkAIAoAAIAJACDZAwEAAAABygQCAAAAAcsEAQAAAAHMBAEAAAABzQQBAAAAAQIAAAAaACA6AAChCQAgAwAAABoAIDoAAKEJACA7AACgCQAgATMAAOwNADAOAwAA-wYAIAcAALsHACAJAAC5BwAgCgAAugcAINYDAAC4BwAw1wMAABgAENgDAAC4BwAw2QMBAAAAAckEAQCXBgAhygQCAJoGACHLBAEA-gYAIcwEAQD6BgAhzQQBAPoGACGUBQAAtwcAIAIAAAAaACAzAACgCQAgAgAAAJ4JACAzAACfCQAgCdYDAACdCQAw1wMAAJ4JABDYAwAAnQkAMNkDAQCXBgAhyQQBAJcGACHKBAIAmgYAIcsEAQD6BgAhzAQBAPoGACHNBAEA-gYAIQnWAwAAnQkAMNcDAACeCQAQ2AMAAJ0JADDZAwEAlwYAIckEAQCXBgAhygQCAJoGACHLBAEA-gYAIcwEAQD6BgAhzQQBAPoGACEF2QMBAMwHACHKBAIA1wcAIcsEAQDNBwAhzAQBAM0HACHNBAEAzQcAIQgDAAD7CAAgBwAA_QgAIAoAAPwIACDZAwEAzAcAIcoEAgDXBwAhywQBAM0HACHMBAEAzQcAIc0EAQDNBwAhCAMAAP8IACAHAACBCQAgCgAAgAkAINkDAQAAAAHKBAIAAAABywQBAAAAAcwEAQAAAAHNBAEAAAABAzoAAOoNACCaBQAA6w0AIKAFAAByACAEOgAAlgkAMJoFAACXCQAwnAUAAJkJACCgBQAAmgkAMAQ6AACKCQAwmgUAAIsJADCcBQAAjQkAIKAFAACOCQAwAAAAAAAFnQUCAAAAAaMFAgAAAAGkBQIAAAABpQUCAAAAAaYFAgAAAAEBnQUgAAAAAQU6AADcDQAgOwAA6A0AIJoFAADdDQAgmwUAAOcNACCgBQAA8AEAIAs6AADWCQAwOwAA2wkAMJoFAADXCQAwmwUAANgJADCcBQAA2QkAIJ0FAADaCQAwngUAANoJADCfBQAA2gkAMKAFAADaCQAwoQUAANwJADCiBQAA3QkAMAs6AACvCQAwOwAAtAkAMJoFAACwCQAwmwUAALEJADCcBQAAsgkAIJ0FAACzCQAwngUAALMJADCfBQAAswkAMKAFAACzCQAwoQUAALUJADCiBQAAtgkAMBMHAADTCQAgHAAA1QkAIB0AANQJACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGaBAEAAAABzQQBAAAAAdAEAQAAAAHRBAEAAAAB1AQgAAAAAeoEAQAAAAHrBAEAAAAB7AQBAAAAAe0EAQAAAAHuBCAAAAAB7wQgAAAAAfAEAgAAAAHxBIAAAAABAgAAABIAIDoAANIJACADAAAAEgAgOgAA0gkAIDsAALkJACABMwAA5g0AMBkHAACABwAgHAAAtQcAIB0AAMEHACAlAAC-BwAg1gMAAMAHADDXAwAAEAAQ2AMAAMAHADDZAwEAAAAB4ANAAJ4GACH9A0AAngYAIZoEAQCbBgAhzQQBAJcGACHQBAEAmAYAIdEEAQCYBgAh1AQgAOoGACHpBAEAlwYAIeoEAQCbBgAh6wQBAAAAAewEAQCYBgAh7QQBAJsGACHuBCAA6gYAIe8EIADqBgAh8AQCAP8GACHxBAAApQYAIIwFAAC_BwAgAgAAABIAIDMAALkJACACAAAAtwkAIDMAALgJACAU1gMAALYJADDXAwAAtwkAENgDAAC2CQAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhmgQBAJsGACHNBAEAlwYAIdAEAQCYBgAh0QQBAJgGACHUBCAA6gYAIekEAQCXBgAh6gQBAJsGACHrBAEAmAYAIewEAQCYBgAh7QQBAJsGACHuBCAA6gYAIe8EIADqBgAh8AQCAP8GACHxBAAApQYAIBTWAwAAtgkAMNcDAAC3CQAQ2AMAALYJADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACGaBAEAmwYAIc0EAQCXBgAh0AQBAJgGACHRBAEAmAYAIdQEIADqBgAh6QQBAJcGACHqBAEAmwYAIesEAQCYBgAh7AQBAJgGACHtBAEAmwYAIe4EIADqBgAh7wQgAOoGACHwBAIA_wYAIfEEAAClBgAgENkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIZoEAQDNBwAhzQQBAMwHACHQBAEAzAcAIdEEAQDMBwAh1AQgAKsJACHqBAEAzQcAIesEAQDMBwAh7AQBAMwHACHtBAEAzQcAIe4EIACrCQAh7wQgAKsJACHwBAIAqgkAIfEEgAAAAAETBwAAugkAIBwAALwJACAdAAC7CQAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhmgQBAM0HACHNBAEAzAcAIdAEAQDMBwAh0QQBAMwHACHUBCAAqwkAIeoEAQDNBwAh6wQBAMwHACHsBAEAzAcAIe0EAQDNBwAh7gQgAKsJACHvBCAAqwkAIfAEAgCqCQAh8QSAAAAAAQU6AADfDQAgOwAA5A0AIJoFAADgDQAgmwUAAOMNACCgBQAA8AEAIAs6AADGCQAwOwAAywkAMJoFAADHCQAwmwUAAMgJADCcBQAAyQkAIJ0FAADKCQAwngUAAMoJADCfBQAAygkAMKAFAADKCQAwoQUAAMwJADCiBQAAzQkAMAs6AAC9CQAwOwAAwQkAMJoFAAC-CQAwmwUAAL8JADCcBQAAwAkAIJ0FAACOCQAwngUAAI4JADCfBQAAjgkAMKAFAACOCQAwoQUAAMIJADCiBQAAkQkAMCAXAADICAAgGAAAyQgAIB0AAMoIACAfAADLCAAgIQAAzAgAICIAAM0IACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGoBAIAAAABqgQBAAAAAawEAAAArAQCrgQAAACuBAKvBAEAAAABsAQBAAAAAbEEAQAAAAGyBAEAAAABswQBAAAAAbQEAgAAAAG1BAIAAAABtgRAAAAAAbcEAgAAAAG4BEAAAAABuQQCAAAAAboEQAAAAAG7BEAAAAABvAQBAAAAAb0EAQAAAAG-BEAAAAABvwRAAAAAAcAEQAAAAAHBBAIAAAABAgAAAD8AIDoAAMUJACADAAAAPwAgOgAAxQkAIDsAAMQJACABMwAA4g0AMAIAAAA_ACAzAADECQAgAgAAAJIJACAzAADDCQAgGtkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIagEAgDXBwAhqgQBAMwHACGsBAAAjgisBCKuBAAAjwiuBCKvBAEAzAcAIbAEAQDMBwAhsQQBAM0HACGyBAEAzQcAIbMEAQDNBwAhtAQCANcHACG1BAIA1wcAIbYEQADZBwAhtwQCANcHACG4BEAA2QcAIbkEAgDXBwAhugRAANkHACG7BEAA2QcAIbwEAQDNBwAhvQQBAM0HACG-BEAAzgcAIb8EQADZBwAhwARAANkHACHBBAIA1wcAISAXAACRCAAgGAAAkggAIB0AAJMIACAfAACUCAAgIQAAlQgAICIAAJYIACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGoBAIA1wcAIaoEAQDMBwAhrAQAAI4IrAQirgQAAI8IrgQirwQBAMwHACGwBAEAzAcAIbEEAQDNBwAhsgQBAM0HACGzBAEAzQcAIbQEAgDXBwAhtQQCANcHACG2BEAA2QcAIbcEAgDXBwAhuARAANkHACG5BAIA1wcAIboEQADZBwAhuwRAANkHACG8BAEAzQcAIb0EAQDNBwAhvgRAAM4HACG_BEAA2QcAIcAEQADZBwAhwQQCANcHACEgFwAAyAgAIBgAAMkIACAdAADKCAAgHwAAywgAICEAAMwIACAiAADNCAAg2QMBAAAAAeADQAAAAAH9A0AAAAABqAQCAAAAAaoEAQAAAAGsBAAAAKwEAq4EAAAArgQCrwQBAAAAAbAEAQAAAAGxBAEAAAABsgQBAAAAAbMEAQAAAAG0BAIAAAABtQQCAAAAAbYEQAAAAAG3BAIAAAABuARAAAAAAbkEAgAAAAG6BEAAAAABuwRAAAAAAbwEAQAAAAG9BAEAAAABvgRAAAAAAb8EQAAAAAHABEAAAAABwQQCAAAAAQ0bAADzCAAgHAAA9AgAINkDAQAAAAHgA0AAAAAB-AMAAADFBAL9A0AAAAABqgQBAAAAAa4EAAAArgQCsAQBAAAAAcUEgAAAAAHGBAIAAAABxwRAAAAAAcgEQAAAAAECAAAAaAAgOgAA0QkAIAMAAABoACA6AADRCQAgOwAA0AkAIAEzAADhDQAwExYAAIoHACAbAACLBwAgHAAAjAcAINYDAACHBwAw1wMAAGYAENgDAACHBwAw2QMBAAAAAeADQACeBgAh-AMAAIgHxQQi_QNAAJ4GACGpBAEAlwYAIaoEAQCYBgAhrgQAAIkHrgQisAQBAJgGACHFBAAApQYAIMYEAgCaBgAhxwRAAJ4GACHIBEAAngYAIY0FAACGBwAgAgAAAGgAIDMAANAJACACAAAAzgkAIDMAAM8JACAP1gMAAM0JADDXAwAAzgkAENgDAADNCQAw2QMBAJcGACHgA0AAngYAIfgDAACIB8UEIv0DQACeBgAhqQQBAJcGACGqBAEAmAYAIa4EAACJB64EIrAEAQCYBgAhxQQAAKUGACDGBAIAmgYAIccEQACeBgAhyARAAJ4GACEP1gMAAM0JADDXAwAAzgkAENgDAADNCQAw2QMBAJcGACHgA0AAngYAIfgDAACIB8UEIv0DQACeBgAhqQQBAJcGACGqBAEAmAYAIa4EAACJB64EIrAEAQCYBgAhxQQAAKUGACDGBAIAmgYAIccEQACeBgAhyARAAJ4GACEL2QMBAMwHACHgA0AAzgcAIfgDAADZCMUEIv0DQADOBwAhqgQBAMwHACGuBAAAjwiuBCKwBAEAzAcAIcUEgAAAAAHGBAIA1wcAIccEQADOBwAhyARAAM4HACENGwAA2wgAIBwAANwIACDZAwEAzAcAIeADQADOBwAh-AMAANkIxQQi_QNAAM4HACGqBAEAzAcAIa4EAACPCK4EIrAEAQDMBwAhxQSAAAAAAcYEAgDXBwAhxwRAAM4HACHIBEAAzgcAIQ0bAADzCAAgHAAA9AgAINkDAQAAAAHgA0AAAAAB-AMAAADFBAL9A0AAAAABqgQBAAAAAa4EAAAArgQCsAQBAAAAAcUEgAAAAAHGBAIAAAABxwRAAAAAAcgEQAAAAAETBwAA0wkAIBwAANUJACAdAADUCQAg2QMBAAAAAeADQAAAAAH9A0AAAAABmgQBAAAAAc0EAQAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHqBAEAAAAB6wQBAAAAAewEAQAAAAHtBAEAAAAB7gQgAAAAAe8EIAAAAAHwBAIAAAAB8QSAAAAAAQM6AADfDQAgmgUAAOANACCgBQAA8AEAIAQ6AADGCQAwmgUAAMcJADCcBQAAyQkAIKAFAADKCQAwBDoAAL0JADCaBQAAvgkAMJwFAADACQAgoAUAAI4JADAFFQAAowkAIBwAAKQJACDZAwEAAAABygQCAAAAAc8EAgAAAAECAAAAFgAgOgAA4QkAIAMAAAAWACA6AADhCQAgOwAA4AkAIAEzAADeDQAwCwgAAL4HACAVAADvBgAgHAAAtQcAINYDAAC9BwAw1wMAABQAENgDAAC9BwAw2QMBAAAAAcoEAgCaBgAhzgQBAJcGACHPBAIAmgYAIZUFAAC8BwAgAgAAABYAIDMAAOAJACACAAAA3gkAIDMAAN8JACAH1gMAAN0JADDXAwAA3gkAENgDAADdCQAw2QMBAJcGACHKBAIAmgYAIc4EAQCXBgAhzwQCAJoGACEH1gMAAN0JADDXAwAA3gkAENgDAADdCQAw2QMBAJcGACHKBAIAmgYAIc4EAQCXBgAhzwQCAJoGACED2QMBAMwHACHKBAIA1wcAIc8EAgDXBwAhBRUAAIgJACAcAACJCQAg2QMBAMwHACHKBAIA1wcAIc8EAgDXBwAhBRUAAKMJACAcAACkCQAg2QMBAAAAAcoEAgAAAAHPBAIAAAABAzoAANwNACCaBQAA3Q0AIKAFAADwAQAgBDoAANYJADCaBQAA1wkAMJwFAADZCQAgoAUAANoJADAEOgAArwkAMJoFAACwCQAwnAUAALIJACCgBQAAswkAMAAAAAU6AADLDQAgOwAA2g0AIJoFAADMDQAgmwUAANkNACCgBQAAbgAgBzoAAMkNACA7AADXDQAgmgUAAMoNACCbBQAA1g0AIJ4FAAAgACCfBQAAIAAgoAUAACIAIAU6AADHDQAgOwAA1A0AIJoFAADIDQAgmwUAANMNACCgBQAAAQAgBzoAAMUNACA7AADRDQAgmgUAAMYNACCbBQAA0A0AIJ4FAAAcACCfBQAAHAAgoAUAAAEAIAc6AADDDQAgOwAAzg0AIJoFAADEDQAgmwUAAM0NACCeBQAAHAAgnwUAABwAIKAFAAABACADOgAAyw0AIJoFAADMDQAgoAUAAG4AIAM6AADJDQAgmgUAAMoNACCgBQAAIgAgAzoAAMcNACCaBQAAyA0AIKAFAAABACADOgAAxQ0AIJoFAADGDQAgoAUAAAEAIAM6AADDDQAgmgUAAMQNACCgBQAAAQAgAAAAAAAFOgAAvg0AIDsAAMENACCaBQAAvw0AIJsFAADADQAgoAUAACIAIAM6AAC-DQAgmgUAAL8NACCgBQAAIgAgAAAAAAAFOgAAtg0AIDsAALwNACCaBQAAtw0AIJsFAAC7DQAgoAUAACIAIAU6AAC0DQAgOwAAuQ0AIJoFAAC1DQAgmwUAALgNACCgBQAAAQAgAzoAALYNACCaBQAAtw0AIKAFAAAiACADOgAAtA0AIJoFAAC1DQAgoAUAAAEAIAAAAAAAAZ0FAAAA4AQCBToAAKwNACA7AACyDQAgmgUAAK0NACCbBQAAsQ0AIKAFAABuACALOgAApAoAMDsAAKkKADCaBQAApQoAMJsFAACmCgAwnAUAAKcKACCdBQAAqAoAMJ4FAACoCgAwnwUAAKgKADCgBQAAqAoAMKEFAACqCgAwogUAAKsKADALOgAAmAoAMDsAAJ0KADCaBQAAmQoAMJsFAACaCgAwnAUAAJsKACCdBQAAnAoAMJ4FAACcCgAwnwUAAJwKADCgBQAAnAoAMKEFAACeCgAwogUAAJ8KADALOgAAjAoAMDsAAJEKADCaBQAAjQoAMJsFAACOCgAwnAUAAI8KACCdBQAAkAoAMJ4FAACQCgAwnwUAAJAKADCgBQAAkAoAMKEFAACSCgAwogUAAJMKADAOCgAA7QkAIA4AAO8JACAPAADwCQAgEAAA8QkAINkDAQAAAAHgA0AAAAAB_QNAAAAAAcwEAQAAAAHWBAEAAAAB1wQBAAAAAdgEAQAAAAHZBEAAAAAB2gRAAAAAAdsEAQAAAAECAAAALgAgOgAAlwoAIAMAAAAuACA6AACXCgAgOwAAlgoAIAEzAACwDQAwEwoAAKMHACALAACkBwAgDgAApQcAIA8AAPsGACAQAAD7BgAg1gMAAKIHADDXAwAALAAQ2AMAAKIHADDZAwEAAAAB4ANAAJ4GACH9A0AAngYAIcwEAQCXBgAh1QQBAPoGACHWBAEAlwYAIdcEAQD6BgAh2AQBAPoGACHZBEAAngYAIdoEQACeBgAh2wQBAJsGACECAAAALgAgMwAAlgoAIAIAAACUCgAgMwAAlQoAIA7WAwAAkwoAMNcDAACUCgAQ2AMAAJMKADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACHMBAEAlwYAIdUEAQD6BgAh1gQBAJcGACHXBAEA-gYAIdgEAQD6BgAh2QRAAJ4GACHaBEAAngYAIdsEAQCbBgAhDtYDAACTCgAw1wMAAJQKABDYAwAAkwoAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIcwEAQCXBgAh1QQBAPoGACHWBAEAlwYAIdcEAQD6BgAh2AQBAPoGACHZBEAAngYAIdoEQACeBgAh2wQBAJsGACEK2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhzAQBAMwHACHWBAEAzAcAIdcEAQDNBwAh2AQBAM0HACHZBEAAzgcAIdoEQADOBwAh2wQBAM0HACEOCgAA6AkAIA4AAOoJACAPAADrCQAgEAAA7AkAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIcwEAQDMBwAh1gQBAMwHACHXBAEAzQcAIdgEAQDNBwAh2QRAAM4HACHaBEAAzgcAIdsEAQDNBwAhDgoAAO0JACAOAADvCQAgDwAA8AkAIBAAAPEJACDZAwEAAAAB4ANAAAAAAf0DQAAAAAHMBAEAAAAB1gQBAAAAAdcEAQAAAAHYBAEAAAAB2QRAAAAAAdoEQAAAAAHbBAEAAAABBNkDAQAAAAHcBAIAAAAB3QQBAAAAAd4EAQAAAAECAAAAKgAgOgAAowoAIAMAAAAqACA6AACjCgAgOwAAogoAIAEzAACvDQAwCgsAAKgHACDWAwAApwcAMNcDAAAoABDYAwAApwcAMNkDAQAAAAHVBAEAlwYAIdwEAgCaBgAh3QQBAJgGACHeBAEAmAYAIZAFAACmBwAgAgAAACoAIDMAAKIKACACAAAAoAoAIDMAAKEKACAI1gMAAJ8KADDXAwAAoAoAENgDAACfCgAw2QMBAJcGACHVBAEAlwYAIdwEAgCaBgAh3QQBAJgGACHeBAEAmAYAIQjWAwAAnwoAMNcDAACgCgAQ2AMAAJ8KADDZAwEAlwYAIdUEAQCXBgAh3AQCAJoGACHdBAEAmAYAId4EAQCYBgAhBNkDAQDMBwAh3AQCANcHACHdBAEAzAcAId4EAQDMBwAhBNkDAQDMBwAh3AQCANcHACHdBAEAzAcAId4EAQDMBwAhBNkDAQAAAAHcBAIAAAAB3QQBAAAAAd4EAQAAAAEFAwAAgQoAINkDAQAAAAHgA0AAAAABygQCAAAAAcsEAQAAAAECAAAAJgAgOgAArwoAIAMAAAAmACA6AACvCgAgOwAArgoAIAEzAACuDQAwDAMAAKUHACALAACoBwAg1gMAAKsHADDXAwAAJAAQ2AMAAKsHADDZAwEAAAAB4ANAAJ4GACHKBAIAmgYAIcsEAQCXBgAh1QQBAJcGACGRBQAAqQcAIJIFAACqBwAgAgAAACYAIDMAAK4KACACAAAArAoAIDMAAK0KACAI1gMAAKsKADDXAwAArAoAENgDAACrCgAw2QMBAJcGACHgA0AAngYAIcoEAgCaBgAhywQBAJcGACHVBAEAlwYAIQjWAwAAqwoAMNcDAACsCgAQ2AMAAKsKADDZAwEAlwYAIeADQACeBgAhygQCAJoGACHLBAEAlwYAIdUEAQCXBgAhBNkDAQDMBwAh4ANAAM4HACHKBAIA1wcAIcsEAQDMBwAhBQMAAP8JACDZAwEAzAcAIeADQADOBwAhygQCANcHACHLBAEAzAcAIQUDAACBCgAg2QMBAAAAAeADQAAAAAHKBAIAAAABywQBAAAAAQM6AACsDQAgmgUAAK0NACCgBQAAbgAgBDoAAKQKADCaBQAApQoAMJwFAACnCgAgoAUAAKgKADAEOgAAmAoAMJoFAACZCgAwnAUAAJsKACCgBQAAnAoAMAQ6AACMCgAwmgUAAI0KADCcBQAAjwoAIKAFAACQCgAwAAAABToAAKQNACA7AACqDQAgmgUAAKUNACCbBQAAqQ0AIKAFAADwAQAgCzoAAM0KADA7AADSCgAwmgUAAM4KADCbBQAAzwoAMJwFAADQCgAgnQUAANEKADCeBQAA0QoAMJ8FAADRCgAwoAUAANEKADChBQAA0woAMKIFAADUCgAwCzoAAMQKADA7AADICgAwmgUAAMUKADCbBQAAxgoAMJwFAADHCgAgnQUAAJAKADCeBQAAkAoAMJ8FAACQCgAwoAUAAJAKADChBQAAyQoAMKIFAACTCgAwCzoAALsKADA7AAC_CgAwmgUAALwKADCbBQAAvQoAMJwFAAC-CgAgnQUAAJoJADCeBQAAmgkAMJ8FAACaCQAwoAUAAJoJADChBQAAwAoAMKIFAACdCQAwCAMAAP8IACAHAACBCQAgCQAA_ggAINkDAQAAAAHJBAEAAAABygQCAAAAAcsEAQAAAAHNBAEAAAABAgAAABoAIDoAAMMKACADAAAAGgAgOgAAwwoAIDsAAMIKACABMwAAqA0AMAIAAAAaACAzAADCCgAgAgAAAJ4JACAzAADBCgAgBdkDAQDMBwAhyQQBAMwHACHKBAIA1wcAIcsEAQDNBwAhzQQBAM0HACEIAwAA-wgAIAcAAP0IACAJAAD6CAAg2QMBAMwHACHJBAEAzAcAIcoEAgDXBwAhywQBAM0HACHNBAEAzQcAIQgDAAD_CAAgBwAAgQkAIAkAAP4IACDZAwEAAAAByQQBAAAAAcoEAgAAAAHLBAEAAAABzQQBAAAAAQ4LAADuCQAgDgAA7wkAIA8AAPAJACAQAADxCQAg2QMBAAAAAeADQAAAAAH9A0AAAAAB1QQBAAAAAdYEAQAAAAHXBAEAAAAB2AQBAAAAAdkEQAAAAAHaBEAAAAAB2wQBAAAAAQIAAAAuACA6AADMCgAgAwAAAC4AIDoAAMwKACA7AADLCgAgATMAAKcNADACAAAALgAgMwAAywoAIAIAAACUCgAgMwAAygoAIArZAwEAzAcAIeADQADOBwAh_QNAAM4HACHVBAEAzQcAIdYEAQDMBwAh1wQBAM0HACHYBAEAzQcAIdkEQADOBwAh2gRAAM4HACHbBAEAzQcAIQ4LAADpCQAgDgAA6gkAIA8AAOsJACAQAADsCQAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAh1QQBAM0HACHWBAEAzAcAIdcEAQDNBwAh2AQBAM0HACHZBEAAzgcAIdoEQADOBwAh2wQBAM0HACEOCwAA7gkAIA4AAO8JACAPAADwCQAgEAAA8QkAINkDAQAAAAHgA0AAAAAB_QNAAAAAAdUEAQAAAAHWBAEAAAAB1wQBAAAAAdgEAQAAAAHZBEAAAAAB2gRAAAAAAdsEAQAAAAEQDAAAsQoAIA0AALIKACARAACzCgAg2QMBAAAAAeADQAAAAAH9A0AAAAABygQCAAAAAdAEAQAAAAHgBAAAAOAEAuEEAgAAAAHiBAIAAAAB4wQBAAAAAeQEQAAAAAHlBEAAAAAB5gRAAAAAAecEQAAAAAECAAAAIgAgOgAA2AoAIAMAAAAiACA6AADYCgAgOwAA1woAIAEzAACmDQAwFgoAAKMHACAMAACvBwAgDQAAsAcAIBEAAIUHACDWAwAArQcAMNcDAAAgABDYAwAArQcAMNkDAQAAAAHgA0AAngYAIf0DQACeBgAhygQCAJoGACHMBAEAlwYAIdAEAQCYBgAh4AQAAK4H4AQi4QQCAJoGACHiBAIA_wYAIeMEAQCYBgAh5ARAAJ4GACHlBEAAngYAIeYEQACdBgAh5wRAAJ0GACGTBQAArAcAIAIAAAAiACAzAADXCgAgAgAAANUKACAzAADWCgAgEdYDAADUCgAw1wMAANUKABDYAwAA1AoAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIcoEAgCaBgAhzAQBAJcGACHQBAEAmAYAIeAEAACuB-AEIuEEAgCaBgAh4gQCAP8GACHjBAEAmAYAIeQEQACeBgAh5QRAAJ4GACHmBEAAnQYAIecEQACdBgAhEdYDAADUCgAw1wMAANUKABDYAwAA1AoAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIcoEAgCaBgAhzAQBAJcGACHQBAEAmAYAIeAEAACuB-AEIuEEAgCaBgAh4gQCAP8GACHjBAEAmAYAIeQEQACeBgAh5QRAAJ4GACHmBEAAnQYAIecEQACdBgAhDdkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIcoEAgDXBwAh0AQBAMwHACHgBAAAhwrgBCLhBAIA1wcAIeIEAgCqCQAh4wQBAMwHACHkBEAAzgcAIeUEQADOBwAh5gRAANkHACHnBEAA2QcAIRAMAACJCgAgDQAAigoAIBEAAIsKACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACHKBAIA1wcAIdAEAQDMBwAh4AQAAIcK4AQi4QQCANcHACHiBAIAqgkAIeMEAQDMBwAh5ARAAM4HACHlBEAAzgcAIeYEQADZBwAh5wRAANkHACEQDAAAsQoAIA0AALIKACARAACzCgAg2QMBAAAAAeADQAAAAAH9A0AAAAABygQCAAAAAdAEAQAAAAHgBAAAAOAEAuEEAgAAAAHiBAIAAAAB4wQBAAAAAeQEQAAAAAHlBEAAAAAB5gRAAAAAAecEQAAAAAEDOgAApA0AIJoFAAClDQAgoAUAAPABACAEOgAAzQoAMJoFAADOCgAwnAUAANAKACCgBQAA0QoAMAQ6AADECgAwmgUAAMUKADCcBQAAxwoAIKAFAACQCgAwBDoAALsKADCaBQAAvAoAMJwFAAC-CgAgoAUAAJoJADAAAAAAAAU6AACfDQAgOwAAog0AIJoFAACgDQAgmwUAAKENACCgBQAAcgAgAzoAAJ8NACCaBQAAoA0AIKAFAAByACAAAAABnQUAAADzBAIFOgAAlw0AIDsAAJ0NACCaBQAAmA0AIJsFAACcDQAgoAUAAPABACAFOgAAlQ0AIDsAAJoNACCaBQAAlg0AIJsFAACZDQAgoAUAAAEAIAM6AACXDQAgmgUAAJgNACCgBQAA8AEAIAM6AACVDQAgmgUAAJYNACCgBQAAAQAgAAAAAAALOgAAoAsAMDsAAKULADCaBQAAoQsAMJsFAACiCwAwnAUAAKMLACCdBQAApAsAMJ4FAACkCwAwnwUAAKQLADCgBQAApAsAMKEFAACmCwAwogUAAKcLADALOgAAlwsAMDsAAJsLADCaBQAAmAsAMJsFAACZCwAwnAUAAJoLACCdBQAAswkAMJ4FAACzCQAwnwUAALMJADCgBQAAswkAMKEFAACcCwAwogUAALYJADALOgAAiwsAMDsAAJALADCaBQAAjAsAMJsFAACNCwAwnAUAAI4LACCdBQAAjwsAMJ4FAACPCwAwnwUAAI8LADCgBQAAjwsAMKEFAACRCwAwogUAAJILADALOgAA_woAMDsAAIQLADCaBQAAgAsAMJsFAACBCwAwnAUAAIILACCdBQAAgwsAMJ4FAACDCwAwnwUAAIMLADCgBQAAgwsAMKEFAACFCwAwogUAAIYLADALOgAA9goAMDsAAPoKADCaBQAA9woAMJsFAAD4CgAwnAUAAPkKACCdBQAAmgkAMJ4FAACaCQAwnwUAAJoJADCgBQAAmgkAMKEFAAD7CgAwogUAAJ0JADAIAwAA_wgAIAkAAP4IACAKAACACQAg2QMBAAAAAckEAQAAAAHKBAIAAAABywQBAAAAAcwEAQAAAAECAAAAGgAgOgAA_goAIAMAAAAaACA6AAD-CgAgOwAA_QoAIAEzAACUDQAwAgAAABoAIDMAAP0KACACAAAAngkAIDMAAPwKACAF2QMBAMwHACHJBAEAzAcAIcoEAgDXBwAhywQBAM0HACHMBAEAzQcAIQgDAAD7CAAgCQAA-ggAIAoAAPwIACDZAwEAzAcAIckEAQDMBwAhygQCANcHACHLBAEAzQcAIcwEAQDNBwAhCAMAAP8IACAJAAD-CAAgCgAAgAkAINkDAQAAAAHJBAEAAAABygQCAAAAAcsEAQAAAAHMBAEAAAABCiMAAOMJACAkAADkCQAg2QMBAAAAAeADQAAAAAH9A0AAAAAB0AQBAAAAAdEEAQAAAAHSBAIAAAAB0wQCAAAAAdQEIAAAAAECAAAAcgAgOgAAigsAIAMAAAByACA6AACKCwAgOwAAiQsAIAEzAACTDQAwEAcAAIAHACAjAACBBwAgJAAA7AYAINYDAAD-BgAw1wMAAHAAENgDAAD-BgAw2QMBAAAAAeADQACeBgAh_QNAAJ4GACHNBAEAlwYAIdAEAQCYBgAh0QQBAJgGACHSBAIAmgYAIdMEAgD_BgAh1AQgAOoGACGMBQAA_QYAIAIAAAByACAzAACJCwAgAgAAAIcLACAzAACICwAgDNYDAACGCwAw1wMAAIcLABDYAwAAhgsAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIc0EAQCXBgAh0AQBAJgGACHRBAEAmAYAIdIEAgCaBgAh0wQCAP8GACHUBCAA6gYAIQzWAwAAhgsAMNcDAACHCwAQ2AMAAIYLADDZAwEAlwYAIeADQACeBgAh_QNAAJ4GACHNBAEAlwYAIdAEAQCYBgAh0QQBAJgGACHSBAIAmgYAIdMEAgD_BgAh1AQgAOoGACEI2QMBAMwHACHgA0AAzgcAIf0DQADOBwAh0AQBAMwHACHRBAEAzAcAIdIEAgDXBwAh0wQCAKoJACHUBCAAqwkAIQojAACtCQAgJAAArgkAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIdAEAQDMBwAh0QQBAMwHACHSBAIA1wcAIdMEAgCqCQAh1AQgAKsJACEKIwAA4wkAICQAAOQJACDZAwEAAAAB4ANAAAAAAf0DQAAAAAHQBAEAAAAB0QQBAAAAAdIEAgAAAAHTBAIAAAAB1AQgAAAAAQoRAADbCgAgEwAA2goAIBQAANwKACDZAwEAAAAB4ANAAAAAAf0DQAAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHoBAEAAAABAgAAAG4AIDoAAJYLACADAAAAbgAgOgAAlgsAIDsAAJULACABMwAAkg0AMBAHAACABwAgEQAAhQcAIBMAAIQHACAUAADvBgAg1gMAAIMHADDXAwAAHgAQ2AMAAIMHADDZAwEAAAAB4ANAAJ4GACH9A0AAngYAIc0EAQCXBgAh0AQBAJgGACHRBAEAmAYAIdQEIADqBgAh6AQBAJgGACGMBQAAggcAIAIAAABuACAzAACVCwAgAgAAAJMLACAzAACUCwAgC9YDAACSCwAw1wMAAJMLABDYAwAAkgsAMNkDAQCXBgAh4ANAAJ4GACH9A0AAngYAIc0EAQCXBgAh0AQBAJgGACHRBAEAmAYAIdQEIADqBgAh6AQBAJgGACEL1gMAAJILADDXAwAAkwsAENgDAACSCwAw2QMBAJcGACHgA0AAngYAIf0DQACeBgAhzQQBAJcGACHQBAEAmAYAIdEEAQCYBgAh1AQgAOoGACHoBAEAmAYAIQfZAwEAzAcAIeADQADOBwAh_QNAAM4HACHQBAEAzAcAIdEEAQDMBwAh1AQgAKsJACHoBAEAzAcAIQoRAAC5CgAgEwAAuAoAIBQAALoKACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACHQBAEAzAcAIdEEAQDMBwAh1AQgAKsJACHoBAEAzAcAIQoRAADbCgAgEwAA2goAIBQAANwKACDZAwEAAAAB4ANAAAAAAf0DQAAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHoBAEAAAABExwAANUJACAdAADUCQAgJQAA4woAINkDAQAAAAHgA0AAAAAB_QNAAAAAAZoEAQAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHpBAEAAAAB6gQBAAAAAesEAQAAAAHsBAEAAAAB7QQBAAAAAe4EIAAAAAHvBCAAAAAB8AQCAAAAAfEEgAAAAAECAAAAEgAgOgAAnwsAIAMAAAASACA6AACfCwAgOwAAngsAIAEzAACRDQAwAgAAABIAIDMAAJ4LACACAAAAtwkAIDMAAJ0LACAQ2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhmgQBAM0HACHQBAEAzAcAIdEEAQDMBwAh1AQgAKsJACHpBAEAzAcAIeoEAQDNBwAh6wQBAMwHACHsBAEAzAcAIe0EAQDNBwAh7gQgAKsJACHvBCAAqwkAIfAEAgCqCQAh8QSAAAAAARMcAAC8CQAgHQAAuwkAICUAAOIKACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGaBAEAzQcAIdAEAQDMBwAh0QQBAMwHACHUBCAAqwkAIekEAQDMBwAh6gQBAM0HACHrBAEAzAcAIewEAQDMBwAh7QQBAM0HACHuBCAAqwkAIe8EIACrCQAh8AQCAKoJACHxBIAAAAABExwAANUJACAdAADUCQAgJQAA4woAINkDAQAAAAHgA0AAAAAB_QNAAAAAAZoEAQAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHpBAEAAAAB6gQBAAAAAesEAQAAAAHsBAEAAAAB7QQBAAAAAe4EIAAAAAHvBCAAAAAB8AQCAAAAAfEEgAAAAAEFAwAA6woAINkDAQAAAAHgA0AAAAABywQBAAAAAfMEAAAA8wQCAgAAAA0AIDoAAKsLACADAAAADQAgOgAAqwsAIDsAAKoLACABMwAAkA0AMAsDAAClBwAgBwAAgAcAINYDAADDBwAw1wMAAAsAENgDAADDBwAw2QMBAAAAAeADQACeBgAhywQBAJcGACHNBAEAlwYAIfMEAADEB_MEIpYFAADCBwAgAgAAAA0AIDMAAKoLACACAAAAqAsAIDMAAKkLACAI1gMAAKcLADDXAwAAqAsAENgDAACnCwAw2QMBAJcGACHgA0AAngYAIcsEAQCXBgAhzQQBAJcGACHzBAAAxAfzBCII1gMAAKcLADDXAwAAqAsAENgDAACnCwAw2QMBAJcGACHgA0AAngYAIcsEAQCXBgAhzQQBAJcGACHzBAAAxAfzBCIE2QMBAMwHACHgA0AAzgcAIcsEAQDMBwAh8wQAAOcK8wQiBQMAAOkKACDZAwEAzAcAIeADQADOBwAhywQBAMwHACHzBAAA5wrzBCIFAwAA6woAINkDAQAAAAHgA0AAAAABywQBAAAAAfMEAAAA8wQCBDoAAKALADCaBQAAoQsAMJwFAACjCwAgoAUAAKQLADAEOgAAlwsAMJoFAACYCwAwnAUAAJoLACCgBQAAswkAMAQ6AACLCwAwmgUAAIwLADCcBQAAjgsAIKAFAACPCwAwBDoAAP8KADCaBQAAgAsAMJwFAACCCwAgoAUAAIMLADAEOgAA9goAMJoFAAD3CgAwnAUAAPkKACCgBQAAmgkAMAAAAAAAAAAAAAAABToAAIsNACA7AACODQAgmgUAAIwNACCbBQAAjQ0AIKAFAAABACADOgAAiw0AIJoFAACMDQAgoAUAAAEAIAAAAAAABToAAIYNACA7AACJDQAgmgUAAIcNACCbBQAAiA0AIKAFAAABACADOgAAhg0AIJoFAACHDQAgoAUAAAEAIAAAAAGdBQAAAIsFAgs6AADIDAAwOwAAzQwAMJoFAADJDAAwmwUAAMoMADCcBQAAywwAIJ0FAADMDAAwngUAAMwMADCfBQAAzAwAMKAFAADMDAAwoQUAAM4MADCiBQAAzwwAMAs6AAC8DAAwOwAAwQwAMJoFAAC9DAAwmwUAAL4MADCcBQAAvwwAIJ0FAADADAAwngUAAMAMADCfBQAAwAwAMKAFAADADAAwoQUAAMIMADCiBQAAwwwAMAs6AACzDAAwOwAAtwwAMJoFAAC0DAAwmwUAALUMADCcBQAAtgwAIJ0FAACkCwAwngUAAKQLADCfBQAApAsAMKAFAACkCwAwoQUAALgMADCiBQAApwsAMAs6AACqDAAwOwAArgwAMJoFAACrDAAwmwUAAKwMADCcBQAArQwAIJ0FAACoCgAwngUAAKgKADCfBQAAqAoAMKAFAACoCgAwoQUAAK8MADCiBQAAqwoAMAs6AAChDAAwOwAApQwAMJoFAACiDAAwmwUAAKMMADCcBQAApAwAIJ0FAACQCgAwngUAAJAKADCfBQAAkAoAMKAFAACQCgAwoQUAAKYMADCiBQAAkwoAMAs6AACYDAAwOwAAnAwAMJoFAACZDAAwmwUAAJoMADCcBQAAmwwAIJ0FAACQCgAwngUAAJAKADCfBQAAkAoAMKAFAACQCgAwoQUAAJ0MADCiBQAAkwoAMAs6AACPDAAwOwAAkwwAMJoFAACQDAAwmwUAAJEMADCcBQAAkgwAIJ0FAACQCgAwngUAAJAKADCfBQAAkAoAMKAFAACQCgAwoQUAAJQMADCiBQAAkwoAMAs6AACGDAAwOwAAigwAMJoFAACHDAAwmwUAAIgMADCcBQAAiQwAIJ0FAACaCQAwngUAAJoJADCfBQAAmgkAMKAFAACaCQAwoQUAAIsMADCiBQAAnQkAMAs6AAD9CwAwOwAAgQwAMJoFAAD-CwAwmwUAAP8LADCcBQAAgAwAIJ0FAACOCQAwngUAAI4JADCfBQAAjgkAMKAFAACOCQAwoQUAAIIMADCiBQAAkQkAMAs6AAD0CwAwOwAA-AsAMJoFAAD1CwAwmwUAAPYLADCcBQAA9wsAIJ0FAACzCAAwngUAALMIADCfBQAAswgAMKAFAACzCAAwoQUAAPkLADCiBQAAtggAMAs6AADrCwAwOwAA7wsAMJoFAADsCwAwmwUAAO0LADCcBQAA7gsAIJ0FAACnCAAwngUAAKcIADCfBQAApwgAMKAFAACnCAAwoQUAAPALADCiBQAAqggAMAs6AADiCwAwOwAA5gsAMJoFAADjCwAwmwUAAOQLADCcBQAA5QsAIJ0FAACbCAAwngUAAJsIADCfBQAAmwgAMKAFAACbCAAwoQUAAOcLADCiBQAAnggAMAs6AADWCwAwOwAA2wsAMJoFAADXCwAwmwUAANgLADCcBQAA2QsAIJ0FAADaCwAwngUAANoLADCfBQAA2gsAMKAFAADaCwAwoQUAANwLADCiBQAA3QsAMAfZAwEAAAAB2wMBAAAAAdwDAQAAAAHdAwEAAAAB3gOAAAAAAd8DAQAAAAHgA0AAAAABAgAAAIUBACA6AADhCwAgAwAAAIUBACA6AADhCwAgOwAA4AsAIAEzAACFDQAwDB4AAPsGACDWAwAA-QYAMNcDAACDAQAQ2AMAAPkGADDZAwEAAAAB2gMBAPoGACHbAwEAmAYAIdwDAQCYBgAh3QMBAJgGACHeAwAApQYAIN8DAQCbBgAh4ANAAJ4GACECAAAAhQEAIDMAAOALACACAAAA3gsAIDMAAN8LACAL1gMAAN0LADDXAwAA3gsAENgDAADdCwAw2QMBAJcGACHaAwEA-gYAIdsDAQCYBgAh3AMBAJgGACHdAwEAmAYAId4DAAClBgAg3wMBAJsGACHgA0AAngYAIQvWAwAA3QsAMNcDAADeCwAQ2AMAAN0LADDZAwEAlwYAIdoDAQD6BgAh2wMBAJgGACHcAwEAmAYAId0DAQCYBgAh3gMAAKUGACDfAwEAmwYAIeADQACeBgAhB9kDAQDMBwAh2wMBAMwHACHcAwEAzAcAId0DAQDMBwAh3gOAAAAAAd8DAQDNBwAh4ANAAM4HACEH2QMBAMwHACHbAwEAzAcAIdwDAQDMBwAh3QMBAMwHACHeA4AAAAAB3wMBAM0HACHgA0AAzgcAIQfZAwEAAAAB2wMBAAAAAdwDAQAAAAHdAwEAAAAB3gOAAAAAAd8DAQAAAAHgA0AAAAABChkAAOwHACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGMBAEAAAABjwQAAACPBAKQBAEAAAABkQQBAAAAAZIEAQAAAAGTBAIAAAABAgAAAFoAIDoAAOoLACADAAAAWgAgOgAA6gsAIDsAAOkLACABMwAAhA0AMAIAAABaACAzAADpCwAgAgAAAJ8IACAzAADoCwAgCdkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYwEAQDMBwAhjwQAAOkHjwQikAQBAMwHACGRBAEAzAcAIZIEAQDMBwAhkwQCANcHACEKGQAA6gcAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYwEAQDMBwAhjwQAAOkHjwQikAQBAMwHACGRBAEAzAcAIZIEAQDMBwAhkwQCANcHACEKGQAA7AcAINkDAQAAAAHgA0AAAAAB_QNAAAAAAYwEAQAAAAGPBAAAAI8EApAEAQAAAAGRBAEAAAABkgQBAAAAAZMEAgAAAAESGQAA9wcAINkDAQAAAAHgA0AAAAAB-AMAAACYBAL9A0AAAAAB_gMBAAAAAYkEAQAAAAGMBAEAAAABlQQAAACVBAKWBAEAAAABmAQCAAAAAZkEAQAAAAGaBAEAAAABmwQBAAAAAZwEAQAAAAGdBEAAAAABngRAAAAAAZ8EQAAAAAECAAAAVQAgOgAA8wsAIAMAAABVACA6AADzCwAgOwAA8gsAIAEzAACDDQAwAgAAAFUAIDMAAPILACACAAAAqwgAIDMAAPELACAR2QMBAMwHACHgA0AAzgcAIfgDAAD0B5gEIv0DQADOBwAh_gMBAMwHACGJBAEAzQcAIYwEAQDMBwAhlQQAAPMHlQQilgQBAMwHACGYBAIA1wcAIZkEAQDNBwAhmgQBAM0HACGbBAEAzQcAIZwEAQDNBwAhnQRAAM4HACGeBEAA2QcAIZ8EQADZBwAhEhkAAPUHACDZAwEAzAcAIeADQADOBwAh-AMAAPQHmAQi_QNAAM4HACH-AwEAzAcAIYkEAQDNBwAhjAQBAMwHACGVBAAA8weVBCKWBAEAzAcAIZgEAgDXBwAhmQQBAM0HACGaBAEAzQcAIZsEAQDNBwAhnAQBAM0HACGdBEAAzgcAIZ4EQADZBwAhnwRAANkHACESGQAA9wcAINkDAQAAAAHgA0AAAAAB-AMAAACYBAL9A0AAAAAB_gMBAAAAAYkEAQAAAAGMBAEAAAABlQQAAACVBAKWBAEAAAABmAQCAAAAAZkEAQAAAAGaBAEAAAABmwQBAAAAAZwEAQAAAAGdBEAAAAABngRAAAAAAZ8EQAAAAAEKGQAAgAgAINkDAQAAAAHgA0AAAAAB_gMBAAAAAYYEAQAAAAGMBAEAAAABoQQAAAChBAKjBAAAAKMEAqQEAQAAAAGlBIAAAAABAgAAAFAAIDoAAPwLACADAAAAUAAgOgAA_AsAIDsAAPsLACABMwAAgg0AMAIAAABQACAzAAD7CwAgAgAAALcIACAzAAD6CwAgCdkDAQDMBwAh4ANAAM4HACH-AwEAzQcAIYYEAQDNBwAhjAQBAMwHACGhBAAA_AehBCKjBAAA_QejBCKkBAEAzAcAIaUEgAAAAAEKGQAA_gcAINkDAQDMBwAh4ANAAM4HACH-AwEAzQcAIYYEAQDNBwAhjAQBAMwHACGhBAAA_AehBCKjBAAA_QejBCKkBAEAzAcAIaUEgAAAAAEKGQAAgAgAINkDAQAAAAHgA0AAAAAB_gMBAAAAAYYEAQAAAAGMBAEAAAABoQQAAAChBAKjBAAAAKMEAqQEAQAAAAGlBIAAAAABIBYAAMcIACAYAADJCAAgHQAAyggAIB8AAMsIACAhAADMCAAgIgAAzQgAINkDAQAAAAHgA0AAAAAB_QNAAAAAAagEAgAAAAGpBAEAAAABqgQBAAAAAawEAAAArAQCrgQAAACuBAKvBAEAAAABsAQBAAAAAbEEAQAAAAGzBAEAAAABtAQCAAAAAbUEAgAAAAG2BEAAAAABtwQCAAAAAbgEQAAAAAG5BAIAAAABugRAAAAAAbsEQAAAAAG8BAEAAAABvQQBAAAAAb4EQAAAAAG_BEAAAAABwARAAAAAAcEEAgAAAAECAAAAPwAgOgAAhQwAIAMAAAA_ACA6AACFDAAgOwAAhAwAIAEzAACBDQAwAgAAAD8AIDMAAIQMACACAAAAkgkAIDMAAIMMACAa2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhqAQCANcHACGpBAEAzAcAIaoEAQDMBwAhrAQAAI4IrAQirgQAAI8IrgQirwQBAMwHACGwBAEAzAcAIbEEAQDNBwAhswQBAM0HACG0BAIA1wcAIbUEAgDXBwAhtgRAANkHACG3BAIA1wcAIbgEQADZBwAhuQQCANcHACG6BEAA2QcAIbsEQADZBwAhvAQBAM0HACG9BAEAzQcAIb4EQADOBwAhvwRAANkHACHABEAA2QcAIcEEAgDXBwAhIBYAAJAIACAYAACSCAAgHQAAkwgAIB8AAJQIACAhAACVCAAgIgAAlggAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIagEAgDXBwAhqQQBAMwHACGqBAEAzAcAIawEAACOCKwEIq4EAACPCK4EIq8EAQDMBwAhsAQBAMwHACGxBAEAzQcAIbMEAQDNBwAhtAQCANcHACG1BAIA1wcAIbYEQADZBwAhtwQCANcHACG4BEAA2QcAIbkEAgDXBwAhugRAANkHACG7BEAA2QcAIbwEAQDNBwAhvQQBAM0HACG-BEAAzgcAIb8EQADZBwAhwARAANkHACHBBAIA1wcAISAWAADHCAAgGAAAyQgAIB0AAMoIACAfAADLCAAgIQAAzAgAICIAAM0IACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGoBAIAAAABqQQBAAAAAaoEAQAAAAGsBAAAAKwEAq4EAAAArgQCrwQBAAAAAbAEAQAAAAGxBAEAAAABswQBAAAAAbQEAgAAAAG1BAIAAAABtgRAAAAAAbcEAgAAAAG4BEAAAAABuQQCAAAAAboEQAAAAAG7BEAAAAABvAQBAAAAAb0EAQAAAAG-BEAAAAABvwRAAAAAAcAEQAAAAAHBBAIAAAABCAcAAIEJACAJAAD-CAAgCgAAgAkAINkDAQAAAAHJBAEAAAABygQCAAAAAcwEAQAAAAHNBAEAAAABAgAAABoAIDoAAI4MACADAAAAGgAgOgAAjgwAIDsAAI0MACABMwAAgA0AMAIAAAAaACAzAACNDAAgAgAAAJ4JACAzAACMDAAgBdkDAQDMBwAhyQQBAMwHACHKBAIA1wcAIcwEAQDNBwAhzQQBAM0HACEIBwAA_QgAIAkAAPoIACAKAAD8CAAg2QMBAMwHACHJBAEAzAcAIcoEAgDXBwAhzAQBAM0HACHNBAEAzQcAIQgHAACBCQAgCQAA_ggAIAoAAIAJACDZAwEAAAAByQQBAAAAAcoEAgAAAAHMBAEAAAABzQQBAAAAAQ4KAADtCQAgCwAA7gkAIA4AAO8JACAPAADwCQAg2QMBAAAAAeADQAAAAAH9A0AAAAABzAQBAAAAAdUEAQAAAAHWBAEAAAAB1wQBAAAAAdkEQAAAAAHaBEAAAAAB2wQBAAAAAQIAAAAuACA6AACXDAAgAwAAAC4AIDoAAJcMACA7AACWDAAgATMAAP8MADACAAAALgAgMwAAlgwAIAIAAACUCgAgMwAAlQwAIArZAwEAzAcAIeADQADOBwAh_QNAAM4HACHMBAEAzAcAIdUEAQDNBwAh1gQBAMwHACHXBAEAzQcAIdkEQADOBwAh2gRAAM4HACHbBAEAzQcAIQ4KAADoCQAgCwAA6QkAIA4AAOoJACAPAADrCQAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhzAQBAMwHACHVBAEAzQcAIdYEAQDMBwAh1wQBAM0HACHZBEAAzgcAIdoEQADOBwAh2wQBAM0HACEOCgAA7QkAIAsAAO4JACAOAADvCQAgDwAA8AkAINkDAQAAAAHgA0AAAAAB_QNAAAAAAcwEAQAAAAHVBAEAAAAB1gQBAAAAAdcEAQAAAAHZBEAAAAAB2gRAAAAAAdsEAQAAAAEOCgAA7QkAIAsAAO4JACAOAADvCQAgEAAA8QkAINkDAQAAAAHgA0AAAAAB_QNAAAAAAcwEAQAAAAHVBAEAAAAB1gQBAAAAAdgEAQAAAAHZBEAAAAAB2gRAAAAAAdsEAQAAAAECAAAALgAgOgAAoAwAIAMAAAAuACA6AACgDAAgOwAAnwwAIAEzAAD-DAAwAgAAAC4AIDMAAJ8MACACAAAAlAoAIDMAAJ4MACAK2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhzAQBAMwHACHVBAEAzQcAIdYEAQDMBwAh2AQBAM0HACHZBEAAzgcAIdoEQADOBwAh2wQBAM0HACEOCgAA6AkAIAsAAOkJACAOAADqCQAgEAAA7AkAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIcwEAQDMBwAh1QQBAM0HACHWBAEAzAcAIdgEAQDNBwAh2QRAAM4HACHaBEAAzgcAIdsEAQDNBwAhDgoAAO0JACALAADuCQAgDgAA7wkAIBAAAPEJACDZAwEAAAAB4ANAAAAAAf0DQAAAAAHMBAEAAAAB1QQBAAAAAdYEAQAAAAHYBAEAAAAB2QRAAAAAAdoEQAAAAAHbBAEAAAABDgoAAO0JACALAADuCQAgDwAA8AkAIBAAAPEJACDZAwEAAAAB4ANAAAAAAf0DQAAAAAHMBAEAAAAB1QQBAAAAAdcEAQAAAAHYBAEAAAAB2QRAAAAAAdoEQAAAAAHbBAEAAAABAgAAAC4AIDoAAKkMACADAAAALgAgOgAAqQwAIDsAAKgMACABMwAA_QwAMAIAAAAuACAzAACoDAAgAgAAAJQKACAzAACnDAAgCtkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIcwEAQDMBwAh1QQBAM0HACHXBAEAzQcAIdgEAQDNBwAh2QRAAM4HACHaBEAAzgcAIdsEAQDNBwAhDgoAAOgJACALAADpCQAgDwAA6wkAIBAAAOwJACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACHMBAEAzAcAIdUEAQDNBwAh1wQBAM0HACHYBAEAzQcAIdkEQADOBwAh2gRAAM4HACHbBAEAzQcAIQ4KAADtCQAgCwAA7gkAIA8AAPAJACAQAADxCQAg2QMBAAAAAeADQAAAAAH9A0AAAAABzAQBAAAAAdUEAQAAAAHXBAEAAAAB2AQBAAAAAdkEQAAAAAHaBEAAAAAB2wQBAAAAAQULAACACgAg2QMBAAAAAeADQAAAAAHKBAIAAAAB1QQBAAAAAQIAAAAmACA6AACyDAAgAwAAACYAIDoAALIMACA7AACxDAAgATMAAPwMADACAAAAJgAgMwAAsQwAIAIAAACsCgAgMwAAsAwAIATZAwEAzAcAIeADQADOBwAhygQCANcHACHVBAEAzAcAIQULAAD-CQAg2QMBAMwHACHgA0AAzgcAIcoEAgDXBwAh1QQBAMwHACEFCwAAgAoAINkDAQAAAAHgA0AAAAABygQCAAAAAdUEAQAAAAEFBwAA6goAINkDAQAAAAHgA0AAAAABzQQBAAAAAfMEAAAA8wQCAgAAAA0AIDoAALsMACADAAAADQAgOgAAuwwAIDsAALoMACABMwAA-wwAMAIAAAANACAzAAC6DAAgAgAAAKgLACAzAAC5DAAgBNkDAQDMBwAh4ANAAM4HACHNBAEAzAcAIfMEAADnCvMEIgUHAADoCgAg2QMBAMwHACHgA0AAzgcAIc0EAQDMBwAh8wQAAOcK8wQiBQcAAOoKACDZAwEAAAAB4ANAAAAAAc0EAQAAAAHzBAAAAPMEAgPZAwEAAAAB_QRAAAAAAf8EAQAAAAECAAAACQAgOgAAxwwAIAMAAAAJACA6AADHDAAgOwAAxgwAIAEzAAD6DAAwCAMAAKUHACDWAwAAxQcAMNcDAAAHABDYAwAAxQcAMNkDAQAAAAHLBAEAlwYAIf0EQACeBgAh_wQBAAAAAQIAAAAJACAzAADGDAAgAgAAAMQMACAzAADFDAAgB9YDAADDDAAw1wMAAMQMABDYAwAAwwwAMNkDAQCXBgAhywQBAJcGACH9BEAAngYAIf8EAQCYBgAhB9YDAADDDAAw1wMAAMQMABDYAwAAwwwAMNkDAQCXBgAhywQBAJcGACH9BEAAngYAIf8EAQCYBgAhA9kDAQDMBwAh_QRAAM4HACH_BAEAzAcAIQPZAwEAzAcAIf0EQADOBwAh_wQBAMwHACED2QMBAAAAAf0EQAAAAAH_BAEAAAABC9kDAQAAAAGhBAEAAAABgAUBAAAAAYEFAQAAAAGCBQEAAAABgwUBAAAAAYQFAgAAAAGFBQEAAAABhgUBAAAAAYcFAQAAAAGIBQEAAAABAgAAAAUAIDoAANMMACADAAAABQAgOgAA0wwAIDsAANIMACABMwAA-QwAMBEDAAClBwAg1gMAAMcHADDXAwAAAwAQ2AMAAMcHADDZAwEAAAABoQQBAJgGACHLBAEAlwYAIYAFAQCYBgAhgQUBAJgGACGCBQEAmwYAIYMFAQCbBgAhhAUCAP8GACGFBQEAmwYAIYYFAQCbBgAhhwUBAJsGACGIBQEAmwYAIZcFAADGBwAgAgAAAAUAIDMAANIMACACAAAA0AwAIDMAANEMACAP1gMAAM8MADDXAwAA0AwAENgDAADPDAAw2QMBAJcGACGhBAEAmAYAIcsEAQCXBgAhgAUBAJgGACGBBQEAmAYAIYIFAQCbBgAhgwUBAJsGACGEBQIA_wYAIYUFAQCbBgAhhgUBAJsGACGHBQEAmwYAIYgFAQCbBgAhD9YDAADPDAAw1wMAANAMABDYAwAAzwwAMNkDAQCXBgAhoQQBAJgGACHLBAEAlwYAIYAFAQCYBgAhgQUBAJgGACGCBQEAmwYAIYMFAQCbBgAhhAUCAP8GACGFBQEAmwYAIYYFAQCbBgAhhwUBAJsGACGIBQEAmwYAIQvZAwEAzAcAIaEEAQDMBwAhgAUBAMwHACGBBQEAzAcAIYIFAQDNBwAhgwUBAM0HACGEBQIAqgkAIYUFAQDNBwAhhgUBAM0HACGHBQEAzQcAIYgFAQDNBwAhC9kDAQDMBwAhoQQBAMwHACGABQEAzAcAIYEFAQDMBwAhggUBAM0HACGDBQEAzQcAIYQFAgCqCQAhhQUBAM0HACGGBQEAzQcAIYcFAQDNBwAhiAUBAM0HACEL2QMBAAAAAaEEAQAAAAGABQEAAAABgQUBAAAAAYIFAQAAAAGDBQEAAAABhAUCAAAAAYUFAQAAAAGGBQEAAAABhwUBAAAAAYgFAQAAAAEEOgAAyAwAMJoFAADJDAAwnAUAAMsMACCgBQAAzAwAMAQ6AAC8DAAwmgUAAL0MADCcBQAAvwwAIKAFAADADAAwBDoAALMMADCaBQAAtAwAMJwFAAC2DAAgoAUAAKQLADAEOgAAqgwAMJoFAACrDAAwnAUAAK0MACCgBQAAqAoAMAQ6AAChDAAwmgUAAKIMADCcBQAApAwAIKAFAACQCgAwBDoAAJgMADCaBQAAmQwAMJwFAACbDAAgoAUAAJAKADAEOgAAjwwAMJoFAACQDAAwnAUAAJIMACCgBQAAkAoAMAQ6AACGDAAwmgUAAIcMADCcBQAAiQwAIKAFAACaCQAwBDoAAP0LADCaBQAA_gsAMJwFAACADAAgoAUAAI4JADAEOgAA9AsAMJoFAAD1CwAwnAUAAPcLACCgBQAAswgAMAQ6AADrCwAwmgUAAOwLADCcBQAA7gsAIKAFAACnCAAwBDoAAOILADCaBQAA4wsAMJwFAADlCwAgoAUAAJsIADAEOgAA1gsAMJoFAADXCwAwnAUAANkLACCgBQAA2gsAMAAAAAAAAAAAAA4EAADhDAAgBQAA4gwAIAYAALELACAUAAC1CwAgHwAA5gwAICEAAOcMACAiAADoDAAgKAAA4wwAICkAAOQMACAqAADkDAAgKwAA5AwAICwAAOUMACAtAADpDAAghgQAAMgHACAHBgAAsQsAIBQAALULACAkAACyCwAgJgAAswsAICcAALQLACCaBAAAyAcAIOoEAADIBwAgAAAIBwAA6wwAIBwAAOUMACAdAAD4DAAgJQAA9wwAIJoEAADIBwAg6gQAAMgHACDtBAAAyAcAIPAEAADIBwAgAAASFgAA7gwAIBcAAOoMACAYAADzDAAgHQAA8AwAIB8AAOYMACAhAADnDAAgIgAA6AwAILEEAADIBwAgsgQAAMgHACCzBAAAyAcAILYEAADIBwAguAQAAMgHACC6BAAAyAcAILsEAADIBwAgvAQAAMgHACC9BAAAyAcAIL8EAADIBwAgwAQAAMgHACADFgAA7gwAIBsAAO8MACAcAADwDAAgAwgAAPcMACAVAAC1CwAgHAAA5QwAIAQHAADrDAAgEQAA5AwAIBMAAO0MACAUAAC1CwAgBwoAAPQMACAMAADjDAAgDQAA9gwAIBEAAOQMACDiBAAAyAcAIOYEAADIBwAg5wQAAMgHACAABAcAAOsMACAjAADsDAAgJAAAsgsAINMEAADIBwAgAAvZAwEAAAABoQQBAAAAAYAFAQAAAAGBBQEAAAABggUBAAAAAYMFAQAAAAGEBQIAAAABhQUBAAAAAYYFAQAAAAGHBQEAAAABiAUBAAAAAQPZAwEAAAAB_QRAAAAAAf8EAQAAAAEE2QMBAAAAAeADQAAAAAHNBAEAAAAB8wQAAADzBAIE2QMBAAAAAeADQAAAAAHKBAIAAAAB1QQBAAAAAQrZAwEAAAAB4ANAAAAAAf0DQAAAAAHMBAEAAAAB1QQBAAAAAdcEAQAAAAHYBAEAAAAB2QRAAAAAAdoEQAAAAAHbBAEAAAABCtkDAQAAAAHgA0AAAAAB_QNAAAAAAcwEAQAAAAHVBAEAAAAB1gQBAAAAAdgEAQAAAAHZBEAAAAAB2gRAAAAAAdsEAQAAAAEK2QMBAAAAAeADQAAAAAH9A0AAAAABzAQBAAAAAdUEAQAAAAHWBAEAAAAB1wQBAAAAAdkEQAAAAAHaBEAAAAAB2wQBAAAAAQXZAwEAAAAByQQBAAAAAcoEAgAAAAHMBAEAAAABzQQBAAAAARrZAwEAAAAB4ANAAAAAAf0DQAAAAAGoBAIAAAABqQQBAAAAAaoEAQAAAAGsBAAAAKwEAq4EAAAArgQCrwQBAAAAAbAEAQAAAAGxBAEAAAABswQBAAAAAbQEAgAAAAG1BAIAAAABtgRAAAAAAbcEAgAAAAG4BEAAAAABuQQCAAAAAboEQAAAAAG7BEAAAAABvAQBAAAAAb0EAQAAAAG-BEAAAAABvwRAAAAAAcAEQAAAAAHBBAIAAAABCdkDAQAAAAHgA0AAAAAB_gMBAAAAAYYEAQAAAAGMBAEAAAABoQQAAAChBAKjBAAAAKMEAqQEAQAAAAGlBIAAAAABEdkDAQAAAAHgA0AAAAAB-AMAAACYBAL9A0AAAAAB_gMBAAAAAYkEAQAAAAGMBAEAAAABlQQAAACVBAKWBAEAAAABmAQCAAAAAZkEAQAAAAGaBAEAAAABmwQBAAAAAZwEAQAAAAGdBEAAAAABngRAAAAAAZ8EQAAAAAEJ2QMBAAAAAeADQAAAAAH9A0AAAAABjAQBAAAAAY8EAAAAjwQCkAQBAAAAAZEEAQAAAAGSBAEAAAABkwQCAAAAAQfZAwEAAAAB2wMBAAAAAdwDAQAAAAHdAwEAAAAB3gOAAAAAAd8DAQAAAAHgA0AAAAABFgUAANUMACAGAADWDAAgFAAA2wwAIB8AAN0MACAhAADeDAAgIgAA3wwAICgAANcMACApAADYDAAgKgAA2QwAICsAANoMACAsAADcDAAgLQAA4AwAINkDAQAAAAHgA0AAAAAB_QNAAAAAAYYEAQAAAAHQBAEAAAAB1AQgAAAAAegEAQAAAAHzBAAAAIsFAokFAQAAAAGLBYAAAAABAgAAAAEAIDoAAIYNACADAAAAHAAgOgAAhg0AIDsAAIoNACAYAAAAHAAgBQAAygsAIAYAAMsLACAUAADQCwAgHwAA0gsAICEAANMLACAiAADUCwAgKAAAzAsAICkAAM0LACAqAADOCwAgKwAAzwsAICwAANELACAtAADVCwAgMwAAig0AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABFgUAAMoLACAGAADLCwAgFAAA0AsAIB8AANILACAhAADTCwAgIgAA1AsAICgAAMwLACApAADNCwAgKgAAzgsAICsAAM8LACAsAADRCwAgLQAA1QsAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABFgQAANQMACAGAADWDAAgFAAA2wwAIB8AAN0MACAhAADeDAAgIgAA3wwAICgAANcMACApAADYDAAgKgAA2QwAICsAANoMACAsAADcDAAgLQAA4AwAINkDAQAAAAHgA0AAAAAB_QNAAAAAAYYEAQAAAAHQBAEAAAAB1AQgAAAAAegEAQAAAAHzBAAAAIsFAokFAQAAAAGLBYAAAAABAgAAAAEAIDoAAIsNACADAAAAHAAgOgAAiw0AIDsAAI8NACAYAAAAHAAgBAAAyQsAIAYAAMsLACAUAADQCwAgHwAA0gsAICEAANMLACAiAADUCwAgKAAAzAsAICkAAM0LACAqAADOCwAgKwAAzwsAICwAANELACAtAADVCwAgMwAAjw0AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABFgQAAMkLACAGAADLCwAgFAAA0AsAIB8AANILACAhAADTCwAgIgAA1AsAICgAAMwLACApAADNCwAgKgAAzgsAICsAAM8LACAsAADRCwAgLQAA1QsAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABBNkDAQAAAAHgA0AAAAABywQBAAAAAfMEAAAA8wQCENkDAQAAAAHgA0AAAAAB_QNAAAAAAZoEAQAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHpBAEAAAAB6gQBAAAAAesEAQAAAAHsBAEAAAAB7QQBAAAAAe4EIAAAAAHvBCAAAAAB8AQCAAAAAfEEgAAAAAEH2QMBAAAAAeADQAAAAAH9A0AAAAAB0AQBAAAAAdEEAQAAAAHUBCAAAAAB6AQBAAAAAQjZAwEAAAAB4ANAAAAAAf0DQAAAAAHQBAEAAAAB0QQBAAAAAdIEAgAAAAHTBAIAAAAB1AQgAAAAAQXZAwEAAAAByQQBAAAAAcoEAgAAAAHLBAEAAAABzAQBAAAAARYEAADUDAAgBQAA1QwAIBQAANsMACAfAADdDAAgIQAA3gwAICIAAN8MACAoAADXDAAgKQAA2AwAICoAANkMACArAADaDAAgLAAA3AwAIC0AAOAMACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGGBAEAAAAB0AQBAAAAAdQEIAAAAAHoBAEAAAAB8wQAAACLBQKJBQEAAAABiwWAAAAAAQIAAAABACA6AACVDQAgERQAALALACAkAACtCwAgJgAArgsAICcAAK8LACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGaBAEAAAAB0AQBAAAAAdEEAQAAAAHUBCAAAAAB6AQBAAAAAeoEAQAAAAH0BCAAAAAB9QQgAAAAAfYEAgAAAAH3BAEAAAABAgAAAPABACA6AACXDQAgAwAAABwAIDoAAJUNACA7AACbDQAgGAAAABwAIAQAAMkLACAFAADKCwAgFAAA0AsAIB8AANILACAhAADTCwAgIgAA1AsAICgAAMwLACApAADNCwAgKgAAzgsAICsAAM8LACAsAADRCwAgLQAA1QsAIDMAAJsNACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGGBAEAzQcAIdAEAQDMBwAh1AQgAKsJACHoBAEAzAcAIfMEAADIC4sFIokFAQDMBwAhiwWAAAAAARYEAADJCwAgBQAAygsAIBQAANALACAfAADSCwAgIQAA0wsAICIAANQLACAoAADMCwAgKQAAzQsAICoAAM4LACArAADPCwAgLAAA0QsAIC0AANULACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGGBAEAzQcAIdAEAQDMBwAh1AQgAKsJACHoBAEAzAcAIfMEAADIC4sFIokFAQDMBwAhiwWAAAAAAQMAAAA7ACA6AACXDQAgOwAAng0AIBMAAAA7ACAUAAD1CgAgJAAA8goAICYAAPMKACAnAAD0CgAgMwAAng0AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIZoEAQDNBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6AQBAMwHACHqBAEAzQcAIfQEIACrCQAh9QQgAKsJACH2BAIA1wcAIfcEAQDMBwAhERQAAPUKACAkAADyCgAgJgAA8woAICcAAPQKACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGaBAEAzQcAIdAEAQDMBwAh0QQBAMwHACHUBCAAqwkAIegEAQDMBwAh6gQBAM0HACH0BCAAqwkAIfUEIACrCQAh9gQCANcHACH3BAEAzAcAIQsHAADiCQAgIwAA4wkAINkDAQAAAAHgA0AAAAAB_QNAAAAAAc0EAQAAAAHQBAEAAAAB0QQBAAAAAdIEAgAAAAHTBAIAAAAB1AQgAAAAAQIAAAByACA6AACfDQAgAwAAAHAAIDoAAJ8NACA7AACjDQAgDQAAAHAAIAcAAKwJACAjAACtCQAgMwAAow0AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIc0EAQDMBwAh0AQBAMwHACHRBAEAzAcAIdIEAgDXBwAh0wQCAKoJACHUBCAAqwkAIQsHAACsCQAgIwAArQkAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIc0EAQDMBwAh0AQBAMwHACHRBAEAzAcAIdIEAgDXBwAh0wQCAKoJACHUBCAAqwkAIREGAACsCwAgFAAAsAsAICQAAK0LACAnAACvCwAg2QMBAAAAAeADQAAAAAH9A0AAAAABmgQBAAAAAdAEAQAAAAHRBAEAAAAB1AQgAAAAAegEAQAAAAHqBAEAAAAB9AQgAAAAAfUEIAAAAAH2BAIAAAAB9wQBAAAAAQIAAADwAQAgOgAApA0AIA3ZAwEAAAAB4ANAAAAAAf0DQAAAAAHKBAIAAAAB0AQBAAAAAeAEAAAA4AQC4QQCAAAAAeIEAgAAAAHjBAEAAAAB5ARAAAAAAeUEQAAAAAHmBEAAAAAB5wRAAAAAAQrZAwEAAAAB4ANAAAAAAf0DQAAAAAHVBAEAAAAB1gQBAAAAAdcEAQAAAAHYBAEAAAAB2QRAAAAAAdoEQAAAAAHbBAEAAAABBdkDAQAAAAHJBAEAAAABygQCAAAAAcsEAQAAAAHNBAEAAAABAwAAADsAIDoAAKQNACA7AACrDQAgEwAAADsAIAYAAPEKACAUAAD1CgAgJAAA8goAICcAAPQKACAzAACrDQAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhmgQBAM0HACHQBAEAzAcAIdEEAQDMBwAh1AQgAKsJACHoBAEAzAcAIeoEAQDNBwAh9AQgAKsJACH1BCAAqwkAIfYEAgDXBwAh9wQBAMwHACERBgAA8QoAIBQAAPUKACAkAADyCgAgJwAA9AoAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIZoEAQDNBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6AQBAMwHACHqBAEAzQcAIfQEIACrCQAh9QQgAKsJACH2BAIA1wcAIfcEAQDMBwAhCwcAANkKACARAADbCgAgFAAA3AoAINkDAQAAAAHgA0AAAAAB_QNAAAAAAc0EAQAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHoBAEAAAABAgAAAG4AIDoAAKwNACAE2QMBAAAAAeADQAAAAAHKBAIAAAABywQBAAAAAQTZAwEAAAAB3AQCAAAAAd0EAQAAAAHeBAEAAAABCtkDAQAAAAHgA0AAAAAB_QNAAAAAAcwEAQAAAAHWBAEAAAAB1wQBAAAAAdgEAQAAAAHZBEAAAAAB2gRAAAAAAdsEAQAAAAEDAAAAHgAgOgAArA0AIDsAALMNACANAAAAHgAgBwAAtwoAIBEAALkKACAUAAC6CgAgMwAAsw0AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIc0EAQDMBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6AQBAMwHACELBwAAtwoAIBEAALkKACAUAAC6CgAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhzQQBAMwHACHQBAEAzAcAIdEEAQDMBwAh1AQgAKsJACHoBAEAzAcAIRYEAADUDAAgBQAA1QwAIAYAANYMACAUAADbDAAgHwAA3QwAICEAAN4MACAiAADfDAAgKQAA2AwAICoAANkMACArAADaDAAgLAAA3AwAIC0AAOAMACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGGBAEAAAAB0AQBAAAAAdQEIAAAAAHoBAEAAAAB8wQAAACLBQKJBQEAAAABiwWAAAAAAQIAAAABACA6AAC0DQAgEQoAALAKACANAACyCgAgEQAAswoAINkDAQAAAAHgA0AAAAAB_QNAAAAAAcoEAgAAAAHMBAEAAAAB0AQBAAAAAeAEAAAA4AQC4QQCAAAAAeIEAgAAAAHjBAEAAAAB5ARAAAAAAeUEQAAAAAHmBEAAAAAB5wRAAAAAAQIAAAAiACA6AAC2DQAgAwAAABwAIDoAALQNACA7AAC6DQAgGAAAABwAIAQAAMkLACAFAADKCwAgBgAAywsAIBQAANALACAfAADSCwAgIQAA0wsAICIAANQLACApAADNCwAgKgAAzgsAICsAAM8LACAsAADRCwAgLQAA1QsAIDMAALoNACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGGBAEAzQcAIdAEAQDMBwAh1AQgAKsJACHoBAEAzAcAIfMEAADIC4sFIokFAQDMBwAhiwWAAAAAARYEAADJCwAgBQAAygsAIAYAAMsLACAUAADQCwAgHwAA0gsAICEAANMLACAiAADUCwAgKQAAzQsAICoAAM4LACArAADPCwAgLAAA0QsAIC0AANULACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGGBAEAzQcAIdAEAQDMBwAh1AQgAKsJACHoBAEAzAcAIfMEAADIC4sFIokFAQDMBwAhiwWAAAAAAQMAAAAgACA6AAC2DQAgOwAAvQ0AIBMAAAAgACAKAACICgAgDQAAigoAIBEAAIsKACAzAAC9DQAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhygQCANcHACHMBAEAzAcAIdAEAQDMBwAh4AQAAIcK4AQi4QQCANcHACHiBAIAqgkAIeMEAQDMBwAh5ARAAM4HACHlBEAAzgcAIeYEQADZBwAh5wRAANkHACERCgAAiAoAIA0AAIoKACARAACLCgAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhygQCANcHACHMBAEAzAcAIdAEAQDMBwAh4AQAAIcK4AQi4QQCANcHACHiBAIAqgkAIeMEAQDMBwAh5ARAAM4HACHlBEAAzgcAIeYEQADZBwAh5wRAANkHACERCgAAsAoAIAwAALEKACARAACzCgAg2QMBAAAAAeADQAAAAAH9A0AAAAABygQCAAAAAcwEAQAAAAHQBAEAAAAB4AQAAADgBALhBAIAAAAB4gQCAAAAAeMEAQAAAAHkBEAAAAAB5QRAAAAAAeYEQAAAAAHnBEAAAAABAgAAACIAIDoAAL4NACADAAAAIAAgOgAAvg0AIDsAAMINACATAAAAIAAgCgAAiAoAIAwAAIkKACARAACLCgAgMwAAwg0AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIcoEAgDXBwAhzAQBAMwHACHQBAEAzAcAIeAEAACHCuAEIuEEAgDXBwAh4gQCAKoJACHjBAEAzAcAIeQEQADOBwAh5QRAAM4HACHmBEAA2QcAIecEQADZBwAhEQoAAIgKACAMAACJCgAgEQAAiwoAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIcoEAgDXBwAhzAQBAMwHACHQBAEAzAcAIeAEAACHCuAEIuEEAgDXBwAh4gQCAKoJACHjBAEAzAcAIeQEQADOBwAh5QRAAM4HACHmBEAA2QcAIecEQADZBwAhFgQAANQMACAFAADVDAAgBgAA1gwAIBQAANsMACAfAADdDAAgIQAA3gwAICIAAN8MACAoAADXDAAgKQAA2AwAICoAANkMACAsAADcDAAgLQAA4AwAINkDAQAAAAHgA0AAAAAB_QNAAAAAAYYEAQAAAAHQBAEAAAAB1AQgAAAAAegEAQAAAAHzBAAAAIsFAokFAQAAAAGLBYAAAAABAgAAAAEAIDoAAMMNACAWBAAA1AwAIAUAANUMACAGAADWDAAgFAAA2wwAIB8AAN0MACAhAADeDAAgIgAA3wwAICgAANcMACApAADYDAAgKwAA2gwAICwAANwMACAtAADgDAAg2QMBAAAAAeADQAAAAAH9A0AAAAABhgQBAAAAAdAEAQAAAAHUBCAAAAAB6AQBAAAAAfMEAAAAiwUCiQUBAAAAAYsFgAAAAAECAAAAAQAgOgAAxQ0AIBYEAADUDAAgBQAA1QwAIAYAANYMACAUAADbDAAgHwAA3QwAICEAAN4MACAiAADfDAAgKAAA1wwAICoAANkMACArAADaDAAgLAAA3AwAIC0AAOAMACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGGBAEAAAAB0AQBAAAAAdQEIAAAAAHoBAEAAAAB8wQAAACLBQKJBQEAAAABiwWAAAAAAQIAAAABACA6AADHDQAgEQoAALAKACAMAACxCgAgDQAAsgoAINkDAQAAAAHgA0AAAAAB_QNAAAAAAcoEAgAAAAHMBAEAAAAB0AQBAAAAAeAEAAAA4AQC4QQCAAAAAeIEAgAAAAHjBAEAAAAB5ARAAAAAAeUEQAAAAAHmBEAAAAAB5wRAAAAAAQIAAAAiACA6AADJDQAgCwcAANkKACATAADaCgAgFAAA3AoAINkDAQAAAAHgA0AAAAAB_QNAAAAAAc0EAQAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHoBAEAAAABAgAAAG4AIDoAAMsNACADAAAAHAAgOgAAww0AIDsAAM8NACAYAAAAHAAgBAAAyQsAIAUAAMoLACAGAADLCwAgFAAA0AsAIB8AANILACAhAADTCwAgIgAA1AsAICgAAMwLACApAADNCwAgKgAAzgsAICwAANELACAtAADVCwAgMwAAzw0AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABFgQAAMkLACAFAADKCwAgBgAAywsAIBQAANALACAfAADSCwAgIQAA0wsAICIAANQLACAoAADMCwAgKQAAzQsAICoAAM4LACAsAADRCwAgLQAA1QsAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABAwAAABwAIDoAAMUNACA7AADSDQAgGAAAABwAIAQAAMkLACAFAADKCwAgBgAAywsAIBQAANALACAfAADSCwAgIQAA0wsAICIAANQLACAoAADMCwAgKQAAzQsAICsAAM8LACAsAADRCwAgLQAA1QsAIDMAANINACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGGBAEAzQcAIdAEAQDMBwAh1AQgAKsJACHoBAEAzAcAIfMEAADIC4sFIokFAQDMBwAhiwWAAAAAARYEAADJCwAgBQAAygsAIAYAAMsLACAUAADQCwAgHwAA0gsAICEAANMLACAiAADUCwAgKAAAzAsAICkAAM0LACArAADPCwAgLAAA0QsAIC0AANULACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGGBAEAzQcAIdAEAQDMBwAh1AQgAKsJACHoBAEAzAcAIfMEAADIC4sFIokFAQDMBwAhiwWAAAAAAQMAAAAcACA6AADHDQAgOwAA1Q0AIBgAAAAcACAEAADJCwAgBQAAygsAIAYAAMsLACAUAADQCwAgHwAA0gsAICEAANMLACAiAADUCwAgKAAAzAsAICoAAM4LACArAADPCwAgLAAA0QsAIC0AANULACAzAADVDQAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhhgQBAM0HACHQBAEAzAcAIdQEIACrCQAh6AQBAMwHACHzBAAAyAuLBSKJBQEAzAcAIYsFgAAAAAEWBAAAyQsAIAUAAMoLACAGAADLCwAgFAAA0AsAIB8AANILACAhAADTCwAgIgAA1AsAICgAAMwLACAqAADOCwAgKwAAzwsAICwAANELACAtAADVCwAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhhgQBAM0HACHQBAEAzAcAIdQEIACrCQAh6AQBAMwHACHzBAAAyAuLBSKJBQEAzAcAIYsFgAAAAAEDAAAAIAAgOgAAyQ0AIDsAANgNACATAAAAIAAgCgAAiAoAIAwAAIkKACANAACKCgAgMwAA2A0AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIcoEAgDXBwAhzAQBAMwHACHQBAEAzAcAIeAEAACHCuAEIuEEAgDXBwAh4gQCAKoJACHjBAEAzAcAIeQEQADOBwAh5QRAAM4HACHmBEAA2QcAIecEQADZBwAhEQoAAIgKACAMAACJCgAgDQAAigoAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIcoEAgDXBwAhzAQBAMwHACHQBAEAzAcAIeAEAACHCuAEIuEEAgDXBwAh4gQCAKoJACHjBAEAzAcAIeQEQADOBwAh5QRAAM4HACHmBEAA2QcAIecEQADZBwAhAwAAAB4AIDoAAMsNACA7AADbDQAgDQAAAB4AIAcAALcKACATAAC4CgAgFAAAugoAIDMAANsNACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACHNBAEAzAcAIdAEAQDMBwAh0QQBAMwHACHUBCAAqwkAIegEAQDMBwAhCwcAALcKACATAAC4CgAgFAAAugoAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIc0EAQDMBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6AQBAMwHACERBgAArAsAIBQAALALACAkAACtCwAgJgAArgsAINkDAQAAAAHgA0AAAAAB_QNAAAAAAZoEAQAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHoBAEAAAAB6gQBAAAAAfQEIAAAAAH1BCAAAAAB9gQCAAAAAfcEAQAAAAECAAAA8AEAIDoAANwNACAD2QMBAAAAAcoEAgAAAAHPBAIAAAABEQYAAKwLACAUAACwCwAgJgAArgsAICcAAK8LACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGaBAEAAAAB0AQBAAAAAdEEAQAAAAHUBCAAAAAB6AQBAAAAAeoEAQAAAAH0BCAAAAAB9QQgAAAAAfYEAgAAAAH3BAEAAAABAgAAAPABACA6AADfDQAgC9kDAQAAAAHgA0AAAAAB-AMAAADFBAL9A0AAAAABqgQBAAAAAa4EAAAArgQCsAQBAAAAAcUEgAAAAAHGBAIAAAABxwRAAAAAAcgEQAAAAAEa2QMBAAAAAeADQAAAAAH9A0AAAAABqAQCAAAAAaoEAQAAAAGsBAAAAKwEAq4EAAAArgQCrwQBAAAAAbAEAQAAAAGxBAEAAAABsgQBAAAAAbMEAQAAAAG0BAIAAAABtQQCAAAAAbYEQAAAAAG3BAIAAAABuARAAAAAAbkEAgAAAAG6BEAAAAABuwRAAAAAAbwEAQAAAAG9BAEAAAABvgRAAAAAAb8EQAAAAAHABEAAAAABwQQCAAAAAQMAAAA7ACA6AADfDQAgOwAA5Q0AIBMAAAA7ACAGAADxCgAgFAAA9QoAICYAAPMKACAnAAD0CgAgMwAA5Q0AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIZoEAQDNBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6AQBAMwHACHqBAEAzQcAIfQEIACrCQAh9QQgAKsJACH2BAIA1wcAIfcEAQDMBwAhEQYAAPEKACAUAAD1CgAgJgAA8woAICcAAPQKACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGaBAEAzQcAIdAEAQDMBwAh0QQBAMwHACHUBCAAqwkAIegEAQDMBwAh6gQBAM0HACH0BCAAqwkAIfUEIACrCQAh9gQCANcHACH3BAEAzAcAIRDZAwEAAAAB4ANAAAAAAf0DQAAAAAGaBAEAAAABzQQBAAAAAdAEAQAAAAHRBAEAAAAB1AQgAAAAAeoEAQAAAAHrBAEAAAAB7AQBAAAAAe0EAQAAAAHuBCAAAAAB7wQgAAAAAfAEAgAAAAHxBIAAAAABAwAAADsAIDoAANwNACA7AADpDQAgEwAAADsAIAYAAPEKACAUAAD1CgAgJAAA8goAICYAAPMKACAzAADpDQAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhmgQBAM0HACHQBAEAzAcAIdEEAQDMBwAh1AQgAKsJACHoBAEAzAcAIeoEAQDNBwAh9AQgAKsJACH1BCAAqwkAIfYEAgDXBwAh9wQBAMwHACERBgAA8QoAIBQAAPUKACAkAADyCgAgJgAA8woAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIZoEAQDNBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6AQBAMwHACHqBAEAzQcAIfQEIACrCQAh9QQgAKsJACH2BAIA1wcAIfcEAQDMBwAhCwcAAOIJACAkAADkCQAg2QMBAAAAAeADQAAAAAH9A0AAAAABzQQBAAAAAdAEAQAAAAHRBAEAAAAB0gQCAAAAAdMEAgAAAAHUBCAAAAABAgAAAHIAIDoAAOoNACAF2QMBAAAAAcoEAgAAAAHLBAEAAAABzAQBAAAAAc0EAQAAAAEa2QMBAAAAAeADQAAAAAH9A0AAAAABqAQCAAAAAakEAQAAAAGqBAEAAAABrAQAAACsBAKuBAAAAK4EAq8EAQAAAAGwBAEAAAABsQQBAAAAAbIEAQAAAAG0BAIAAAABtQQCAAAAAbYEQAAAAAG3BAIAAAABuARAAAAAAbkEAgAAAAG6BEAAAAABuwRAAAAAAbwEAQAAAAG9BAEAAAABvgRAAAAAAb8EQAAAAAHABEAAAAABwQQCAAAAAQMAAABwACA6AADqDQAgOwAA8A0AIA0AAABwACAHAACsCQAgJAAArgkAIDMAAPANACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACHNBAEAzAcAIdAEAQDMBwAh0QQBAMwHACHSBAIA1wcAIdMEAgCqCQAh1AQgAKsJACELBwAArAkAICQAAK4JACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACHNBAEAzAcAIdAEAQDMBwAh0QQBAMwHACHSBAIA1wcAIdMEAgCqCQAh1AQgAKsJACERBgAArAsAICQAAK0LACAmAACuCwAgJwAArwsAINkDAQAAAAHgA0AAAAAB_QNAAAAAAZoEAQAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHoBAEAAAAB6gQBAAAAAfQEIAAAAAH1BCAAAAAB9gQCAAAAAfcEAQAAAAECAAAA8AEAIDoAAPENACALBwAA2QoAIBEAANsKACATAADaCgAg2QMBAAAAAeADQAAAAAH9A0AAAAABzQQBAAAAAdAEAQAAAAHRBAEAAAAB1AQgAAAAAegEAQAAAAECAAAAbgAgOgAA8w0AIBYEAADUDAAgBQAA1QwAIAYAANYMACAfAADdDAAgIQAA3gwAICIAAN8MACAoAADXDAAgKQAA2AwAICoAANkMACArAADaDAAgLAAA3AwAIC0AAOAMACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGGBAEAAAAB0AQBAAAAAdQEIAAAAAHoBAEAAAAB8wQAAACLBQKJBQEAAAABiwWAAAAAAQIAAAABACA6AAD1DQAgBggAAKIJACAcAACkCQAg2QMBAAAAAcoEAgAAAAHOBAEAAAABzwQCAAAAAQIAAAAWACA6AAD3DQAgAwAAADsAIDoAAPENACA7AAD7DQAgEwAAADsAIAYAAPEKACAkAADyCgAgJgAA8woAICcAAPQKACAzAAD7DQAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhmgQBAM0HACHQBAEAzAcAIdEEAQDMBwAh1AQgAKsJACHoBAEAzAcAIeoEAQDNBwAh9AQgAKsJACH1BCAAqwkAIfYEAgDXBwAh9wQBAMwHACERBgAA8QoAICQAAPIKACAmAADzCgAgJwAA9AoAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIZoEAQDNBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6AQBAMwHACHqBAEAzQcAIfQEIACrCQAh9QQgAKsJACH2BAIA1wcAIfcEAQDMBwAhAwAAAB4AIDoAAPMNACA7AAD-DQAgDQAAAB4AIAcAALcKACARAAC5CgAgEwAAuAoAIDMAAP4NACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACHNBAEAzAcAIdAEAQDMBwAh0QQBAMwHACHUBCAAqwkAIegEAQDMBwAhCwcAALcKACARAAC5CgAgEwAAuAoAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIc0EAQDMBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6AQBAMwHACEDAAAAHAAgOgAA9Q0AIDsAAIEOACAYAAAAHAAgBAAAyQsAIAUAAMoLACAGAADLCwAgHwAA0gsAICEAANMLACAiAADUCwAgKAAAzAsAICkAAM0LACAqAADOCwAgKwAAzwsAICwAANELACAtAADVCwAgMwAAgQ4AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABFgQAAMkLACAFAADKCwAgBgAAywsAIB8AANILACAhAADTCwAgIgAA1AsAICgAAMwLACApAADNCwAgKgAAzgsAICsAAM8LACAsAADRCwAgLQAA1QsAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABAwAAABQAIDoAAPcNACA7AACEDgAgCAAAABQAIAgAAIcJACAcAACJCQAgMwAAhA4AINkDAQDMBwAhygQCANcHACHOBAEAzAcAIc8EAgDXBwAhBggAAIcJACAcAACJCQAg2QMBAMwHACHKBAIA1wcAIc4EAQDMBwAhzwQCANcHACEUBwAA0wkAIBwAANUJACAlAADjCgAg2QMBAAAAAeADQAAAAAH9A0AAAAABmgQBAAAAAc0EAQAAAAHQBAEAAAAB0QQBAAAAAdQEIAAAAAHpBAEAAAAB6gQBAAAAAesEAQAAAAHsBAEAAAAB7QQBAAAAAe4EIAAAAAHvBCAAAAAB8AQCAAAAAfEEgAAAAAECAAAAEgAgOgAAhQ4AIAbZAwEAAAAB2wMAAADDBALfAwEAAAAB_wOAAAAAAYoEQAAAAAHDBAEAAAABAowEAQAAAAGnBEAAAAABAwAAABAAIDoAAIUOACA7AACLDgAgFgAAABAAIAcAALoJACAcAAC8CQAgJQAA4goAIDMAAIsOACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGaBAEAzQcAIc0EAQDMBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6QQBAMwHACHqBAEAzQcAIesEAQDMBwAh7AQBAMwHACHtBAEAzQcAIe4EIACrCQAh7wQgAKsJACHwBAIAqgkAIfEEgAAAAAEUBwAAugkAIBwAALwJACAlAADiCgAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhmgQBAM0HACHNBAEAzAcAIdAEAQDMBwAh0QQBAMwHACHUBCAAqwkAIekEAQDMBwAh6gQBAM0HACHrBAEAzAcAIewEAQDMBwAh7QQBAM0HACHuBCAAqwkAIe8EIACrCQAh8AQCAKoJACHxBIAAAAABDhYAAPIIACAcAAD0CAAg2QMBAAAAAeADQAAAAAH4AwAAAMUEAv0DQAAAAAGpBAEAAAABqgQBAAAAAa4EAAAArgQCsAQBAAAAAcUEgAAAAAHGBAIAAAABxwRAAAAAAcgEQAAAAAECAAAAaAAgOgAAjA4AIAMAAABmACA6AACMDgAgOwAAkA4AIBAAAABmACAWAADaCAAgHAAA3AgAIDMAAJAOACDZAwEAzAcAIeADQADOBwAh-AMAANkIxQQi_QNAAM4HACGpBAEAzAcAIaoEAQDMBwAhrgQAAI8IrgQisAQBAMwHACHFBIAAAAABxgQCANcHACHHBEAAzgcAIcgEQADOBwAhDhYAANoIACAcAADcCAAg2QMBAMwHACHgA0AAzgcAIfgDAADZCMUEIv0DQADOBwAhqQQBAMwHACGqBAEAzAcAIa4EAACPCK4EIrAEAQDMBwAhxQSAAAAAAcYEAgDXBwAhxwRAAM4HACHIBEAAzgcAIQYIAACiCQAgFQAAowkAINkDAQAAAAHKBAIAAAABzgQBAAAAAc8EAgAAAAECAAAAFgAgOgAAkQ4AIBYEAADUDAAgBQAA1QwAIAYAANYMACAUAADbDAAgHwAA3QwAICEAAN4MACAiAADfDAAgKAAA1wwAICkAANgMACAqAADZDAAgKwAA2gwAIC0AAOAMACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGGBAEAAAAB0AQBAAAAAdQEIAAAAAHoBAEAAAAB8wQAAACLBQKJBQEAAAABiwWAAAAAAQIAAAABACA6AACTDgAgFAcAANMJACAdAADUCQAgJQAA4woAINkDAQAAAAHgA0AAAAAB_QNAAAAAAZoEAQAAAAHNBAEAAAAB0AQBAAAAAdEEAQAAAAHUBCAAAAAB6QQBAAAAAeoEAQAAAAHrBAEAAAAB7AQBAAAAAe0EAQAAAAHuBCAAAAAB7wQgAAAAAfAEAgAAAAHxBIAAAAABAgAAABIAIDoAAJUOACACpgQBAAAAAacEQAAAAAEJ2QMBAAAAAdoDAQAAAAHgA0AAAAAB_gMBAAAAAYYEAQAAAAGhBAAAAKEEAqMEAAAAowQCpAQBAAAAAaUEgAAAAAER2QMBAAAAAeADQAAAAAH4AwAAAJgEAv0DQAAAAAH-AwEAAAABiQQBAAAAAY0EAQAAAAGVBAAAAJUEApYEAQAAAAGYBAIAAAABmQQBAAAAAZoEAQAAAAGbBAEAAAABnAQBAAAAAZ0EQAAAAAGeBEAAAAABnwRAAAAAAQnZAwEAAAAB4ANAAAAAAf0DQAAAAAGNBAEAAAABjwQAAACPBAKQBAEAAAABkQQBAAAAAZIEAQAAAAGTBAIAAAABAwAAABQAIDoAAJEOACA7AACdDgAgCAAAABQAIAgAAIcJACAVAACICQAgMwAAnQ4AINkDAQDMBwAhygQCANcHACHOBAEAzAcAIc8EAgDXBwAhBggAAIcJACAVAACICQAg2QMBAMwHACHKBAIA1wcAIc4EAQDMBwAhzwQCANcHACEDAAAAHAAgOgAAkw4AIDsAAKAOACAYAAAAHAAgBAAAyQsAIAUAAMoLACAGAADLCwAgFAAA0AsAIB8AANILACAhAADTCwAgIgAA1AsAICgAAMwLACApAADNCwAgKgAAzgsAICsAAM8LACAtAADVCwAgMwAAoA4AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABFgQAAMkLACAFAADKCwAgBgAAywsAIBQAANALACAfAADSCwAgIQAA0wsAICIAANQLACAoAADMCwAgKQAAzQsAICoAAM4LACArAADPCwAgLQAA1QsAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABAwAAABAAIDoAAJUOACA7AACjDgAgFgAAABAAIAcAALoJACAdAAC7CQAgJQAA4goAIDMAAKMOACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGaBAEAzQcAIc0EAQDMBwAh0AQBAMwHACHRBAEAzAcAIdQEIACrCQAh6QQBAMwHACHqBAEAzQcAIesEAQDMBwAh7AQBAMwHACHtBAEAzQcAIe4EIACrCQAh7wQgAKsJACHwBAIAqgkAIfEEgAAAAAEUBwAAugkAIB0AALsJACAlAADiCgAg2QMBAMwHACHgA0AAzgcAIf0DQADOBwAhmgQBAM0HACHNBAEAzAcAIdAEAQDMBwAh0QQBAMwHACHUBCAAqwkAIekEAQDMBwAh6gQBAM0HACHrBAEAzAcAIewEAQDMBwAh7QQBAM0HACHuBCAAqwkAIe8EIACrCQAh8AQCAKoJACHxBIAAAAABDhYAAPIIACAbAADzCAAg2QMBAAAAAeADQAAAAAH4AwAAAMUEAv0DQAAAAAGpBAEAAAABqgQBAAAAAa4EAAAArgQCsAQBAAAAAcUEgAAAAAHGBAIAAAABxwRAAAAAAcgEQAAAAAECAAAAaAAgOgAApA4AICEWAADHCAAgFwAAyAgAIBgAAMkIACAfAADLCAAgIQAAzAgAICIAAM0IACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGoBAIAAAABqQQBAAAAAaoEAQAAAAGsBAAAAKwEAq4EAAAArgQCrwQBAAAAAbAEAQAAAAGxBAEAAAABsgQBAAAAAbMEAQAAAAG0BAIAAAABtQQCAAAAAbYEQAAAAAG3BAIAAAABuARAAAAAAbkEAgAAAAG6BEAAAAABuwRAAAAAAbwEAQAAAAG9BAEAAAABvgRAAAAAAb8EQAAAAAHABEAAAAABwQQCAAAAAQIAAAA_ACA6AACmDgAgAwAAAGYAIDoAAKQOACA7AACqDgAgEAAAAGYAIBYAANoIACAbAADbCAAgMwAAqg4AINkDAQDMBwAh4ANAAM4HACH4AwAA2QjFBCL9A0AAzgcAIakEAQDMBwAhqgQBAMwHACGuBAAAjwiuBCKwBAEAzAcAIcUEgAAAAAHGBAIA1wcAIccEQADOBwAhyARAAM4HACEOFgAA2ggAIBsAANsIACDZAwEAzAcAIeADQADOBwAh-AMAANkIxQQi_QNAAM4HACGpBAEAzAcAIaoEAQDMBwAhrgQAAI8IrgQisAQBAMwHACHFBIAAAAABxgQCANcHACHHBEAAzgcAIcgEQADOBwAhAwAAAD0AIDoAAKYOACA7AACtDgAgIwAAAD0AIBYAAJAIACAXAACRCAAgGAAAkggAIB8AAJQIACAhAACVCAAgIgAAlggAIDMAAK0OACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGoBAIA1wcAIakEAQDMBwAhqgQBAMwHACGsBAAAjgisBCKuBAAAjwiuBCKvBAEAzAcAIbAEAQDMBwAhsQQBAM0HACGyBAEAzQcAIbMEAQDNBwAhtAQCANcHACG1BAIA1wcAIbYEQADZBwAhtwQCANcHACG4BEAA2QcAIbkEAgDXBwAhugRAANkHACG7BEAA2QcAIbwEAQDNBwAhvQQBAM0HACG-BEAAzgcAIb8EQADZBwAhwARAANkHACHBBAIA1wcAISEWAACQCAAgFwAAkQgAIBgAAJIIACAfAACUCAAgIQAAlQgAICIAAJYIACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGoBAIA1wcAIakEAQDMBwAhqgQBAMwHACGsBAAAjgisBCKuBAAAjwiuBCKvBAEAzAcAIbAEAQDMBwAhsQQBAM0HACGyBAEAzQcAIbMEAQDNBwAhtAQCANcHACG1BAIA1wcAIbYEQADZBwAhtwQCANcHACG4BEAA2QcAIbkEAgDXBwAhugRAANkHACG7BEAA2QcAIbwEAQDNBwAhvQQBAM0HACG-BEAAzgcAIb8EQADZBwAhwARAANkHACHBBAIA1wcAIRYEAADUDAAgBQAA1QwAIAYAANYMACAUAADbDAAgIQAA3gwAICIAAN8MACAoAADXDAAgKQAA2AwAICoAANkMACArAADaDAAgLAAA3AwAIC0AAOAMACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGGBAEAAAAB0AQBAAAAAdQEIAAAAAHoBAEAAAAB8wQAAACLBQKJBQEAAAABiwWAAAAAAQIAAAABACA6AACuDgAgIRYAAMcIACAXAADICAAgGAAAyQgAIB0AAMoIACAhAADMCAAgIgAAzQgAINkDAQAAAAHgA0AAAAAB_QNAAAAAAagEAgAAAAGpBAEAAAABqgQBAAAAAawEAAAArAQCrgQAAACuBAKvBAEAAAABsAQBAAAAAbEEAQAAAAGyBAEAAAABswQBAAAAAbQEAgAAAAG1BAIAAAABtgRAAAAAAbcEAgAAAAG4BEAAAAABuQQCAAAAAboEQAAAAAG7BEAAAAABvAQBAAAAAb0EAQAAAAG-BEAAAAABvwRAAAAAAcAEQAAAAAHBBAIAAAABAgAAAD8AIDoAALAOACADAAAAHAAgOgAArg4AIDsAALQOACAYAAAAHAAgBAAAyQsAIAUAAMoLACAGAADLCwAgFAAA0AsAICEAANMLACAiAADUCwAgKAAAzAsAICkAAM0LACAqAADOCwAgKwAAzwsAICwAANELACAtAADVCwAgMwAAtA4AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABFgQAAMkLACAFAADKCwAgBgAAywsAIBQAANALACAhAADTCwAgIgAA1AsAICgAAMwLACApAADNCwAgKgAAzgsAICsAAM8LACAsAADRCwAgLQAA1QsAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABAwAAAD0AIDoAALAOACA7AAC3DgAgIwAAAD0AIBYAAJAIACAXAACRCAAgGAAAkggAIB0AAJMIACAhAACVCAAgIgAAlggAIDMAALcOACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGoBAIA1wcAIakEAQDMBwAhqgQBAMwHACGsBAAAjgisBCKuBAAAjwiuBCKvBAEAzAcAIbAEAQDMBwAhsQQBAM0HACGyBAEAzQcAIbMEAQDNBwAhtAQCANcHACG1BAIA1wcAIbYEQADZBwAhtwQCANcHACG4BEAA2QcAIbkEAgDXBwAhugRAANkHACG7BEAA2QcAIbwEAQDNBwAhvQQBAM0HACG-BEAAzgcAIb8EQADZBwAhwARAANkHACHBBAIA1wcAISEWAACQCAAgFwAAkQgAIBgAAJIIACAdAACTCAAgIQAAlQgAICIAAJYIACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGoBAIA1wcAIakEAQDMBwAhqgQBAMwHACGsBAAAjgisBCKuBAAAjwiuBCKvBAEAzAcAIbAEAQDMBwAhsQQBAM0HACGyBAEAzQcAIbMEAQDNBwAhtAQCANcHACG1BAIA1wcAIbYEQADZBwAhtwQCANcHACG4BEAA2QcAIbkEAgDXBwAhugRAANkHACG7BEAA2QcAIbwEAQDNBwAhvQQBAM0HACG-BEAAzgcAIb8EQADZBwAhwARAANkHACHBBAIA1wcAIRYEAADUDAAgBQAA1QwAIAYAANYMACAUAADbDAAgHwAA3QwAICIAAN8MACAoAADXDAAgKQAA2AwAICoAANkMACArAADaDAAgLAAA3AwAIC0AAOAMACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGGBAEAAAAB0AQBAAAAAdQEIAAAAAHoBAEAAAAB8wQAAACLBQKJBQEAAAABiwWAAAAAAQIAAAABACA6AAC4DgAgIRYAAMcIACAXAADICAAgGAAAyQgAIB0AAMoIACAfAADLCAAgIgAAzQgAINkDAQAAAAHgA0AAAAAB_QNAAAAAAagEAgAAAAGpBAEAAAABqgQBAAAAAawEAAAArAQCrgQAAACuBAKvBAEAAAABsAQBAAAAAbEEAQAAAAGyBAEAAAABswQBAAAAAbQEAgAAAAG1BAIAAAABtgRAAAAAAbcEAgAAAAG4BEAAAAABuQQCAAAAAboEQAAAAAG7BEAAAAABvAQBAAAAAb0EAQAAAAG-BEAAAAABvwRAAAAAAcAEQAAAAAHBBAIAAAABAgAAAD8AIDoAALoOACADAAAAHAAgOgAAuA4AIDsAAL4OACAYAAAAHAAgBAAAyQsAIAUAAMoLACAGAADLCwAgFAAA0AsAIB8AANILACAiAADUCwAgKAAAzAsAICkAAM0LACAqAADOCwAgKwAAzwsAICwAANELACAtAADVCwAgMwAAvg4AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABFgQAAMkLACAFAADKCwAgBgAAywsAIBQAANALACAfAADSCwAgIgAA1AsAICgAAMwLACApAADNCwAgKgAAzgsAICsAAM8LACAsAADRCwAgLQAA1QsAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABAwAAAD0AIDoAALoOACA7AADBDgAgIwAAAD0AIBYAAJAIACAXAACRCAAgGAAAkggAIB0AAJMIACAfAACUCAAgIgAAlggAIDMAAMEOACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGoBAIA1wcAIakEAQDMBwAhqgQBAMwHACGsBAAAjgisBCKuBAAAjwiuBCKvBAEAzAcAIbAEAQDMBwAhsQQBAM0HACGyBAEAzQcAIbMEAQDNBwAhtAQCANcHACG1BAIA1wcAIbYEQADZBwAhtwQCANcHACG4BEAA2QcAIbkEAgDXBwAhugRAANkHACG7BEAA2QcAIbwEAQDNBwAhvQQBAM0HACG-BEAAzgcAIb8EQADZBwAhwARAANkHACHBBAIA1wcAISEWAACQCAAgFwAAkQgAIBgAAJIIACAdAACTCAAgHwAAlAgAICIAAJYIACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGoBAIA1wcAIakEAQDMBwAhqgQBAMwHACGsBAAAjgisBCKuBAAAjwiuBCKvBAEAzAcAIbAEAQDMBwAhsQQBAM0HACGyBAEAzQcAIbMEAQDNBwAhtAQCANcHACG1BAIA1wcAIbYEQADZBwAhtwQCANcHACG4BEAA2QcAIbkEAgDXBwAhugRAANkHACG7BEAA2QcAIbwEAQDNBwAhvQQBAM0HACG-BEAAzgcAIb8EQADZBwAhwARAANkHACHBBAIA1wcAIRYEAADUDAAgBQAA1QwAIAYAANYMACAUAADbDAAgHwAA3QwAICEAAN4MACAoAADXDAAgKQAA2AwAICoAANkMACArAADaDAAgLAAA3AwAIC0AAOAMACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGGBAEAAAAB0AQBAAAAAdQEIAAAAAHoBAEAAAAB8wQAAACLBQKJBQEAAAABiwWAAAAAAQIAAAABACA6AADCDgAgIRYAAMcIACAXAADICAAgGAAAyQgAIB0AAMoIACAfAADLCAAgIQAAzAgAINkDAQAAAAHgA0AAAAAB_QNAAAAAAagEAgAAAAGpBAEAAAABqgQBAAAAAawEAAAArAQCrgQAAACuBAKvBAEAAAABsAQBAAAAAbEEAQAAAAGyBAEAAAABswQBAAAAAbQEAgAAAAG1BAIAAAABtgRAAAAAAbcEAgAAAAG4BEAAAAABuQQCAAAAAboEQAAAAAG7BEAAAAABvAQBAAAAAb0EAQAAAAG-BEAAAAABvwRAAAAAAcAEQAAAAAHBBAIAAAABAgAAAD8AIDoAAMQOACADAAAAHAAgOgAAwg4AIDsAAMgOACAYAAAAHAAgBAAAyQsAIAUAAMoLACAGAADLCwAgFAAA0AsAIB8AANILACAhAADTCwAgKAAAzAsAICkAAM0LACAqAADOCwAgKwAAzwsAICwAANELACAtAADVCwAgMwAAyA4AINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABFgQAAMkLACAFAADKCwAgBgAAywsAIBQAANALACAfAADSCwAgIQAA0wsAICgAAMwLACApAADNCwAgKgAAzgsAICsAAM8LACAsAADRCwAgLQAA1QsAINkDAQDMBwAh4ANAAM4HACH9A0AAzgcAIYYEAQDNBwAh0AQBAMwHACHUBCAAqwkAIegEAQDMBwAh8wQAAMgLiwUiiQUBAMwHACGLBYAAAAABAwAAAD0AIDoAAMQOACA7AADLDgAgIwAAAD0AIBYAAJAIACAXAACRCAAgGAAAkggAIB0AAJMIACAfAACUCAAgIQAAlQgAIDMAAMsOACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGoBAIA1wcAIakEAQDMBwAhqgQBAMwHACGsBAAAjgisBCKuBAAAjwiuBCKvBAEAzAcAIbAEAQDMBwAhsQQBAM0HACGyBAEAzQcAIbMEAQDNBwAhtAQCANcHACG1BAIA1wcAIbYEQADZBwAhtwQCANcHACG4BEAA2QcAIbkEAgDXBwAhugRAANkHACG7BEAA2QcAIbwEAQDNBwAhvQQBAM0HACG-BEAAzgcAIb8EQADZBwAhwARAANkHACHBBAIA1wcAISEWAACQCAAgFwAAkQgAIBgAAJIIACAdAACTCAAgHwAAlAgAICEAAJUIACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGoBAIA1wcAIakEAQDMBwAhqgQBAMwHACGsBAAAjgisBCKuBAAAjwiuBCKvBAEAzAcAIbAEAQDMBwAhsQQBAM0HACGyBAEAzQcAIbMEAQDNBwAhtAQCANcHACG1BAIA1wcAIbYEQADZBwAhtwQCANcHACG4BEAA2QcAIbkEAgDXBwAhugRAANkHACG7BEAA2QcAIbwEAQDNBwAhvQQBAM0HACG-BEAAzgcAIb8EQADZBwAhwARAANkHACHBBAIA1wcAIRYEAADUDAAgBQAA1QwAIAYAANYMACAUAADbDAAgHwAA3QwAICEAAN4MACAiAADfDAAgKAAA1wwAICkAANgMACAqAADZDAAgKwAA2gwAICwAANwMACDZAwEAAAAB4ANAAAAAAf0DQAAAAAGGBAEAAAAB0AQBAAAAAdQEIAAAAAHoBAEAAAAB8wQAAACLBQKJBQEAAAABiwWAAAAAAQIAAAABACA6AADMDgAgAwAAABwAIDoAAMwOACA7AADQDgAgGAAAABwAIAQAAMkLACAFAADKCwAgBgAAywsAIBQAANALACAfAADSCwAgIQAA0wsAICIAANQLACAoAADMCwAgKQAAzQsAICoAAM4LACArAADPCwAgLAAA0QsAIDMAANAOACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGGBAEAzQcAIdAEAQDMBwAh1AQgAKsJACHoBAEAzAcAIfMEAADIC4sFIokFAQDMBwAhiwWAAAAAARYEAADJCwAgBQAAygsAIAYAAMsLACAUAADQCwAgHwAA0gsAICEAANMLACAiAADUCwAgKAAAzAsAICkAAM0LACAqAADOCwAgKwAAzwsAICwAANELACDZAwEAzAcAIeADQADOBwAh_QNAAM4HACGGBAEAzQcAIdAEAQDMBwAh1AQgAKsJACHoBAEAzAcAIfMEAADIC4sFIokFAQDMBwAhiwWAAAAAAQ4EBgIFCgMGDgQSAB8UfgkfgAEWIYEBFyKCARgoegwpew4qfA4rfQ4sfxEthgEeAQMAAQEDAAECAwABBwAFBgYPBBIAHRR0CSQTBiZvCidzBwUHAAUSABwcahEdaRMlAAcEBwAFEgAbIxcIJGMGBAgABxIAGhUbCRxAEQQDHQEHPAUJAAgKHwoFBwAFETYOEgAQEyMLFDcJBQoACgwnDA0rDREvDhIADwIDAAELAAsBCwALBQoACgswCw4AAQ8xARAyAQMMMwANNAARNQADETkAEzgAFDoACBIAGRYABhdBARhCCB1GEh9RFiFWFyJbGAIZABEaABMEEgAVFgAGG0oUHEsSARoAEwIbTAAcTQACGQARHlIBAhkAESBXAQIZABEgXAEEHV0AH14AIV8AImAAAhVhABxiAAIjZAAkZQACHGwAHWsABQZ1ABR5ACR2ACZ3ACd4AAEehwEBDQSIAQAFiQEABooBABSPAQAfkQEAIZIBACKTAQAoiwEAKYwBACqNAQArjgEALJABAC2UAQAAAAADEgAkQAAlQQAmAAAAAxIAJEAAJUEAJgEDAAEBAwABBRIAK0AALkEAL1IALFMALQAAAAAABRIAK0AALkEAL1IALFMALQEDAAEBAwABAxIANEAANUEANgAAAAMSADRAADVBADYAAAADEgA8QAA9QQA-AAAAAxIAPEAAPUEAPgAABRIAQ0AARkEAR1IARFMARQAAAAAABRIAQ0AARkEAR1IARFMARQIDAAEHAAUCAwABBwAFAxIATEAATUEATgAAAAMSAExAAE1BAE4CBwAFJQAHAgcABSUABwUSAFNAAFZBAFdSAFRTAFUAAAAAAAUSAFNAAFZBAFdSAFRTAFUBBwAFAQcABQMSAFxAAF1BAF4AAAADEgBcQABdQQBeAQoACgEKAAoFEgBjQABmQQBnUgBkUwBlAAAAAAAFEgBjQABmQQBnUgBkUwBlAgMAAQsACwIDAAELAAsFEgBsQABvQQBwUgBtUwBuAAAAAAAFEgBsQABvQQBwUgBtUwBuAQsACwELAAsFEgB1QAB4QQB5UgB2UwB3AAAAAAAFEgB1QAB4QQB5UgB2UwB3BQoACguWAwsOAAEPlwMBEJgDAQUKAAoLngMLDgABD58DARCgAwEDEgB-QAB_QQCAAQAAAAMSAH5AAH9BAIABAQcABQEHAAUFEgCFAUAAiAFBAIkBUgCGAVMAhwEAAAAAAAUSAIUBQACIAUEAiQFSAIYBUwCHAQEIAAcBCAAHBRIAjgFAAJEBQQCSAVIAjwFTAJABAAAAAAAFEgCOAUAAkQFBAJIBUgCPAVMAkAEEA94DAQfgAwUJAAgK3wMKBAPmAwEH6AMFCQAICucDCgUSAJcBQACaAUEAmwFSAJgBUwCZAQAAAAAABRIAlwFAAJoBQQCbAVIAmAFTAJkBARYABgEWAAYFEgCgAUAAowFBAKQBUgChAVMAogEAAAAAAAUSAKABQACjAUEApAFSAKEBUwCiAQEaABMBGgATAxIAqQFAAKoBQQCrAQAAAAMSAKkBQACqAUEAqwEDFgAGF6YEARinBAgDFgAGF60EARiuBAgFEgCwAUAAswFBALQBUgCxAVMAsgEAAAAAAAUSALABQACzAUEAtAFSALEBUwCyAQIZABEaABMCGQARGgATAxIAuQFAALoBQQC7AQAAAAMSALkBQAC6AUEAuwECGQARHtYEAQIZABEe3AQBAxIAwAFAAMEBQQDCAQAAAAMSAMABQADBAUEAwgECGQARIO4EAQIZABEg9AQBBRIAxwFAAMoBQQDLAVIAyAFTAMkBAAAAAAAFEgDHAUAAygFBAMsBUgDIAVMAyQECGQARIIYFAQIZABEgjAUBBRIA0AFAANMBQQDUAVIA0QFTANIBAAAAAAAFEgDQAUAA0wFBANQBUgDRAVMA0gEAAAADEgDaAUAA2wFBANwBAAAAAxIA2gFAANsBQQDcAQAAAAUSAOIBQADlAUEA5gFSAOMBUwDkAQAAAAAABRIA4gFAAOUBQQDmAVIA4wFTAOQBAAAABRIA7AFAAO8BQQDwAVIA7QFTAO4BAAAAAAAFEgDsAUAA7wFBAPABUgDtAVMA7gEBHukFAQEe7wUBAxIA9QFAAPYBQQD3AQAAAAMSAPUBQAD2AUEA9wEuAgEvlQEBMJcBATGYAQEymQEBNJsBATWdASA2ngEhN6ABATiiASA5owEiPKQBAT2lAQE-pgEgQqkBI0OqASdEqwECRawBAkatAQJHrgECSK8BAkmxAQJKswEgS7QBKEy2AQJNuAEgTrkBKU-6AQJQuwECUbwBIFS_ASpVwAEwVsEBA1fCAQNYwwEDWcQBA1rFAQNbxwEDXMkBIF3KATFezAEDX84BIGDPATJh0AEDYtEBA2PSASBk1QEzZdYBN2bYAThn2QE4aNwBOGndAThq3gE4a-ABOGziASBt4wE5buUBOG_nASBw6AE6cekBOHLqAThz6wEgdO4BO3XvAT928QEFd_IBBXj0AQV59QEFevYBBXv4AQV8-gEgffsBQH79AQV__wEggAGAAkGBAYECBYIBggIFgwGDAiCEAYYCQoUBhwJIhgGIAgSHAYkCBIgBigIEiQGLAgSKAYwCBIsBjgIEjAGQAiCNAZECSY4BkwIEjwGVAiCQAZYCSpEBlwIEkgGYAgSTAZkCIJQBnAJLlQGdAk-WAZ4CBpcBnwIGmAGgAgaZAaECBpoBogIGmwGkAgacAaYCIJ0BpwJQngGpAgafAasCIKABrAJRoQGtAgaiAa4CBqMBrwIgpAGyAlKlAbMCWKYBtAIKpwG1AgqoAbYCCqkBtwIKqgG4AgqrAboCCqwBvAIgrQG9AlmuAb8CCq8BwQIgsAHCAlqxAcMCCrIBxAIKswHFAiC0AcgCW7UByQJftgHKAgu3AcsCC7gBzAILuQHNAgu6Ac4CC7sB0AILvAHSAiC9AdMCYL4B1QILvwHXAiDAAdgCYcEB2QILwgHaAgvDAdsCIMQB3gJixQHfAmjGAeACDMcB4QIMyAHiAgzJAeMCDMoB5AIMywHmAgzMAegCIM0B6QJpzgHrAgzPAe0CINAB7gJq0QHvAgzSAfACDNMB8QIg1AH0AmvVAfUCcdYB9gIN1wH3Ag3YAfgCDdkB-QIN2gH6Ag3bAfwCDdwB_gIg3QH_AnLeAYEDDd8BgwMg4AGEA3PhAYUDDeIBhgMN4wGHAyDkAYoDdOUBiwN65gGMAw7nAY0DDugBjgMO6QGPAw7qAZADDusBkgMO7AGUAyDtAZUDe-4BmgMO7wGcAyDwAZ0DfPEBoQMO8gGiAw7zAaMDIPQBpgN99QGnA4EB9gGoAwf3AakDB_gBqgMH-QGrAwf6AawDB_sBrgMH_AGwAyD9AbEDggH-AbMDB_8BtQMggAK2A4MBgQK3AweCArgDB4MCuQMghAK8A4QBhQK9A4oBhgK-AwiHAr8DCIgCwAMIiQLBAwiKAsIDCIsCxAMIjALGAyCNAscDiwGOAskDCI8CywMgkALMA4wBkQLNAwiSAs4DCJMCzwMglALSA40BlQLTA5MBlgLUAwmXAtUDCZgC1gMJmQLXAwmaAtgDCZsC2gMJnALcAyCdAt0DlAGeAuIDCZ8C5AMgoALlA5UBoQLpAwmiAuoDCaMC6wMgpALuA5YBpQLvA5wBpgLwAxOnAvEDE6gC8gMTqQLzAxOqAvQDE6sC9gMTrAL4AyCtAvkDnQGuAvsDE68C_QMgsAL-A54BsQL_AxOyAoAEE7MCgQQgtAKEBJ8BtQKFBKUBtgKGBBS3AocEFLgCiAQUuQKJBBS6AooEFLsCjAQUvAKOBCC9Ao8EpgG-ApEEFL8CkwQgwAKUBKcBwQKVBBTCApYEFMMClwQgxAKaBKgBxQKbBKwBxgKcBBHHAp0EEcgCngQRyQKfBBHKAqAEEcsCogQRzAKkBCDNAqUErQHOAqkEEc8CqwQg0AKsBK4B0QKvBBHSArAEEdMCsQQg1AK0BK8B1QK1BLUB1gK2BBLXArcEEtgCuAQS2QK5BBLaAroEEtsCvAQS3AK-BCDdAr8EtgHeAsEEEt8CwwQg4ALEBLcB4QLFBBLiAsYEEuMCxwQg5ALKBLgB5QLLBLwB5gLMBBbnAs0EFugCzgQW6QLPBBbqAtAEFusC0gQW7ALUBCDtAtUEvQHuAtgEFu8C2gQg8ALbBL4B8QLdBBbyAt4EFvMC3wQg9ALiBL8B9QLjBMMB9gLkBBf3AuUEF_gC5gQX-QLnBBf6AugEF_sC6gQX_ALsBCD9Au0ExAH-AvAEF_8C8gQggAPzBMUBgQP1BBeCA_YEF4MD9wQghAP6BMYBhQP7BMwBhgP8BBiHA_0EGIgD_gQYiQP_BBiKA4AFGIsDggUYjAOEBSCNA4UFzQGOA4gFGI8DigUgkAOLBc4BkQONBRiSA44FGJMDjwUglAOSBc8BlQOTBdUBlgOVBdYBlwOWBdYBmAOZBdYBmQOaBdYBmgObBdYBmwOdBdYBnAOfBSCdA6AF1wGeA6IF1gGfA6QFIKADpQXYAaEDpgXWAaIDpwXWAaMDqAUgpAOrBdkBpQOsBd0BpgOuBd4BpwOvBd4BqAOyBd4BqQOzBd4BqgO0Bd4BqwO2Bd4BrAO4BSCtA7kF3wGuA7sF3gGvA70FILADvgXgAbEDvwXeAbIDwAXeAbMDwQUgtAPEBeEBtQPFBecBtgPHBegBtwPIBegBuAPLBegBuQPMBegBugPNBegBuwPPBegBvAPRBSC9A9IF6QG-A9QF6AG_A9YFIMAD1wXqAcED2AXoAcID2QXoAcMD2gUgxAPdBesBxQPeBfEBxgPfBR7HA-AFHsgD4QUeyQPiBR7KA-MFHssD5QUezAPnBSDNA-gF8gHOA-sFHs8D7QUg0APuBfMB0QPwBR7SA_EFHtMD8gUg1AP1BfQB1QP2BfgB"
};
async function decodeBase64AsWasm(wasmBase64) {
	const { Buffer } = await import("node:buffer");
	const wasmArray = Buffer.from(wasmBase64, "base64");
	return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
	getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
	getQueryCompilerWasmModule: async () => {
		const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
		return await decodeBase64AsWasm(wasm);
	},
	importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
	return runtime.getPrismaClient(config);
}
runtime.Extensions.getExtensionContext;
runtime.NullTypes.DbNull, runtime.NullTypes.JsonNull, runtime.NullTypes.AnyNull;
runtime.makeStrictEnum({
	ReadUncommitted: "ReadUncommitted",
	ReadCommitted: "ReadCommitted",
	RepeatableRead: "RepeatableRead",
	Serializable: "Serializable"
});
runtime.Extensions.defineExtension;
//#endregion
//#region ../../packages/db/dist/generated/client.js
globalThis["__dirname"] = path$1.dirname(fileURLToPath(import.meta.url));
/**
* ## Prisma Client
*
* Type-safe database client for TypeScript
* @example
* ```
* const prisma = new PrismaClient({
*   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
* })
* // Fetch zero or more Users
* const users = await prisma.user.findMany()
* ```
*
* Read more in our [docs](https://pris.ly/d/client).
*/
const PrismaClient = getPrismaClientClass();
//#endregion
//#region ../../packages/db/dist/client.js
function requiredDatabaseUrl() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) throw new Error("DATABASE_URL is required to access the database");
	return databaseUrl;
}
function resolveDriver(databaseUrl, configuredDriver = process.env.DATABASE_DRIVER) {
	if (configuredDriver === "neon" || configuredDriver === "pg") return configuredDriver;
	return new URL(databaseUrl).hostname.endsWith(".neon.tech") ? "neon" : "pg";
}
function createPrismaClient(databaseUrl = requiredDatabaseUrl(), driver = resolveDriver(databaseUrl)) {
	return new PrismaClient({ adapter: driver === "neon" ? new PrismaNeonAdapterFactory({ connectionString: databaseUrl }) : new PrismaPgAdapterFactory({
		connectionString: databaseUrl,
		connectionTimeoutMillis: 1e4,
		idleTimeoutMillis: 5e3,
		max: 5
	}) });
}
function getPrismaClient() {
	globalThis.backbeatPrisma ??= createPrismaClient();
	return globalThis.backbeatPrisma;
}
//#endregion
//#region ../../packages/domain/dist/schedules/resolve.js
var import_helmet = /* @__PURE__ */ __toESM(require_helmet(), 1);
function floorDiv(value, divisor) {
	return Math.floor(value / divisor);
}
function positiveModulo(value, divisor) {
	return (value % divisor + divisor) % divisor;
}
function toInstant(date) {
	return qi.Instant.fromEpochMilliseconds(date.getTime());
}
function isLayerActive(layer, at) {
	return (!layer.activeFrom || layer.activeFrom.getTime() <= at.getTime()) && (!layer.activeUntil || at.getTime() < layer.activeUntil.getTime());
}
function localDayOfWeek(date) {
	return date.dayOfWeek % 7;
}
function isRestrictionActive(restriction, local) {
	const currentDate = local.toPlainDate();
	const currentTime = local.toPlainTime();
	const start = qi.PlainTime.from(restriction.startLocalTime);
	const end = qi.PlainTime.from(restriction.endLocalTime);
	if (qi.PlainTime.compare(start, end) < 0) return localDayOfWeek(currentDate) === restriction.dayOfWeek && qi.PlainTime.compare(currentTime, start) >= 0 && qi.PlainTime.compare(currentTime, end) < 0;
	const nextDay = (restriction.dayOfWeek + 1) % 7;
	return localDayOfWeek(currentDate) === restriction.dayOfWeek && qi.PlainTime.compare(currentTime, start) >= 0 || localDayOfWeek(currentDate) === nextDay && qi.PlainTime.compare(currentTime, end) < 0;
}
function restrictionsAllow(layer, local) {
	return layer.restrictions.length === 0 || layer.restrictions.some((restriction) => isRestrictionActive(restriction, local));
}
function calendarRotationIndex(layer, local) {
	const anchorDate = qi.PlainDate.from(layer.anchorLocalDate);
	const handoff = qi.PlainTime.from(layer.handoffLocalTime);
	const effectiveDate = qi.PlainTime.compare(local.toPlainTime(), handoff) < 0 ? local.toPlainDate().subtract({ days: 1 }) : local.toPlainDate();
	const elapsedDays = anchorDate.until(effectiveDate, { largestUnit: "days" }).days;
	return floorDiv(elapsedDays, layer.rotationType === "WEEKLY" ? 7 * layer.rotationInterval : layer.rotationInterval);
}
function customRotationIndex(layer, at) {
	if (!layer.customIntervalMinutes) throw new Error(`Custom layer ${layer.id} has no interval`);
	return floorDiv(at.getTime() - layer.anchorInstant.getTime(), layer.customIntervalMinutes * 6e4);
}
function resolveLayerAt(layer, timezone, at) {
	if (!isLayerActive(layer, at) || layer.participants.length === 0) return null;
	const local = toInstant(at).toZonedDateTimeISO(timezone);
	if (!restrictionsAllow(layer, local)) return null;
	const participants = [...layer.participants].sort((left, right) => left.position - right.position);
	return participants[positiveModulo(layer.rotationType === "CUSTOM" ? customRotationIndex(layer, at) : calendarRotationIndex(layer, local), participants.length)].userId;
}
function activeOverrideFor(schedule, layer, baseUserId, at) {
	const active = schedule.overrides.filter((override) => override.startsAt.getTime() <= at.getTime() && at.getTime() < override.endsAt.getTime() && (!override.layerId || override.layerId === layer.id) && (!override.replacedUserId || override.replacedUserId === baseUserId));
	active.sort((left, right) => {
		const layerSpecificity = Number(Boolean(right.layerId)) - Number(Boolean(left.layerId));
		if (layerSpecificity !== 0) return layerSpecificity;
		const userSpecificity = Number(Boolean(right.replacedUserId)) - Number(Boolean(left.replacedUserId));
		if (userSpecificity !== 0) return userSpecificity;
		const startsAt = right.startsAt.getTime() - left.startsAt.getTime();
		if (startsAt !== 0) return startsAt;
		return right.createdAt.getTime() - left.createdAt.getTime();
	});
	return active[0] ?? null;
}
function resolveScheduleAt(schedule, at) {
	const users = /* @__PURE__ */ new Map();
	const layers = [...schedule.layers].sort((left, right) => left.position - right.position);
	for (const layer of layers) {
		const baseUserId = resolveLayerAt(layer, schedule.timezone, at);
		if (!baseUserId) continue;
		const override = activeOverrideFor(schedule, layer, baseUserId, at);
		const userId = override?.replacementUserId ?? baseUserId;
		const existing = users.get(userId);
		if (existing) {
			existing.layerIds.push(layer.id);
			if (override) existing.overrideIds.push(override.id);
		} else users.set(userId, {
			layerIds: [layer.id],
			overrideIds: override ? [override.id] : [],
			userId
		});
	}
	return [...users.values()];
}
//#endregion
//#region ../../packages/domain/dist/escalation/cursor.js
function firstEscalationStep(steps) {
	const step = [...steps].sort((left, right) => left.position - right.position)[0];
	return step ? {
		exhausted: false,
		next: {
			loop: 0,
			position: step.position
		},
		step
	} : {
		exhausted: true,
		next: null,
		step: null
	};
}
function advanceEscalationCursor(steps, current, repeatCount) {
	const sorted = [...steps].sort((left, right) => left.position - right.position);
	const nextStep = sorted.find((step) => step.position > current.position);
	if (nextStep) return {
		exhausted: false,
		next: {
			loop: current.loop,
			position: nextStep.position
		},
		step: nextStep
	};
	const firstStep = sorted[0];
	if (firstStep && current.loop < repeatCount) return {
		exhausted: false,
		next: {
			loop: current.loop + 1,
			position: firstStep.position
		},
		step: firstStep
	};
	return {
		exhausted: true,
		next: null,
		step: null
	};
}
//#endregion
//#region ../../packages/domain/dist/escalation/targets.js
async function expandEscalationTargets(transaction, stepId, at) {
	const step = await transaction.escalationStep.findUnique({
		where: { id: stepId },
		include: { targets: {
			orderBy: { position: "asc" },
			include: {
				schedule: { include: {
					layers: {
						orderBy: { position: "asc" },
						include: {
							participants: {
								orderBy: { position: "asc" },
								include: { user: { select: { active: true } } }
							},
							restrictions: true
						}
					},
					overrides: true
				} },
				team: { include: { memberships: { include: { user: { select: { active: true } } } } } },
				user: { select: { active: true } }
			}
		} }
	});
	if (!step) throw new Error(`Escalation step ${stepId} does not exist`);
	const users = /* @__PURE__ */ new Set();
	for (const target of step.targets) {
		if (target.userId && target.user?.active) users.add(target.userId);
		if (target.team) {
			for (const membership of target.team.memberships) if (membership.user.active) users.add(membership.userId);
		}
		if (target.schedule?.active) {
			const schedule = {
				id: target.schedule.id,
				timezone: target.schedule.timezone,
				layers: target.schedule.layers.map((layer) => ({
					activeFrom: layer.activeFrom,
					activeUntil: layer.activeUntil,
					anchorInstant: layer.anchorInstant,
					anchorLocalDate: layer.anchorLocalDate.toISOString().slice(0, 10),
					customIntervalMinutes: layer.customIntervalMinutes,
					handoffLocalTime: layer.handoffLocalTime,
					id: layer.id,
					participants: layer.participants.filter((participant) => participant.user.active).map((participant) => ({
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
				})).filter((layer) => (!layer.activeFrom || layer.activeFrom <= at) && (!layer.activeUntil || at < layer.activeUntil)),
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
			for (const onCall of resolveScheduleAt(schedule, at)) users.add(onCall.userId);
		}
	}
	return [...users];
}
//#endregion
//#region ../../packages/domain/dist/incidents/errors.js
var DomainError = class extends Error {
	code;
	statusCode;
	constructor(code, message, statusCode) {
		super(message);
		this.name = "DomainError";
		this.code = code;
		this.statusCode = statusCode;
	}
};
//#endregion
//#region ../../packages/domain/dist/incidents/lifecycle.js
const OPEN_STATES = [IncidentState.TRIGGERED, IncidentState.ACKNOWLEDGED];
async function lock(transaction, key) {
	await transaction.$queryRaw`
    SELECT 1::int AS "locked"
    FROM pg_advisory_xact_lock(hashtextextended(${key}, 0))
  `;
}
function actorData(actor) {
	return {
		actorKind: actor?.kind ?? ActorKind.INTEGRATION,
		...actor?.userId ? { actorUserId: actor.userId } : {},
		...actor?.slackUserId ? { slackUserId: actor.slackUserId } : {}
	};
}
async function findIncident(transaction, reference) {
	if (reference.incidentId) return transaction.incident.findUnique({ where: { id: reference.incidentId } });
	if (reference.serviceId && reference.dedupKey) return transaction.incident.findFirst({
		where: {
			dedupKey: reference.dedupKey,
			serviceId: reference.serviceId,
			state: { in: OPEN_STATES }
		},
		orderBy: { openedAt: "desc" }
	});
	return null;
}
async function idempotentIncidentResult(transaction, idempotencyKey) {
	const timeline = await transaction.incidentTimelineEntry.findUnique({
		where: { idempotencyKey },
		include: { incident: true }
	});
	return timeline ? {
		changed: false,
		incident: timeline.incident,
		targetUserIds: []
	} : null;
}
async function enqueueIncidentWorkflow(transaction, incident, reason, idempotencyKey) {
	await transaction.outboxEvent.upsert({
		where: { idempotencyKey },
		create: {
			idempotencyKey,
			kind: "INCIDENT_GENERATION_REQUESTED",
			payload: {
				generation: incident.escalationGeneration,
				incidentId: incident.id,
				reason
			}
		},
		update: {}
	});
}
async function escalationPolicy(transaction, serviceId) {
	return (await transaction.service.findUniqueOrThrow({
		where: { id: serviceId },
		include: { escalationPolicy: { include: { steps: { orderBy: { position: "asc" } } } } }
	})).escalationPolicy;
}
async function recordAlertAction(transaction, reference, event, action, status) {
	if (!event || !reference.serviceId || !reference.dedupKey) return;
	if (event.requestId) {
		if (await transaction.alertOccurrence.findUnique({ where: { requestId: event.requestId } })) return;
	}
	const alert = await transaction.alert.findUnique({ where: { serviceId_dedupKey: {
		dedupKey: reference.dedupKey,
		serviceId: reference.serviceId
	} } });
	if (!alert) return;
	await transaction.alert.update({
		where: { id: alert.id },
		data: {
			lastSeenAt: /* @__PURE__ */ new Date(),
			status,
			occurrences: { create: {
				action,
				payload: event.payload,
				...event.requestHash ? { requestHash: event.requestHash } : {},
				...event.requestId ? { requestId: event.requestId } : {}
			} }
		}
	});
}
function deadlineFor(step, now) {
	return new Date(now.getTime() + step.timeoutMinutes * 6e4);
}
async function triggerIncident(prisma, input) {
	return prisma.$transaction(async (transaction) => {
		await lock(transaction, `alert:${input.serviceId}:${input.dedupKey}`);
		if (input.requestId) {
			const occurrence = await transaction.alertOccurrence.findUnique({ where: { requestId: input.requestId } });
			if (occurrence) {
				const incident = await transaction.incident.findFirst({
					where: { alerts: { some: { alertId: occurrence.alertId } } },
					orderBy: { openedAt: "desc" }
				});
				if (incident) return {
					changed: false,
					incident,
					targetUserIds: []
				};
			}
		}
		const now = input.now ?? /* @__PURE__ */ new Date();
		const alert = await transaction.alert.upsert({
			where: { serviceId_dedupKey: {
				dedupKey: input.dedupKey,
				serviceId: input.serviceId
			} },
			create: {
				dedupKey: input.dedupKey,
				latestPayload: input.payload,
				serviceId: input.serviceId,
				severity: input.severity,
				source: input.source,
				status: AlertStatus.TRIGGERED
			},
			update: {
				lastSeenAt: now,
				latestPayload: input.payload,
				occurrenceCount: { increment: 1 },
				severity: input.severity,
				source: input.source,
				status: AlertStatus.TRIGGERED
			}
		});
		await transaction.alertOccurrence.create({ data: {
			action: AlertAction.TRIGGER,
			alertId: alert.id,
			payload: input.payload,
			...input.requestHash ? { requestHash: input.requestHash } : {},
			...input.requestId ? { requestId: input.requestId } : {}
		} });
		const existing = await transaction.incident.findFirst({
			where: {
				dedupKey: input.dedupKey,
				serviceId: input.serviceId,
				state: { in: OPEN_STATES }
			},
			orderBy: { openedAt: "desc" }
		});
		if (existing) return {
			changed: true,
			incident: await transaction.incident.update({
				where: { id: existing.id },
				data: {
					severity: input.severity,
					source: input.source,
					sourceUrl: input.sourceUrl ?? null,
					summary: input.summary,
					version: { increment: 1 },
					alerts: { connectOrCreate: {
						where: { incidentId_alertId: {
							alertId: alert.id,
							incidentId: existing.id
						} },
						create: { alertId: alert.id }
					} },
					timelineEntries: { create: {
						...actorData(input.actor),
						idempotencyKey: input.idempotencyKey,
						message: "Alert retriggered and grouped into the open incident",
						metadata: { alertId: alert.id },
						type: TimelineEventType.INCIDENT_RETRIGGERED
					} }
				}
			}),
			targetUserIds: []
		};
		const first = firstEscalationStep((await escalationPolicy(transaction, input.serviceId)).steps);
		const targets = first.exhausted ? [] : await expandEscalationTargets(transaction, first.step.id, now);
		const generation = 1;
		const incident = await transaction.incident.create({ data: {
			assigneeId: targets[0] ?? null,
			currentEscalationLoop: first.exhausted ? 0 : first.next.loop,
			currentEscalationPosition: first.exhausted ? 0 : first.next.position,
			currentStepId: first.exhausted ? null : first.step.id,
			dedupKey: input.dedupKey,
			escalationDeadline: first.exhausted ? null : deadlineFor(first.step, now),
			escalationGeneration: generation,
			serviceId: input.serviceId,
			severity: input.severity,
			source: input.source,
			sourceUrl: input.sourceUrl ?? null,
			summary: input.summary,
			alerts: { create: { alertId: alert.id } },
			timelineEntries: { create: [{
				...actorData(input.actor),
				idempotencyKey: input.idempotencyKey,
				message: "Incident triggered",
				metadata: {
					alertId: alert.id,
					dedupKey: input.dedupKey
				},
				type: TimelineEventType.INCIDENT_TRIGGERED
			}, ...first.exhausted ? [{
				actorKind: ActorKind.SYSTEM,
				idempotencyKey: `${input.idempotencyKey}:exhausted`,
				message: "Escalation policy has no steps",
				metadata: {},
				type: TimelineEventType.ESCALATION_EXHAUSTED
			}] : [{
				actorKind: ActorKind.SYSTEM,
				idempotencyKey: `${input.idempotencyKey}:escalation`,
				message: "Escalation started",
				metadata: {
					loop: first.next.loop,
					position: first.next.position,
					targetUserIds: targets
				},
				type: TimelineEventType.ESCALATION_STARTED
			}]] }
		} });
		await enqueueIncidentWorkflow(transaction, incident, "triggered", `incident:${incident.id}:generation:${generation}`);
		return {
			changed: true,
			incident,
			targetUserIds: targets
		};
	});
}
async function acknowledgeIncident(prisma, input) {
	return prisma.$transaction(async (transaction) => {
		const idempotent = await idempotentIncidentResult(transaction, input.idempotencyKey);
		if (idempotent) return idempotent;
		const incident = await findIncident(transaction, input.reference);
		if (!incident) throw new DomainError("INCIDENT_NOT_FOUND", "No open incident matches this reference", 404);
		await lock(transaction, `incident:${incident.id}`);
		const current = await transaction.incident.findUniqueOrThrow({
			where: { id: incident.id },
			include: { service: { include: { escalationPolicy: true } } }
		});
		await recordAlertAction(transaction, input.reference, input.alertEvent, AlertAction.ACKNOWLEDGE, AlertStatus.ACKNOWLEDGED);
		if (current.state === IncidentState.ACKNOWLEDGED) return {
			changed: false,
			incident: current,
			targetUserIds: []
		};
		if (current.state === IncidentState.RESOLVED) throw new DomainError("INVALID_INCIDENT_TRANSITION", "A resolved incident cannot be acknowledged", 409);
		const now = input.now ?? /* @__PURE__ */ new Date();
		const acknowledgementTimeout = current.service.escalationPolicy.acknowledgementTimeoutMinutes;
		const generation = current.escalationGeneration + 1;
		const updated = await transaction.incident.update({
			where: { id: current.id },
			data: {
				acknowledgementExpiresAt: acknowledgementTimeout ? new Date(now.getTime() + acknowledgementTimeout * 6e4) : null,
				acknowledgedAt: current.acknowledgedAt ?? now,
				escalationDeadline: null,
				escalationGeneration: generation,
				nagDeadline: null,
				nagGeneration: { increment: 1 },
				snoozedUntil: null,
				state: IncidentState.ACKNOWLEDGED,
				version: { increment: 1 },
				timelineEntries: { create: {
					...actorData(input.actor),
					idempotencyKey: input.idempotencyKey,
					message: "Incident acknowledged",
					metadata: {},
					type: TimelineEventType.INCIDENT_ACKNOWLEDGED
				} }
			}
		});
		await enqueueIncidentWorkflow(transaction, updated, "acknowledged", `incident:${updated.id}:generation:${generation}`);
		return {
			changed: true,
			incident: updated,
			targetUserIds: []
		};
	});
}
async function resolveIncident(prisma, input) {
	return prisma.$transaction(async (transaction) => {
		const idempotent = await idempotentIncidentResult(transaction, input.idempotencyKey);
		if (idempotent) return idempotent;
		let incident = await findIncident(transaction, input.reference);
		if (!incident && input.reference.serviceId && input.reference.dedupKey) incident = await transaction.incident.findFirst({
			where: {
				dedupKey: input.reference.dedupKey,
				serviceId: input.reference.serviceId
			},
			orderBy: { openedAt: "desc" }
		});
		if (!incident) throw new DomainError("INCIDENT_NOT_FOUND", "No incident matches this reference", 404);
		await lock(transaction, `incident:${incident.id}`);
		const current = await transaction.incident.findUniqueOrThrow({ where: { id: incident.id } });
		await recordAlertAction(transaction, input.reference, input.alertEvent, AlertAction.RESOLVE, AlertStatus.RESOLVED);
		if (current.state === IncidentState.RESOLVED) return {
			changed: false,
			incident: current,
			targetUserIds: []
		};
		const now = input.now ?? /* @__PURE__ */ new Date();
		const generation = current.escalationGeneration + 1;
		const updated = await transaction.incident.update({
			where: { id: current.id },
			data: {
				acknowledgementExpiresAt: null,
				escalationDeadline: null,
				escalationGeneration: generation,
				nagDeadline: null,
				nagGeneration: { increment: 1 },
				resolvedAt: now,
				snoozedUntil: null,
				state: IncidentState.RESOLVED,
				version: { increment: 1 },
				timelineEntries: { create: {
					...actorData(input.actor),
					idempotencyKey: input.idempotencyKey,
					message: input.note ? `Incident resolved: ${input.note}` : "Incident resolved",
					metadata: input.note ? { note: input.note } : {},
					type: TimelineEventType.INCIDENT_RESOLVED
				} }
			}
		});
		await transaction.alert.updateMany({
			where: { incidents: { some: { incidentId: updated.id } } },
			data: { status: AlertStatus.RESOLVED }
		});
		await enqueueIncidentWorkflow(transaction, updated, "resolved", `incident:${updated.id}:generation:${generation}`);
		return {
			changed: true,
			incident: updated,
			targetUserIds: []
		};
	});
}
async function advanceResult(transaction, current, advance, input, now) {
	const generation = current.escalationGeneration + 1;
	if (advance.exhausted) return {
		changed: true,
		incident: await transaction.incident.update({
			where: { id: current.id },
			data: {
				escalationDeadline: null,
				escalationGeneration: generation,
				version: { increment: 1 },
				timelineEntries: { create: {
					...actorData(input.actor),
					idempotencyKey: input.idempotencyKey,
					message: "Escalation policy exhausted",
					metadata: {
						loop: current.currentEscalationLoop,
						position: current.currentEscalationPosition
					},
					type: TimelineEventType.ESCALATION_EXHAUSTED
				} }
			}
		}),
		targetUserIds: []
	};
	const targets = await expandEscalationTargets(transaction, advance.step.id, now);
	const updated = await transaction.incident.update({
		where: { id: current.id },
		data: {
			assigneeId: targets[0] ?? current.assigneeId,
			currentEscalationLoop: advance.next.loop,
			currentEscalationPosition: advance.next.position,
			currentStepId: advance.step.id,
			escalationDeadline: deadlineFor(advance.step, now),
			escalationGeneration: generation,
			snoozedUntil: null,
			version: { increment: 1 },
			timelineEntries: { create: {
				...actorData(input.actor),
				idempotencyKey: input.idempotencyKey,
				message: "Escalation advanced",
				metadata: {
					loop: advance.next.loop,
					position: advance.next.position,
					targetUserIds: targets
				},
				type: TimelineEventType.ESCALATION_ADVANCED
			} }
		}
	});
	await enqueueIncidentWorkflow(transaction, updated, "escalated", `incident:${updated.id}:generation:${generation}`);
	return {
		changed: true,
		incident: updated,
		targetUserIds: targets
	};
}
async function advanceIncidentEscalation(prisma, input) {
	return prisma.$transaction(async (transaction) => {
		const idempotent = await idempotentIncidentResult(transaction, input.idempotencyKey);
		if (idempotent) return idempotent;
		const incident = await findIncident(transaction, input.reference);
		if (!incident) throw new DomainError("INCIDENT_NOT_FOUND", "No open incident matches this reference", 404);
		await lock(transaction, `incident:${incident.id}`);
		const current = await transaction.incident.findUniqueOrThrow({ where: { id: incident.id } });
		if (current.state !== IncidentState.TRIGGERED) throw new DomainError("INVALID_INCIDENT_TRANSITION", "Only triggered incidents can escalate", 409);
		if (input.expectedGeneration !== void 0 && current.escalationGeneration !== input.expectedGeneration) throw new DomainError("STALE_INCIDENT_GENERATION", "This escalation generation is stale", 409);
		const now = input.now ?? /* @__PURE__ */ new Date();
		if (input.requireDeadline && (!current.escalationDeadline || current.escalationDeadline > now)) return {
			changed: false,
			incident: current,
			targetUserIds: []
		};
		const policy = await escalationPolicy(transaction, current.serviceId);
		return advanceResult(transaction, current, advanceEscalationCursor(policy.steps, {
			loop: current.currentEscalationLoop,
			position: current.currentEscalationPosition
		}, policy.repeatCount), input, now);
	});
}
async function expireAcknowledgement(prisma, input) {
	return prisma.$transaction(async (transaction) => {
		const incident = await findIncident(transaction, input.reference);
		if (!incident) throw new DomainError("INCIDENT_NOT_FOUND", "No open incident matches this reference", 404);
		await lock(transaction, `incident:${incident.id}`);
		const current = await transaction.incident.findUniqueOrThrow({ where: { id: incident.id } });
		const now = input.now ?? /* @__PURE__ */ new Date();
		if (current.state !== IncidentState.ACKNOWLEDGED || current.escalationGeneration !== input.expectedGeneration || !current.acknowledgementExpiresAt || current.acknowledgementExpiresAt > now) return {
			changed: false,
			incident: current,
			targetUserIds: []
		};
		const policy = await escalationPolicy(transaction, current.serviceId);
		const currentStep = policy.steps.find((step) => step.position === current.currentEscalationPosition) ?? policy.steps[0];
		const targets = currentStep ? await expandEscalationTargets(transaction, currentStep.id, now) : [];
		const generation = current.escalationGeneration + 1;
		const updated = await transaction.incident.update({
			where: { id: current.id },
			data: {
				acknowledgementExpiresAt: null,
				assigneeId: targets[0] ?? current.assigneeId,
				currentStepId: currentStep?.id ?? null,
				escalationDeadline: currentStep ? deadlineFor(currentStep, now) : null,
				escalationGeneration: generation,
				state: IncidentState.TRIGGERED,
				version: { increment: 1 },
				timelineEntries: { create: {
					...actorData(input.actor),
					idempotencyKey: input.idempotencyKey,
					message: "Acknowledgement expired; escalation resumed",
					metadata: { targetUserIds: targets },
					type: TimelineEventType.ACKNOWLEDGEMENT_EXPIRED
				} }
			}
		});
		await enqueueIncidentWorkflow(transaction, updated, "acknowledgement-expired", `incident:${updated.id}:generation:${generation}`);
		return {
			changed: true,
			incident: updated,
			targetUserIds: targets
		};
	});
}
//#endregion
//#region ../../packages/contracts/dist/alert-events.js
var import_fastify = /* @__PURE__ */ __toESM(require_fastify(), 1);
const eventActionSchema = _enum([
	"trigger",
	"acknowledge",
	"resolve"
]);
const alertSeveritySchema = _enum([
	"critical",
	"warning",
	"info"
]);
const pagerDutyEventSchema = object({
	dedup_key: string().trim().min(1).max(255),
	event_action: eventActionSchema,
	payload: object({
		component: string().max(255).optional(),
		custom_details: record(string(), unknown()).optional(),
		group: string().max(255).optional(),
		severity: alertSeveritySchema,
		source: string().trim().min(1).max(1024),
		source_url: url().optional(),
		summary: string().trim().min(1).max(1024)
	}).passthrough(),
	routing_key: string().optional()
});
const genericWebhookSchema = object({
	custom_details: record(string(), unknown()).optional(),
	dedup_key: string().trim().min(1).max(255),
	details: record(string(), unknown()).optional(),
	event_action: eventActionSchema.default("trigger"),
	severity: alertSeveritySchema,
	source: string().trim().min(1).max(1024),
	summary: string().trim().min(1).max(1024),
	url: url().optional()
});
const alertmanagerWebhookSchema = object({
	alerts: array(object({
		annotations: record(string(), string()).default({}),
		endsAt: string().optional(),
		fingerprint: string().optional(),
		generatorURL: string().optional(),
		labels: record(string(), string()).default({}),
		startsAt: string().optional(),
		status: _enum(["firing", "resolved"]).optional(),
		valueString: string().optional()
	}).passthrough()).min(1),
	commonAnnotations: record(string(), string()).default({}),
	commonLabels: record(string(), string()).default({}),
	externalURL: string().optional(),
	groupKey: string().optional(),
	receiver: string().optional(),
	status: _enum(["firing", "resolved"]),
	version: string().optional()
}).passthrough();
const grafanaWebhookSchema = alertmanagerWebhookSchema.extend({
	message: string().optional(),
	orgId: number().optional(),
	title: string().optional()
});
//#endregion
//#region ../../packages/db/dist/routing-keys.js
const ROUTING_KEY_PATTERN = /^(?<prefix>bbp_[a-f0-9]{12})\.(?<secret>[A-Za-z0-9_-]{43})$/;
function parseRoutingKey(routingKey) {
	const prefix = ROUTING_KEY_PATTERN.exec(routingKey)?.groups?.prefix;
	return prefix ? { prefix } : null;
}
async function verifyRoutingKey(storedHash, candidate) {
	if (!parseRoutingKey(candidate)) return false;
	try {
		return await verify(storedHash, candidate);
	} catch {
		return false;
	}
}
//#endregion
//#region ../../packages/workflows/dist/dispatch.js
function logicalKey$1(input) {
	return `incident:${input.incidentId}:generation:${input.generation}`;
}
async function dispatchIncidentWorkflow(prisma, starter, input) {
	const key = logicalKey$1(input);
	const registered = await prisma.workflowRun.upsert({
		where: { logicalKey: key },
		create: {
			entityId: input.incidentId,
			generation: input.generation,
			kind: WorkflowKind.INCIDENT_GENERATION,
			logicalKey: key
		},
		update: {}
	});
	if (registered.vercelRunId && registered.status !== WorkflowStatus.FAILED) return {
		runId: registered.vercelRunId,
		started: false
	};
	try {
		const started = await starter.startIncidentGeneration(input);
		await prisma.$transaction([prisma.workflowRun.update({
			where: { id: registered.id },
			data: {
				lastError: null,
				startedAt: registered.startedAt ?? /* @__PURE__ */ new Date(),
				status: WorkflowStatus.RUNNING,
				vercelRunId: started.runId
			}
		}), prisma.outboxEvent.updateMany({
			where: { idempotencyKey: key },
			data: {
				attempts: { increment: 1 },
				dispatchedAt: /* @__PURE__ */ new Date(),
				lastError: null,
				status: OutboxStatus.DISPATCHED
			}
		})]);
		return {
			runId: started.runId,
			started: true
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		await prisma.$transaction([prisma.workflowRun.update({
			where: { id: registered.id },
			data: {
				lastError: message,
				status: WorkflowStatus.FAILED
			}
		}), prisma.outboxEvent.updateMany({
			where: { idempotencyKey: key },
			data: {
				attempts: { increment: 1 },
				lastError: message,
				status: OutboxStatus.FAILED
			}
		})]);
		throw error;
	}
}
//#endregion
//#region ../../packages/workflows/dist/incident-engine.js
function logicalKey(input) {
	return `incident:${input.incidentId}:generation:${input.generation}`;
}
async function updateRun(prisma, input, status, expectedWakeAt) {
	await prisma.workflowRun.updateMany({
		where: { logicalKey: logicalKey(input) },
		data: {
			expectedWakeAt,
			...status === WorkflowStatus.SUCCEEDED || status === WorkflowStatus.STALE ? { finishedAt: /* @__PURE__ */ new Date() } : {},
			status
		}
	});
}
async function evaluateIncidentWake(prisma, input, now = /* @__PURE__ */ new Date()) {
	const incident = await prisma.incident.findUnique({ where: { id: input.incidentId } });
	if (!incident || incident.escalationGeneration !== input.generation) {
		await updateRun(prisma, input, WorkflowStatus.STALE, null);
		return {
			done: true,
			nextGeneration: null,
			sleepUntil: null
		};
	}
	if (incident.state === IncidentState.RESOLVED) {
		await updateRun(prisma, input, WorkflowStatus.SUCCEEDED, null);
		return {
			done: true,
			nextGeneration: null,
			sleepUntil: null
		};
	}
	if (incident.state === IncidentState.ACKNOWLEDGED) {
		if (!incident.acknowledgementExpiresAt) {
			await updateRun(prisma, input, WorkflowStatus.SUCCEEDED, null);
			return {
				done: true,
				nextGeneration: null,
				sleepUntil: null
			};
		}
		if (incident.acknowledgementExpiresAt > now) {
			await updateRun(prisma, input, WorkflowStatus.SLEEPING, incident.acknowledgementExpiresAt);
			return {
				done: false,
				nextGeneration: null,
				sleepUntil: incident.acknowledgementExpiresAt
			};
		}
		const expired = await expireAcknowledgement(prisma, {
			actor: { kind: ActorKind.SYSTEM },
			expectedGeneration: input.generation,
			idempotencyKey: `${logicalKey(input)}:acknowledgement-expired`,
			now,
			reference: { incidentId: incident.id }
		});
		await updateRun(prisma, input, WorkflowStatus.SUCCEEDED, null);
		return {
			done: true,
			nextGeneration: expired.changed ? expired.incident.escalationGeneration : null,
			sleepUntil: null
		};
	}
	if (!incident.escalationDeadline) {
		await updateRun(prisma, input, WorkflowStatus.SUCCEEDED, null);
		return {
			done: true,
			nextGeneration: null,
			sleepUntil: null
		};
	}
	if (incident.escalationDeadline > now) {
		await updateRun(prisma, input, WorkflowStatus.SLEEPING, incident.escalationDeadline);
		return {
			done: false,
			nextGeneration: null,
			sleepUntil: incident.escalationDeadline
		};
	}
	try {
		const advanced = await advanceIncidentEscalation(prisma, {
			actor: { kind: ActorKind.SYSTEM },
			expectedGeneration: input.generation,
			idempotencyKey: `${logicalKey(input)}:escalate:${incident.escalationDeadline.toISOString()}`,
			now,
			reference: { incidentId: incident.id },
			requireDeadline: true
		});
		await updateRun(prisma, input, WorkflowStatus.SUCCEEDED, null);
		return {
			done: true,
			nextGeneration: advanced.incident.escalationDeadline ? advanced.incident.escalationGeneration : null,
			sleepUntil: null
		};
	} catch (error) {
		if (error instanceof DomainError && (error.code === "STALE_INCIDENT_GENERATION" || error.code === "INVALID_INCIDENT_TRANSITION")) {
			await updateRun(prisma, input, WorkflowStatus.STALE, null);
			return {
				done: true,
				nextGeneration: null,
				sleepUntil: null
			};
		}
		throw error;
	}
}
//#endregion
//#region src/routes/alerts.ts
var AlertHttpError = class extends Error {
	statusCode;
	constructor(statusCode, message) {
		super(message);
		this.name = "AlertHttpError";
		this.statusCode = statusCode;
	}
};
function headerValue(request, name) {
	const value = request.headers[name];
	return Array.isArray(value) ? value[0] : value;
}
function routingKeyFromRequest(request, bodyRoutingKey) {
	if (bodyRoutingKey) return bodyRoutingKey;
	const explicit = headerValue(request, "x-routing-key");
	if (explicit) return explicit;
	const authorization = headerValue(request, "authorization");
	if (authorization?.startsWith("Bearer ")) return authorization.slice(7).trim();
	return null;
}
async function authenticateService(prisma, routingKey) {
	if (!routingKey) throw new AlertHttpError(401, "A routing key is required");
	const parsed = parseRoutingKey(routingKey);
	if (!parsed) throw new AlertHttpError(401, "The routing key is invalid");
	const service = await prisma.service.findUnique({ where: { routingKeyPrefix: parsed.prefix } });
	if (!service?.active || !await verifyRoutingKey(service.routingKeyHash, routingKey)) throw new AlertHttpError(401, "The routing key is invalid");
	return service;
}
function severity(value) {
	switch (value) {
		case "critical": return Severity.CRITICAL;
		case "warning": return Severity.WARNING;
		case "info": return Severity.INFO;
	}
}
function payloadHash(payload) {
	return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
function idempotencySeed(request, payload) {
	return headerValue(request, "x-idempotency-key") ?? headerValue(request, "x-request-id") ?? payloadHash(payload);
}
async function processEvent(dependencies, event, routingKey, seed) {
	const service = await authenticateService(dependencies.prisma, routingKey);
	const eventPayload = event;
	const requestHash = payloadHash(event);
	const requestId = `${event.event_action}:${service.id}:${event.dedup_key}:${seed}`;
	const idempotencyKey = requestId;
	const reference = {
		dedupKey: event.dedup_key,
		serviceId: service.id
	};
	const result = event.event_action === "trigger" ? await triggerIncident(dependencies.prisma, {
		actor: { kind: ActorKind.INTEGRATION },
		dedupKey: event.dedup_key,
		idempotencyKey,
		payload: eventPayload,
		requestHash,
		requestId,
		serviceId: service.id,
		severity: severity(event.payload.severity),
		source: event.payload.source,
		...event.payload.source_url ? { sourceUrl: event.payload.source_url } : {},
		summary: event.payload.summary
	}) : event.event_action === "acknowledge" ? await acknowledgeIncident(dependencies.prisma, {
		actor: { kind: ActorKind.INTEGRATION },
		alertEvent: {
			payload: eventPayload,
			requestHash,
			requestId
		},
		idempotencyKey,
		reference
	}) : await resolveIncident(dependencies.prisma, {
		actor: { kind: ActorKind.INTEGRATION },
		alertEvent: {
			payload: eventPayload,
			requestHash,
			requestId
		},
		idempotencyKey,
		reference
	});
	await dispatchIncidentWorkflow(dependencies.prisma, dependencies.workflowStarter, {
		generation: result.incident.escalationGeneration,
		incidentId: result.incident.id
	});
	return {
		changed: result.changed,
		incident: {
			id: result.incident.id,
			number: result.incident.number,
			state: result.incident.state
		}
	};
}
function acceptedResponse(event, processed) {
	return {
		dedup_key: event.dedup_key,
		incident: processed.incident,
		message: processed.changed ? "Event processed" : "Event was already processed",
		status: "success"
	};
}
function normalizedSeverity(value) {
	const normalized = value?.toLowerCase();
	if (normalized === "critical" || normalized === "warning" || normalized === "info") return normalized;
	if (normalized === "error" || normalized === "high") return "critical";
	if (normalized === "warn" || normalized === "medium") return "warning";
	return "info";
}
function registerAlertRoutes(app, dependencies) {
	app.post("/api/v1/alerts", async (request, reply) => {
		const parsed = pagerDutyEventSchema.safeParse(request.body);
		if (!parsed.success) throw new AlertHttpError(400, `Invalid event payload: ${parsed.error.issues[0]?.message ?? "unknown error"}`);
		const processed = await processEvent(dependencies, parsed.data, routingKeyFromRequest(request, parsed.data.routing_key), idempotencySeed(request, parsed.data));
		return reply.code(202).send(acceptedResponse(parsed.data, processed));
	});
	app.post("/api/v1/integrations/generic", async (request, reply) => {
		const parsed = genericWebhookSchema.safeParse(request.body);
		if (!parsed.success) throw new AlertHttpError(400, `Invalid generic webhook: ${parsed.error.issues[0]?.message ?? "unknown error"}`);
		const event = {
			dedup_key: parsed.data.dedup_key,
			event_action: parsed.data.event_action,
			payload: {
				custom_details: parsed.data.custom_details ?? parsed.data.details ?? {},
				severity: parsed.data.severity,
				source: parsed.data.source,
				...parsed.data.url ? { source_url: parsed.data.url } : {},
				summary: parsed.data.summary
			}
		};
		const processed = await processEvent(dependencies, event, routingKeyFromRequest(request), idempotencySeed(request, parsed.data));
		return reply.code(202).send(acceptedResponse(event, processed));
	});
	app.post("/api/v1/integrations/alertmanager", async (request, reply) => {
		const parsed = alertmanagerWebhookSchema.safeParse(request.body);
		if (!parsed.success) throw new AlertHttpError(400, `Invalid Alertmanager webhook: ${parsed.error.issues[0]?.message ?? "unknown error"}`);
		const routingKey = routingKeyFromRequest(request);
		const seed = idempotencySeed(request, parsed.data);
		const results = [];
		for (const [index, alert] of parsed.data.alerts.entries()) {
			const event = {
				dedup_key: alert.fingerprint ?? `${parsed.data.groupKey ?? "alertmanager"}:${payloadHash(alert.labels).slice(0, 24)}`,
				event_action: alert.status === "resolved" || parsed.data.status === "resolved" ? "resolve" : "trigger",
				payload: {
					custom_details: {
						annotations: alert.annotations,
						labels: alert.labels,
						value: alert.valueString
					},
					severity: normalizedSeverity(alert.labels.severity),
					source: alert.labels.instance ?? alert.labels.job ?? parsed.data.receiver ?? "alertmanager",
					...alert.generatorURL ? { source_url: alert.generatorURL } : {},
					summary: alert.annotations.summary ?? alert.annotations.description ?? alert.labels.alertname ?? "Alertmanager alert"
				}
			};
			const processed = await processEvent(dependencies, event, routingKey, `${seed}:${alert.fingerprint ?? index}`);
			results.push(acceptedResponse(event, processed));
		}
		return reply.code(202).send({
			results,
			status: "success"
		});
	});
	app.post("/api/v1/integrations/grafana", async (request, reply) => {
		const parsed = grafanaWebhookSchema.safeParse(request.body);
		if (!parsed.success) throw new AlertHttpError(400, `Invalid Grafana webhook: ${parsed.error.issues[0]?.message ?? "unknown error"}`);
		const routingKey = routingKeyFromRequest(request);
		const seed = idempotencySeed(request, parsed.data);
		const results = [];
		for (const [index, alert] of parsed.data.alerts.entries()) {
			const event = {
				dedup_key: alert.fingerprint ?? `${parsed.data.groupKey ?? "grafana"}:${payloadHash(alert.labels).slice(0, 24)}`,
				event_action: alert.status === "resolved" || parsed.data.status === "resolved" ? "resolve" : "trigger",
				payload: {
					custom_details: {
						annotations: alert.annotations,
						labels: alert.labels,
						value: alert.valueString
					},
					severity: normalizedSeverity(alert.labels.severity ?? parsed.data.commonLabels.severity),
					source: alert.labels.instance ?? alert.labels.grafana_folder ?? "grafana",
					...alert.generatorURL ? { source_url: alert.generatorURL } : {},
					summary: alert.annotations.summary ?? parsed.data.title ?? parsed.data.message ?? alert.labels.alertname ?? "Grafana alert"
				}
			};
			const processed = await processEvent(dependencies, event, routingKey, `${seed}:${alert.fingerprint ?? index}`);
			results.push(acceptedResponse(event, processed));
		}
		return reply.code(202).send({
			results,
			status: "success"
		});
	});
}
//#endregion
//#region src/app.ts
function buildApp(options = {}) {
	const app = (0, import_fastify.default)({
		bodyLimit: 1048576,
		logger: { redact: {
			paths: [
				"req.headers.authorization",
				"req.headers.cookie",
				"req.headers.x-routing-key"
			],
			censor: "[REDACTED]"
		} }
	});
	app.register(import_helmet.default, { contentSecurityPolicy: false });
	app.get("/", () => ({
		name: "backbeatpager-api",
		status: "ok"
	}));
	app.get("/health", () => ({ status: "healthy" }));
	app.get("/ready", async (request, reply) => {
		if (!options.alertRoutes) return {
			database: "not-configured",
			status: "ready"
		};
		try {
			await options.alertRoutes.prisma.$queryRaw`SELECT 1`;
			return {
				database: "connected",
				status: "ready"
			};
		} catch (error) {
			request.log.error({ error }, "Database readiness check failed");
			return reply.code(503).send({
				database: "unavailable",
				status: "not-ready"
			});
		}
	});
	const alertRoutes = options.alertRoutes;
	if (alertRoutes) app.register((scope, _options, done) => {
		registerAlertRoutes(scope, alertRoutes);
		done();
	});
	app.setErrorHandler((error, request, reply) => {
		const statusCode = error instanceof DomainError || error instanceof AlertHttpError ? error.statusCode : 500;
		if (statusCode >= 500) request.log.error({ error }, "Request failed");
		return reply.code(statusCode).send({ error: {
			code: error instanceof DomainError ? error.code : "REQUEST_FAILED",
			message: statusCode >= 500 ? "Internal server error" : error instanceof Error ? error.message : "Request failed"
		} });
	});
	return app;
}
//#endregion
//#region src/workflows/incident-generation.ts
async function evaluateWakeStep$1(input) {
	return evaluateIncidentWake(getPrismaClient(), input);
}
evaluateWakeStep$1.stepId = "step//./src/workflows/incident-generation//evaluateWakeStep";
async function startNextGenerationStep$1(input) {
	await dispatchIncidentWorkflow(getPrismaClient(), vercelIncidentWorkflowStarter$1, input);
}
startNextGenerationStep$1.stepId = "step//./src/workflows/incident-generation//startNextGenerationStep";
async function incidentGenerationWorkflow$1(input) {
	throw new Error("You attempted to execute workflow incidentGenerationWorkflow function directly. To start a workflow, use start(incidentGenerationWorkflow) from workflow/api");
}
incidentGenerationWorkflow$1.workflowId = "workflow//./src/workflows/incident-generation//incidentGenerationWorkflow";
const vercelIncidentWorkflowStarter$1 = { async startIncidentGeneration(input) {
	return { runId: (await start(incidentGenerationWorkflow$1, [input])).runId };
} };
//#endregion
//#region src/index.ts
const app = buildApp({ alertRoutes: {
	prisma: getPrismaClient(),
	workflowStarter: vercelIncidentWorkflowStarter$1
} });
await app.ready();
function handler$2(request, response) {
	app.server.emit("request", request, response);
}
//#endregion
//#region node_modules/.nitro/workflow/webhook.mjs
async function handler$1(request) {
	const pathParts = new URL(request.url).pathname.split("/");
	const token = decodeURIComponent(pathParts[pathParts.length - 1]);
	if (!token) return new Response("Missing token", { status: 400 });
	try {
		return await resumeWebhook(token, request);
	} catch (error) {
		console.error("Error during resumeWebhook", error);
		return new Response(null, { status: 404 });
	}
}
const POST$1 = handler$1;
//#endregion
//#region #workflow/webhook.mjs
var webhook_default = async ({ req }) => {
	try {
		return await POST$1(req);
	} catch (error) {
		console.error("Handler error:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
};
//#endregion
//#region node_modules/.nitro/workflow/steps.mjs
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", {
	value,
	configurable: true
});
async function __builtin_response_array_buffer() {
	return this.arrayBuffer();
}
__name(__builtin_response_array_buffer, "__builtin_response_array_buffer");
async function __builtin_response_json() {
	return this.json();
}
__name(__builtin_response_json, "__builtin_response_json");
async function __builtin_response_text() {
	return this.text();
}
__name(__builtin_response_text, "__builtin_response_text");
registerStepFunction("__builtin_response_array_buffer", __builtin_response_array_buffer);
registerStepFunction("__builtin_response_json", __builtin_response_json);
registerStepFunction("__builtin_response_text", __builtin_response_text);
async function evaluateWakeStep(input) {
	return evaluateIncidentWake(getPrismaClient(), input);
}
__name(evaluateWakeStep, "evaluateWakeStep");
async function startNextGenerationStep(input) {
	await dispatchIncidentWorkflow(getPrismaClient(), vercelIncidentWorkflowStarter, input);
}
__name(startNextGenerationStep, "startNextGenerationStep");
async function incidentGenerationWorkflow(input) {
	throw new Error("You attempted to execute workflow incidentGenerationWorkflow function directly. To start a workflow, use start(incidentGenerationWorkflow) from workflow/api");
}
__name(incidentGenerationWorkflow, "incidentGenerationWorkflow");
incidentGenerationWorkflow.workflowId = "workflow//./src/workflows/incident-generation//incidentGenerationWorkflow";
var vercelIncidentWorkflowStarter = { async startIncidentGeneration(input) {
	return { runId: (await start(incidentGenerationWorkflow, [input])).runId };
} };
registerStepFunction("step//./src/workflows/incident-generation//evaluateWakeStep", evaluateWakeStep);
registerStepFunction("step//./src/workflows/incident-generation//startNextGenerationStep", startNextGenerationStep);
async function fetch(...args) {
	return globalThis.fetch(...args);
}
__name(fetch, "fetch");
registerStepFunction("step//workflow@4.6.0//fetch", fetch);
//#endregion
//#region #workflow/steps.mjs
var steps_default = async ({ req }) => {
	try {
		return await stepEntrypoint(req);
	} catch (error) {
		console.error("Handler error:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
};
const POST = workflowEntrypoint(`globalThis.__private_workflows = new Map();
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js
var require_ms = __commonJS({
  "../../node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js"(exports, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\\d+)?\\.?\\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?\$/i.exec(str);
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    __name(parse, "parse");
    function fmtShort(ms2) {
      var msAbs = Math.abs(ms2);
      if (msAbs >= d) {
        return Math.round(ms2 / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms2 / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms2 / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms2 / s) + "s";
      }
      return ms2 + "ms";
    }
    __name(fmtShort, "fmtShort");
    function fmtLong(ms2) {
      var msAbs = Math.abs(ms2);
      if (msAbs >= d) {
        return plural(ms2, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms2, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms2, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms2, msAbs, s, "second");
      }
      return ms2 + " ms";
    }
    __name(fmtLong, "fmtLong");
    function plural(ms2, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
    }
    __name(plural, "plural");
  }
});

// ../../node_modules/.pnpm/@workflow+utils@4.1.3/node_modules/@workflow/utils/dist/time.js
var import_ms = __toESM(require_ms(), 1);
function parseDurationToDate(param) {
  if (typeof param === "string") {
    const durationMs = (0, import_ms.default)(param);
    if (typeof durationMs !== "number" || durationMs < 0) {
      throw new Error(\`Invalid duration: "\${param}". Expected a valid duration string like "1s", "1m", "1h", etc.\`);
    }
    return new Date(Date.now() + durationMs);
  } else if (typeof param === "number") {
    if (param < 0 || !Number.isFinite(param)) {
      throw new Error(\`Invalid duration: \${param}. Expected a non-negative finite number of milliseconds.\`);
    }
    return new Date(Date.now() + param);
  } else if (param instanceof Date || param && typeof param === "object" && typeof param.getTime === "function") {
    return param instanceof Date ? param : new Date(param.getTime());
  } else {
    throw new Error(\`Invalid duration parameter. Expected a duration string, number (milliseconds), or Date object.\`);
  }
}
__name(parseDurationToDate, "parseDurationToDate");

// ../../node_modules/.pnpm/@workflow+errors@4.1.4/node_modules/@workflow/errors/dist/index.js
var BASE_URL = "https://useworkflow.dev/err";
function isError(value) {
  return typeof value === "object" && value !== null && "name" in value && "message" in value;
}
__name(isError, "isError");
var ERROR_SLUGS = {
  NODE_JS_MODULE_IN_WORKFLOW: "node-js-module-in-workflow",
  START_INVALID_WORKFLOW_FUNCTION: "start-invalid-workflow-function",
  SERIALIZATION_FAILED: "serialization-failed",
  WEBHOOK_INVALID_RESPOND_WITH_VALUE: "webhook-invalid-respond-with-value",
  WEBHOOK_RESPONSE_NOT_SENT: "webhook-response-not-sent",
  FETCH_IN_WORKFLOW_FUNCTION: "fetch-in-workflow",
  TIMEOUT_FUNCTIONS_IN_WORKFLOW: "timeout-in-workflow",
  HOOK_CONFLICT: "hook-conflict",
  CORRUPTED_EVENT_LOG: "corrupted-event-log",
  REPLAY_DIVERGENCE: "replay-divergence",
  STEP_NOT_REGISTERED: "step-not-registered",
  WORKFLOW_NOT_REGISTERED: "workflow-not-registered",
  RUNTIME_DECRYPTION_FAILED: "runtime-decryption-failed"
};
var WorkflowError = class extends Error {
  static {
    __name(this, "WorkflowError");
  }
  cause;
  constructor(message, options) {
    const msgDocs = options?.slug ? \`\${message}

Learn more: \${BASE_URL}/\${options.slug}\` : message;
    super(msgDocs, {
      cause: options?.cause
    });
    this.cause = options?.cause;
    if (options?.cause instanceof Error) {
      this.stack = \`\${this.stack}
Caused by: \${options.cause.stack}\`;
    }
  }
  static is(value) {
    return isError(value) && value.name === "WorkflowError";
  }
};
var HookConflictError = class extends WorkflowError {
  static {
    __name(this, "HookConflictError");
  }
  token;
  // TODO: Make this required once all persisted hook_conflict events and World
  // implementations always include the active hook owner's run ID.
  conflictingRunId;
  constructor(token, conflictingRunId) {
    super(\`Hook token "\${token}" is already in use by another workflow\${conflictingRunId ? \` (run "\${conflictingRunId}")\` : ""}\`, {
      slug: ERROR_SLUGS.HOOK_CONFLICT
    });
    this.name = "HookConflictError";
    this.token = token;
    if (conflictingRunId !== void 0) {
      this.conflictingRunId = conflictingRunId;
    }
  }
  static is(value) {
    return isError(value) && value.name === "HookConflictError";
  }
};
var FatalError = class extends Error {
  static {
    __name(this, "FatalError");
  }
  fatal = true;
  constructor(message) {
    super(message);
    this.name = "FatalError";
  }
  static is(value) {
    return isError(value) && value.name === "FatalError";
  }
};
var RetryableError = class extends Error {
  static {
    __name(this, "RetryableError");
  }
  /**
   * The Date when the step should be retried.
   */
  retryAfter;
  constructor(message, options = {}) {
    super(message);
    this.name = "RetryableError";
    if (options.retryAfter !== void 0) {
      this.retryAfter = parseDurationToDate(options.retryAfter);
    } else {
      this.retryAfter = new Date(Date.now() + 1e3);
    }
  }
  static is(value) {
    return isError(value) && value.name === "RetryableError";
  }
};
var FATAL_ERROR_KEY = /* @__PURE__ */ Symbol.for("@workflow/errors//FatalError");
var RETRYABLE_ERROR_KEY = /* @__PURE__ */ Symbol.for("@workflow/errors//RetryableError");
var HOOK_CONFLICT_ERROR_KEY = /* @__PURE__ */ Symbol.for("@workflow/errors//HookConflictError");
if (typeof globalThis !== "undefined") {
  if (!Object.hasOwn(globalThis, FATAL_ERROR_KEY)) {
    Object.defineProperty(globalThis, FATAL_ERROR_KEY, {
      value: FatalError,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
  if (!Object.hasOwn(globalThis, RETRYABLE_ERROR_KEY)) {
    Object.defineProperty(globalThis, RETRYABLE_ERROR_KEY, {
      value: RetryableError,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
  if (!Object.hasOwn(globalThis, HOOK_CONFLICT_ERROR_KEY)) {
    Object.defineProperty(globalThis, HOOK_CONFLICT_ERROR_KEY, {
      value: HookConflictError,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
}

// ../../node_modules/.pnpm/@workflow+core@4.6.0_@opentelemetry+api@1.9.1/node_modules/@workflow/core/dist/symbols.js
var WORKFLOW_SLEEP = /* @__PURE__ */ Symbol.for("WORKFLOW_SLEEP");

// ../../node_modules/.pnpm/@workflow+core@4.6.0_@opentelemetry+api@1.9.1/node_modules/@workflow/core/dist/sleep.js
async function sleep(param) {
  const sleepFn = globalThis[WORKFLOW_SLEEP];
  if (!sleepFn) {
    throw new Error("\`sleep()\` can only be called inside a workflow function");
  }
  return sleepFn(param);
}
__name(sleep, "sleep");

// ../../node_modules/.pnpm/workflow@4.6.0_@nestjs+common@11.1.28_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+core@1_b595a2b26d1a902ce4766ea1d8df7f10/node_modules/workflow/dist/stdlib.js
var fetch = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//workflow@4.6.0//fetch");

// src/workflows/incident-generation.ts
var evaluateWakeStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./src/workflows/incident-generation//evaluateWakeStep");
var startNextGenerationStep = globalThis[/* @__PURE__ */ Symbol.for("WORKFLOW_USE_STEP")]("step//./src/workflows/incident-generation//startNextGenerationStep");
async function incidentGenerationWorkflow(input) {
  while (true) {
    const result = await evaluateWakeStep(input);
    if (result.nextGeneration !== null) {
      await startNextGenerationStep({
        generation: result.nextGeneration,
        incidentId: input.incidentId
      });
      return;
    }
    if (result.done) return;
    await sleep(result.sleepUntil);
  }
}
__name(incidentGenerationWorkflow, "incidentGenerationWorkflow");
incidentGenerationWorkflow.workflowId = "workflow//./src/workflows/incident-generation//incidentGenerationWorkflow";
globalThis.__private_workflows.set("workflow//./src/workflows/incident-generation//incidentGenerationWorkflow", incidentGenerationWorkflow);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL21zQDIuMS4zL25vZGVfbW9kdWxlcy9tcy9pbmRleC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQHdvcmtmbG93K3V0aWxzQDQuMS4zL25vZGVfbW9kdWxlcy9Ad29ya2Zsb3cvdXRpbHMvc3JjL3RpbWUudHMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0B3b3JrZmxvdytlcnJvcnNANC4xLjQvbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9lcnJvcnMvc3JjL2luZGV4LnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9Ad29ya2Zsb3crY29yZUA0LjYuMF9Ab3BlbnRlbGVtZXRyeSthcGlAMS45LjEvbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9zeW1ib2xzLnRzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9Ad29ya2Zsb3crY29yZUA0LjYuMF9Ab3BlbnRlbGVtZXRyeSthcGlAMS45LjEvbm9kZV9tb2R1bGVzL0B3b3JrZmxvdy9jb3JlL3NyYy9zbGVlcC50cyIsICIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd29ya2Zsb3dANC42LjBfQG5lc3Rqcytjb21tb25AMTEuMS4yOF9yZWZsZWN0LW1ldGFkYXRhQDAuMi4yX3J4anNANy44LjJfX0BuZXN0anMrY29yZUAxX2I1OTVhMmIyNmQxYTkwMmNlNDc2NmVhMWQ4ZGY3ZjEwL25vZGVfbW9kdWxlcy93b3JrZmxvdy9zcmMvc3RkbGliLnRzIiwgInNyYy93b3JrZmxvd3MvaW5jaWRlbnQtZ2VuZXJhdGlvbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBIZWxwZXJzLlxuICovIHZhciBzID0gMTAwMDtcbnZhciBtID0gcyAqIDYwO1xudmFyIGggPSBtICogNjA7XG52YXIgZCA9IGggKiAyNDtcbnZhciB3ID0gZCAqIDc7XG52YXIgeSA9IGQgKiAzNjUuMjU7XG4vKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIHZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgbnVtYmVyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqLyBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgdmFsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlKHZhbCk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSh2YWwpKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLmxvbmcgPyBmbXRMb25nKHZhbCkgOiBmbXRTaG9ydCh2YWwpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgdmFsaWQgbnVtYmVyLiB2YWw9JyArIEpTT04uc3RyaW5naWZ5KHZhbCkpO1xufTtcbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovIGZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgIGlmIChzdHIubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIG1hdGNoID0gL14oLT8oPzpcXGQrKT9cXC4/XFxkKykgKihtaWxsaXNlY29uZHM/fG1zZWNzP3xtc3xzZWNvbmRzP3xzZWNzP3xzfG1pbnV0ZXM/fG1pbnM/fG18aG91cnM/fGhycz98aHxkYXlzP3xkfHdlZWtzP3x3fHllYXJzP3x5cnM/fHkpPyQvaS5leGVjKHN0cik7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBuID0gcGFyc2VGbG9hdChtYXRjaFsxXSk7XG4gICAgdmFyIHR5cGUgPSAobWF0Y2hbMl0gfHwgJ21zJykudG9Mb3dlckNhc2UoKTtcbiAgICBzd2l0Y2godHlwZSl7XG4gICAgICAgIGNhc2UgJ3llYXJzJzpcbiAgICAgICAgY2FzZSAneWVhcic6XG4gICAgICAgIGNhc2UgJ3lycyc6XG4gICAgICAgIGNhc2UgJ3lyJzpcbiAgICAgICAgY2FzZSAneSc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHk7XG4gICAgICAgIGNhc2UgJ3dlZWtzJzpcbiAgICAgICAgY2FzZSAnd2Vlayc6XG4gICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiB3O1xuICAgICAgICBjYXNlICdkYXlzJzpcbiAgICAgICAgY2FzZSAnZGF5JzpcbiAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIGQ7XG4gICAgICAgIGNhc2UgJ2hvdXJzJzpcbiAgICAgICAgY2FzZSAnaG91cic6XG4gICAgICAgIGNhc2UgJ2hycyc6XG4gICAgICAgIGNhc2UgJ2hyJzpcbiAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIGg7XG4gICAgICAgIGNhc2UgJ21pbnV0ZXMnOlxuICAgICAgICBjYXNlICdtaW51dGUnOlxuICAgICAgICBjYXNlICdtaW5zJzpcbiAgICAgICAgY2FzZSAnbWluJzpcbiAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIG07XG4gICAgICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgICAgICBjYXNlICdzZWNvbmQnOlxuICAgICAgICBjYXNlICdzZWNzJzpcbiAgICAgICAgY2FzZSAnc2VjJzpcbiAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHM7XG4gICAgICAgIGNhc2UgJ21pbGxpc2Vjb25kcyc6XG4gICAgICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICAgICAgY2FzZSAnbXNlY3MnOlxuICAgICAgICBjYXNlICdtc2VjJzpcbiAgICAgICAgY2FzZSAnbXMnOlxuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbn1cbi8qKlxuICogU2hvcnQgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi8gZnVuY3Rpb24gZm10U2hvcnQobXMpIHtcbiAgICB2YXIgbXNBYnMgPSBNYXRoLmFicyhtcyk7XG4gICAgaWYgKG1zQWJzID49IGQpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBkKSArICdkJztcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IGgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBoKSArICdoJztcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IG0pIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBtKSArICdtJztcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IHMpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBzKSArICdzJztcbiAgICB9XG4gICAgcmV0dXJuIG1zICsgJ21zJztcbn1cbi8qKlxuICogTG9uZyBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqLyBmdW5jdGlvbiBmbXRMb25nKG1zKSB7XG4gICAgdmFyIG1zQWJzID0gTWF0aC5hYnMobXMpO1xuICAgIGlmIChtc0FicyA+PSBkKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBkLCAnZGF5Jyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBoKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBoLCAnaG91cicpO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gbSkge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgbSwgJ21pbnV0ZScpO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gcykge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgcywgJ3NlY29uZCcpO1xuICAgIH1cbiAgICByZXR1cm4gbXMgKyAnIG1zJztcbn1cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi8gZnVuY3Rpb24gcGx1cmFsKG1zLCBtc0FicywgbiwgbmFtZSkge1xuICAgIHZhciBpc1BsdXJhbCA9IG1zQWJzID49IG4gKiAxLjU7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBuKSArICcgJyArIG5hbWUgKyAoaXNQbHVyYWwgPyAncycgOiAnJyk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBTdHJpbmdWYWx1ZSB9IGZyb20gJ21zJztcbmltcG9ydCBtcyBmcm9tICdtcyc7XG5cbi8qKlxuICogUGFyc2VzIGEgZHVyYXRpb24gcGFyYW1ldGVyIChzdHJpbmcsIG51bWJlciwgb3IgRGF0ZSkgYW5kIHJldHVybnMgYSBEYXRlIG9iamVjdFxuICogcmVwcmVzZW50aW5nIHdoZW4gdGhlIGR1cmF0aW9uIHNob3VsZCBlbGFwc2UuXG4gKlxuICogLSBGb3Igc3RyaW5nczogUGFyc2VzIGR1cmF0aW9uIHN0cmluZ3MgbGlrZSBcIjFzXCIsIFwiNW1cIiwgXCIxaFwiLCBldGMuIHVzaW5nIHRoZSBgbXNgIGxpYnJhcnlcbiAqIC0gRm9yIG51bWJlcnM6IFRyZWF0cyBhcyBtaWxsaXNlY29uZHMgZnJvbSBub3dcbiAqIC0gRm9yIERhdGUgb2JqZWN0czogUmV0dXJucyB0aGUgZGF0ZSBkaXJlY3RseSAoaGFuZGxlcyBib3RoIERhdGUgaW5zdGFuY2VzIGFuZCBkYXRlLWxpa2Ugb2JqZWN0cyBmcm9tIGRlc2VyaWFsaXphdGlvbilcbiAqXG4gKiBAcGFyYW0gcGFyYW0gLSBUaGUgZHVyYXRpb24gcGFyYW1ldGVyIChTdHJpbmdWYWx1ZSwgRGF0ZSwgb3IgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcylcbiAqIEByZXR1cm5zIEEgRGF0ZSBvYmplY3QgcmVwcmVzZW50aW5nIHdoZW4gdGhlIGR1cmF0aW9uIHNob3VsZCBlbGFwc2VcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgcGFyYW1ldGVyIGlzIGludmFsaWQgb3IgY2Fubm90IGJlIHBhcnNlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VEdXJhdGlvblRvRGF0ZShwYXJhbTogU3RyaW5nVmFsdWUgfCBEYXRlIHwgbnVtYmVyKTogRGF0ZSB7XG4gIGlmICh0eXBlb2YgcGFyYW0gPT09ICdzdHJpbmcnKSB7XG4gICAgY29uc3QgZHVyYXRpb25NcyA9IG1zKHBhcmFtKTtcbiAgICBpZiAodHlwZW9mIGR1cmF0aW9uTXMgIT09ICdudW1iZXInIHx8IGR1cmF0aW9uTXMgPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIGR1cmF0aW9uOiBcIiR7cGFyYW19XCIuIEV4cGVjdGVkIGEgdmFsaWQgZHVyYXRpb24gc3RyaW5nIGxpa2UgXCIxc1wiLCBcIjFtXCIsIFwiMWhcIiwgZXRjLmBcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLm5vdygpICsgZHVyYXRpb25Ncyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHBhcmFtID09PSAnbnVtYmVyJykge1xuICAgIGlmIChwYXJhbSA8IDAgfHwgIU51bWJlci5pc0Zpbml0ZShwYXJhbSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEludmFsaWQgZHVyYXRpb246ICR7cGFyYW19LiBFeHBlY3RlZCBhIG5vbi1uZWdhdGl2ZSBmaW5pdGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy5gXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERhdGUoRGF0ZS5ub3coKSArIHBhcmFtKTtcbiAgfSBlbHNlIGlmIChcbiAgICBwYXJhbSBpbnN0YW5jZW9mIERhdGUgfHxcbiAgICAocGFyYW0gJiZcbiAgICAgIHR5cGVvZiBwYXJhbSA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiAocGFyYW0gYXMgYW55KS5nZXRUaW1lID09PSAnZnVuY3Rpb24nKVxuICApIHtcbiAgICAvLyBIYW5kbGUgYm90aCBEYXRlIGluc3RhbmNlcyBhbmQgZGF0ZS1saWtlIG9iamVjdHMgKGZyb20gZGVzZXJpYWxpemF0aW9uKVxuICAgIHJldHVybiBwYXJhbSBpbnN0YW5jZW9mIERhdGUgPyBwYXJhbSA6IG5ldyBEYXRlKChwYXJhbSBhcyBhbnkpLmdldFRpbWUoKSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYEludmFsaWQgZHVyYXRpb24gcGFyYW1ldGVyLiBFeHBlY3RlZCBhIGR1cmF0aW9uIHN0cmluZywgbnVtYmVyIChtaWxsaXNlY29uZHMpLCBvciBEYXRlIG9iamVjdC5gXG4gICAgKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IHBhcnNlRHVyYXRpb25Ub0RhdGUgfSBmcm9tICdAd29ya2Zsb3cvdXRpbHMnO1xuaW1wb3J0IHR5cGUgeyBTdHJ1Y3R1cmVkRXJyb3IgfSBmcm9tICdAd29ya2Zsb3cvd29ybGQnO1xuaW1wb3J0IHR5cGUgeyBTdHJpbmdWYWx1ZSB9IGZyb20gJ21zJztcblxuY29uc3QgQkFTRV9VUkwgPSAnaHR0cHM6Ly91c2V3b3JrZmxvdy5kZXYvZXJyJztcblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqIENoZWNrIGlmIGEgdmFsdWUgaXMgYW4gRXJyb3Igd2l0aG91dCByZWx5aW5nIG9uIE5vZGUuanMgdXRpbGl0aWVzLlxuICogVGhpcyBpcyBuZWVkZWQgZm9yIGVycm9yIGNsYXNzZXMgdGhhdCBjYW4gYmUgdXNlZCBpbiBWTSBjb250ZXh0cyB3aGVyZVxuICogTm9kZS5qcyBpbXBvcnRzIGFyZSBub3QgYXZhaWxhYmxlLlxuICovXG5mdW5jdGlvbiBpc0Vycm9yKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgeyBuYW1lOiBzdHJpbmc7IG1lc3NhZ2U6IHN0cmluZyB9IHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXG4gICAgdmFsdWUgIT09IG51bGwgJiZcbiAgICAnbmFtZScgaW4gdmFsdWUgJiZcbiAgICAnbWVzc2FnZScgaW4gdmFsdWVcbiAgKTtcbn1cblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqIEFsbCB0aGUgc2x1Z3Mgb2YgdGhlIGVycm9ycyB1c2VkIGZvciBkb2N1bWVudGF0aW9uIGxpbmtzLlxuICovXG5leHBvcnQgY29uc3QgRVJST1JfU0xVR1MgPSB7XG4gIE5PREVfSlNfTU9EVUxFX0lOX1dPUktGTE9XOiAnbm9kZS1qcy1tb2R1bGUtaW4td29ya2Zsb3cnLFxuICBTVEFSVF9JTlZBTElEX1dPUktGTE9XX0ZVTkNUSU9OOiAnc3RhcnQtaW52YWxpZC13b3JrZmxvdy1mdW5jdGlvbicsXG4gIFNFUklBTElaQVRJT05fRkFJTEVEOiAnc2VyaWFsaXphdGlvbi1mYWlsZWQnLFxuICBXRUJIT09LX0lOVkFMSURfUkVTUE9ORF9XSVRIX1ZBTFVFOiAnd2ViaG9vay1pbnZhbGlkLXJlc3BvbmQtd2l0aC12YWx1ZScsXG4gIFdFQkhPT0tfUkVTUE9OU0VfTk9UX1NFTlQ6ICd3ZWJob29rLXJlc3BvbnNlLW5vdC1zZW50JyxcbiAgRkVUQ0hfSU5fV09SS0ZMT1dfRlVOQ1RJT046ICdmZXRjaC1pbi13b3JrZmxvdycsXG4gIFRJTUVPVVRfRlVOQ1RJT05TX0lOX1dPUktGTE9XOiAndGltZW91dC1pbi13b3JrZmxvdycsXG4gIEhPT0tfQ09ORkxJQ1Q6ICdob29rLWNvbmZsaWN0JyxcbiAgQ09SUlVQVEVEX0VWRU5UX0xPRzogJ2NvcnJ1cHRlZC1ldmVudC1sb2cnLFxuICBSRVBMQVlfRElWRVJHRU5DRTogJ3JlcGxheS1kaXZlcmdlbmNlJyxcbiAgU1RFUF9OT1RfUkVHSVNURVJFRDogJ3N0ZXAtbm90LXJlZ2lzdGVyZWQnLFxuICBXT1JLRkxPV19OT1RfUkVHSVNURVJFRDogJ3dvcmtmbG93LW5vdC1yZWdpc3RlcmVkJyxcbiAgUlVOVElNRV9ERUNSWVBUSU9OX0ZBSUxFRDogJ3J1bnRpbWUtZGVjcnlwdGlvbi1mYWlsZWQnLFxufSBhcyBjb25zdDtcblxudHlwZSBFcnJvclNsdWcgPSAodHlwZW9mIEVSUk9SX1NMVUdTKVtrZXlvZiB0eXBlb2YgRVJST1JfU0xVR1NdO1xuXG5pbnRlcmZhY2UgV29ya2Zsb3dFcnJvck9wdGlvbnMgZXh0ZW5kcyBFcnJvck9wdGlvbnMge1xuICAvKipcbiAgICogVGhlIHNsdWcgb2YgdGhlIGVycm9yLiBUaGlzIHdpbGwgYmUgdXNlZCB0byBnZW5lcmF0ZSBhIGxpbmsgdG8gdGhlIGVycm9yIGRvY3VtZW50YXRpb24uXG4gICAqL1xuICBzbHVnPzogRXJyb3JTbHVnO1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGNsYXNzIGZvciBhbGwgV29ya2Zsb3ctcmVsYXRlZCBlcnJvcnMuXG4gKlxuICogVGhpcyBlcnJvciBpcyB0aHJvd24gYnkgdGhlIFdvcmtmbG93IFNESyB3aGVuIGludGVybmFsIG9wZXJhdGlvbnMgZmFpbC5cbiAqIFlvdSBjYW4gdXNlIHRoaXMgY2xhc3Mgd2l0aCBgaW5zdGFuY2VvZmAgdG8gY2F0Y2ggYW55IFdvcmtmbG93IFNESyBlcnJvci5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIHRyeSB7XG4gKiAgIGF3YWl0IGdldFJ1bihydW5JZCk7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBXb3JrZmxvd0Vycm9yKSB7XG4gKiAgICAgY29uc29sZS5lcnJvcignV29ya2Zsb3cgU0RLIGVycm9yOicsIGVycm9yLm1lc3NhZ2UpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHJlYWRvbmx5IGNhdXNlPzogdW5rbm93bjtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIG9wdGlvbnM/OiBXb3JrZmxvd0Vycm9yT3B0aW9ucykge1xuICAgIGNvbnN0IG1zZ0RvY3MgPSBvcHRpb25zPy5zbHVnXG4gICAgICA/IGAke21lc3NhZ2V9XFxuXFxuTGVhcm4gbW9yZTogJHtCQVNFX1VSTH0vJHtvcHRpb25zLnNsdWd9YFxuICAgICAgOiBtZXNzYWdlO1xuICAgIHN1cGVyKG1zZ0RvY3MsIHsgY2F1c2U6IG9wdGlvbnM/LmNhdXNlIH0pO1xuICAgIHRoaXMuY2F1c2UgPSBvcHRpb25zPy5jYXVzZTtcblxuICAgIGlmIChvcHRpb25zPy5jYXVzZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aGlzLnN0YWNrID0gYCR7dGhpcy5zdGFja31cXG5DYXVzZWQgYnk6ICR7b3B0aW9ucy5jYXVzZS5zdGFja31gO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFdvcmtmbG93RXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIHdvcmxkIChzdG9yYWdlIGJhY2tlbmQpIG9wZXJhdGlvbiBmYWlscyB1bmV4cGVjdGVkbHkuXG4gKlxuICogVGhpcyBpcyB0aGUgY2F0Y2gtYWxsIGVycm9yIGZvciB3b3JsZCBpbXBsZW1lbnRhdGlvbnMuIFNwZWNpZmljLFxuICogd2VsbC1rbm93biBmYWlsdXJlIG1vZGVzIGhhdmUgZGVkaWNhdGVkIGVycm9yIHR5cGVzIChlLmcuXG4gKiBFbnRpdHlDb25mbGljdEVycm9yLCBSdW5FeHBpcmVkRXJyb3IsIFRocm90dGxlRXJyb3IpLiBUaGlzIGVycm9yXG4gKiBjb3ZlcnMgZXZlcnl0aGluZyBlbHNlIOKAlCB2YWxpZGF0aW9uIGZhaWx1cmVzLCBtaXNzaW5nIGVudGl0aWVzXG4gKiB3aXRob3V0IGEgZGVkaWNhdGVkIHR5cGUsIG9yIHVuZXhwZWN0ZWQgSFRUUCBlcnJvcnMgZnJvbSB3b3JsZC12ZXJjZWwuXG4gKi9cbmV4cG9ydCBjbGFzcyBXb3JrZmxvd1dvcmxkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgc3RhdHVzPzogbnVtYmVyO1xuICBjb2RlPzogc3RyaW5nO1xuICB1cmw/OiBzdHJpbmc7XG4gIC8qKiBSZXRyeS1BZnRlciB2YWx1ZSBpbiBzZWNvbmRzLCBwcmVzZW50IG9uIDQyOSBhbmQgNDI1IHJlc3BvbnNlcyAqL1xuICByZXRyeUFmdGVyPzogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBvcHRpb25zPzoge1xuICAgICAgc3RhdHVzPzogbnVtYmVyO1xuICAgICAgdXJsPzogc3RyaW5nO1xuICAgICAgY29kZT86IHN0cmluZztcbiAgICAgIHJldHJ5QWZ0ZXI/OiBudW1iZXI7XG4gICAgICBjYXVzZT86IHVua25vd247XG4gICAgfVxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCB7XG4gICAgICBjYXVzZTogb3B0aW9ucz8uY2F1c2UsXG4gICAgfSk7XG4gICAgdGhpcy5uYW1lID0gJ1dvcmtmbG93V29ybGRFcnJvcic7XG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zPy5zdGF0dXM7XG4gICAgdGhpcy5jb2RlID0gb3B0aW9ucz8uY29kZTtcbiAgICB0aGlzLnVybCA9IG9wdGlvbnM/LnVybDtcbiAgICB0aGlzLnJldHJ5QWZ0ZXIgPSBvcHRpb25zPy5yZXRyeUFmdGVyO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dXb3JsZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1dvcmtmbG93V29ybGRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIHdvcmtmbG93IHJ1biBmYWlscyBkdXJpbmcgZXhlY3V0aW9uLlxuICpcbiAqIFRoaXMgZXJyb3IgaW5kaWNhdGVzIHRoYXQgdGhlIHdvcmtmbG93IGVuY291bnRlcmVkIGEgZmF0YWwgZXJyb3IgYW5kIGNhbm5vdFxuICogY29udGludWUuIEl0IGlzIHRocm93biB3aGVuIGF3YWl0aW5nIGBydW4ucmV0dXJuVmFsdWVgIG9uIGEgcnVuIHdob3NlIHN0YXR1c1xuICogaXMgYCdmYWlsZWQnYC4gVGhlIGBjYXVzZWAgcHJvcGVydHkgY29udGFpbnMgdGhlIHVuZGVybHlpbmcgZXJyb3Igd2l0aCBpdHNcbiAqIG1lc3NhZ2UsIHN0YWNrIHRyYWNlLCBhbmQgb3B0aW9uYWwgZXJyb3IgY29kZS5cbiAqXG4gKiBVc2UgdGhlIHN0YXRpYyBgV29ya2Zsb3dSdW5GYWlsZWRFcnJvci5pcygpYCBtZXRob2QgZm9yIHR5cGUtc2FmZSBjaGVja2luZ1xuICogaW4gY2F0Y2ggYmxvY2tzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgV29ya2Zsb3dSdW5GYWlsZWRFcnJvciB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9lcnJvcnNcIjtcbiAqXG4gKiB0cnkge1xuICogICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW4ucmV0dXJuVmFsdWU7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoV29ya2Zsb3dSdW5GYWlsZWRFcnJvci5pcyhlcnJvcikpIHtcbiAqICAgICBjb25zb2xlLmVycm9yKGBSdW4gJHtlcnJvci5ydW5JZH0gZmFpbGVkOmAsIGVycm9yLmNhdXNlLm1lc3NhZ2UpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93UnVuRmFpbGVkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgcnVuSWQ6IHN0cmluZztcbiAgZGVjbGFyZSBjYXVzZTogRXJyb3IgJiB7IGNvZGU/OiBzdHJpbmcgfTtcblxuICBjb25zdHJ1Y3RvcihydW5JZDogc3RyaW5nLCBlcnJvcjogU3RydWN0dXJlZEVycm9yKSB7XG4gICAgLy8gQ3JlYXRlIGEgcHJvcGVyIEVycm9yIGluc3RhbmNlIGZyb20gdGhlIFN0cnVjdHVyZWRFcnJvciB0byBzZXQgYXMgY2F1c2VcbiAgICAvLyBOT1RFOiBjdXN0b20gZXJyb3IgdHlwZXMgZG8gbm90IGdldCBzZXJpYWxpemVkL2Rlc2VyaWFsaXplZC4gRXZlcnl0aGluZyBpcyBhbiBFcnJvclxuICAgIGNvbnN0IGNhdXNlRXJyb3IgPSBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgaWYgKGVycm9yLnN0YWNrKSB7XG4gICAgICBjYXVzZUVycm9yLnN0YWNrID0gZXJyb3Iuc3RhY2s7XG4gICAgfVxuICAgIGlmIChlcnJvci5jb2RlKSB7XG4gICAgICAoY2F1c2VFcnJvciBhcyBhbnkpLmNvZGUgPSBlcnJvci5jb2RlO1xuICAgIH1cblxuICAgIHN1cGVyKGBXb3JrZmxvdyBydW4gXCIke3J1bklkfVwiIGZhaWxlZDogJHtlcnJvci5tZXNzYWdlfWAsIHtcbiAgICAgIGNhdXNlOiBjYXVzZUVycm9yLFxuICAgIH0pO1xuICAgIHRoaXMubmFtZSA9ICdXb3JrZmxvd1J1bkZhaWxlZEVycm9yJztcbiAgICB0aGlzLnJ1bklkID0gcnVuSWQ7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBXb3JrZmxvd1J1bkZhaWxlZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1dvcmtmbG93UnVuRmFpbGVkRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYXR0ZW1wdGluZyB0byBnZXQgcmVzdWx0cyBmcm9tIGFuIGluY29tcGxldGUgd29ya2Zsb3cgcnVuLlxuICpcbiAqIFRoaXMgZXJyb3Igb2NjdXJzIHdoZW4geW91IHRyeSB0byBhY2Nlc3MgdGhlIHJlc3VsdCBvZiBhIHdvcmtmbG93XG4gKiB0aGF0IGlzIHN0aWxsIHJ1bm5pbmcgb3IgaGFzbid0IGNvbXBsZXRlZCB5ZXQuXG4gKi9cbmV4cG9ydCBjbGFzcyBXb3JrZmxvd1J1bk5vdENvbXBsZXRlZEVycm9yIGV4dGVuZHMgV29ya2Zsb3dFcnJvciB7XG4gIHJ1bklkOiBzdHJpbmc7XG4gIHN0YXR1czogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJ1bklkOiBzdHJpbmcsIHN0YXR1czogc3RyaW5nKSB7XG4gICAgc3VwZXIoYFdvcmtmbG93IHJ1biBcIiR7cnVuSWR9XCIgaGFzIG5vdCBjb21wbGV0ZWRgLCB7fSk7XG4gICAgdGhpcy5uYW1lID0gJ1dvcmtmbG93UnVuTm90Q29tcGxldGVkRXJyb3InO1xuICAgIHRoaXMucnVuSWQgPSBydW5JZDtcbiAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFdvcmtmbG93UnVuTm90Q29tcGxldGVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dSdW5Ob3RDb21wbGV0ZWRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgV29ya2Zsb3cgcnVudGltZSBlbmNvdW50ZXJzIGFuIGludGVybmFsIGVycm9yLlxuICpcbiAqIFRoaXMgZXJyb3IgaW5kaWNhdGVzIGFuIGlzc3VlIHdpdGggd29ya2Zsb3cgZXhlY3V0aW9uLCBzdWNoIGFzXG4gKiBzZXJpYWxpemF0aW9uIGZhaWx1cmVzLCBzdGFydGluZyBhbiBpbnZhbGlkIHdvcmtmbG93IGZ1bmN0aW9uLCBvclxuICogb3RoZXIgcnVudGltZSBwcm9ibGVtcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93UnVudGltZUVycm9yIGV4dGVuZHMgV29ya2Zsb3dFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9ucz86IFdvcmtmbG93RXJyb3JPcHRpb25zKSB7XG4gICAgc3VwZXIobWVzc2FnZSwge1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgICB0aGlzLm5hbWUgPSAnV29ya2Zsb3dSdW50aW1lRXJyb3InO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgV29ya2Zsb3dSdW50aW1lRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnV29ya2Zsb3dSdW50aW1lRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gdGhlIHBlcnNpc3RlZCB3b3JrZmxvdyBldmVudCBsb2cgY2Fubm90IGJlIHJlcGxheWVkIGJlY2F1c2UgaXRcbiAqIGNvbnRhaW5zIG9ycGhhbmVkLCBkdXBsaWNhdGUsIG9yIG1pc21hdGNoZWQgZXZlbnRzLlxuICpcbiAqIFRoaXMgaXMgYSBydW50aW1lL2luZnJhc3RydWN0dXJlIGZhaWx1cmUgcmF0aGVyIHRoYW4gdXNlciBjb2RlIHRocm93aW5nLlxuICogV2hlbiB0aGlzIHJlYWNoZXMgcnVuIGZhaWx1cmUgaGFuZGxpbmcsIGl0IGlzIHJlY29yZGVkIHdpdGggdGhlIGRpc3RpbmN0XG4gKiBgQ09SUlVQVEVEX0VWRU5UX0xPR2AgY29kZSBzbyB3b3JsZHMgYW5kIGJhY2tlbmRzIGNhbiB0cmFjayBpdCBzZXBhcmF0ZWx5XG4gKiBmcm9tIGdlbmVyaWMgcnVudGltZSBmYWlsdXJlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvcnJ1cHRlZEV2ZW50TG9nRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1J1bnRpbWVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9ucz86IEVycm9yT3B0aW9ucykge1xuICAgIHN1cGVyKG1lc3NhZ2UsIHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBzbHVnOiBFUlJPUl9TTFVHUy5DT1JSVVBURURfRVZFTlRfTE9HLFxuICAgIH0pO1xuICAgIHRoaXMubmFtZSA9ICdDb3JydXB0ZWRFdmVudExvZ0Vycm9yJztcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIENvcnJ1cHRlZEV2ZW50TG9nRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnQ29ycnVwdGVkRXZlbnRMb2dFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25hbCBzdHJ1Y3R1cmVkIGNvbnRleHQgYXR0YWNoZWQgdG8gYSB7QGxpbmsgUnVudGltZURlY3J5cHRpb25FcnJvcn0sXG4gKiBjYXJyaWVkIG92ZXIgZnJvbSB0aGUgdW5kZXJseWluZyBkZWNyeXB0IGNhbGwgc2l0ZSB0byBoZWxwIGRpYWdub3NlIHRoZVxuICogZmFpbHVyZSB3aXRob3V0IHBva2luZyB0aHJvdWdoIHN0YWNrcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSdW50aW1lRGVjcnlwdGlvbkVycm9yQ29udGV4dCB7XG4gIC8qKiBUaGUgb3BlcmF0aW9uIHRoYXQgZmFpbGVkIOKAlCB1c2VmdWwgdG8gdGVsbCBlbmNyeXB0IHZzIGRlY3J5cHQgYXBhcnQuICovXG4gIG9wZXJhdGlvbj86ICdlbmNyeXB0JyB8ICdkZWNyeXB0JztcbiAgLyoqIEJ5dGUgbGVuZ3RoIG9mIHRoZSBpbnB1dCBwYXlsb2FkIGF0IHRoZSB0aW1lIG9mIHRoZSBmYWlsdXJlLiAqL1xuICBieXRlTGVuZ3RoPzogbnVtYmVyO1xuICAvKipcbiAgICogVGhlIGZpcnN0IDQgYnl0ZXMgb2YgdGhlIGlucHV0IHBheWxvYWQsIGRlY29kZWQgYXMgVVRGLTggaWYgcHJpbnRhYmxlLlxuICAgKiBVc2VmdWwgZm9yIHRlbGxpbmcgYXBhcnQgdHJ1bmNhdGVkLWJ1dC12YWxpZC1sb29raW5nIGVuY3J5cHRlZCBwYXlsb2Fkc1xuICAgKiBmcm9tIGNvbXBsZXRlbHkgdW5yZWxhdGVkIGNvcnJ1cHRpb24gKGUuZy4gYW4gSFRNTCBlcnJvciBwYWdlIHN1cmZhY2VkXG4gICAqIGFzIGEgMjAwIE9LKS5cbiAgICovXG4gIGZvcm1hdFByZWZpeD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgU0RLJ3MgYnVpbHQtaW4gQUVTLUdDTSBlbmNyeXB0aW9uIGxheWVyIGZhaWxzIHRvIGVuY3J5cHRcbiAqIG9yIGRlY3J5cHQgYSB3b3JrZmxvdyBwYXlsb2FkLlxuICpcbiAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgU0RLIGZhaWx1cmUg4oCUIHVzZXIgY29kZSBuZXZlciBpbnZva2VzIHRoZSBTREsnc1xuICogZW5jcnlwdGlvbiBwcmltaXRpdmVzIGRpcmVjdGx5LiBDb21tb24gY2F1c2VzOlxuICpcbiAqIC0gQSBjaXBoZXJ0ZXh0IC8gYXV0aCB0YWcgbWlzbWF0Y2gsIHR5cGljYWxseSBzdXJmYWNlZCBhcyB0aGUgbmF0aXZlIFdlYlxuICogICBDcnlwdG8gYE9wZXJhdGlvbkVycm9yOiBUaGUgb3BlcmF0aW9uIGZhaWxlZCBmb3IgYW4gb3BlcmF0aW9uLXNwZWNpZmljXG4gKiAgIHJlYXNvbmAuIFVzdWFsbHkgY2F1c2VkIGJ5IGNpcGhlcnRleHQgbXV0YXRpb24gb3IgdHJ1bmNhdGlvbiBpbiB0cmFuc2l0XG4gKiAgIGJldHdlZW4gc3RvcmFnZSBhbmQgcmVhZCAodHJ1bmNhdGVkIEhUVFAgcmVzcG9uc2UsIGVkZ2UtY2FjaGUgbWlzc1xuICogICByZXR1cm5pbmcgYSBwYXJ0aWFsIDIwMCwgcHJveHkgZHJvcCBkdXJpbmcgc3RyZWFtaW5nLCBldGMuKS5cbiAqIC0gQSBrZXkgcmVzb2x1dGlvbiBtaXNtYXRjaCAod3JvbmcgZGVwbG95bWVudCwgbWlzc2luZyBrZXkgbWF0ZXJpYWwpLlxuICogLSBBIG1hbGZvcm1lZCBlbmNyeXB0ZWQgZW52ZWxvcGUgKHRvbyBzaG9ydCB0byBjb250YWluIHRoZSBHQ00gbm9uY2VcbiAqICAgYW5kIHRhZykuXG4gKlxuICogRXh0ZW5kcyB7QGxpbmsgV29ya2Zsb3dSdW50aW1lRXJyb3J9IHNvIHRoZSBydW4tZmFpbHVyZSBjbGFzc2lmaWVyXG4gKiByb3V0ZXMgaXQgdG8gYFJVTlRJTUVfRVJST1JgLlxuICovXG5leHBvcnQgY2xhc3MgUnVudGltZURlY3J5cHRpb25FcnJvciBleHRlbmRzIFdvcmtmbG93UnVudGltZUVycm9yIHtcbiAgLyoqIE9wdGlvbmFsIHN0cnVjdHVyZWQgY29udGV4dCBhYm91dCB0aGUgZmFpbGVkIGVuY3J5cHQvZGVjcnlwdCBjYWxsLiAqL1xuICByZWFkb25seSBjb250ZXh0PzogUnVudGltZURlY3J5cHRpb25FcnJvckNvbnRleHQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiBFcnJvck9wdGlvbnMgJiB7IGNvbnRleHQ/OiBSdW50aW1lRGVjcnlwdGlvbkVycm9yQ29udGV4dCB9XG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIHtcbiAgICAgIGNhdXNlOiBvcHRpb25zPy5jYXVzZSxcbiAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLlJVTlRJTUVfREVDUllQVElPTl9GQUlMRUQsXG4gICAgfSk7XG4gICAgdGhpcy5uYW1lID0gJ1J1bnRpbWVEZWNyeXB0aW9uRXJyb3InO1xuICAgIGlmIChvcHRpb25zPy5jb250ZXh0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY29udGV4dCA9IG9wdGlvbnMuY29udGV4dDtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSdW50aW1lRGVjcnlwdGlvbkVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1J1bnRpbWVEZWNyeXB0aW9uRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gdGhlIGN1cnJlbnQgd29ya2Zsb3cgcmVwbGF5IGNhbm5vdCBmb2xsb3cgdGhlIHBhdGggZGVzY3JpYmVkIGJ5XG4gKiB0aGUgcmVjb3JkZWQgZXZlbnQgbG9nLiBBIHNpbmdsZSBkaXZlcmdlbmNlIGRvZXMgbm90IHByb3ZlIHRoYXQgdGhlXG4gKiBwZXJzaXN0ZWQgaGlzdG9yeSBpcyBpbnZhbGlkOiBhIHN1YnNlcXVlbnQgcmVwbGF5IG1heSBvYnNlcnZlIG9yIHNjaGVkdWxlXG4gKiB3b3JrIGNvcnJlY3RseSwgc28gdGhlIHJ1bnRpbWUgbWF5IHJlZGVsaXZlciBiZWZvcmUgZGVjbGFyaW5nIGNvcnJ1cHRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXBsYXlEaXZlcmdlbmNlRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd1J1bnRpbWVFcnJvciB7XG4gIHJlYWRvbmx5IGV2ZW50SWQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIG9wdGlvbnM6IEVycm9yT3B0aW9ucyAmIHsgZXZlbnRJZDogc3RyaW5nIH0pIHtcbiAgICBzdXBlcihtZXNzYWdlLCB7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgc2x1ZzogRVJST1JfU0xVR1MuUkVQTEFZX0RJVkVSR0VOQ0UsXG4gICAgfSk7XG4gICAgdGhpcy5uYW1lID0gJ1JlcGxheURpdmVyZ2VuY2VFcnJvcic7XG4gICAgdGhpcy5ldmVudElkID0gb3B0aW9ucy5ldmVudElkO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUmVwbGF5RGl2ZXJnZW5jZUVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1JlcGxheURpdmVyZ2VuY2VFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIHN0ZXAgZnVuY3Rpb24gaXMgbm90IHJlZ2lzdGVyZWQgaW4gdGhlIGN1cnJlbnQgZGVwbG95bWVudC5cbiAqXG4gKiBUaGlzIGlzIGFuIGluZnJhc3RydWN0dXJlIGVycm9yIOKAlCBub3QgYSB1c2VyIGNvZGUgZXJyb3IuIEl0IHR5cGljYWxseSBtZWFuc1xuICogc29tZXRoaW5nIHdlbnQgd3Jvbmcgd2l0aCB0aGUgYnVuZGxpbmcvYnVpbGQgdG9vbGluZyB0aGF0IGNhdXNlZCB0aGUgc3RlcFxuICogdG8gbm90IGdldCBidWlsdCBjb3JyZWN0bHkuXG4gKlxuICogV2hlbiB0aGlzIGhhcHBlbnMsIHRoZSBzdGVwIGZhaWxzIChsaWtlIGEgRmF0YWxFcnJvcikgYW5kIGNvbnRyb2wgaXMgcGFzc2VkIGJhY2tcbiAqIHRvIHRoZSB3b3JrZmxvdyBmdW5jdGlvbiwgd2hpY2ggY2FuIG9wdGlvbmFsbHkgaGFuZGxlIHRoZSBmYWlsdXJlIGdyYWNlZnVsbHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGVwTm90UmVnaXN0ZXJlZEVycm9yIGV4dGVuZHMgV29ya2Zsb3dSdW50aW1lRXJyb3Ige1xuICBzdGVwTmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHN0ZXBOYW1lOiBzdHJpbmcpIHtcbiAgICBzdXBlcihcbiAgICAgIGBTdGVwIFwiJHtzdGVwTmFtZX1cIiBpcyBub3QgcmVnaXN0ZXJlZCBpbiB0aGUgY3VycmVudCBkZXBsb3ltZW50LiBUaGlzIHVzdWFsbHkgaW5kaWNhdGVzIGEgYnVpbGQgb3IgYnVuZGxpbmcgaXNzdWUgdGhhdCBjYXVzZWQgdGhlIHN0ZXAgdG8gbm90IGJlIGluY2x1ZGVkIGluIHRoZSBkZXBsb3ltZW50LmAsXG4gICAgICB7IHNsdWc6IEVSUk9SX1NMVUdTLlNURVBfTk9UX1JFR0lTVEVSRUQgfVxuICAgICk7XG4gICAgdGhpcy5uYW1lID0gJ1N0ZXBOb3RSZWdpc3RlcmVkRXJyb3InO1xuICAgIHRoaXMuc3RlcE5hbWUgPSBzdGVwTmFtZTtcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFN0ZXBOb3RSZWdpc3RlcmVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnU3RlcE5vdFJlZ2lzdGVyZWRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIHdvcmtmbG93IGZ1bmN0aW9uIGlzIG5vdCByZWdpc3RlcmVkIGluIHRoZSBjdXJyZW50IGRlcGxveW1lbnQuXG4gKlxuICogVGhpcyBpcyBhbiBpbmZyYXN0cnVjdHVyZSBlcnJvciDigJQgbm90IGEgdXNlciBjb2RlIGVycm9yLiBJdCB0eXBpY2FsbHkgbWVhbnM6XG4gKiAtIEEgcnVuIHdhcyBzdGFydGVkIGFnYWluc3QgYSBkZXBsb3ltZW50IHRoYXQgZG9lcyBub3QgaGF2ZSB0aGUgd29ya2Zsb3dcbiAqICAgKGUuZy4sIHRoZSB3b3JrZmxvdyB3YXMgcmVuYW1lZCBvciBtb3ZlZCBhbmQgYSBuZXcgcnVuIHRhcmdldGVkIHRoZSBsYXRlc3QgZGVwbG95bWVudClcbiAqIC0gU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2l0aCB0aGUgYnVuZGxpbmcvYnVpbGQgdG9vbGluZyB0aGF0IGNhdXNlZCB0aGUgd29ya2Zsb3dcbiAqICAgdG8gbm90IGdldCBidWlsdCBjb3JyZWN0bHlcbiAqXG4gKiBXaGVuIHRoaXMgaGFwcGVucywgdGhlIHJ1biBmYWlscyB3aXRoIGEgYFJVTlRJTUVfRVJST1JgIGVycm9yIGNvZGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBXb3JrZmxvd05vdFJlZ2lzdGVyZWRFcnJvciBleHRlbmRzIFdvcmtmbG93UnVudGltZUVycm9yIHtcbiAgd29ya2Zsb3dOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iod29ya2Zsb3dOYW1lOiBzdHJpbmcpIHtcbiAgICBzdXBlcihcbiAgICAgIGBXb3JrZmxvdyBcIiR7d29ya2Zsb3dOYW1lfVwiIGlzIG5vdCByZWdpc3RlcmVkIGluIHRoZSBjdXJyZW50IGRlcGxveW1lbnQuIFRoaXMgdXN1YWxseSBtZWFucyBhIHJ1biB3YXMgc3RhcnRlZCBhZ2FpbnN0IGEgZGVwbG95bWVudCB0aGF0IGRvZXMgbm90IGhhdmUgdGhpcyB3b3JrZmxvdywgb3IgdGhlcmUgd2FzIGEgYnVpbGQvYnVuZGxpbmcgaXNzdWUuYCxcbiAgICAgIHsgc2x1ZzogRVJST1JfU0xVR1MuV09SS0ZMT1dfTk9UX1JFR0lTVEVSRUQgfVxuICAgICk7XG4gICAgdGhpcy5uYW1lID0gJ1dvcmtmbG93Tm90UmVnaXN0ZXJlZEVycm9yJztcbiAgICB0aGlzLndvcmtmbG93TmFtZSA9IHdvcmtmbG93TmFtZTtcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFdvcmtmbG93Tm90UmVnaXN0ZXJlZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1dvcmtmbG93Tm90UmVnaXN0ZXJlZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIHBlcmZvcm1pbmcgb3BlcmF0aW9ucyBvbiBhIHdvcmtmbG93IHJ1biB0aGF0IGRvZXMgbm90IGV4aXN0LlxuICpcbiAqIFRoaXMgZXJyb3Igb2NjdXJzIHdoZW4geW91IGNhbGwgbWV0aG9kcyBvbiBhIHJ1biBvYmplY3QgKGUuZy4gYHJ1bi5zdGF0dXNgLFxuICogYHJ1bi5jYW5jZWwoKWAsIGBydW4ucmV0dXJuVmFsdWVgKSBidXQgdGhlIHVuZGVybHlpbmcgcnVuIElEIGRvZXMgbm90IG1hdGNoXG4gKiBhbnkga25vd24gd29ya2Zsb3cgcnVuLiBOb3RlIHRoYXQgYGdldFJ1bihpZClgIGl0c2VsZiBpcyBzeW5jaHJvbm91cyBhbmQgd2lsbFxuICogbm90IHRocm93IOKAlCB0aGlzIGVycm9yIGlzIHJhaXNlZCB3aGVuIHN1YnNlcXVlbnQgb3BlcmF0aW9ucyBkaXNjb3ZlciB0aGUgcnVuXG4gKiBpcyBtaXNzaW5nLlxuICpcbiAqIFVzZSB0aGUgc3RhdGljIGBXb3JrZmxvd1J1bk5vdEZvdW5kRXJyb3IuaXMoKWAgbWV0aG9kIGZvciB0eXBlLXNhZmUgY2hlY2tpbmdcbiAqIGluIGNhdGNoIGJsb2Nrcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IFdvcmtmbG93UnVuTm90Rm91bmRFcnJvciB9IGZyb20gXCJ3b3JrZmxvdy9pbnRlcm5hbC9lcnJvcnNcIjtcbiAqXG4gKiB0cnkge1xuICogICBjb25zdCBzdGF0dXMgPSBhd2FpdCBydW4uc3RhdHVzO1xuICogfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgaWYgKFdvcmtmbG93UnVuTm90Rm91bmRFcnJvci5pcyhlcnJvcikpIHtcbiAqICAgICBjb25zb2xlLmVycm9yKGBSdW4gJHtlcnJvci5ydW5JZH0gZG9lcyBub3QgZXhpc3RgKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBXb3JrZmxvd1J1bk5vdEZvdW5kRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgcnVuSWQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihydW5JZDogc3RyaW5nKSB7XG4gICAgc3VwZXIoYFdvcmtmbG93IHJ1biBcIiR7cnVuSWR9XCIgbm90IGZvdW5kYCwge30pO1xuICAgIHRoaXMubmFtZSA9ICdXb3JrZmxvd1J1bk5vdEZvdW5kRXJyb3InO1xuICAgIHRoaXMucnVuSWQgPSBydW5JZDtcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFdvcmtmbG93UnVuTm90Rm91bmRFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdXb3JrZmxvd1J1bk5vdEZvdW5kRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBob29rIHRva2VuIGlzIGFscmVhZHkgaW4gdXNlIGJ5IGFub3RoZXIgYWN0aXZlIHdvcmtmbG93IHJ1bi5cbiAqXG4gKiBUaGlzIGlzIGEgdXNlciBlcnJvciDigJQgaXQgbWVhbnMgdGhlIHNhbWUgY3VzdG9tIHRva2VuIHdhcyBwYXNzZWQgdG9cbiAqIGBjcmVhdGVIb29rYCBpbiB0d28gb3IgbW9yZSBjb25jdXJyZW50IHJ1bnMuIFVzZSBhIHVuaXF1ZSB0b2tlbiBwZXIgcnVuXG4gKiAob3Igb21pdCB0aGUgdG9rZW4gdG8gbGV0IHRoZSBydW50aW1lIGdlbmVyYXRlIG9uZSBhdXRvbWF0aWNhbGx5KS5cbiAqL1xuZXhwb3J0IGNsYXNzIEhvb2tDb25mbGljdEVycm9yIGV4dGVuZHMgV29ya2Zsb3dFcnJvciB7XG4gIHRva2VuOiBzdHJpbmc7XG4gIC8vIFRPRE86IE1ha2UgdGhpcyByZXF1aXJlZCBvbmNlIGFsbCBwZXJzaXN0ZWQgaG9va19jb25mbGljdCBldmVudHMgYW5kIFdvcmxkXG4gIC8vIGltcGxlbWVudGF0aW9ucyBhbHdheXMgaW5jbHVkZSB0aGUgYWN0aXZlIGhvb2sgb3duZXIncyBydW4gSUQuXG4gIGNvbmZsaWN0aW5nUnVuSWQ/OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodG9rZW46IHN0cmluZywgY29uZmxpY3RpbmdSdW5JZD86IHN0cmluZykge1xuICAgIHN1cGVyKFxuICAgICAgYEhvb2sgdG9rZW4gXCIke3Rva2VufVwiIGlzIGFscmVhZHkgaW4gdXNlIGJ5IGFub3RoZXIgd29ya2Zsb3cke2NvbmZsaWN0aW5nUnVuSWQgPyBgIChydW4gXCIke2NvbmZsaWN0aW5nUnVuSWR9XCIpYCA6ICcnfWAsXG4gICAgICB7XG4gICAgICAgIHNsdWc6IEVSUk9SX1NMVUdTLkhPT0tfQ09ORkxJQ1QsXG4gICAgICB9XG4gICAgKTtcbiAgICB0aGlzLm5hbWUgPSAnSG9va0NvbmZsaWN0RXJyb3InO1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICBpZiAoY29uZmxpY3RpbmdSdW5JZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmNvbmZsaWN0aW5nUnVuSWQgPSBjb25mbGljdGluZ1J1bklkO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIEhvb2tDb25mbGljdEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ0hvb2tDb25mbGljdEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGNhbGxpbmcgYHJlc3VtZUhvb2soKWAgb3IgYHJlc3VtZVdlYmhvb2soKWAgd2l0aCBhIHRva2VuIHRoYXRcbiAqIGRvZXMgbm90IG1hdGNoIGFueSBhY3RpdmUgaG9vay5cbiAqXG4gKiBDb21tb24gY2F1c2VzOlxuICogLSBUaGUgaG9vayBoYXMgZXhwaXJlZCAocGFzdCBpdHMgVFRMKVxuICogLSBUaGUgaG9vayB3YXMgYWxyZWFkeSBkaXNwb3NlZCBhZnRlciBiZWluZyBjb25zdW1lZFxuICogLSBUaGUgd29ya2Zsb3cgaGFzIG5vdCBzdGFydGVkIHlldCwgc28gdGhlIGhvb2sgZG9lcyBub3QgZXhpc3RcbiAqXG4gKiBBIGNvbW1vbiBwYXR0ZXJuIGlzIHRvIGNhdGNoIHRoaXMgZXJyb3IgYW5kIHN0YXJ0IGEgbmV3IHdvcmtmbG93IHJ1biB3aGVuXG4gKiB0aGUgaG9vayBkb2VzIG5vdCBleGlzdCB5ZXQgKHRoZSBcInJlc3VtZSBvciBzdGFydFwiIHBhdHRlcm4pLlxuICpcbiAqIFVzZSB0aGUgc3RhdGljIGBIb29rTm90Rm91bmRFcnJvci5pcygpYCBtZXRob2QgZm9yIHR5cGUtc2FmZSBjaGVja2luZyBpblxuICogY2F0Y2ggYmxvY2tzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgSG9va05vdEZvdW5kRXJyb3IgfSBmcm9tIFwid29ya2Zsb3cvaW50ZXJuYWwvZXJyb3JzXCI7XG4gKlxuICogdHJ5IHtcbiAqICAgYXdhaXQgcmVzdW1lSG9vayh0b2tlbiwgcGF5bG9hZCk7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoSG9va05vdEZvdW5kRXJyb3IuaXMoZXJyb3IpKSB7XG4gKiAgICAgLy8gSG9vayBkb2Vzbid0IGV4aXN0IOKAlCBzdGFydCBhIG5ldyB3b3JrZmxvdyBydW4gaW5zdGVhZFxuICogICAgIGF3YWl0IHN0YXJ0V29ya2Zsb3coXCJteVdvcmtmbG93XCIsIHBheWxvYWQpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIEhvb2tOb3RGb3VuZEVycm9yIGV4dGVuZHMgV29ya2Zsb3dFcnJvciB7XG4gIHRva2VuOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodG9rZW46IHN0cmluZykge1xuICAgIHN1cGVyKCdIb29rIG5vdCBmb3VuZCcsIHt9KTtcbiAgICB0aGlzLm5hbWUgPSAnSG9va05vdEZvdW5kRXJyb3InO1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIEhvb2tOb3RGb3VuZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ0hvb2tOb3RGb3VuZEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBjb25mbGljdHMgd2l0aCB0aGUgY3VycmVudCBzdGF0ZSBvZiBhbiBlbnRpdHkuXG4gKiBUaGlzIGluY2x1ZGVzIGF0dGVtcHRzIHRvIG1vZGlmeSBhbiBlbnRpdHkgYWxyZWFkeSBpbiBhIHRlcm1pbmFsIHN0YXRlLFxuICogY3JlYXRlIGFuIGVudGl0eSB0aGF0IGFscmVhZHkgZXhpc3RzLCBvciBhbnkgb3RoZXIgNDA5LXN0eWxlIGNvbmZsaWN0LlxuICpcbiAqIFRoZSB3b3JrZmxvdyBydW50aW1lIGhhbmRsZXMgdGhpcyBlcnJvciBhdXRvbWF0aWNhbGx5LiBVc2VycyBpbnRlcmFjdGluZ1xuICogd2l0aCB3b3JsZCBzdG9yYWdlIGJhY2tlbmRzIGRpcmVjdGx5IG1heSBlbmNvdW50ZXIgaXQuXG4gKi9cbmV4cG9ydCBjbGFzcyBFbnRpdHlDb25mbGljdEVycm9yIGV4dGVuZHMgV29ya2Zsb3dXb3JsZEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ0VudGl0eUNvbmZsaWN0RXJyb3InO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgRW50aXR5Q29uZmxpY3RFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdFbnRpdHlDb25mbGljdEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgcnVuIGlzIG5vIGxvbmdlciBhdmFpbGFibGUg4oCUIGVpdGhlciBiZWNhdXNlIGl0IGhhcyBiZWVuXG4gKiBjbGVhbmVkIHVwLCBleHBpcmVkLCBvciBhbHJlYWR5IHJlYWNoZWQgYSB0ZXJtaW5hbCBzdGF0ZSAoY29tcGxldGVkL2ZhaWxlZCkuXG4gKlxuICogVGhlIHdvcmtmbG93IHJ1bnRpbWUgaGFuZGxlcyB0aGlzIGVycm9yIGF1dG9tYXRpY2FsbHkuIFVzZXJzIGludGVyYWN0aW5nXG4gKiB3aXRoIHdvcmxkIHN0b3JhZ2UgYmFja2VuZHMgZGlyZWN0bHkgbWF5IGVuY291bnRlciBpdC5cbiAqL1xuZXhwb3J0IGNsYXNzIFJ1bkV4cGlyZWRFcnJvciBleHRlbmRzIFdvcmtmbG93V29ybGRFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdSdW5FeHBpcmVkRXJyb3InO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUnVuRXhwaXJlZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1J1bkV4cGlyZWRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhbiBvcGVyYXRpb24gY2Fubm90IHByb2NlZWQgYmVjYXVzZSBhIHJlcXVpcmVkIHRpbWVzdGFtcFxuICogKGUuZy4gcmV0cnlBZnRlcikgaGFzIG5vdCBiZWVuIHJlYWNoZWQgeWV0LlxuICpcbiAqIFRoZSB3b3JrZmxvdyBydW50aW1lIGhhbmRsZXMgdGhpcyBlcnJvciBhdXRvbWF0aWNhbGx5LiBVc2VycyBpbnRlcmFjdGluZ1xuICogd2l0aCB3b3JsZCBzdG9yYWdlIGJhY2tlbmRzIGRpcmVjdGx5IG1heSBlbmNvdW50ZXIgaXQuXG4gKlxuICogQHByb3BlcnR5IHJldHJ5QWZ0ZXIgLSBEZWxheSBpbiBzZWNvbmRzIGJlZm9yZSB0aGUgb3BlcmF0aW9uIGNhbiBiZSByZXRyaWVkLlxuICovXG5leHBvcnQgY2xhc3MgVG9vRWFybHlFcnJvciBleHRlbmRzIFdvcmtmbG93V29ybGRFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9ucz86IHsgcmV0cnlBZnRlcj86IG51bWJlciB9KSB7XG4gICAgc3VwZXIobWVzc2FnZSwgeyByZXRyeUFmdGVyOiBvcHRpb25zPy5yZXRyeUFmdGVyIH0pO1xuICAgIHRoaXMubmFtZSA9ICdUb29FYXJseUVycm9yJztcbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFRvb0Vhcmx5RXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnVG9vRWFybHlFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIHJlcXVlc3QgaXMgcmF0ZSBsaW1pdGVkIGJ5IHRoZSB3b3JrZmxvdyBiYWNrZW5kLlxuICpcbiAqIFRoZSB3b3JrZmxvdyBydW50aW1lIGhhbmRsZXMgdGhpcyBlcnJvciBhdXRvbWF0aWNhbGx5IHdpdGggcmV0cnkgbG9naWMuXG4gKiBVc2VycyBpbnRlcmFjdGluZyB3aXRoIHdvcmxkIHN0b3JhZ2UgYmFja2VuZHMgZGlyZWN0bHkgbWF5IGVuY291bnRlciBpdFxuICogaWYgcmV0cmllcyBhcmUgZXhoYXVzdGVkLlxuICpcbiAqIEBwcm9wZXJ0eSByZXRyeUFmdGVyIC0gRGVsYXkgaW4gc2Vjb25kcyBiZWZvcmUgdGhlIHJlcXVlc3QgY2FuIGJlIHJldHJpZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBUaHJvdHRsZUVycm9yIGV4dGVuZHMgV29ya2Zsb3dXb3JsZEVycm9yIHtcbiAgcmV0cnlBZnRlcj86IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIG9wdGlvbnM/OiB7IHJldHJ5QWZ0ZXI/OiBudW1iZXIgfSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdUaHJvdHRsZUVycm9yJztcbiAgICB0aGlzLnJldHJ5QWZ0ZXIgPSBvcHRpb25zPy5yZXRyeUFmdGVyO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgVGhyb3R0bGVFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdUaHJvdHRsZUVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGF3YWl0aW5nIGBydW4ucmV0dXJuVmFsdWVgIG9uIGEgd29ya2Zsb3cgcnVuIHRoYXQgd2FzIGNhbmNlbGxlZC5cbiAqXG4gKiBUaGlzIGVycm9yIGluZGljYXRlcyB0aGF0IHRoZSB3b3JrZmxvdyB3YXMgZXhwbGljaXRseSBjYW5jZWxsZWQgKHZpYVxuICogYHJ1bi5jYW5jZWwoKWApIGFuZCB3aWxsIG5vdCBwcm9kdWNlIGEgcmV0dXJuIHZhbHVlLiBZb3UgY2FuIGNoZWNrIGZvclxuICogY2FuY2VsbGF0aW9uIGJlZm9yZSBhd2FpdGluZyB0aGUgcmV0dXJuIHZhbHVlIGJ5IGluc3BlY3RpbmcgYHJ1bi5zdGF0dXNgLlxuICpcbiAqIFVzZSB0aGUgc3RhdGljIGBXb3JrZmxvd1J1bkNhbmNlbGxlZEVycm9yLmlzKClgIG1ldGhvZCBmb3IgdHlwZS1zYWZlXG4gKiBjaGVja2luZyBpbiBjYXRjaCBibG9ja3MuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBXb3JrZmxvd1J1bkNhbmNlbGxlZEVycm9yIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL2Vycm9yc1wiO1xuICpcbiAqIHRyeSB7XG4gKiAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bi5yZXR1cm5WYWx1ZTtcbiAqIH0gY2F0Y2ggKGVycm9yKSB7XG4gKiAgIGlmIChXb3JrZmxvd1J1bkNhbmNlbGxlZEVycm9yLmlzKGVycm9yKSkge1xuICogICAgIGNvbnNvbGUubG9nKGBSdW4gJHtlcnJvci5ydW5JZH0gd2FzIGNhbmNlbGxlZGApO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHtcbiAgcnVuSWQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihydW5JZDogc3RyaW5nKSB7XG4gICAgc3VwZXIoYFdvcmtmbG93IHJ1biBcIiR7cnVuSWR9XCIgY2FuY2VsbGVkYCwge30pO1xuICAgIHRoaXMubmFtZSA9ICdXb3JrZmxvd1J1bkNhbmNlbGxlZEVycm9yJztcbiAgICB0aGlzLnJ1bklkID0gcnVuSWQ7XG4gIH1cblxuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBXb3JrZmxvd1J1bkNhbmNlbGxlZEVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1dvcmtmbG93UnVuQ2FuY2VsbGVkRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYXR0ZW1wdGluZyB0byBvcGVyYXRlIG9uIGEgd29ya2Zsb3cgcnVuIHRoYXQgcmVxdWlyZXMgYSBuZXdlciBXb3JsZCB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgZXJyb3Igb2NjdXJzIHdoZW4gYSBydW4gd2FzIGNyZWF0ZWQgd2l0aCBhIG5ld2VyIHNwZWMgdmVyc2lvbiB0aGFuIHRoZVxuICogY3VycmVudCBXb3JsZCBpbXBsZW1lbnRhdGlvbiBzdXBwb3J0cy4gVG8gcmVzb2x2ZSB0aGlzLCB1cGdyYWRlIHlvdXJcbiAqIGB3b3JrZmxvd2AgcGFja2FnZXMgdG8gYSB2ZXJzaW9uIHRoYXQgc3VwcG9ydHMgdGhlIHJlcXVpcmVkIHNwZWMgdmVyc2lvbi5cbiAqXG4gKiBVc2UgdGhlIHN0YXRpYyBgUnVuTm90U3VwcG9ydGVkRXJyb3IuaXMoKWAgbWV0aG9kIGZvciB0eXBlLXNhZmUgY2hlY2tpbmcgaW5cbiAqIGNhdGNoIGJsb2Nrcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IFJ1bk5vdFN1cHBvcnRlZEVycm9yIH0gZnJvbSBcIndvcmtmbG93L2ludGVybmFsL2Vycm9yc1wiO1xuICpcbiAqIHRyeSB7XG4gKiAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IHJ1bi5zdGF0dXM7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoUnVuTm90U3VwcG9ydGVkRXJyb3IuaXMoZXJyb3IpKSB7XG4gKiAgICAgY29uc29sZS5lcnJvcihcbiAqICAgICAgIGBSdW4gcmVxdWlyZXMgc3BlYyB2JHtlcnJvci5ydW5TcGVjVmVyc2lvbn0sIGAgK1xuICogICAgICAgYGJ1dCB3b3JsZCBzdXBwb3J0cyB2JHtlcnJvci53b3JsZFNwZWNWZXJzaW9ufWBcbiAqICAgICApO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJ1bk5vdFN1cHBvcnRlZEVycm9yIGV4dGVuZHMgV29ya2Zsb3dFcnJvciB7XG4gIHJlYWRvbmx5IHJ1blNwZWNWZXJzaW9uOiBudW1iZXI7XG4gIHJlYWRvbmx5IHdvcmxkU3BlY1ZlcnNpb246IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihydW5TcGVjVmVyc2lvbjogbnVtYmVyLCB3b3JsZFNwZWNWZXJzaW9uOiBudW1iZXIpIHtcbiAgICBzdXBlcihcbiAgICAgIGBSdW4gcmVxdWlyZXMgc3BlYyB2ZXJzaW9uICR7cnVuU3BlY1ZlcnNpb259LCBidXQgd29ybGQgc3VwcG9ydHMgdmVyc2lvbiAke3dvcmxkU3BlY1ZlcnNpb259LiBgICtcbiAgICAgICAgYFBsZWFzZSB1cGdyYWRlICd3b3JrZmxvdycgcGFja2FnZS5gXG4gICAgKTtcbiAgICB0aGlzLm5hbWUgPSAnUnVuTm90U3VwcG9ydGVkRXJyb3InO1xuICAgIHRoaXMucnVuU3BlY1ZlcnNpb24gPSBydW5TcGVjVmVyc2lvbjtcbiAgICB0aGlzLndvcmxkU3BlY1ZlcnNpb24gPSB3b3JsZFNwZWNWZXJzaW9uO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUnVuTm90U3VwcG9ydGVkRXJyb3Ige1xuICAgIHJldHVybiBpc0Vycm9yKHZhbHVlKSAmJiB2YWx1ZS5uYW1lID09PSAnUnVuTm90U3VwcG9ydGVkRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogQSBmYXRhbCBlcnJvciBpcyBhbiBlcnJvciB0aGF0IGNhbm5vdCBiZSByZXRyaWVkLlxuICogSXQgd2lsbCBjYXVzZSB0aGUgc3RlcCB0byBmYWlsIGFuZCB0aGUgZXJyb3Igd2lsbFxuICogYmUgYnViYmxlZCB1cCB0byB0aGUgd29ya2Zsb3cgbG9naWMuXG4gKi9cbmV4cG9ydCBjbGFzcyBGYXRhbEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBmYXRhbCA9IHRydWU7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ0ZhdGFsRXJyb3InO1xuICB9XG5cbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgRmF0YWxFcnJvciB7XG4gICAgcmV0dXJuIGlzRXJyb3IodmFsdWUpICYmIHZhbHVlLm5hbWUgPT09ICdGYXRhbEVycm9yJztcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJldHJ5YWJsZUVycm9yT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSByZXRyeWluZyB0aGUgc3RlcC5cbiAgICogQ2FuIGFsc28gYmUgYSBkdXJhdGlvbiBzdHJpbmcgKGUuZy4sIFwiNXNcIiwgXCIybVwiKSBvciBhIERhdGUgb2JqZWN0LlxuICAgKiBJZiBub3QgcHJvdmlkZWQsIHRoZSBzdGVwIHdpbGwgYmUgcmV0cmllZCBhZnRlciAxIHNlY29uZCAoMTAwMCBtaWxsaXNlY29uZHMpLlxuICAgKi9cbiAgcmV0cnlBZnRlcj86IG51bWJlciB8IFN0cmluZ1ZhbHVlIHwgRGF0ZTtcbn1cblxuLyoqXG4gKiBBbiBlcnJvciB0aGF0IGNhbiBoYXBwZW4gZHVyaW5nIGEgc3RlcCBleGVjdXRpb24sIGFsbG93aW5nXG4gKiBmb3IgY29uZmlndXJhdGlvbiBvZiB0aGUgcmV0cnkgYmVoYXZpb3IuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXRyeWFibGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgLyoqXG4gICAqIFRoZSBEYXRlIHdoZW4gdGhlIHN0ZXAgc2hvdWxkIGJlIHJldHJpZWQuXG4gICAqL1xuICByZXRyeUFmdGVyOiBEYXRlO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9uczogUmV0cnlhYmxlRXJyb3JPcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnUmV0cnlhYmxlRXJyb3InO1xuXG4gICAgaWYgKG9wdGlvbnMucmV0cnlBZnRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnJldHJ5QWZ0ZXIgPSBwYXJzZUR1cmF0aW9uVG9EYXRlKG9wdGlvbnMucmV0cnlBZnRlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZmF1bHQgdG8gMSBzZWNvbmQgKDEwMDAgbWlsbGlzZWNvbmRzKVxuICAgICAgdGhpcy5yZXRyeUFmdGVyID0gbmV3IERhdGUoRGF0ZS5ub3coKSArIDEwMDApO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFJldHJ5YWJsZUVycm9yIHtcbiAgICByZXR1cm4gaXNFcnJvcih2YWx1ZSkgJiYgdmFsdWUubmFtZSA9PT0gJ1JldHJ5YWJsZUVycm9yJztcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVkVSQ0VMXzQwM19FUlJPUl9NRVNTQUdFID1cbiAgJ1lvdXIgY3VycmVudCB2ZXJjZWwgYWNjb3VudCBkb2VzIG5vdCBoYXZlIGFjY2VzcyB0byB0aGlzIHJlc291cmNlLiBVc2UgYHZlcmNlbCBsb2dpbmAgb3IgYHZlcmNlbCBzd2l0Y2hgIHRvIGVuc3VyZSB5b3UgYXJlIGxpbmtlZCB0byB0aGUgcmlnaHQgYWNjb3VudC4nO1xuXG5leHBvcnQgeyBSVU5fRVJST1JfQ09ERVMsIHR5cGUgUnVuRXJyb3JDb2RlIH0gZnJvbSAnLi9lcnJvci1jb2Rlcy5qcyc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ3Jvc3MtcmVhbG0gY2xhc3MgcmVnaXN0cmF0aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vXG4vLyBgRmF0YWxFcnJvcmAsIGBSZXRyeWFibGVFcnJvcmAsIGFuZCBgSG9va0NvbmZsaWN0RXJyb3JgIGFyZSBub3QgYnVpbHQtaW5zLCBzbyBkaWZmZXJlbnQgcmVhbG1zXG4vLyAoZS5nLiB0aGUgd29ya2Zsb3cgVk0gY29udGV4dCB2cy4gdGhlIGhvc3QgY29udGV4dCB0aGF0IHJ1bnMgdGhlIHF1ZXVlXG4vLyBoYW5kbGVyKSBidW5kbGUgYW5kIGxvYWQgdGhlaXIgb3duIGNvcGllcyBvZiB0aGlzIG1vZHVsZSDigJQgbWVhbmluZyBlYWNoXG4vLyByZWFsbSBoYXMgaXRzIG93biBkaXN0aW5jdCBjbGFzcyBpZGVudGl0eS4gQ3Jvc3MtcmVhbG0gYGluc3RhbmNlb2ZgIGZhaWxzXG4vLyBiZWNhdXNlIHRoZSBwcm90b3R5cGUgY2hhaW5zIG5ldmVyIG1lZXQuXG4vL1xuLy8gVG8gbGV0IHNlcmlhbGl6YXRpb24gcmV2aXZlcnMgcmVjb25zdHJ1Y3QgYSB2YWx1ZSBhcyB0aGUgKmNvbnN1bWVyJ3MqXG4vLyBGYXRhbEVycm9yIChzbyB1c2VyLWNvZGUgYGVyciBpbnN0YW5jZW9mIEZhdGFsRXJyb3JgIHBhc3NlcyksIGVhY2ggYnVuZGxlZFxuLy8gY29weSBvZiB0aGlzIG1vZHVsZSBzZWxmLXJlZ2lzdGVycyBpdHMgY2xhc3Mgb24gYGdsb2JhbFRoaXNgIHZpYSBhIGtub3duXG4vLyBTeW1ib2wuZm9yIGtleS4gUmV2aXZlcnMgaW4gYEB3b3JrZmxvdy9jb3JlYCBsb29rIHVwIHRoZSBjbGFzcyB2aWEgdGhlXG4vLyBjb25zdW1lcidzIGdsb2JhbFRoaXMgYXQgaHlkcmF0aW9uIHRpbWUuXG4vL1xuLy8gRmlyc3QgcmVnaXN0cmF0aW9uIGluIGEgZ2l2ZW4gcmVhbG0gd2lucy4gVGhlIGRlc2NyaXB0b3IgaXMgbm9uLXdyaXRhYmxlXG4vLyBhbmQgbm9uLWNvbmZpZ3VyYWJsZSB0byBtYWtlIGFjY2lkZW50YWwgY2xvYmJlcmluZyBsb3VkLlxuY29uc3QgRkFUQUxfRVJST1JfS0VZID0gU3ltYm9sLmZvcignQHdvcmtmbG93L2Vycm9ycy8vRmF0YWxFcnJvcicpO1xuY29uc3QgUkVUUllBQkxFX0VSUk9SX0tFWSA9IFN5bWJvbC5mb3IoJ0B3b3JrZmxvdy9lcnJvcnMvL1JldHJ5YWJsZUVycm9yJyk7XG5jb25zdCBIT09LX0NPTkZMSUNUX0VSUk9SX0tFWSA9IFN5bWJvbC5mb3IoXG4gICdAd29ya2Zsb3cvZXJyb3JzLy9Ib29rQ29uZmxpY3RFcnJvcidcbik7XG5cbmlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgaWYgKCFPYmplY3QuaGFzT3duKGdsb2JhbFRoaXMsIEZBVEFMX0VSUk9SX0tFWSkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xvYmFsVGhpcywgRkFUQUxfRVJST1JfS0VZLCB7XG4gICAgICB2YWx1ZTogRmF0YWxFcnJvcixcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuICBpZiAoIU9iamVjdC5oYXNPd24oZ2xvYmFsVGhpcywgUkVUUllBQkxFX0VSUk9SX0tFWSkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xvYmFsVGhpcywgUkVUUllBQkxFX0VSUk9SX0tFWSwge1xuICAgICAgdmFsdWU6IFJldHJ5YWJsZUVycm9yLFxuICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG4gIGlmICghT2JqZWN0Lmhhc093bihnbG9iYWxUaGlzLCBIT09LX0NPTkZMSUNUX0VSUk9SX0tFWSkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xvYmFsVGhpcywgSE9PS19DT05GTElDVF9FUlJPUl9LRVksIHtcbiAgICAgIHZhbHVlOiBIb29rQ29uZmxpY3RFcnJvcixcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxufVxuIiwgImV4cG9ydCBjb25zdCBXT1JLRkxPV19VU0VfU1RFUCA9IFN5bWJvbC5mb3IoJ1dPUktGTE9XX1VTRV9TVEVQJyk7XG5leHBvcnQgY29uc3QgV09SS0ZMT1dfQ1JFQVRFX0hPT0sgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19DUkVBVEVfSE9PSycpO1xuZXhwb3J0IGNvbnN0IFdPUktGTE9XX1NMRUVQID0gU3ltYm9sLmZvcignV09SS0ZMT1dfU0xFRVAnKTtcbmV4cG9ydCBjb25zdCBXT1JLRkxPV19DT05URVhUID0gU3ltYm9sLmZvcignV09SS0ZMT1dfQ09OVEVYVCcpO1xuZXhwb3J0IGNvbnN0IFdPUktGTE9XX0dFVF9TVFJFQU1fSUQgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19HRVRfU1RSRUFNX0lEJyk7XG5leHBvcnQgY29uc3QgU1RBQkxFX1VMSUQgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19TVEFCTEVfVUxJRCcpO1xuZXhwb3J0IGNvbnN0IFNUUkVBTV9OQU1FX1NZTUJPTCA9IFN5bWJvbC5mb3IoJ1dPUktGTE9XX1NUUkVBTV9OQU1FJyk7XG5leHBvcnQgY29uc3QgU1RSRUFNX1RZUEVfU1lNQk9MID0gU3ltYm9sLmZvcignV09SS0ZMT1dfU1RSRUFNX1RZUEUnKTtcbmV4cG9ydCBjb25zdCBTVFJFQU1fRlJBTUlOR19TWU1CT0wgPSBTeW1ib2wuZm9yKCdXT1JLRkxPV19TVFJFQU1fRlJBTUlORycpO1xuLyoqXG4gKiBTdGFtcGVkIG9uIGEgcmVhbCBgV3JpdGFibGVTdHJlYW1gICh0aGUgdXNlci12aXNpYmxlIGBzZXJpYWxpemUud3JpdGFibGVgXG4gKiByZXR1cm5lZCBmcm9tIGEgc3RlcC1zaWRlIHJldml2ZXIgb3Igc3RlcC1jb250ZXh0IGBnZXRXcml0YWJsZSgpYCkgdG9cbiAqIHJlY29yZCB0aGUgYHJ1bklkYCBvZiB0aGUgd29ya2Zsb3cgcnVuIHRoYXQgb3ducyB0aGUgdW5kZXJseWluZyBzZXJ2ZXJcbiAqIHN0cmVhbS4gVXNlZCB0b2dldGhlciB3aXRoIGBTVFJFQU1fTkFNRV9TWU1CT0xgLlxuICpcbiAqIFdoZW4gYGdldEV4dGVybmFsUmVkdWNlcnMuV3JpdGFibGVTdHJlYW1gICh0aGUgZGVoeWRyYXRpb24gcGF0aCB1c2VkIGJ5XG4gKiBgc3RhcnQoKWApIHNlZXMgYm90aCBzeW1ib2xzIG9uIGEgd3JpdGFibGUsIGl0IGluY2x1ZGVzIHRoZSBgcnVuSWRgIGluXG4gKiB0aGUgZGVzY3JpcHRvciBpdCBlbWl0cy4gVGhlIGNoaWxkIHJ1bidzIHN0ZXAtc2lkZSByZXZpdmVyIHRoZW4gb3BlbnNcbiAqIGEgc2VydmVyIHdyaXRhYmxlIGFnYWluc3QgdGhlIG9yaWdpbmFsIGAocnVuSWQsIG5hbWUpYCBhbmQgcmVzb2x2ZXNcbiAqIHRoYXQgcnVuJ3MgZW5jcnlwdGlvbiBrZXkgZGlyZWN0bHkg4oCUIHNvIHRoZSBjaGlsZCdzIHdyaXRlcyBsYW5kIG9uXG4gKiB0aGUgcGFyZW50J3Mgc3RyZWFtIGFzLWlzLCB3aXRoIG5vIGNsaWVudCBwcm9jZXNzIGluIHRoZSBsb29wLiBUaGF0XG4gKiBrZWVwcyB0aGUgZm9yd2FyZGluZyBhbGl2ZSBmb3IgdGhlIGZ1bGwgbGlmZXRpbWUgb2YgdGhlIGNoaWxkIHJ1bixcbiAqIG5vdCBqdXN0IGZvciB0aGUgcGFyZW50IHN0ZXAgdGhhdCBpbml0aWF0ZWQgYHN0YXJ0KClgLlxuICovXG5leHBvcnQgY29uc3QgU1RSRUFNX1NFUlZFUl9SVU5fSURfU1lNQk9MID0gU3ltYm9sLmZvcihcbiAgJ1dPUktGTE9XX1NUUkVBTV9TRVJWRVJfUlVOX0lEJ1xuKTtcbi8qKlxuICogU3RhbXBlZCBhbG9uZ3NpZGUgYFNUUkVBTV9TRVJWRVJfUlVOX0lEX1NZTUJPTGAgd2hlbiB0aGUgZGVwbG95bWVudCB0aGF0XG4gKiBvd25zIGEgZm9yd2FyZGVkIHdyaXRhYmxlIHN0cmVhbSBpcyBrbm93bi4gQ3Jvc3MtZGVwbG95bWVudCBjb25zdW1lcnMgdXNlXG4gKiBpdCB0byByZXNvbHZlIHRoZSBvd25pbmcgcnVuJ3MgZW5jcnlwdGlvbiBrZXkgd2l0aG91dCBsb2FkaW5nIHRoZSBydW4gZmlyc3QuXG4gKi9cbmV4cG9ydCBjb25zdCBTVFJFQU1fU0VSVkVSX0RFUExPWU1FTlRfSURfU1lNQk9MID0gU3ltYm9sLmZvcihcbiAgJ1dPUktGTE9XX1NUUkVBTV9TRVJWRVJfREVQTE9ZTUVOVF9JRCdcbik7XG5leHBvcnQgY29uc3QgQk9EWV9JTklUX1NZTUJPTCA9IFN5bWJvbC5mb3IoJ0JPRFlfSU5JVCcpO1xuZXhwb3J0IGNvbnN0IFdFQkhPT0tfUkVTUE9OU0VfV1JJVEFCTEUgPSBTeW1ib2wuZm9yKFxuICAnV0VCSE9PS19SRVNQT05TRV9XUklUQUJMRSdcbik7XG5cbi8qKlxuICogU3ltYm9sIHVzZWQgdG8gc3RvcmUgdGhlIGNsYXNzIHJlZ2lzdHJ5IG9uIGdsb2JhbFRoaXMgaW4gd29ya2Zsb3cgbW9kZS5cbiAqIFRoaXMgYWxsb3dzIHRoZSBkZXNlcmlhbGl6ZXIgdG8gZmluZCBjbGFzc2VzIGJ5IGNsYXNzSWQgaW4gdGhlIFZNIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBjb25zdCBXT1JLRkxPV19DTEFTU19SRUdJU1RSWSA9IFN5bWJvbC5mb3IoJ3dvcmtmbG93LWNsYXNzLXJlZ2lzdHJ5Jyk7XG4iLCAiaW1wb3J0IHR5cGUgeyBTdHJpbmdWYWx1ZSB9IGZyb20gJ21zJztcbmltcG9ydCB7IFdPUktGTE9XX1NMRUVQIH0gZnJvbSAnLi9zeW1ib2xzLmpzJztcblxuLyoqXG4gKiBTbGVlcCB3aXRoaW4gYSB3b3JrZmxvdyBmb3IgYSBnaXZlbiBkdXJhdGlvbi5cbiAqXG4gKiBUaGlzIGlzIGEgYnVpbHQtaW4gcnVudGltZSBmdW5jdGlvbiB0aGF0IHVzZXMgdGltZXIgZXZlbnRzIGluIHRoZSBldmVudCBsb2cuXG4gKlxuICogQHBhcmFtIGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIHRvIHNsZWVwIGZvciwgdGhpcyBpcyBhIHN0cmluZyBpbiB0aGUgZm9ybWF0XG4gKiBvZiBgXCIxMDAwbXNcImAsIGBcIjFzXCJgLCBgXCIxbVwiYCwgYFwiMWhcImAsIG9yIGBcIjFkXCJgLlxuICogQG92ZXJsb2FkXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBzbGVlcCBpcyBjb21wbGV0ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNsZWVwKGR1cmF0aW9uOiBTdHJpbmdWYWx1ZSk6IFByb21pc2U8dm9pZD47XG5cbi8qKlxuICogU2xlZXAgd2l0aGluIGEgd29ya2Zsb3cgdW50aWwgYSBzcGVjaWZpYyBkYXRlLlxuICpcbiAqIFRoaXMgaXMgYSBidWlsdC1pbiBydW50aW1lIGZ1bmN0aW9uIHRoYXQgdXNlcyB0aW1lciBldmVudHMgaW4gdGhlIGV2ZW50IGxvZy5cbiAqXG4gKiBAcGFyYW0gZGF0ZSAtIFRoZSBkYXRlIHRvIHNsZWVwIHVudGlsLCB0aGlzIG11c3QgYmUgYSBmdXR1cmUgZGF0ZS5cbiAqIEBvdmVybG9hZFxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgc2xlZXAgaXMgY29tcGxldGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzbGVlcChkYXRlOiBEYXRlKTogUHJvbWlzZTx2b2lkPjtcblxuLyoqXG4gKiBTbGVlcCB3aXRoaW4gYSB3b3JrZmxvdyBmb3IgYSBnaXZlbiBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMuXG4gKlxuICogVGhpcyBpcyBhIGJ1aWx0LWluIHJ1bnRpbWUgZnVuY3Rpb24gdGhhdCB1c2VzIHRpbWVyIGV2ZW50cyBpbiB0aGUgZXZlbnQgbG9nLlxuICpcbiAqIEBwYXJhbSBkdXJhdGlvbk1zIC0gVGhlIGR1cmF0aW9uIHRvIHNsZWVwIGZvciBpbiBtaWxsaXNlY29uZHMuXG4gKiBAb3ZlcmxvYWRcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHNsZWVwIGlzIGNvbXBsZXRlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2xlZXAoZHVyYXRpb25NczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNsZWVwKHBhcmFtOiBTdHJpbmdWYWx1ZSB8IERhdGUgfCBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgLy8gSW5zaWRlIHRoZSB3b3JrZmxvdyBWTSwgdGhlIHNsZWVwIGZ1bmN0aW9uIGlzIHN0b3JlZCBpbiB0aGUgZ2xvYmFsVGhpcyBvYmplY3QgYmVoaW5kIGEgc3ltYm9sXG4gIGNvbnN0IHNsZWVwRm4gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpW1dPUktGTE9XX1NMRUVQXTtcbiAgaWYgKCFzbGVlcEZuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdgc2xlZXAoKWAgY2FuIG9ubHkgYmUgY2FsbGVkIGluc2lkZSBhIHdvcmtmbG93IGZ1bmN0aW9uJyk7XG4gIH1cbiAgcmV0dXJuIHNsZWVwRm4ocGFyYW0pO1xufVxuIiwgIi8qKlxuICogVGhpcyBpcyB0aGUgXCJzdGFuZGFyZCBsaWJyYXJ5XCIgb2Ygc3RlcHMgdGhhdCB3ZSBtYWtlIGF2YWlsYWJsZSB0byBhbGwgd29ya2Zsb3cgdXNlcnMuXG4gKiBUaGUgY2FuIGJlIGltcG9ydGVkIGxpa2Ugc286IGBpbXBvcnQgeyBmZXRjaCB9IGZyb20gJ3dvcmtmbG93J2AuIGFuZCB1c2VkIGluIHdvcmtmbG93LlxuICogVGhlIG5lZWQgdG8gYmUgZXhwb3J0ZWQgZGlyZWN0bHkgaW4gdGhpcyBwYWNrYWdlIGFuZCBjYW5ub3QgbGl2ZSBpbiBgY29yZWAgdG8gcHJldmVudFxuICogY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHBvc3QtY29tcGlsYXRpb24uXG4gKi9cblxuLyoqXG4gKiBBIGhvaXN0ZWQgYGZldGNoKClgIGZ1bmN0aW9uIHRoYXQgaXMgZXhlY3V0ZWQgYXMgYSBcInN0ZXBcIiBmdW5jdGlvbixcbiAqIGZvciB1c2Ugd2l0aGluIHdvcmtmbG93IGZ1bmN0aW9ucy5cbiAqXG4gKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9GZXRjaF9BUElcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoKC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIGdsb2JhbFRoaXMuZmV0Y2g+KSB7XG4gICd1c2Ugc3RlcCc7XG4gIHJldHVybiBnbG9iYWxUaGlzLmZldGNoKC4uLmFyZ3MpO1xufVxuIiwgImltcG9ydCB7IHNsZWVwIH0gZnJvbSBcIndvcmtmbG93XCI7XG5pbXBvcnQgeyBzdGFydCB9IGZyb20gXCJ3b3JrZmxvdy9hcGlcIjtcbi8qKl9faW50ZXJuYWxfd29ya2Zsb3dze1wid29ya2Zsb3dzXCI6e1wic3JjL3dvcmtmbG93cy9pbmNpZGVudC1nZW5lcmF0aW9uLnRzXCI6e1wiaW5jaWRlbnRHZW5lcmF0aW9uV29ya2Zsb3dcIjp7XCJ3b3JrZmxvd0lkXCI6XCJ3b3JrZmxvdy8vLi9zcmMvd29ya2Zsb3dzL2luY2lkZW50LWdlbmVyYXRpb24vL2luY2lkZW50R2VuZXJhdGlvbldvcmtmbG93XCJ9fX0sXCJzdGVwc1wiOntcInNyYy93b3JrZmxvd3MvaW5jaWRlbnQtZ2VuZXJhdGlvbi50c1wiOntcImV2YWx1YXRlV2FrZVN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vc3JjL3dvcmtmbG93cy9pbmNpZGVudC1nZW5lcmF0aW9uLy9ldmFsdWF0ZVdha2VTdGVwXCJ9LFwic3RhcnROZXh0R2VuZXJhdGlvblN0ZXBcIjp7XCJzdGVwSWRcIjpcInN0ZXAvLy4vc3JjL3dvcmtmbG93cy9pbmNpZGVudC1nZW5lcmF0aW9uLy9zdGFydE5leHRHZW5lcmF0aW9uU3RlcFwifX19fSovO1xudmFyIGV2YWx1YXRlV2FrZVN0ZXAgPSBnbG9iYWxUaGlzW1N5bWJvbC5mb3IoXCJXT1JLRkxPV19VU0VfU1RFUFwiKV0oXCJzdGVwLy8uL3NyYy93b3JrZmxvd3MvaW5jaWRlbnQtZ2VuZXJhdGlvbi8vZXZhbHVhdGVXYWtlU3RlcFwiKTtcbnZhciBzdGFydE5leHRHZW5lcmF0aW9uU3RlcCA9IGdsb2JhbFRoaXNbU3ltYm9sLmZvcihcIldPUktGTE9XX1VTRV9TVEVQXCIpXShcInN0ZXAvLy4vc3JjL3dvcmtmbG93cy9pbmNpZGVudC1nZW5lcmF0aW9uLy9zdGFydE5leHRHZW5lcmF0aW9uU3RlcFwiKTtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbmNpZGVudEdlbmVyYXRpb25Xb3JrZmxvdyhpbnB1dCkge1xuICAgIHdoaWxlKHRydWUpe1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBldmFsdWF0ZVdha2VTdGVwKGlucHV0KTtcbiAgICAgICAgaWYgKHJlc3VsdC5uZXh0R2VuZXJhdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgYXdhaXQgc3RhcnROZXh0R2VuZXJhdGlvblN0ZXAoe1xuICAgICAgICAgICAgICAgIGdlbmVyYXRpb246IHJlc3VsdC5uZXh0R2VuZXJhdGlvbixcbiAgICAgICAgICAgICAgICBpbmNpZGVudElkOiBpbnB1dC5pbmNpZGVudElkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHJldHVybjtcbiAgICAgICAgYXdhaXQgc2xlZXAocmVzdWx0LnNsZWVwVW50aWwpO1xuICAgIH1cbn1cbmluY2lkZW50R2VuZXJhdGlvbldvcmtmbG93LndvcmtmbG93SWQgPSBcIndvcmtmbG93Ly8uL3NyYy93b3JrZmxvd3MvaW5jaWRlbnQtZ2VuZXJhdGlvbi8vaW5jaWRlbnRHZW5lcmF0aW9uV29ya2Zsb3dcIjtcbmdsb2JhbFRoaXMuX19wcml2YXRlX3dvcmtmbG93cy5zZXQoXCJ3b3JrZmxvdy8vLi9zcmMvd29ya2Zsb3dzL2luY2lkZW50LWdlbmVyYXRpb24vL2luY2lkZW50R2VuZXJhdGlvbldvcmtmbG93XCIsIGluY2lkZW50R2VuZXJhdGlvbldvcmtmbG93KTtcbmV4cG9ydCBjb25zdCB2ZXJjZWxJbmNpZGVudFdvcmtmbG93U3RhcnRlciA9IHtcbiAgICBhc3luYyBzdGFydEluY2lkZW50R2VuZXJhdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcnVuID0gYXdhaXQgc3RhcnQoaW5jaWRlbnRHZW5lcmF0aW9uV29ya2Zsb3csIFtcbiAgICAgICAgICAgIGlucHV0XG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcnVuSWQ6IHJ1bi5ydW5JZFxuICAgICAgICB9O1xuICAgIH1cbn07XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBLHdFQUFBQSxTQUFBO0FBRUksUUFBSSxJQUFJO0FBQ1osUUFBSSxJQUFJLElBQUk7QUFDWixRQUFJLElBQUksSUFBSTtBQUNaLFFBQUksSUFBSSxJQUFJO0FBQ1osUUFBSSxJQUFJLElBQUk7QUFDWixRQUFJLElBQUksSUFBSTtBQWFSLElBQUFBLFFBQU8sVUFBVSxTQUFTLEtBQUssU0FBUztBQUN4QyxnQkFBVSxXQUFXLENBQUM7QUFDdEIsVUFBSSxPQUFPLE9BQU87QUFDbEIsVUFBSSxTQUFTLFlBQVksSUFBSSxTQUFTLEdBQUc7QUFDckMsZUFBTyxNQUFNLEdBQUc7QUFBQSxNQUNwQixXQUFXLFNBQVMsWUFBWSxTQUFTLEdBQUcsR0FBRztBQUMzQyxlQUFPLFFBQVEsT0FBTyxRQUFRLEdBQUcsSUFBSSxTQUFTLEdBQUc7QUFBQSxNQUNyRDtBQUNBLFlBQU0sSUFBSSxNQUFNLDBEQUEwRCxLQUFLLFVBQVUsR0FBRyxDQUFDO0FBQUEsSUFDakc7QUFPSSxhQUFTLE1BQU0sS0FBSztBQUNwQixZQUFNLE9BQU8sR0FBRztBQUNoQixVQUFJLElBQUksU0FBUyxLQUFLO0FBQ2xCO0FBQUEsTUFDSjtBQUNBLFVBQUksUUFBUSxtSUFBbUksS0FBSyxHQUFHO0FBQ3ZKLFVBQUksQ0FBQyxPQUFPO0FBQ1I7QUFBQSxNQUNKO0FBQ0EsVUFBSSxJQUFJLFdBQVcsTUFBTSxDQUFDLENBQUM7QUFDM0IsVUFBSSxRQUFRLE1BQU0sQ0FBQyxLQUFLLE1BQU0sWUFBWTtBQUMxQyxjQUFPLE1BQUs7QUFBQSxRQUNSLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFDRCxpQkFBTyxJQUFJO0FBQUEsUUFDZixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsaUJBQU8sSUFBSTtBQUFBLFFBQ2YsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLElBQUk7QUFBQSxRQUNmLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFDRCxpQkFBTyxJQUFJO0FBQUEsUUFDZixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsaUJBQU8sSUFBSTtBQUFBLFFBQ2YsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLElBQUk7QUFBQSxRQUNmLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFDRCxpQkFBTztBQUFBLFFBQ1g7QUFDSSxpQkFBTztBQUFBLE1BQ2Y7QUFBQSxJQUNKO0FBckRhO0FBNERULGFBQVMsU0FBU0MsS0FBSTtBQUN0QixVQUFJLFFBQVEsS0FBSyxJQUFJQSxHQUFFO0FBQ3ZCLFVBQUksU0FBUyxHQUFHO0FBQ1osZUFBTyxLQUFLLE1BQU1BLE1BQUssQ0FBQyxJQUFJO0FBQUEsTUFDaEM7QUFDQSxVQUFJLFNBQVMsR0FBRztBQUNaLGVBQU8sS0FBSyxNQUFNQSxNQUFLLENBQUMsSUFBSTtBQUFBLE1BQ2hDO0FBQ0EsVUFBSSxTQUFTLEdBQUc7QUFDWixlQUFPLEtBQUssTUFBTUEsTUFBSyxDQUFDLElBQUk7QUFBQSxNQUNoQztBQUNBLFVBQUksU0FBUyxHQUFHO0FBQ1osZUFBTyxLQUFLLE1BQU1BLE1BQUssQ0FBQyxJQUFJO0FBQUEsTUFDaEM7QUFDQSxhQUFPQSxNQUFLO0FBQUEsSUFDaEI7QUFmYTtBQXNCVCxhQUFTLFFBQVFBLEtBQUk7QUFDckIsVUFBSSxRQUFRLEtBQUssSUFBSUEsR0FBRTtBQUN2QixVQUFJLFNBQVMsR0FBRztBQUNaLGVBQU8sT0FBT0EsS0FBSSxPQUFPLEdBQUcsS0FBSztBQUFBLE1BQ3JDO0FBQ0EsVUFBSSxTQUFTLEdBQUc7QUFDWixlQUFPLE9BQU9BLEtBQUksT0FBTyxHQUFHLE1BQU07QUFBQSxNQUN0QztBQUNBLFVBQUksU0FBUyxHQUFHO0FBQ1osZUFBTyxPQUFPQSxLQUFJLE9BQU8sR0FBRyxRQUFRO0FBQUEsTUFDeEM7QUFDQSxVQUFJLFNBQVMsR0FBRztBQUNaLGVBQU8sT0FBT0EsS0FBSSxPQUFPLEdBQUcsUUFBUTtBQUFBLE1BQ3hDO0FBQ0EsYUFBT0EsTUFBSztBQUFBLElBQ2hCO0FBZmE7QUFrQlQsYUFBUyxPQUFPQSxLQUFJLE9BQU8sR0FBRyxNQUFNO0FBQ3BDLFVBQUksV0FBVyxTQUFTLElBQUk7QUFDNUIsYUFBTyxLQUFLLE1BQU1BLE1BQUssQ0FBQyxJQUFJLE1BQU0sUUFBUSxXQUFXLE1BQU07QUFBQSxJQUMvRDtBQUhhO0FBQUE7QUFBQTs7O0FDdkliLGdCQUFlO0FBYVosU0FBQSxvQkFBQSxPQUFBO0FBQ0gsTUFBTSxPQUFBLFVBQVUsVUFBbUI7QUFDN0IsVUFBQSxpQkFBaUIsVUFBQUMsU0FBQSxLQUFVO0FBQzdCLFFBQUEsT0FBTSxlQUFnQixZQUFPLGFBQUEsR0FBQTtBQUN6QixZQUFBLElBQU8sTUFBQSxzQkFBMkIsS0FBQSxpRUFBaUI7O0FBSXZELFdBQUMsSUFBQSxLQUFBLEtBQUEsSUFBQSxJQUFBLFVBQUE7YUFDTSxPQUFJLFVBQWEsVUFBSztBQUM5QixRQUFBLFFBQUEsS0FBQSxDQUFBLE9BQUEsU0FBQSxLQUFBLEdBQUE7QUFBTSxZQUFJLElBQU8sTUFBSyxxQkFBZ0IsS0FBQSwwREFBQTtJQUNyQztXQUNFLElBQU0sS0FBSSxLQUNSLElBQUEsSUFBQSxLQUFBO2FBRUgsaUJBQUEsUUFBQSxTQUFBLE9BQUEsVUFBQSxZQUFBLE9BQUEsTUFBQSxZQUFBLFlBQUE7QUFFRixXQUFBLGlCQUFBLE9BQUEsUUFBQSxJQUFBLEtBQUEsTUFBQSxRQUFBLENBQUE7U0FBTTtBQUVMLFVBQU0sSUFBQSxNQUFBLGdHQUFBOzs7QUFuQlA7OztBQ1ZILElBQU0sV0FBVztBQU9kLFNBQUEsUUFBQSxPQUFBO0FBQ0gsU0FBUyxPQUFRLFVBQWMsWUFBQSxVQUFBLFFBQUEsVUFBQSxTQUFBLGFBQUE7O0FBRDVCO0FBUUYsSUFBQSxjQUFBO0VBRUQsNEJBQUE7OztFQUdHLG9DQUFBO0VBQ0gsMkJBQTJCO0VBQ3pCLDRCQUE0QjtFQUM1QiwrQkFBK0I7RUFDL0IsZUFBQTtFQUNBLHFCQUFBO0VBQ0EsbUJBQUE7RUFDQSxxQkFBQTtFQUNBLHlCQUFBO0VBQ0EsMkJBQWU7OztFQWpDakI7Ozs7Ozs7OztNQWtFRyxPQUFBLFNBQUE7SUFDRyxDQUFBO0FBQ0ssU0FBZ0IsUUFBQSxTQUFBO0FBRXpCLFFBQUEsU0FBWSxpQkFBK0MsT0FBQTtBQUN6RCxXQUFNLFFBQVUsR0FBQSxLQUFTLEtBQUk7YUFBQSxRQUFBLE1BQUEsS0FBQTs7O1NBRzdCLEdBQU0sT0FBTztBQUNiLFdBQUssUUFBUSxLQUFPLEtBQUUsTUFBTSxTQUFBOzs7QUFpVjVCLElBQU0sb0JBQU4sY0FBNEIsY0FBbUI7RUE1Wm5ELE9BNFptRDs7Ozs7O0VBS2pEO2NBQ1MsT0FBUSxrQkFBZ0I7QUFDaEMsVUFBQSxlQUFBLEtBQUEsMENBQUEsbUJBQUEsVUFBQSxnQkFBQSxPQUFBLEVBQUEsSUFBQTtNQUNGLE1BQUEsWUFBQTtJQUVELENBQUE7Ozs7OztFQU1HO0VBQ0gsT0FBTSxHQUFPLE9BQUE7QUFDWCxXQUFjLFFBQUEsS0FBQSxLQUFBLE1BQUEsU0FBQTtFQUNkOzs7RUEvYUY7Ozs7RUErbkJHLFlBQUEsU0FBQTtBQUNHLFVBQU8sT0FBQTtBQUNGLFNBQUEsT0FBdUI7RUFDdkI7RUFFVCxPQUFBLEdBQUEsT0FBWTtBQUNWLFdBQ0UsUUFBQSxLQUFBLEtBQUEsTUFBQSxTQUE2Qjs7O0FBUTFCLElBQUcsaUJBQUgsY0FBaUIsTUFBQTtFQTlvQjFCLE9BOG9CMEI7Ozs7OztFQUd6QjtFQUVELFlBQUEsU0FBQSxVQUFBLENBQUEsR0FBQTs7OztBQUlHLFdBQUEsYUFBQSxvQkFBQSxRQUFBLFVBQUE7SUFDRyxPQUFPO0FBR1gsV0FBWSxhQUFlLElBQUEsS0FBQSxLQUFBLElBQUEsSUFBQSxHQUFBO0lBQ3pCOztFQUVGLE9BQUMsR0FBQSxPQUFBO0FBRUQsV0FBVSxRQUFjLEtBQUEsS0FBQSxNQUFBLFNBQUE7OztJQWtDdkIsa0JBQUEsdUJBQUEsSUFBQSw4QkFBQTtJQUVELHNCQUF3Qix1QkFBQSxJQUFBLGtDQUFBOzhCQUNELHVCQUFVLElBQUkscUNBQXNCO0lBQzNELE9BQUMsZUFBQSxhQUFBO0FBQ0YsTUFBQSxDQUFBLE9BQUEsT0FBQSxZQUFBLGVBQUEsR0FBQTtBQUVNLFdBQU0sZUFBQSxZQUNYLGlCQUFBO01BRU8sT0FBQTtNQUVULFVBQUE7TUFDQSxZQUFBO01BQ0EsY0FBQTtJQUNFLENBQUE7RUFDRjtBQUNBLE1BQUEsQ0FBQSxPQUFBLE9BQUEsWUFBQSxtQkFBQSxHQUFBO0FBQ0EsV0FBQSxlQUFBLFlBQUEscUJBQUE7TUFDQSxPQUFBO01BQ0EsVUFBQTtNQUNFLFlBQUE7TUFDRixjQUFBO0lBQ0EsQ0FBQTtFQUNBO0FBQ0EsTUFBQSxDQUFBLE9BQUEsT0FBQSxZQUFBLHVCQUFBLEdBQUE7QUFDQSxXQUFBLGVBQUEsWUFBQSx5QkFBMkM7TUFDekMsT0FBQTtNQUNGLFVBQUE7TUFDQSxZQUFBO01BQ00sY0FBa0I7SUFDbEIsQ0FBQTtFQUNOO0FBSUE7OztBQ3B1Qk8sSUFBTSxpQkFBaUIsdUJBQU8sSUFBSSxnQkFBZ0I7OztBQ21DekQsZUFBc0IsTUFBTSxPQUFrQztBQUU1RCxRQUFNLFVBQVcsV0FBbUIsY0FBYztBQUNsRCxNQUFJLENBQUMsU0FBUztBQUNaLFVBQU0sSUFBSSxNQUFNLHlEQUF5RDtFQUMzRTtBQUNBLFNBQU8sUUFBUSxLQUFLO0FBQ3RCO0FBUHNCOzs7QUN6Qm5CLElBQUEsUUFBQSxXQUFBLHVCQUFBLElBQUEsbUJBQUEsQ0FBQSxFQUFBLDZCQUFBOzs7QUNUSCxJQUFJLG1CQUFtQixXQUFXLHVCQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSw2REFBNkQ7QUFDaEksSUFBSSwwQkFBMEIsV0FBVyx1QkFBTyxJQUFJLG1CQUFtQixDQUFDLEVBQUUsb0VBQW9FO0FBQzlJLGVBQXNCLDJCQUEyQixPQUFPO0FBQ3BELFNBQU0sTUFBSztBQUNQLFVBQU0sU0FBUyxNQUFNLGlCQUFpQixLQUFLO0FBQzNDLFFBQUksT0FBTyxtQkFBbUIsTUFBTTtBQUNoQyxZQUFNLHdCQUF3QjtBQUFBLFFBQzFCLFlBQVksT0FBTztBQUFBLFFBQ25CLFlBQVksTUFBTTtBQUFBLE1BQ3RCLENBQUM7QUFDRDtBQUFBLElBQ0o7QUFDQSxRQUFJLE9BQU8sS0FBTTtBQUNqQixVQUFNLE1BQU0sT0FBTyxVQUFVO0FBQUEsRUFDakM7QUFDSjtBQWJzQjtBQWN0QiwyQkFBMkIsYUFBYTtBQUN4QyxXQUFXLG9CQUFvQixJQUFJLDZFQUE2RSwwQkFBMEI7IiwKICAibmFtZXMiOiBbIm1vZHVsZSIsICJtcyIsICJtcyJdCn0K
`);
//#endregion
//#region #workflow/workflows.mjs
var workflows_default = async ({ req }) => {
	try {
		return await POST(req);
	} catch (error) {
		console.error("Handler error:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
};
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_@electric-sql+pglite@0.4.1_@vercel+functions@3.7.5_@aws-sdk+crede_07de0a566947a98899c43288478844d8/node_modules/nitro/dist/runtime/internal/static.mjs
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
const findRoute = /* @__PURE__ */ (() => {
	const $0 = {
		route: "/.well-known/workflow/v1/step",
		handler: toEventHandler(steps_default)
	}, $1 = {
		route: "/.well-known/workflow/v1/flow",
		handler: toEventHandler(workflows_default)
	}, $2 = {
		route: "/.well-known/workflow/v1/webhook/:token",
		handler: toEventHandler(webhook_default)
	}, $3 = {
		route: "/**",
		handler: toEventHandler(toFetchHandler(handler$2))
	};
	return (m, p) => {
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		if (p === "/.well-known/workflow/v1/step") return { data: $0 };
		else if (p === "/.well-known/workflow/v1/flow") return { data: $1 };
		let s = p.split("/"), l = s.length;
		if (l > 1) {
			if (s[1] === ".well-known") {
				if (l > 2) {
					if (s[2] === "workflow") {
						if (l > 3) {
							if (s[3] === "v1") {
								if (l > 4) {
									if (s[4] === "webhook") {
										if (l === 6 || l === 5) {
											if (l > 5) return {
												data: $2,
												params: { "token": s[5] }
											};
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return {
			data: $3,
			params: { "_": s.slice(1).join("/") }
		};
	};
})();
const globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_@electric-sql+pglite@0.4.1_@vercel+functions@3.7.5_@aws-sdk+crede_07de0a566947a98899c43288478844d8/node_modules/nitro/dist/runtime/internal/error/prod.mjs
const errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
const errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	return h3App;
}
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_@electric-sql+pglite@0.4.1_@vercel+functions@3.7.5_@aws-sdk+crede_07de0a566947a98899c43288478844d8/node_modules/nitro/dist/runtime/internal/app.mjs
const APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_@electric-sql+pglite@0.4.1_@vercel+functions@3.7.5_@aws-sdk+crede_07de0a566947a98899c43288478844d8/node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
const tracingSrvxPlugins = [];
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_@electric-sql+pglite@0.4.1_@vercel+functions@3.7.5_@aws-sdk+crede_07de0a566947a98899c43288478844d8/node_modules/nitro/dist/presets/node/runtime/node-server.mjs
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
