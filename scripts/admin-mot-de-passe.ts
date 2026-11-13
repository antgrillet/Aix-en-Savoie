// Change le mot de passe d'un compte admin existant.
// Usage : ADMIN_EMAIL=… ADMIN_PASSWORD=… bun run scripts/admin-mot-de-passe.ts
// Attention : écrit dans la base désignée par DATABASE_URL (production comprise).
// Le script n'affiche jamais le mot de passe, son hash ni l'adresse.
import bcrypt from 'bcrypt'

const LONGUEUR_MINIMALE = 12

// Erreur attendue : son message est sûr à afficher (aucune valeur saisie dedans).
class ErreurAttendue extends Error {}

function lireSaisie() {
  const email = process.env.ADMIN_EMAIL?.trim()
  const motDePasse = process.env.ADMIN_PASSWORD

  if (!email) throw new ErreurAttendue('ADMIN_EMAIL manquant.')
  if (!motDePasse) throw new ErreurAttendue('ADMIN_PASSWORD manquant.')
  if (motDePasse.length < LONGUEUR_MINIMALE) {
    throw new ErreurAttendue(
      `ADMIN_PASSWORD doit faire au moins ${LONGUEUR_MINIMALE} caractères.`
    )
  }

  return { email, motDePasse }
}

async function main() {
  const { email, motDePasse } = lireSaisie()

  // Import différé : src/lib/prisma exige DATABASE_URL dès son chargement,
  // les erreurs de saisie ci-dessus doivent passer avant.
  const { prisma } = await import('../src/lib/prisma')

  try {
    const admin = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    })

    if (!admin || admin.role !== 'admin') {
      throw new ErreurAttendue('Aucun compte admin ne porte cette adresse.')
    }

    // Compte utilisé par Better Auth pour la connexion par identifiants.
    const compteIdentifiants = admin.accounts.find(
      (account) => account.providerId === 'credential'
    )

    if (!compteIdentifiants) {
      throw new ErreurAttendue('Ce compte admin n’a pas de compte à identifiants.')
    }

    // Même hachage que src/lib/auth.ts : bcrypt, coût 10.
    const hash = await bcrypt.hash(motDePasse, 10)

    await prisma.account.update({
      where: { id: compteIdentifiants.id },
      data: { password: hash },
    })

    console.log('Mot de passe mis à jour')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  if (error instanceof ErreurAttendue) {
    console.error(error.message)
  } else {
    // Pas de message brut : il pourrait reprendre une valeur de la requête.
    const nom = error instanceof Error ? error.name : 'Erreur inconnue'
    console.error(`Échec de la mise à jour du mot de passe (${nom}).`)
  }
  process.exit(1)
})
