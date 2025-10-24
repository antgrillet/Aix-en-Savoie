-- CreateTable
CREATE TABLE "classements" (
    "id" SERIAL NOT NULL,
    "equipeId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "club" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "classements_equipeId_idx" ON "classements"("equipeId");

-- AddForeignKey
ALTER TABLE "classements" ADD CONSTRAINT "classements_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
