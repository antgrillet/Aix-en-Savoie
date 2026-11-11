-- AlterTable
ALTER TABLE "matchs" ADD COLUMN     "extRencontreId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "matchs_equipeId_extRencontreId_key" ON "matchs"("equipeId", "extRencontreId");
