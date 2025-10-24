-- AlterTable
ALTER TABLE "equipes" ADD COLUMN     "genre" TEXT NOT NULL DEFAULT 'MASCULIN';

-- CreateIndex
CREATE INDEX "equipes_genre_idx" ON "equipes"("genre");
