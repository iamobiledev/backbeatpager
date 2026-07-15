-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RESPONDER');

-- CreateEnum
CREATE TYPE "TeamMembershipRole" AS ENUM ('MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "RotationType" AS ENUM ('DAILY', 'WEEKLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "IncidentState" AS ENUM ('TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AlertAction" AS ENUM ('TRIGGER', 'ACKNOWLEDGE', 'RESOLVE');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('INCIDENT_TRIGGERED', 'INCIDENT_ACKNOWLEDGED', 'INCIDENT_RESOLVED', 'INCIDENT_RETRIGGERED', 'INCIDENT_REASSIGNED', 'INCIDENT_SNOOZED', 'NOTE_ADDED', 'ESCALATION_STARTED', 'ESCALATION_ADVANCED', 'ESCALATION_EXHAUSTED', 'ACKNOWLEDGEMENT_EXPIRED', 'NOTIFICATION_QUEUED', 'NOTIFICATION_SENT', 'NOTIFICATION_FAILED', 'INCIDENT_CHANNEL_CREATED', 'SLACK_MESSAGE_UPDATED');

-- CreateEnum
CREATE TYPE "ActorKind" AS ENUM ('SYSTEM', 'USER', 'SLACK_USER', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('SLACK', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'RETRYING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "SlackMessageDestination" AS ENUM ('DM', 'SERVICE_CHANNEL', 'INCIDENT_CHANNEL');

-- CreateEnum
CREATE TYPE "SlackInteractionStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'DISPATCHED', 'FAILED');

-- CreateEnum
CREATE TYPE "WorkflowKind" AS ENUM ('INCIDENT_GENERATION', 'MESSAGE_SYNC', 'HANDOFF', 'DIGEST', 'RECONCILIATION');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('PENDING', 'RUNNING', 'SLEEPING', 'SUCCEEDED', 'FAILED', 'STALE');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "slackUserId" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "role" "UserRole" NOT NULL DEFAULT 'RESPONDER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notificationPreferences" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMPTZ(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Team" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "slackChannelId" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "handoffMessagesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "digestEnabled" BOOLEAN NOT NULL DEFAULT true,
    "digestDayOfWeek" INTEGER NOT NULL DEFAULT 1,
    "digestLocalTime" TEXT NOT NULL DEFAULT '09:00',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "TeamMembershipRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "escalationPolicyId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "routingKeyPrefix" TEXT NOT NULL,
    "routingKeyHash" TEXT NOT NULL,
    "slackChannelId" TEXT,
    "sourceLinkTemplate" TEXT,
    "autoCreateIncidentChannel" BOOLEAN NOT NULL DEFAULT false,
    "incidentChannelsPrivate" BOOLEAN NOT NULL DEFAULT false,
    "criticalChannelThresholdMinutes" INTEGER,
    "nagIntervals" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleLayer" (
    "id" UUID NOT NULL,
    "scheduleId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "rotationType" "RotationType" NOT NULL,
    "rotationInterval" INTEGER NOT NULL DEFAULT 1,
    "customIntervalMinutes" INTEGER,
    "handoffLocalTime" TEXT NOT NULL,
    "anchorLocalDate" DATE NOT NULL,
    "anchorInstant" TIMESTAMPTZ(3) NOT NULL,
    "activeFrom" TIMESTAMPTZ(3),
    "activeUntil" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ScheduleLayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleParticipant" (
    "id" UUID NOT NULL,
    "layerId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleRestriction" (
    "id" UUID NOT NULL,
    "layerId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startLocalTime" TEXT NOT NULL,
    "endLocalTime" TEXT NOT NULL,

    CONSTRAINT "ScheduleRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleOverride" (
    "id" UUID NOT NULL,
    "scheduleId" UUID NOT NULL,
    "layerId" UUID,
    "replacementUserId" UUID NOT NULL,
    "replacedUserId" UUID,
    "createdById" UUID,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ScheduleOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalationPolicy" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "repeatCount" INTEGER NOT NULL DEFAULT 0,
    "acknowledgementTimeoutMinutes" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "EscalationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalationStep" (
    "id" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "timeoutMinutes" INTEGER NOT NULL,

    CONSTRAINT "EscalationStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalationTarget" (
    "id" UUID NOT NULL,
    "stepId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "userId" UUID,
    "scheduleId" UUID,
    "teamId" UUID,

    CONSTRAINT "EscalationTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "dedupKey" TEXT NOT NULL,
    "status" "AlertStatus" NOT NULL,
    "severity" "Severity" NOT NULL,
    "source" TEXT NOT NULL,
    "latestPayload" JSONB NOT NULL,
    "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertOccurrence" (
    "id" UUID NOT NULL,
    "alertId" UUID NOT NULL,
    "action" "AlertAction" NOT NULL,
    "payload" JSONB NOT NULL,
    "requestId" TEXT,
    "requestHash" TEXT,
    "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "serviceId" UUID NOT NULL,
    "dedupKey" TEXT NOT NULL,
    "state" "IncidentState" NOT NULL DEFAULT 'TRIGGERED',
    "severity" "Severity" NOT NULL,
    "summary" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "assigneeId" UUID,
    "currentStepId" UUID,
    "currentEscalationLoop" INTEGER NOT NULL DEFAULT 0,
    "currentEscalationPosition" INTEGER NOT NULL DEFAULT 0,
    "escalationDeadline" TIMESTAMPTZ(3),
    "escalationGeneration" INTEGER NOT NULL DEFAULT 0,
    "nagDeadline" TIMESTAMPTZ(3),
    "nagGeneration" INTEGER NOT NULL DEFAULT 0,
    "snoozedUntil" TIMESTAMPTZ(3),
    "acknowledgementExpiresAt" TIMESTAMPTZ(3),
    "incidentSlackChannelId" TEXT,
    "incidentStatusMessageTs" TEXT,
    "openedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMPTZ(3),
    "resolvedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentAlert" (
    "incidentId" UUID NOT NULL,
    "alertId" UUID NOT NULL,
    "linkedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentAlert_pkey" PRIMARY KEY ("incidentId","alertId")
);

-- CreateTable
CREATE TABLE "IncidentTimelineEntry" (
    "id" UUID NOT NULL,
    "incidentId" UUID NOT NULL,
    "type" "TimelineEventType" NOT NULL,
    "actorKind" "ActorKind" NOT NULL,
    "actorUserId" UUID,
    "slackUserId" TEXT,
    "message" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentTimelineEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" UUID NOT NULL,
    "incidentId" UUID NOT NULL,
    "targetUserId" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "targetAddress" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "idempotencyKey" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "slackChannelId" TEXT,
    "slackMessageTs" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "queuedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attemptedAt" TIMESTAMPTZ(3),
    "deliveredAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlackMessage" (
    "id" UUID NOT NULL,
    "incidentId" UUID NOT NULL,
    "targetUserId" UUID,
    "destination" "SlackMessageDestination" NOT NULL,
    "destinationKey" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageTs" TEXT NOT NULL,
    "renderVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SlackMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlackInteractionReceipt" (
    "id" UUID NOT NULL,
    "receiptKey" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "slackUserId" TEXT,
    "status" "SlackInteractionStatus" NOT NULL DEFAULT 'RECEIVED',
    "payload" JSONB,
    "result" JSONB,
    "errorMessage" TEXT,
    "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMPTZ(3),

    CONSTRAINT "SlackInteractionReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" UUID NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "availableAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatchedAt" TIMESTAMPTZ(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" UUID NOT NULL,
    "logicalKey" TEXT NOT NULL,
    "kind" "WorkflowKind" NOT NULL,
    "entityId" TEXT NOT NULL,
    "generation" INTEGER NOT NULL,
    "vercelRunId" TEXT,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'PENDING',
    "expectedWakeAt" TIMESTAMPTZ(3),
    "startedAt" TIMESTAMPTZ(3),
    "finishedAt" TIMESTAMPTZ(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB NOT NULL DEFAULT '{}',
    "requestId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_slackUserId_key" ON "User"("slackUserId");

-- CreateIndex
CREATE INDEX "User_active_idx" ON "User"("active");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expires_idx" ON "Session"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

-- CreateIndex
CREATE INDEX "Team_active_idx" ON "Team"("active");

-- CreateIndex
CREATE INDEX "TeamMembership_userId_idx" ON "TeamMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembership_teamId_userId_key" ON "TeamMembership"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_routingKeyPrefix_key" ON "Service"("routingKeyPrefix");

-- CreateIndex
CREATE INDEX "Service_escalationPolicyId_idx" ON "Service"("escalationPolicyId");

-- CreateIndex
CREATE INDEX "Service_active_idx" ON "Service"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Service_teamId_slug_key" ON "Service"("teamId", "slug");

-- CreateIndex
CREATE INDEX "Schedule_teamId_active_idx" ON "Schedule"("teamId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_teamId_slug_key" ON "Schedule"("teamId", "slug");

-- CreateIndex
CREATE INDEX "ScheduleLayer_scheduleId_activeFrom_activeUntil_idx" ON "ScheduleLayer"("scheduleId", "activeFrom", "activeUntil");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleLayer_scheduleId_position_key" ON "ScheduleLayer"("scheduleId", "position");

-- CreateIndex
CREATE INDEX "ScheduleParticipant_userId_idx" ON "ScheduleParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleParticipant_layerId_position_key" ON "ScheduleParticipant"("layerId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleParticipant_layerId_userId_key" ON "ScheduleParticipant"("layerId", "userId");

-- CreateIndex
CREATE INDEX "ScheduleRestriction_layerId_dayOfWeek_idx" ON "ScheduleRestriction"("layerId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleRestriction_layerId_dayOfWeek_startLocalTime_endLoc_key" ON "ScheduleRestriction"("layerId", "dayOfWeek", "startLocalTime", "endLocalTime");

-- CreateIndex
CREATE INDEX "ScheduleOverride_scheduleId_startsAt_endsAt_idx" ON "ScheduleOverride"("scheduleId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "ScheduleOverride_layerId_startsAt_endsAt_idx" ON "ScheduleOverride"("layerId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "ScheduleOverride_replacementUserId_idx" ON "ScheduleOverride"("replacementUserId");

-- CreateIndex
CREATE INDEX "EscalationPolicy_teamId_active_idx" ON "EscalationPolicy"("teamId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "EscalationPolicy_teamId_slug_key" ON "EscalationPolicy"("teamId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "EscalationStep_policyId_position_key" ON "EscalationStep"("policyId", "position");

-- CreateIndex
CREATE INDEX "EscalationTarget_userId_idx" ON "EscalationTarget"("userId");

-- CreateIndex
CREATE INDEX "EscalationTarget_scheduleId_idx" ON "EscalationTarget"("scheduleId");

-- CreateIndex
CREATE INDEX "EscalationTarget_teamId_idx" ON "EscalationTarget"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "EscalationTarget_stepId_position_key" ON "EscalationTarget"("stepId", "position");

-- CreateIndex
CREATE INDEX "Alert_serviceId_status_idx" ON "Alert"("serviceId", "status");

-- CreateIndex
CREATE INDEX "Alert_lastSeenAt_idx" ON "Alert"("lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_serviceId_dedupKey_key" ON "Alert"("serviceId", "dedupKey");

-- CreateIndex
CREATE UNIQUE INDEX "AlertOccurrence_requestId_key" ON "AlertOccurrence"("requestId");

-- CreateIndex
CREATE INDEX "AlertOccurrence_alertId_receivedAt_idx" ON "AlertOccurrence"("alertId", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Incident_number_key" ON "Incident"("number");

-- CreateIndex
CREATE INDEX "Incident_state_openedAt_idx" ON "Incident"("state", "openedAt");

-- CreateIndex
CREATE INDEX "Incident_serviceId_openedAt_idx" ON "Incident"("serviceId", "openedAt");

-- CreateIndex
CREATE INDEX "Incident_assigneeId_state_idx" ON "Incident"("assigneeId", "state");

-- CreateIndex
CREATE INDEX "Incident_escalationDeadline_idx" ON "Incident"("escalationDeadline");

-- CreateIndex
CREATE INDEX "Incident_nagDeadline_idx" ON "Incident"("nagDeadline");

-- CreateIndex
CREATE INDEX "IncidentAlert_alertId_idx" ON "IncidentAlert"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentTimelineEntry_idempotencyKey_key" ON "IncidentTimelineEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "IncidentTimelineEntry_incidentId_createdAt_idx" ON "IncidentTimelineEntry"("incidentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_idempotencyKey_key" ON "NotificationLog"("idempotencyKey");

-- CreateIndex
CREATE INDEX "NotificationLog_incidentId_createdAt_idx" ON "NotificationLog"("incidentId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationLog_status_queuedAt_idx" ON "NotificationLog"("status", "queuedAt");

-- CreateIndex
CREATE INDEX "NotificationLog_targetUserId_idx" ON "NotificationLog"("targetUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SlackMessage_destinationKey_key" ON "SlackMessage"("destinationKey");

-- CreateIndex
CREATE INDEX "SlackMessage_incidentId_destination_idx" ON "SlackMessage"("incidentId", "destination");

-- CreateIndex
CREATE UNIQUE INDEX "SlackMessage_channelId_messageTs_key" ON "SlackMessage"("channelId", "messageTs");

-- CreateIndex
CREATE UNIQUE INDEX "SlackInteractionReceipt_receiptKey_key" ON "SlackInteractionReceipt"("receiptKey");

-- CreateIndex
CREATE INDEX "SlackInteractionReceipt_status_receivedAt_idx" ON "SlackInteractionReceipt"("status", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OutboxEvent_idempotencyKey_key" ON "OutboxEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "OutboxEvent_status_availableAt_idx" ON "OutboxEvent"("status", "availableAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowRun_logicalKey_key" ON "WorkflowRun"("logicalKey");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowRun_vercelRunId_key" ON "WorkflowRun"("vercelRunId");

-- CreateIndex
CREATE INDEX "WorkflowRun_kind_entityId_generation_idx" ON "WorkflowRun"("kind", "entityId", "generation");

-- CreateIndex
CREATE INDEX "WorkflowRun_status_expectedWakeAt_idx" ON "WorkflowRun"("status", "expectedWakeAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_escalationPolicyId_fkey" FOREIGN KEY ("escalationPolicyId") REFERENCES "EscalationPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleLayer" ADD CONSTRAINT "ScheduleLayer_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleParticipant" ADD CONSTRAINT "ScheduleParticipant_layerId_fkey" FOREIGN KEY ("layerId") REFERENCES "ScheduleLayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleParticipant" ADD CONSTRAINT "ScheduleParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleRestriction" ADD CONSTRAINT "ScheduleRestriction_layerId_fkey" FOREIGN KEY ("layerId") REFERENCES "ScheduleLayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleOverride" ADD CONSTRAINT "ScheduleOverride_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleOverride" ADD CONSTRAINT "ScheduleOverride_layerId_fkey" FOREIGN KEY ("layerId") REFERENCES "ScheduleLayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleOverride" ADD CONSTRAINT "ScheduleOverride_replacementUserId_fkey" FOREIGN KEY ("replacementUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleOverride" ADD CONSTRAINT "ScheduleOverride_replacedUserId_fkey" FOREIGN KEY ("replacedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleOverride" ADD CONSTRAINT "ScheduleOverride_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationPolicy" ADD CONSTRAINT "EscalationPolicy_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationStep" ADD CONSTRAINT "EscalationStep_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "EscalationPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationTarget" ADD CONSTRAINT "EscalationTarget_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "EscalationStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationTarget" ADD CONSTRAINT "EscalationTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationTarget" ADD CONSTRAINT "EscalationTarget_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationTarget" ADD CONSTRAINT "EscalationTarget_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertOccurrence" ADD CONSTRAINT "AlertOccurrence_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_currentStepId_fkey" FOREIGN KEY ("currentStepId") REFERENCES "EscalationStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentAlert" ADD CONSTRAINT "IncidentAlert_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentAlert" ADD CONSTRAINT "IncidentAlert_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentTimelineEntry" ADD CONSTRAINT "IncidentTimelineEntry_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentTimelineEntry" ADD CONSTRAINT "IncidentTimelineEntry_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlackMessage" ADD CONSTRAINT "SlackMessage_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlackMessage" ADD CONSTRAINT "SlackMessage_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Domain invariants Prisma cannot express directly.
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE UNIQUE INDEX "User_email_normalized_key" ON "User" (LOWER("email"));

CREATE UNIQUE INDEX "Incident_one_open_per_service_dedup_key"
ON "Incident" ("serviceId", "dedupKey")
WHERE "state" IN ('TRIGGERED', 'ACKNOWLEDGED');

ALTER TABLE "Team"
  ADD CONSTRAINT "Team_digestDayOfWeek_check"
    CHECK ("digestDayOfWeek" BETWEEN 0 AND 6),
  ADD CONSTRAINT "Team_digestLocalTime_check"
    CHECK ("digestLocalTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');

ALTER TABLE "Service"
  ADD CONSTRAINT "Service_routingKeyPrefix_check"
    CHECK ("routingKeyPrefix" ~ '^bbp_[a-z0-9]{12}$'),
  ADD CONSTRAINT "Service_criticalChannelThresholdMinutes_check"
    CHECK (
      "criticalChannelThresholdMinutes" IS NULL
      OR "criticalChannelThresholdMinutes" > 0
    );

ALTER TABLE "ScheduleLayer"
  ADD CONSTRAINT "ScheduleLayer_position_check"
    CHECK ("position" >= 0),
  ADD CONSTRAINT "ScheduleLayer_rotationInterval_check"
    CHECK ("rotationInterval" > 0),
  ADD CONSTRAINT "ScheduleLayer_customIntervalMinutes_check"
    CHECK (
      ("rotationType" = 'CUSTOM' AND "customIntervalMinutes" > 0)
      OR ("rotationType" <> 'CUSTOM' AND "customIntervalMinutes" IS NULL)
    ),
  ADD CONSTRAINT "ScheduleLayer_handoffLocalTime_check"
    CHECK ("handoffLocalTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  ADD CONSTRAINT "ScheduleLayer_activeRange_check"
    CHECK (
      "activeFrom" IS NULL
      OR "activeUntil" IS NULL
      OR "activeUntil" > "activeFrom"
    );

ALTER TABLE "ScheduleParticipant"
  ADD CONSTRAINT "ScheduleParticipant_position_check"
    CHECK ("position" >= 0);

ALTER TABLE "ScheduleRestriction"
  ADD CONSTRAINT "ScheduleRestriction_dayOfWeek_check"
    CHECK ("dayOfWeek" BETWEEN 0 AND 6),
  ADD CONSTRAINT "ScheduleRestriction_startLocalTime_check"
    CHECK ("startLocalTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  ADD CONSTRAINT "ScheduleRestriction_endLocalTime_check"
    CHECK ("endLocalTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  ADD CONSTRAINT "ScheduleRestriction_nonEmpty_check"
    CHECK ("startLocalTime" <> "endLocalTime");

ALTER TABLE "ScheduleOverride"
  ADD CONSTRAINT "ScheduleOverride_range_check"
    CHECK ("endsAt" > "startsAt"),
  ADD CONSTRAINT "ScheduleOverride_distinctUsers_check"
    CHECK (
      "replacedUserId" IS NULL
      OR "replacedUserId" <> "replacementUserId"
    ),
  ADD CONSTRAINT "ScheduleOverride_no_ambiguous_overlap"
    EXCLUDE USING gist (
      "scheduleId" WITH =,
      COALESCE("layerId", '00000000-0000-0000-0000-000000000000'::uuid) WITH =,
      COALESCE("replacedUserId", '00000000-0000-0000-0000-000000000000'::uuid) WITH =,
      tstzrange("startsAt", "endsAt", '[)') WITH &&
    );

ALTER TABLE "EscalationPolicy"
  ADD CONSTRAINT "EscalationPolicy_repeatCount_check"
    CHECK ("repeatCount" >= 0),
  ADD CONSTRAINT "EscalationPolicy_acknowledgementTimeoutMinutes_check"
    CHECK (
      "acknowledgementTimeoutMinutes" IS NULL
      OR "acknowledgementTimeoutMinutes" > 0
    );

ALTER TABLE "EscalationStep"
  ADD CONSTRAINT "EscalationStep_position_check"
    CHECK ("position" >= 0),
  ADD CONSTRAINT "EscalationStep_timeoutMinutes_check"
    CHECK ("timeoutMinutes" > 0);

ALTER TABLE "EscalationTarget"
  ADD CONSTRAINT "EscalationTarget_position_check"
    CHECK ("position" >= 0),
  ADD CONSTRAINT "EscalationTarget_exactlyOneTarget_check"
    CHECK (
      (("userId" IS NOT NULL)::int
        + ("scheduleId" IS NOT NULL)::int
        + ("teamId" IS NOT NULL)::int) = 1
    );

ALTER TABLE "Alert"
  ADD CONSTRAINT "Alert_occurrenceCount_check"
    CHECK ("occurrenceCount" > 0);

ALTER TABLE "Incident"
  ADD CONSTRAINT "Incident_escalationCursor_check"
    CHECK (
      "currentEscalationLoop" >= 0
      AND "currentEscalationPosition" >= 0
      AND "escalationGeneration" >= 0
      AND "nagGeneration" >= 0
      AND "version" >= 0
    ),
  ADD CONSTRAINT "Incident_resolvedAt_check"
    CHECK (
      ("state" = 'RESOLVED' AND "resolvedAt" IS NOT NULL)
      OR ("state" <> 'RESOLVED' AND "resolvedAt" IS NULL)
    );

ALTER TABLE "NotificationLog"
  ADD CONSTRAINT "NotificationLog_attempt_check"
    CHECK ("attempt" >= 0);

ALTER TABLE "SlackMessage"
  ADD CONSTRAINT "SlackMessage_renderVersion_check"
    CHECK ("renderVersion" >= 0);

ALTER TABLE "OutboxEvent"
  ADD CONSTRAINT "OutboxEvent_attempts_check"
    CHECK ("attempts" >= 0);

ALTER TABLE "WorkflowRun"
  ADD CONSTRAINT "WorkflowRun_generation_check"
    CHECK ("generation" >= 0);
