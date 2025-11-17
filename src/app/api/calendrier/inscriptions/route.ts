import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleInscription } from "@prisma/client";

// Quotas maximum par rôle
const QUOTAS: Record<RoleInscription, number | null> = {
  TABLE_DE_MARQUE: 2,
  ARBITRE: 2,
  RESPONSABLE_SALLE: 1,
  BUVETTE: null, // Illimité
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchId, nom, prenom, role } = body;

    // Validation des champs
    if (!matchId || !nom || !prenom || !role) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que le rôle est valide
    if (!Object.keys(QUOTAS).includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    // Vérifier que le match existe et n'est pas terminé
    const match = await prisma.match.findUnique({
      where: { id: parseInt(matchId) },
      include: {
        inscriptions: {
          where: { role },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    if (match.termine) {
      return NextResponse.json(
        { error: "Impossible de s'inscrire à un match terminé" },
        { status: 400 }
      );
    }

    // Vérifier les quotas
    const quota = QUOTAS[role as RoleInscription];
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
        matchId: parseInt(matchId),
        nom: nom.trim(),
        prenom: prenom.trim(),
        role: role as RoleInscription,
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
