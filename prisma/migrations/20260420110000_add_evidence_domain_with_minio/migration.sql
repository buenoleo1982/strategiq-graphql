CREATE TABLE "Evidence" (
  "id" SERIAL NOT NULL,
  "fileName" TEXT NOT NULL,
  "label" TEXT,
  "objectKey" TEXT NOT NULL,
  "bucketName" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "uploadedById" INTEGER,
  "strategicObjectiveId" INTEGER,
  "initiativeId" INTEGER,
  "indicatorId" INTEGER,
  "nonConformityId" INTEGER,
  "correctiveActionId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Evidence_objectKey_key" ON "Evidence"("objectKey");

ALTER TABLE "Evidence"
  ADD CONSTRAINT "Evidence_uploadedById_fkey"
  FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Evidence"
  ADD CONSTRAINT "Evidence_strategicObjectiveId_fkey"
  FOREIGN KEY ("strategicObjectiveId") REFERENCES "StrategicObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Evidence"
  ADD CONSTRAINT "Evidence_initiativeId_fkey"
  FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Evidence"
  ADD CONSTRAINT "Evidence_indicatorId_fkey"
  FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Evidence"
  ADD CONSTRAINT "Evidence_nonConformityId_fkey"
  FOREIGN KEY ("nonConformityId") REFERENCES "NonConformity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Evidence"
  ADD CONSTRAINT "Evidence_correctiveActionId_fkey"
  FOREIGN KEY ("correctiveActionId") REFERENCES "CorrectiveAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
