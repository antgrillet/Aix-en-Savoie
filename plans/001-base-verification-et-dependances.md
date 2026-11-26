# Plan 001 : une commande `check`, une CI sur push, des dépendances à jour et sans poids mort

> **Consignes à l'exécutant** : suis ce plan étape par étape. Lance chaque commande de
> vérification et confirme le résultat attendu avant de passer à la suite. Si une des
> « Conditions d'arrêt » se produit, arrête-toi et rends compte : n'improvise pas.
> Ne modifie pas `plans/README.md` : le relecteur tient l'index.
>
> **Contrôle de dérive (à lancer d'abord)** :
> `git diff --stat 7ce2291..HEAD -- package.json bun.lock .github src/lib/cron.ts src/instrumentation.ts README_SYNC.md postcss.config.js`
> Si un de ces fichiers a changé, compare les extraits de « État actuel » au code réel ;
> un écart est une condition d'arrêt.

## Statut

- **Priorité** : P1
- **Effort** : M
- **Risque** : MED (montées de version non vérifiables par un build complet ici)
- **Dépend de** : aucun
- **Catégorie** : dx, migration, tech-debt
- **Écrit sur** : commit `7ce2291`, 2026-11-13

## Pourquoi

Rien ne lance lint, typecheck et tests avant un déploiement : `bun run build` n'exécute que
`test:auth`, et le seul workflow GitHub est la synchronisation planifiée. `bun audit`
signale des avis critiques sur `next` 16.3.1 (corrigés en 16.3.8, dont l'optimisation
d'images AVIF, format activé dans `next.config.mjs`) et sur `better-auth` 1.7.3 (corrigés
en 1.7.7), plus un avis élevé sur `@tiptap/core` < 3.30.4. Enfin plusieurs dépendances ne
sont importées nulle part, et `src/lib/cron.ts` (node-cron) est du code mort sur Vercel
qui peut lancer une synchro parallèle sur une machine locale en mode production.

## État actuel

- `package.json` (scripts, lignes 7-24) :
  ```json
  "build": "bun run prisma:generate && bun run test:auth && BROWSERSLIST_IGNORE_OLD_DATA=true next build",
  "lint": "eslint src/",
  "type-check": "tsc --noEmit",
  "test:auth": "bun test scripts/auth.test.ts",
  "test:sync": "bun test scripts/ffhandball.test.ts scripts/resultats-weekend.test.ts",
  "test:dates": "bun test scripts/dates.test.ts"
  ```
  Versions concernées : `"next": "16.3.1"`, `"eslint-config-next": "16.3.1"`,
  `"better-auth": "1.7.3"`, `"auth": "1.7.3"` (devDependency, CLI Better Auth, même
  numéro de version), huit paquets `@tiptap/*` en `^3.30.2`.
- Dépendances sans aucun import dans `src/`, `scripts/`, `prisma/` : `cheerio`,
  `embla-carousel-react`, `@tanstack/react-table`, `autoprefixer` (`postcss.config.js`
  n'utilise que `@tailwindcss/postcss`).
- `node-cron` et `@types/node-cron` ne servent qu'à `src/lib/cron.ts`, importé seulement par
  `src/instrumentation.ts:17`, qui sort immédiatement sur Vercel (`if (process.env.VERCEL) return`).
  `README_SYNC.md:84` cite `cron.ts` dans une arborescence.
- `.github/workflows/sync-matches.yml` est le seul workflow. Il installe ainsi (à copier) :
  ```yaml
  - uses: actions/checkout@v7
  - uses: oven-sh/setup-bun@v2
    with:
      bun-version: 1.3.14
  - uses: actions/cache@v6
    with:
      path: ~/.bun/install/cache
      key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
  - run: bun ci
  ```
- Le `postinstall` lance `prisma generate`, qui fonctionne sans base de données.
- `scripts/auth.test.ts` force une fausse `DATABASE_URL` : les tests ne touchent aucune base.

## Environnement de travail

Tu es dans un worktree git jetable : pas de `node_modules`, pas de `.env`.
- Commence par `bun install`.
- Il n'y a pas de base de données. Ne lance ni `bun run build`, ni `bun dev`, ni
  `prisma migrate`, ni `bun run sync:matches`. Ne crée et ne copie aucun fichier `.env`.

## Commandes

| But | Commande | Attendu |
|---|---|---|
| Installer | `bun install` | exit 0 |
| Typecheck | `bun run type-check` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Tests | `bun test scripts/` | 0 fail |
| Audit | `bun audit` | voir étape 3 |

## Périmètre

**Dans le périmètre** : `package.json`, `bun.lock`, `.github/workflows/ci.yml` (à créer),
`src/lib/cron.ts` (à supprimer), `src/instrumentation.ts` (à supprimer), `README_SYNC.md`
(ligne 84 seulement).

**Hors périmètre** : `.github/workflows/sync-matches.yml`, `tailwind.config.ts`,
`components.json`, `next.config.mjs`, tout fichier de `src/` autre que les deux cités.
Si une montée de version exige de modifier du code applicatif, c'est une condition d'arrêt.

## Git

- Tu es déjà sur une branche de worktree ; commite dessus.
- Un commit par étape, style du dépôt (conventional commits en anglais), par exemple
  `fix: lock down the upload, volunteer and contact endpoints`.
- Aucune ligne d'attribution dans les messages. Ne pousse rien, n'ouvre pas de PR.

## Étapes

### Étape 1 : état de départ
`bun install`, puis les trois vérifications. Note le nombre de tests.
**Vérifier** : `bun run type-check && bun run lint && bun test scripts/` → exit 0, 0 fail.

### Étape 2 : script `check` et CI
Ajoute dans `package.json`, après `test:dates` :
`"check": "bun run lint && bun run type-check && bun test scripts/"`.
Crée `.github/workflows/ci.yml` : déclencheurs `push` (branche `main`) et `pull_request`,
`permissions: contents: read`, un job `check` sur `ubuntu-latest`, `timeout-minutes: 10`,
les quatre étapes d'installation ci-dessus, puis `bun run check`. Aucun secret.
**Vérifier** : `bun run check` → exit 0.

### Étape 3 : montées de version de sécurité
`bun add -E next@16.3.8 better-auth@1.7.7`, `bun add -d -E eslint-config-next@16.3.8 auth@1.7.7`,
puis les huit `@tiptap/*` déjà présents en `@^3.30.4` (même liste que dans `package.json`,
n'en ajoute aucun). Si une version exacte n'existe pas, prends la plus petite version
publiée qui la dépasse dans la même série mineure et note-le.
Lis `node_modules/next/dist/docs/` (guide de mise à jour s'il existe) pour repérer un
changement cassant entre 16.3.1 et 16.3.8.
**Vérifier** : `bun run check` → exit 0 ; `bun audit 2>&1 | grep -A12 -E "^(next|better-auth|@tiptap/core) " | grep -c "critical:"` → `0`.

### Étape 4 : retirer le code et les dépendances morts
Supprime `src/lib/cron.ts` et `src/instrumentation.ts`. Retire la ligne 84 de
`README_SYNC.md`. Puis `bun remove node-cron @types/node-cron cheerio embla-carousel-react @tanstack/react-table autoprefixer`.
Avant chaque retrait, confirme par recherche qu'aucun fichier hors `node_modules`,
`.next`, `bun.lock` n'importe le paquet.
**Vérifier** : `grep -rnE "node-cron|cheerio|embla-carousel|react-table|autoprefixer|lib/cron|startCronJobs" src scripts prisma postcss.config.js package.json` → aucune ligne ; `bun run check` → exit 0.

## Tests

Pas de nouveau test : ce plan branche les tests existants. La preuve est `bun run check`.

## Critères de fin

- [ ] `bun run check` sort en 0
- [ ] `.github/workflows/ci.yml` existe et lance `bun run check`
- [ ] `package.json` : `next` 16.3.8 (ou supérieur noté), `better-auth` ≥ 1.7.7
- [ ] plus aucun avis `critical` pour `next` et `better-auth` dans `bun audit`
- [ ] `src/lib/cron.ts` et `src/instrumentation.ts` n'existent plus
- [ ] `git status` : seuls les fichiers du périmètre ont changé

## Conditions d'arrêt

- `bun run check` échoue après une montée de version et la correction demande de toucher
  à du code hors périmètre.
- `scripts/auth.test.ts` échoue avec `better-auth` 1.7.7 : rends compte du test et de
  l'erreur, ne modifie pas le test.
- Un paquet « mort » est en réalité importé quelque part : ne le retire pas, signale-le.

## Notes de maintenance

- Non vérifié par ce plan : `next build` et le rendu réel après la montée de version (pas
  de base dans le worktree). À contrôler sur un déploiement de prévisualisation Vercel
  avant la mise en production : connexion admin, upload d'image, page d'accueil.
- Le plan 006 ajoute une dépendance : en cas de conflit sur `bun.lock` à la fusion,
  garder `package.json` fusionné et relancer `bun install`.
- Les avis restants de `bun audit` (dépendances transitives de l'outillage) sont à
  réévaluer après ce plan ; ils ne touchent pas le code servi.
