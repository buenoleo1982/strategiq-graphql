-- AlterTable
ALTER TABLE "StrategicObjective"
ADD COLUMN "createdById" INTEGER,
ADD COLUMN "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "Initiative"
ADD COLUMN "createdById" INTEGER,
ADD COLUMN "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "Indicator"
ADD COLUMN "createdById" INTEGER,
ADD COLUMN "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "NonConformity"
ADD COLUMN "createdById" INTEGER,
ADD COLUMN "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "CorrectiveAction"
ADD COLUMN "createdById" INTEGER,
ADD COLUMN "updatedById" INTEGER;

-- AddForeignKey
ALTER TABLE "StrategicObjective"
ADD CONSTRAINT "StrategicObjective_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategicObjective"
ADD CONSTRAINT "StrategicObjective_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Initiative"
ADD CONSTRAINT "Initiative_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Initiative"
ADD CONSTRAINT "Initiative_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicator"
ADD CONSTRAINT "Indicator_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicator"
ADD CONSTRAINT "Indicator_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonConformity"
ADD CONSTRAINT "NonConformity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonConformity"
ADD CONSTRAINT "NonConformity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction"
ADD CONSTRAINT "CorrectiveAction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction"
ADD CONSTRAINT "CorrectiveAction_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
