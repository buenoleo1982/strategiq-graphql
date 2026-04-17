-- CreateTable
CREATE TABLE "IndicatorEntry" (
    "id" SERIAL NOT NULL,
    "indicatorId" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndicatorEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IndicatorEntry" ADD CONSTRAINT "IndicatorEntry_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
