import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fermerSessionBenevole,
  ouvrirSessionBenevole,
  sessionBenevoleActive,
} from "@/lib/calendrier-session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const empreinte = (valeur: string) =>
  createHash("sha256").update(valeur).digest();

// Indique à l'écran si la session bénévole est encore valide.
export async function GET() {
  return NextResponse.json({ authenticated: await sessionBenevoleActive() });
}

export async function POST(request: Request) {
  try {
    if (
      !rateLimit(`calendrier-auth:${clientIp(request)}`, {
        limit: 10,
        windowMs: 10 * 60 * 1000,
      })
    ) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const password = body?.password;

    if (typeof password !== "string" || !password || password.length > 200) {
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

    if (!timingSafeEqual(empreinte(password), empreinte(setting.value))) {
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 401 }
      );
    }

    await ouvrirSessionBenevole();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE() {
  await fermerSessionBenevole();
  return NextResponse.json({ success: true });
}
