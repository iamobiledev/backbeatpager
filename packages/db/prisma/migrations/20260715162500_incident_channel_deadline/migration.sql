ALTER TABLE "Incident"
ADD COLUMN "incidentChannelDeadline" TIMESTAMPTZ(3);

CREATE INDEX "Incident_incidentChannelDeadline_idx"
ON "Incident"("incidentChannelDeadline");
