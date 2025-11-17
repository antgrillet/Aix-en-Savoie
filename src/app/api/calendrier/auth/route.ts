import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Mot de passe requis" },
        { status: 400 }
      );
    }

    // Récupérer le mot de passe du calendrier depuis les settings
    const setting = await prisma.setting.findUnique({
      where: { key: "calendrier_password" },
    });

    if (!setting) {
      return NextResponse.json(
        { error: "Configuration du calendrier non trouvée" },
        { status: 500 }
      );
    }

    // Vérifier le mot de passe
    if (password === setting.value) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
