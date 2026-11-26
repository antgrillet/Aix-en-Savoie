# Plan 008 : plus d'identifiants en dur dans `scripts/`, et une documentation qui décrit le code réel

> **Consignes à l'exécutant** : suis ce plan étape par étape. Lance chaque commande de
> vérification et confirme le résultat attendu avant de passer à la suite. Si une des
> « Conditions d'arrêt » se produit, arrête-toi et rends compte : n'improvise pas.
> Ne modifie pas `plans/README.md` : le relecteur tient l'index.
>
> **Règle absolue sur les secrets** : plusieurs fichiers que tu vas lire contiennent des
> mots de passe et une adresse e-mail écrits en dur. Ne recopie jamais ces valeurs : ni
> dans un nouveau fichier, ni dans un message de commit, ni dans ton rapport. Désigne-les
> par fichier et ligne.
>
> **Contrôle de dérive (à lancer d'abord)** :
> `git diff --stat 7ce2291..HEAD -- scripts CLAUDE.md PRODUCT.md CALENDRIER_INTERACTIF.md .gitignore`
> Si un de ces fichiers a changé, compare les extraits de « État actuel » au code réel ;
> un écart est une condition d'arrêt.

## Statut

- **Priorité** : P2
- **Effort** : S
- **Risque** : LOW
- **Dépend de** : aucun
- **Catégorie** : security, docs, dx
- **Écrit sur** : commit `7ce2291`, 2026-11-13

## Pourquoi

`scripts/` garde une dizaine de scripts ponctuels, écrits pendant une panne de connexion
admin, qu'aucun fichier ne référence. Plusieurs écrivent en base de production un mot de
passe admin écrit en dur et l'affichent en clair ; un autre installe un mot de passe par
défaut pour l'espace bénévoles, mot de passe aussi imprimé dans la documentation. Un
lancement par erreur casse ou affaiblit la connexion admin, et personne ne sait quel
script est le bon. En parallèle, la documentation décrit un code qui n'existe plus
(`middleware.ts`, session en `sessionStorage`) ou n'a jamais existé (suivi de dossiers
d'inscription), et aucune liste des variables d'environnement n'existe.

## État actuel

- Scripts référencés et à conserver : `scripts/sync-matches.ts`, `scripts/ffhb-equipes.ts`
  (dans `package.json`), tous les `scripts/*.test.ts`.
- Scripts que rien ne référence (ni `package.json`, ni `.github/`, ni `src/`, ni les `.md`) :
  `check-account-provider.ts`, `check-admin.ts`, `create-admin-with-better-auth.ts`,
  `fix-admin-password.ts`, `fix-provider-id.ts`, `reset-admin-better-auth.ts`,
  `restore-credential-provider.ts`, `update-admin-password.ts`, `verify-admin-password.ts`,
  `init-calendrier-password.ts`, `generate-partner-slugs.ts`, `generate-partner-slugs.mjs`,
  `fix-sequences.ts`, `clean-blob.ts`.
  Les dix premiers touchent aux comptes ou aux mots de passe ; la plupart contiennent un
  mot de passe ou une adresse en dur (par exemple `scripts/verify-admin-password.ts:5`,
  `scripts/init-calendrier-password.ts:10`).
- Hachage des mots de passe admin, `src/lib/auth.ts:49-56` : `bcrypt.hash(password, 10)`
  à l'écriture et `bcrypt.compare` à la lecture. `scripts/update-admin-password.ts` montre
  quelle table et quelle colonne portent le hash (modèle `Account`, table `accounts`).
- `CLAUDE.md:49` : « Protected routes checked in `middleware.ts` via session cookie. »
  Le fichier réel est `src/proxy.ts` (nom imposé par Next.js 16), qui valide la session
  et le rôle `admin` pour `/admin/*`.
- `PRODUCT.md:23` : « Les inscriptions arrivent par le formulaire public ; l'admin suit
  les dossiers et les pièces manquantes. » En réalité le modèle `Inscription`
  (`prisma/schema.prisma:338-353`) est l'inscription d'un bénévole (`nom`, `prenom`,
  `role`, `matchId`) à un match à domicile depuis `/calendrier`, et l'admin
  (`/admin/inscriptions`) suit les rôles non pourvus par match. Il n'existe ni dossier ni pièce.
- `CALENDRIER_INTERACTIF.md` : la ligne 14 imprime un mot de passe par défaut ; les lignes
  190-201 décrivent l'ancienne mécanique (« Session stockée côté client (sessionStorage) »).
  Mécanique réelle (`src/lib/calendrier-session.ts`, `src/app/api/calendrier/`) : un mot de
  passe juste pose un cookie `httpOnly` signé, valable 12 heures ; les routes
  `/api/calendrier/matchs` et `/api/calendrier/inscriptions` répondent 401 sans lui ;
  `GET /api/calendrier/auth` indique si la session est active, `DELETE` la ferme ; la
  suppression d'une inscription est réservée à l'admin ; les tentatives sont limitées en
  débit. Le mot de passe reste stocké en clair dans les réglages : choix assumé, il est
  partagé entre bénévoles.
- `.gitignore` ignore `.env.example` deux fois : ligne 12 (`.env.example`) et ligne 39
  (`.env*`). Aucun `README.md` général n'existe.
- Variables d'environnement lues par le code (noms seulement) : `DATABASE_URL`,
  `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`,
  `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `BLOB_READ_WRITE_TOKEN` (lue par `@vercel/blob`),
  `GITHUB_TOKEN`, `GITHUB_REPO`, `NEXT_PUBLIC_BASE_URL`. Vérifie cette liste par
  `grep -rhoE "process\.env\.[A-Z_]+" src scripts prisma.config.ts | sort -u`.

## Environnement de travail

Worktree git jetable : pas de `node_modules`, pas de `.env`, pas de base de données.
Commence par `bun install`. N'exécute aucun des scripts de `scripts/` hors tests. Ne crée
et ne copie aucun fichier `.env` (le fichier `.env.example` demandé ne contient que des
noms et des valeurs factices).

## Commandes

| But | Commande | Attendu |
|---|---|---|
| Installer | `bun install` | exit 0 |
| Typecheck | `bun run type-check` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Tests | `bun test scripts/` | 0 fail |

## Périmètre

**Dans le périmètre** : les quatorze scripts non référencés (suppression selon l'étape 1),
`scripts/admin-mot-de-passe.ts` (à créer), `CLAUDE.md` (ligne 49 et, si elle s'y trouve,
la mention de `middleware.ts` dans la section Authentication), `PRODUCT.md` (ligne 23),
`CALENDRIER_INTERACTIF.md`, `.gitignore`, `.env.example` (à créer), `README.md` (à créer).

**Hors périmètre** : `package.json`, `README_SYNC.md`, `DESIGN.md`, `src/`, `prisma/`,
`scripts/sync-matches.ts`, `scripts/ffhb-equipes.ts`, les fichiers de test, le bloc
« This is NOT the Next.js you know » à la fin de `CLAUDE.md` (réécrit par `next dev`).

## Git

Commite sur la branche du worktree, un commit par étape, conventional commits en anglais
(exemples du dépôt : `fix: remove all build and lint warnings`, `chore: …`). Aucune
ligne d'attribution, aucune valeur secrète dans les messages. Ne pousse rien.

## Étapes

### Étape 1 : supprimer les scripts ponctuels
Supprime les dix scripts de comptes et de mots de passe et les deux
`generate-partner-slugs`. Pour `fix-sequences.ts` et `clean-blob.ts` : lis-les ; s'ils ne
contiennent ni mot de passe, ni adresse, ni jeton en dur, garde-les et ajoute en tête un
commentaire d'une ligne disant ce qu'ils font et qu'ils écrivent en production ; sinon
supprime-les aussi.
**Vérifier** : `ls scripts` ne liste plus les douze fichiers ;
`grep -rnEi "password\s*[:=]\s*['\"][^'\"]+['\"]" scripts --include='*.ts' | grep -v "\.test\.ts"` → aucune ligne.

### Étape 2 : un seul script pour changer le mot de passe admin
Avant de supprimer `update-admin-password.ts` à l'étape 1, lis-le pour reprendre sa façon
de trouver le compte. Crée `scripts/admin-mot-de-passe.ts` : lit `ADMIN_EMAIL` et
`ADMIN_PASSWORD` dans l'environnement (erreur claire et code de sortie 1 si l'une manque,
si le mot de passe fait moins de 12 caractères, ou si aucun compte admin ne porte cette
adresse) ; hache avec `bcrypt` coût 10, comme `src/lib/auth.ts` ; met à jour le hash du
compte à identifiants ; n'affiche jamais le mot de passe, le hash ni l'adresse, seulement
« Mot de passe mis à jour » ; ferme la connexion Prisma. Commentaire d'en-tête : usage
(`ADMIN_EMAIL=… ADMIN_PASSWORD=… bun run scripts/admin-mot-de-passe.ts`) et rappel qu'il
écrit dans la base désignée par `DATABASE_URL`. Ne l'exécute pas.
**Vérifier** : `bun run type-check` → exit 0 ; `bun x eslint scripts/admin-mot-de-passe.ts` → exit 0 ;
`grep -n "console\.\(log\|error\).*\(password\|hash\|email\)" scripts/admin-mot-de-passe.ts` → aucune ligne qui interpole une de ces valeurs.

### Étape 3 : documentation
- `CLAUDE.md:49` : remplace `middleware.ts` par `src/proxy.ts` et précise que la session
  et le rôle admin y sont vérifiés.
- `PRODUCT.md:23` : remplace la phrase par la réalité décrite dans « État actuel »
  (inscriptions de bénévoles aux matchs à domicile depuis `/calendrier`, suivi des rôles
  non pourvus dans l'admin). Garde le ton et la longueur des lignes voisines.
- `CALENDRIER_INTERACTIF.md` : supprime le mot de passe par défaut de la ligne 14 (dis
  qu'il se définit dans `/admin/parametres`) ; réécris les lignes 190-201 selon la
  mécanique réelle ; corrige toute autre phrase qui parle de `sessionStorage` ou d'une
  suppression d'inscription par les bénévoles ; ne touche pas aux sections « évolutions futures ».
**Vérifier** : `grep -n "middleware.ts" CLAUDE.md` → aucune ligne ; `grep -n "pièces manquantes" PRODUCT.md` → aucune ligne ; `grep -n "sessionStorage\|par défaut :" CALENDRIER_INTERACTIF.md` → aucune ligne.

### Étape 4 : variables d'environnement et README
- `.gitignore` : supprime la ligne 12 (`.env.example`) et ajoute `!.env.example` juste
  après la ligne `.env*`.
- `.env.example` : une ligne par variable de la liste vérifiée, avec un commentaire d'une
  ligne sur son rôle et une valeur factice évidente (`postgresql://utilisateur:motdepasse@hote/base`,
  `re_xxx`…). Aucune valeur réelle.
