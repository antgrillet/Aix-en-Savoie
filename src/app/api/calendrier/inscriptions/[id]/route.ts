import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID d'inscription invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'inscription existe
    const inscription = await prisma.inscription.findUnique({
      where: { id },
      include: {
        match: true,
      },
    });

    if (!inscription) {
      return NextResponse.json(
        { error: "Inscription non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que le match n'est pas terminé
    if (inscription.match.termine) {
      return NextResponse.json(
        { error: "Impossible de supprimer une inscription d'un match terminé" },
        { status: 400 }
      );
    }

    // Supprimer l'inscription
    await prisma.inscription.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
