-- CreateEnum
CREATE TYPE "StrategicObjectiveStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StrategicObjectivePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "StrategicObjective" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "StrategicObjectiveStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "StrategicObjectivePriority" NOT NULL DEFAULT 'MEDIUM',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "ownerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategicObjective_pkey" PRIMARY KEY ("id")
);
