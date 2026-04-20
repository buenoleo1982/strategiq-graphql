-- AlterTable
ALTER TABLE "Evidence"
ADD COLUMN "updatedById" INTEGER,
ADD COLUMN "deletedById" INTEGER,
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Evidence"
ADD CONSTRAINT "Evidence_updatedById_fkey"
FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence"
ADD CONSTRAINT "Evidence_deletedById_fkey"
FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