- `README.md` (40 lignes au plus, en français) : ce qu'est le projet (une phrase),
  prérequis (Bun 1.3), installation (`bun install`, copier `.env.example` vers `.env`),
  commandes (`bun dev`, `bun run type-check`, `bun run lint`, `bun test scripts/`),
  synchronisation FFHandball (renvoi vers `README_SYNC.md`), changement du mot de passe
  admin (le script de l'étape 2), renvoi vers `CLAUDE.md`, `PRODUCT.md`, `DESIGN.md`.
**Vérifier** : `git check-ignore .env.example` → exit 1 (non ignoré) ; `git check-ignore .env` → exit 0 ;
`bun run type-check && bun run lint && bun test scripts/` → exit 0, 0 fail.

## Critères de fin

- [ ] `bun run type-check`, `bun run lint`, `bun test scripts/` passent
- [ ] aucun mot de passe en dur dans `scripts/` hors fichiers de test (commande de l'étape 1)
- [ ] `grep -rn "handball20" . --include='*.md' --include='*.ts' --exclude-dir=node_modules --exclude-dir=.next` → aucune ligne
- [ ] `.env.example` suivi par git, `.env` toujours ignoré
- [ ] `CLAUDE.md`, `PRODUCT.md`, `CALENDRIER_INTERACTIF.md` corrigés (commandes de l'étape 3)
- [ ] `git status` : seuls les fichiers du périmètre ont changé

## Conditions d'arrêt

- Un des scripts « non référencés » est en réalité cité quelque part (cherche son nom dans
  tout le dépôt hors `node_modules`).
- `update-admin-password.ts` ne permet pas de comprendre où vit le hash du compte à
  identifiants : n'invente pas, rends compte.
- Tu trouves un secret réel (jeton d'API, URL de base avec mot de passe) dans un fichier
  suivi par git : signale fichier et ligne, sans la valeur.

## Notes de maintenance

- Supprimer les scripts ne retire rien de l'historique git : les valeurs qu'ils
  contenaient restent compromises. Le mot de passe admin et celui de l'espace bénévoles
  doivent être changés en production (action du propriétaire du site, hors de ce plan).
- `scripts/admin-mot-de-passe.ts` n'a pas été exécuté contre une base : le premier usage
  réel doit être fait avec attention, en vérifiant la connexion ensuite.
- Le plan 001 retire `src/lib/cron.ts` et la ligne correspondante de `README_SYNC.md` :
  c'est pourquoi `README_SYNC.md` est hors périmètre ici.
