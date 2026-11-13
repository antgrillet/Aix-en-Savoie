# HBC Aix-en-Savoie

Site officiel du club de handball HBC Aix-en-Savoie : vitrine publique, espace bénévoles et administration (Next.js 16, Prisma, Better Auth).

## Installation

Prérequis : Bun 1.3 et une base Postgres.

```bash
bun install
cp .env.example .env   # puis remplacer chaque valeur factice
```

## Commandes

```bash
bun dev                # serveur de développement (port 3000)
bun run type-check     # vérification TypeScript
bun run lint           # ESLint
bun test scripts/      # tests
```

## Synchronisation FFHandball

Matchs, lieux et classements viennent de ffhandball.fr : voir [README_SYNC.md](README_SYNC.md).

## Changer le mot de passe admin

```bash
ADMIN_EMAIL=… ADMIN_PASSWORD=… bun run scripts/admin-mot-de-passe.ts
```

Le compte admin doit exister, le mot de passe fait au moins 12 caractères. Le script écrit dans la base désignée par `DATABASE_URL` : vérifier laquelle avant de le lancer, puis tester la connexion sur `/login`.

## Pour aller plus loin

- [CLAUDE.md](CLAUDE.md) : architecture et conventions
- [PRODUCT.md](PRODUCT.md) : produit et contexte d'usage
- [DESIGN.md](DESIGN.md) : système visuel
