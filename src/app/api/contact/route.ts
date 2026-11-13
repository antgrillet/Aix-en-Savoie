import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContactEmail } from '@/lib/email'
import { contactSchema } from '@/lib/validations/contact'
import { clientIp, rateLimit } from '@/lib/rate-limit'

// Plafond durable, toutes origines confondues : protège la base et la boîte du
// club si la limite par adresse (en mémoire) est contournée.
const MAX_MESSAGES_PAR_HEURE = 40

export async function POST(request: NextRequest) {
  try {
    if (
      !rateLimit(`contact:${clientIp(request)}`, {
        limit: 5,
        windowMs: 10 * 60 * 1000,
      })
    ) {
      return NextResponse.json(
        { error: 'Trop de messages envoyés. Réessayez dans quelques minutes.' },
        { status: 429 }
      )
    }

    const parsed = contactSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Vérifiez le nom, le prénom, l\'adresse e-mail et le message.' },
        { status: 400 }
      )
    }

    const { nom, prenom, email, telephone, message, experience, niveau, positions, leurre } =
      parsed.data

    // Leurre rempli : on répond comme un succès sans rien enregistrer ni envoyer.
    if (leurre) {
      return NextResponse.json({ success: true, message: 'Message envoyé avec succès' })
    }

    const recents = await prisma.contactMessage.count({
      where: { createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    })
    if (recents >= MAX_MESSAGES_PAR_HEURE) {
      return NextResponse.json(
        {
          error:
            'Le formulaire est momentanément saturé. Écrivez-nous à contact@hbcaixensavoie.fr.',
        },
        { status: 429 }
      )
    }

    // Sauvegarder dans la base de données
    await prisma.contactMessage.create({
      data: {
        nom,
        prenom,
        email,
        telephone: telephone || null,
        message,
        experience: experience ?? false,
        niveau: niveau || null,
        positions: positions ?? [],
      },
    })

    // Envoyer l'email via Resend
    const emailResult = await sendContactEmail({
      nom,
      prenom,
      email,
      telephone: telephone || undefined,
      message,
      experience: experience ?? undefined,
      niveau: niveau || undefined,
      positions: positions ?? undefined,
    })

    if (!emailResult.success) {
      console.error('Failed to send contact email')
      // On continue même si l'email échoue, car le message est sauvegardé en BDD
    }

    return NextResponse.json(
      { success: true, message: 'Message envoyé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}
