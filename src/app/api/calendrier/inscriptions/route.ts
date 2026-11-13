import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, type Inscription, type RoleInscription } from "@/generated/prisma/client";
import { z } from "zod";
import { sessionBenevoleActive } from "@/lib/calendrier-session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { QUOTAS, matchOuvert, placeDisponible } from "@/lib/calendrier-regles";

type ResultatInscription =
  | { ok: true; inscription: Inscription }
  | { ok: false; status: number; error: string };

// Lecture du match, contrôles et création dans une seule transaction
// sérialisable : deux inscriptions simultanées ne peuvent pas dépasser le quota.
function inscrire(
  matchId: number,
  nom: string,
  prenom: string,
  role: RoleInscription
): Promise<ResultatInscription> {
  return prisma.$transaction(
    async (tx): Promise<ResultatInscription> => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: {
          inscriptions: {
            where: { role },
          },
        },
      });

      if (!match || !match.published || !match.domicile) {
        return { ok: false, status: 404, error: "Match non trouvé" };
      }

      if (match.termine) {
        return {
          ok: false,
          status: 400,
          error: "Impossible de s'inscrire à un match terminé",
        };
      }

      if (!matchOuvert(match, new Date())) {
        return {
          ok: false,
          status: 400,
          error: "Les inscriptions pour ce match sont closes",
        };
      }

      // Vérifier les quotas
      if (!placeDisponible(role, match.inscriptions.length)) {
        return {
          ok: false,
          status: 400,
          error: `Le quota pour le rôle "${role}" est atteint (${QUOTAS[role]} max)`,
        };
      }

      // Vérifier si la personne n'est pas déjà inscrite pour ce rôle
      const existingInscription = match.inscriptions.find(
        (i) =>
          i.nom.toLowerCase() === nom.toLowerCase() &&
          i.prenom.toLowerCase() === prenom.toLowerCase()
      );

      if (existingInscription) {
        return {
          ok: false,
          status: 400,
          error: "Vous êtes déjà inscrit(e) pour ce rôle sur ce match",
        };
      }

      const inscription = await tx.inscription.create({
        data: {
          matchId,
          nom,
          prenom,
          role,
        },
      });

      return { ok: true, inscription };
    },
    { isolationLevel: "Serializable" }
  );
}

function conflitDeSerialisation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

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

    // Un conflit de sérialisation est retenté une fois
    let resultat: ResultatInscription;
    try {
      resultat = await inscrire(matchId, nom, prenom, role);
    } catch (error) {
      if (!conflitDeSerialisation(error)) throw error;
      try {
        resultat = await inscrire(matchId, nom, prenom, role);
      } catch (retryError) {
        if (!conflitDeSerialisation(retryError)) throw retryError;
        return NextResponse.json(
          { error: "Une autre inscription vient d'être enregistrée, réessayez" },
          { status: 409 }
        );
      }
    }

    if (!resultat.ok) {
      return NextResponse.json(
        { error: resultat.error },
        { status: resultat.status }
      );
    }

    return NextResponse.json(resultat.inscription, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
