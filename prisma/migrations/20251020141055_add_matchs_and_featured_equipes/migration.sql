-- AlterTable
ALTER TABLE "equipes" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "matchs" (
    "id" SERIAL NOT NULL,
    "equipeId" INTEGER NOT NULL,
    "adversaire" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "lieu" TEXT NOT NULL,
    "domicile" BOOLEAN NOT NULL DEFAULT true,
    "competition" TEXT,
    "scoreEquipe" INTEGER,
    "scoreAdversaire" INTEGER,
    "termine" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "matchs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matchs_equipeId_idx" ON "matchs"("equipeId");

-- CreateIndex
CREATE INDEX "matchs_date_idx" ON "matchs"("date" DESC);

-- CreateIndex
CREATE INDEX "matchs_termine_idx" ON "matchs"("termine");

-- CreateIndex
CREATE INDEX "matchs_published_idx" ON "matchs"("published");

-- CreateIndex
CREATE INDEX "equipes_featured_idx" ON "equipes"("featured");

-- AddForeignKey
ALTER TABLE "matchs" ADD CONSTRAINT "matchs_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
