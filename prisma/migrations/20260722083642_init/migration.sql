-- CreateTable
CREATE TABLE "MissionOverride" (
    "id" TEXT NOT NULL,
    "mision" TEXT NOT NULL,
    "nombreEs" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissionOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "imagen" TEXT,
    "overrideId" TEXT NOT NULL,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MissionOverride_mision_key" ON "MissionOverride"("mision");

-- CreateIndex
CREATE INDEX "Step_overrideId_idx" ON "Step"("overrideId");

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_overrideId_fkey" FOREIGN KEY ("overrideId") REFERENCES "MissionOverride"("id") ON DELETE CASCADE ON UPDATE CASCADE;
