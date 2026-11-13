import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleInscription } from "@/generated/prisma/client";
import { z } from "zod";
import { sessionBenevoleActive } from "@/lib/calendrier-session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Quotas maximum par rôle
const QUOTAS: Record<RoleInscription, number | null> = {
  TABLE_DE_MARQUE: 2,
  ARBITRE: 2,
  RESPONSABLE_SALLE: 1,
  BUVETTE: null, // Illimité
};

const inscriptionSchema = z.object({
  matchId: z.coerce.number().int().positive(),
  nom: z.string().trim().min(1).max(60),
  prenom: z.string().trim().min(1).max(60),
  role: z.enum(["TABLE_DE_MARQUE", "ARBITRE", "RESPONSABLE_SALLE", "BUVETTE"]),
});

export async function POST(request: Request) {
  try {
    if (!(await sessionBenevoleActive())) {
      return NextResponse.json(
        { error: "Session expirée, reconnectez-vous" },
        { status: 401 }
      );
    }

    if (
      !rateLimit(`calendrier-inscription:${clientIp(request)}`, {
        limit: 20,
        windowMs: 10 * 60 * 1000,
      })
    ) {
      return NextResponse.json(
        { error: "Trop d'inscriptions en peu de temps. Réessayez plus tard." },
        { status: 429 }
      );
    }

    const parsed = inscriptionSchema.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Nom, prénom et rôle sont requis" },
        { status: 400 }
      );
    }
    const { matchId, nom, prenom, role } = parsed.data;

    // Vérifier que le match existe et n'est pas terminé
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        inscriptions: {
          where: { role },
        },
      },
    });

    if (!match || !match.published || !match.domicile) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    if (match.termine) {
      return NextResponse.json(
        { error: "Impossible de s'inscrire à un match terminé" },
        { status: 400 }
      );
    }

    // Vérifier les quotas
    const quota = QUOTAS[role];
    if (quota !== null && match.inscriptions.length >= quota) {
      return NextResponse.json(
        {
          error: `Le quota pour le rôle "${role}" est atteint (${quota} max)`,
        },
        { status: 400 }
      );
    }

    // Vérifier si la personne n'est pas déjà inscrite pour ce rôle
    const existingInscription = match.inscriptions.find(
      (i) =>
        i.nom.toLowerCase() === nom.toLowerCase() &&
        i.prenom.toLowerCase() === prenom.toLowerCase()
    );

    if (existingInscription) {
      return NextResponse.json(
        { error: "Vous êtes déjà inscrit(e) pour ce rôle sur ce match" },
        { status: 400 }
      );
    }

    // Créer l'inscription
    const inscription = await prisma.inscription.create({
      data: {
        matchId,
        nom,
        prenom,
        role,
      },
    });

    return NextResponse.json(inscription, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
