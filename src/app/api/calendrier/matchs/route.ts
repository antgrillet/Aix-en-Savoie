import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const equipeId = searchParams.get("equipeId");

    // Construire le where clause
    const whereClause: any = {
      termine: false, // Uniquement les matchs à venir
      published: true,
      domicile: true, // Uniquement les matchs à domicile
    };

    if (equipeId) {
      whereClause.equipeId = parseInt(equipeId);
    }

    // Récupérer les matchs à venir avec leurs inscriptions
    const matchs = await prisma.match.findMany({
      where: whereClause,
      include: {
        equipe: {
          select: {
            id: true,
            nom: true,
            categorie: true,
            genre: true,
            slug: true,
          },
        },
        inscriptions: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Grouper les inscriptions par rôle pour chaque match
    const matchsAvecStats = matchs.map((match) => {
      const inscriptionsParRole = {
        TABLE_DE_MARQUE: match.inscriptions.filter(
          (i) => i.role === "TABLE_DE_MARQUE"
        ),
        ARBITRE: match.inscriptions.filter((i) => i.role === "ARBITRE"),
        RESPONSABLE_SALLE: match.inscriptions.filter(
          (i) => i.role === "RESPONSABLE_SALLE"
        ),
        BUVETTE: match.inscriptions.filter((i) => i.role === "BUVETTE"),
      };

      return {
        ...match,
        inscriptionsParRole,
        stats: {
          tableDeMarque: inscriptionsParRole.TABLE_DE_MARQUE.length,
          arbitre: inscriptionsParRole.ARBITRE.length,
          responsableSalle: inscriptionsParRole.RESPONSABLE_SALLE.length,
          buvette: inscriptionsParRole.BUVETTE.length,
        },
      };
    });

    return NextResponse.json(matchsAvecStats);
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
