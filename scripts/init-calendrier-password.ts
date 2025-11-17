import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Initialisation du mot de passe du calendrier...");

  const setting = await prisma.setting.upsert({
    where: { key: "calendrier_password" },
    create: {
      key: "calendrier_password",
      value: "handball2025",
      type: "string",
      description: "Mot de passe pour accéder au calendrier interactif",
    },
    update: {},
  });

  console.log("✓ Mot de passe du calendrier initialisé :", setting.value);
}

main()
  .catch((e) => {
    console.error("Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
