import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, prenom, email, telephone, message, experience, niveau, positions } = body

    // Validation
    if (!nom || !prenom || !email || !message) {
      return NextResponse.json(
        { error: 'Les champs nom, prénom, email et message sont requis' },
        { status: 400 }
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
        experience: experience || false,
        niveau: niveau || null,
        positions: positions || [],
      },
    })

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
