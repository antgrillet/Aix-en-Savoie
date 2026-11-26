-- CreateEnum
CREATE TYPE "StatutNoteArbitrage" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'REFUSEE');

-- CreateTable
CREATE TABLE "notes_arbitrage" (
    "id" SERIAL NOT NULL,
    "dateMatch" DATE NOT NULL,
    "heureMatch" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "equipeLocale" TEXT NOT NULL,
    "equipeVisiteur" TEXT NOT NULL,
    "salle" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "licence" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "titulaireCompte" TEXT,
    "iban" TEXT,
    "bic" TEXT,
    "indemniteCentimes" INTEGER NOT NULL,
    "kilometres" INTEGER NOT NULL,
    "baremeKmCentimes" INTEGER NOT NULL,
    "fraisAnnexesCentimes" INTEGER NOT NULL,
    "totalDemandeCentimes" INTEGER NOT NULL,
    "statut" "StatutNoteArbitrage" NOT NULL DEFAULT 'EN_ATTENTE',
    "traiteePar" TEXT,
    "traiteeParId" TEXT,
    "traiteeLe" TIMESTAMP(3),
    "commentaire" TEXT,
    "motifRefus" TEXT,
    "signature" BYTEA,
    "envoiComptableLe" TIMESTAMP(3),
    "envoiComptableA" TEXT,
    "envoiComptableErreur" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_arbitrage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "justificatifs_arbitrage" (
    "id" SERIAL NOT NULL,
    "noteId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "taille" INTEGER NOT NULL,
    "contenu" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "justificatifs_arbitrage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notes_arbitrage_statut_idx" ON "notes_arbitrage"("statut");

-- CreateIndex
CREATE INDEX "notes_arbitrage_createdAt_idx" ON "notes_arbitrage"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "justificatifs_arbitrage_noteId_idx" ON "justificatifs_arbitrage"("noteId");

-- AddForeignKey
ALTER TABLE "justificatifs_arbitrage" ADD CONSTRAINT "justificatifs_arbitrage_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes_arbitrage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

