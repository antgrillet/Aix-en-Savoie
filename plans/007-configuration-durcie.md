# Plan 007 : origines de confiance, images distantes, en-têtes HTTP et réponses d'API resserrés

> **Consignes à l'exécutant** : suis ce plan étape par étape. Lance chaque commande de
> vérification et confirme le résultat attendu avant de passer à la suite. Si une des
> « Conditions d'arrêt » se produit, arrête-toi et rends compte : n'improvise pas.
> Ne modifie pas `plans/README.md` : le relecteur tient l'index.
>
> **Contrôle de dérive (à lancer d'abord)** :
> `git diff --stat 7ce2291..HEAD -- src/lib/auth.ts src/lib/auth-utils.ts next.config.mjs scripts/auth.test.ts src/app/api/sync "src/app/api/admin" .github/workflows/sync-matches.yml`
> Si un de ces fichiers a changé, compare les extraits de « État actuel » au code réel ;
> un écart est une condition d'arrêt.

## Statut

- **Priorité** : P2
- **Effort** : M
- **Risque** : MED (une origine ou un hôte d'image oublié casse la connexion ou des images)
- **Dépend de** : aucun
- **Catégorie** : security
- **Écrit sur** : commit `7ce2291`, 2026-11-13

## Pourquoi

Quatre réglages sont plus ouverts que nécessaire. (1) Better Auth fait confiance à
`https://*.vercel.app`, c'est-à-dire à tout projet Vercel de n'importe qui, et à
`localhost` même en production ; cette liste sert à contrôler l'origine des requêtes et
les URL de redirection. (2) L'URL de réinitialisation du mot de passe admin, jeton
compris, est écrite dans les journaux du serveur. (3) `next.config.mjs` autorise
l'optimisation d'images depuis n'importe quel hôte https : `/_next/image` sert de proxy
ouvert, aux frais du club. (4) Le site n'envoie aucun en-tête de sécurité : `/admin` peut
être affiché dans un cadre tiers. S'y ajoutent deux routes d'API admin qui répondent 500
au lieu de 401 sans session, et le workflow de synchronisation sans bloc `permissions`.

## État actuel

- `src/lib/auth.ts`, lignes 17-29 :
  ```ts
  trustedOrigins: [
    'http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002',
    'https://hbcaixensavoie.fr', 'https://www.hbcaixensavoie.fr',
    'https://hbc-aix-en-savoie.fr', 'https://www.hbc-aix-en-savoie.fr',
    'https://*.vercel.app',
    'http://localhost:3001', 'http://127.0.0.1:3001',
  ],
  ```
  et lignes 45-48 :
  ```ts
  sendResetPassword: async ({ user, url }) => {
    // TODO: Implémenter l'envoi d'email
    console.log('Reset password URL:', url)
  },
  ```
- `scripts/auth.test.ts` (lancé dans `bun run build`) : force `BETTER_AUTH_URL` à
  `http://localhost:3000`, vérifie que les origines `https://hbcaixensavoie.fr` et
  `https://www.hbcaixensavoie.fr` sont acceptées (lignes 46-58) et qu'une origine sans
  rapport est refusée (ligne 60). `bun test` tourne avec `NODE_ENV=test`.
- `next.config.mjs` (fichier complet) :
  ```js
  const nextConfig = {
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: '**' },
        { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      ],
      formats: ['image/avif', 'image/webp'],
    },
  }
  ```
  Constat sur la base réelle (lecture seule, 13 novembre 2026) : toutes les images
  absolues viennent de `*.public.blob.vercel-storage.com` (articles, équipes,
  partenaires, réglages) ou de `media-logos-clubs.ffhandball.fr` (logos des adversaires) ;
  le reste est en chemins relatifs (`/img/...`).
- `src/lib/auth-utils.ts` : `getServerSession()` renvoie la session ou `null` ;
  `requireAdmin()` appelle `redirect('/login')` sans session admin (correct pour les
  pages et les Server Actions, pas pour une route d'API).
- `src/app/api/sync/matches/route.ts` : `POST` et `GET` appellent `await requireAdmin()`
  **à l'intérieur** d'un `try` ; le `catch` attrape la redirection et répond 500 avec
  `error.message` (lignes 58-67 pour `POST`).
- `src/app/api/admin/equipes/[id]/sync-matches/route.ts:18` : `await requireAdmin()` en
  tête de `POST` (hors `try`). Vers la ligne 44, le résultat de `syncTeamMatches` n'est
  traité que pour `status === 'error'`.
- `src/app/api/upload/route.ts` montre le modèle à suivre pour une route d'API :
  ```ts
  const session = await getServerSession()
  if (session?.user.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  ```
- `.github/workflows/sync-matches.yml` : un job `sync`, sans clé `permissions`.
- Cette version de Next.js a des API qui diffèrent des versions antérieures : lis le
  guide des en-têtes et de la configuration des images dans `node_modules/next/dist/docs/`
  avant d'écrire `next.config.mjs`.

## Environnement de travail

Worktree git jetable : pas de `node_modules`, pas de `.env`, pas de base de données.
Commence par `bun install`. Ne lance ni `bun run build`, ni `bun dev`. Ne crée et ne
copie aucun `.env`.

## Commandes

| But | Commande | Attendu |
|---|---|---|
| Installer | `bun install` | exit 0 |
| Typecheck | `bun run type-check` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Tests | `bun test scripts/` | 0 fail |

## Périmètre

**Dans le périmètre** : `src/lib/auth.ts`, `src/lib/auth-utils.ts`, `scripts/auth.test.ts`,
`next.config.mjs`, `scripts/next-config.test.ts` (à créer),
`src/app/api/sync/matches/route.ts`, `src/app/api/admin/equipes/[id]/sync-matches/route.ts`,
`.github/workflows/sync-matches.yml`.

**Hors périmètre** : `src/proxy.ts`, `src/lib/auth-client.ts`, `src/app/api/upload/route.ts`,
toute politique CSP (trop risquée sans navigateur pour la régler), l'envoi réel d'un
courriel de réinitialisation, `src/lib/sync-matches.ts`, `package.json`.

## Git

Commite sur la branche du worktree, un commit par étape, conventional commits en anglais
(exemple du dépôt : `fix: restore admin login on the production domain`). Aucune ligne
d'attribution. Ne pousse rien.

## Étapes

### Étape 1 : origines de confiance
Dans `src/lib/auth.ts`, construis la liste dans une fonction exportée
`originesDeConfiance(env: { NODE_ENV?: string; VERCEL_URL?: string; VERCEL_BRANCH_URL?: string })` :
les quatre domaines du club toujours ; les origines `localhost` et `127.0.0.1` seulement
si `NODE_ENV !== 'production'` ; `https://${VERCEL_URL}` et `https://${VERCEL_BRANCH_URL}`
quand ces variables existent (déploiements de prévisualisation du projet lui-même) ;
plus aucun joker `*.vercel.app`. Passe `trustedOrigins: originesDeConfiance(process.env)`.
Dans `scripts/auth.test.ts`, ajoute : en production la liste ne contient ni `localhost`
ni joker ; avec `VERCEL_URL='hbc-xyz.vercel.app'` elle contient
`https://hbc-xyz.vercel.app` ; une requête de connexion venant de
`https://autre-projet.vercel.app` est refusée (même forme que le test « unrelated origin »
existant). Ne modifie aucun test existant.
**Vérifier** : `bun test scripts/auth.test.ts` → 0 fail ; `grep -n "\*.vercel.app" src/lib/auth.ts` → aucune ligne.

### Étape 2 : plus de jeton dans les journaux
Remplace le corps de `sendResetPassword` par un journal sans donnée sensible
(`console.warn('Réinitialisation de mot de passe demandée : envoi de courriel non configuré')`),
sans l'URL ni l'adresse. Garde un commentaire `TODO` d'une ligne.
**Vérifier** : `grep -n "Reset password URL\|console.log(.*url" src/lib/auth.ts` → aucune ligne ; `bun run type-check` → exit 0.

### Étape 3 : images distantes et en-têtes
Dans `next.config.mjs` : `remotePatterns` réduit à `*.public.blob.vercel-storage.com` et
`media-logos-clubs.ffhandball.fr` (https) ; ajoute `async headers()` qui pose sur toutes
les routes `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`X-Frame-Options: DENY` et `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
Crée `scripts/next-config.test.ts` qui importe `../next.config.mjs` et vérifie : aucun
`hostname` égal à `**` ; les deux hôtes attendus présents ; `headers()` renvoie les
quatre en-têtes pour un motif couvrant toutes les routes.
**Vérifier** : `bun test scripts/next-config.test.ts` → 0 fail.

### Étape 4 : routes d'API admin
- `src/lib/auth-utils.ts` : ajoute `sessionAdmin()` qui renvoie la session si
  `role === 'admin'`, sinon `null`, sans redirection. Ne modifie pas `requireAdmin`.
- `src/app/api/sync/matches/route.ts` (`POST` et `GET`) et
  `src/app/api/admin/equipes/[id]/sync-matches/route.ts` (`POST`) : remplace
  `await requireAdmin()` par le contrôle `sessionAdmin()` avec réponse
  `NextResponse.json({ error: 'Non autorisé' }, { status: 401 })`, placé avant tout autre
  traitement. Dans le `catch` du `POST` de `sync/matches`, renvoie un message générique
  (`'Erreur lors du déclenchement'`) au lieu de `error.message`.
- Dans la route `admin/equipes/[id]/sync-matches`, lis comment le résultat de
  `syncTeamMatches` est renvoyé : fais suivre tel quel le champ `status` du résultat dans
  la réponse JSON s'il n'y est pas déjà, sans changer les autres champs. (Un autre plan
  ajoute la valeur `'warning'` à ce statut ; ici, le type actuel suffit.)
**Vérifier** : `grep -rn "requireAdmin" src/app/api` → aucune ligne ; `bun run type-check && bun run lint && bun test scripts/` → exit 0, 0 fail.

### Étape 5 : workflow
Dans `.github/workflows/sync-matches.yml`, ajoute au niveau racine, avant `concurrency` :
```yaml
permissions:
  contents: read
```
**Vérifier** : `grep -n -A1 "^permissions:" .github/workflows/sync-matches.yml` → les deux lignes.

## Critères de fin

- [ ] `bun run type-check`, `bun run lint`, `bun test scripts/` passent
- [ ] plus de joker `*.vercel.app` ; `localhost` absent de la liste en production (test à l'appui)
- [ ] aucun journal ne contient l'URL de réinitialisation
- [ ] `next.config.mjs` : deux hôtes d'images, quatre en-têtes (test à l'appui)
- [ ] les trois handlers d'API répondent 401 sans session admin, sans `redirect`
- [ ] aucun test existant de `scripts/auth.test.ts` n'a été modifié
- [ ] `git status` : seuls les fichiers du périmètre ont changé

## Conditions d'arrêt

- Un test existant de `scripts/auth.test.ts` échoue après l'étape 1.
- La documentation locale de Next.js indique une autre forme pour `headers()` ou pour
  `remotePatterns` que celle supposée ici et tu ne peux pas la vérifier par le test.
- Tu trouves dans `src/` une image `next/image` dont l'URL en dur pointe vers un hôte
  autre que les deux retenus (cherche `https://` dans les attributs `src` des composants) :
  ajoute l'hôte et signale-le ; s'il y en a plus de trois, arrête-toi.

## Notes de maintenance

- Si une image saisie avec une URL externe cesse de s'afficher après ce plan, son hôte
  manque dans `remotePatterns` : préférer le téléversement dans l'admin à l'ajout d'hôtes.
- `X-Frame-Options: DENY` interdit d'afficher le site dans un cadre, y compris depuis un
  site partenaire : à assouplir seulement sur demande explicite.
- Non vérifié ici : la connexion admin sur un déploiement de prévisualisation Vercel
  (dépend de `VERCEL_URL` et `VERCEL_BRANCH_URL`, fournies par la plateforme). À
  contrôler avant mise en production, ainsi que l'affichage des logos adverses.
- Restent ouverts : une politique CSP, et l'envoi réel du courriel de réinitialisation.
