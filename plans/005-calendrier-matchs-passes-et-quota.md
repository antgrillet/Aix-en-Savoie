# Plan 005 : l'espace bénévoles ne propose plus les matchs passés et ne dépasse plus ses quotas

> **Consignes à l'exécutant** : suis ce plan étape par étape. Lance chaque commande de
> vérification et confirme le résultat attendu avant de passer à la suite. Si une des
> « Conditions d'arrêt » se produit, arrête-toi et rends compte : n'improvise pas.
> Ne modifie pas `plans/README.md` : le relecteur tient l'index.
>
> **Contrôle de dérive (à lancer d'abord)** :
> `git diff --stat 7ce2291..HEAD -- src/app/api/calendrier src/lib/calendrier-session.ts`
> Si un de ces fichiers a changé, compare les extraits de « État actuel » au code réel ;
> un écart est une condition d'arrêt.

## Statut

- **Priorité** : P2
- **Effort** : S
- **Risque** : LOW
- **Dépend de** : aucun
- **Catégorie** : bug
- **Écrit sur** : commit `7ce2291`, 2026-11-13

## Pourquoi

L'espace bénévoles (`/calendrier`) liste les matchs à domicile pour que les bénévoles
s'inscrivent à un rôle (table de marque, arbitre, responsable de salle, buvette). La
liste filtre sur `termine: false` sans borne de date : un match passé dont le score n'a
jamais été saisi, ou un match reporté dont l'ancienne date est restée en base, reste
affiché comme « à venir » et ouvert aux inscriptions, et ces lignes s'accumulent au fil
de la saison. Par ailleurs le quota par rôle est lu puis l'inscription créée dans deux
requêtes séparées : deux bénévoles qui valident en même temps dépassent le quota.

## État actuel

- `src/app/api/calendrier/matchs/route.ts` (guillemets doubles et points-virgules dans ce
  dossier : respecte le style du fichier). Après le contrôle `sessionBenevoleActive()` :
  ```ts
  const whereClause: any = {
    termine: false, // Uniquement les matchs à venir
    published: true,
    domicile: true, // Uniquement les matchs à domicile
  };
  ```
  puis `prisma.match.findMany({ where: whereClause, include: { equipe…, inscriptions… }, orderBy: { date: "asc" } })`.
- `src/app/api/calendrier/inscriptions/route.ts` : le `POST` vérifie la session bénévole,
  la limite de débit, valide le corps avec `inscriptionSchema` (Zod), puis :
  ```ts
  const QUOTAS: Record<RoleInscription, number | null> = {
    TABLE_DE_MARQUE: 2, ARBITRE: 2, RESPONSABLE_SALLE: 1, BUVETTE: null, // Illimité
  };
  …
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { inscriptions: { where: { role } } },
  });
  if (!match || !match.published || !match.domicile) { … 404 }
  if (match.termine) { … 400 "Impossible de s'inscrire à un match terminé" }
  const quota = QUOTAS[role];
  if (quota !== null && match.inscriptions.length >= quota) { … 400 }
  const existingInscription = match.inscriptions.find(…nom et prénom identiques…);
  if (existingInscription) { … 400 }
  const inscription = await prisma.inscription.create({ data: { matchId, nom, prenom, role } });
  ```
  Les contrôles de session, de débit et de schéma en tête du handler sont récents et
  corrects : ne les modifie pas.
- `RoleInscription` vient de `@/generated/prisma/client` (client Prisma généré par `bun install`).
- Tests du dépôt : `bun:test`, fichiers `scripts/*.test.ts` (modèle : `scripts/dates.test.ts`).

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

**Dans le périmètre** : `src/lib/calendrier-regles.ts` (à créer),
`scripts/calendrier-regles.test.ts` (à créer), `src/app/api/calendrier/matchs/route.ts`,
`src/app/api/calendrier/inscriptions/route.ts`.

**Hors périmètre** : `src/app/api/calendrier/auth/route.ts`,
`src/app/api/calendrier/inscriptions/[id]/route.ts`, `src/lib/calendrier-session.ts`,
`src/lib/rate-limit.ts`, `src/lib/dates.ts`, les composants `src/components/calendrier/`,
le stockage du mot de passe du calendrier (en clair dans les réglages : choix documenté
dans `CALENDRIER_INTERACTIF.md`, le mot de passe est partagé entre bénévoles), le schéma
Prisma, `package.json`.

## Git

Commite sur la branche du worktree, conventional commits en anglais (exemple du dépôt :
`fix: lock down the upload, volunteer and contact endpoints`). Aucune ligne
d'attribution. Ne pousse rien.

## Étapes

### Étape 1 : règles pures dans `src/lib/calendrier-regles.ts`
Exporte :
- `DELAI_APRES_COUP_ENVOI_MS = 3 * 60 * 60 * 1000` ;
- `limiteMatchsOuverts(maintenant: Date): Date` : `maintenant` moins ce délai ;
- `matchOuvert(match: { date: Date; termine: boolean }, maintenant: Date): boolean` :
  vrai si le match n'est pas terminé et que sa date est postérieure ou égale à la limite ;
- `QUOTAS` (déplacé depuis la route, même contenu et même type) ;
- `placeDisponible(role: RoleInscription, dejaInscrits: number): boolean`.
Aucun accès à Prisma, à `next/*` ni au fuseau horaire : la règle compare des instants.
Tests dans `scripts/calendrier-regles.test.ts` : match dans une heure ouvert ; commencé
il y a deux heures ouvert ; commencé il y a quatre heures fermé ; match terminé fermé
même futur ; quota atteint et non atteint pour chaque rôle limité ; buvette toujours disponible.
**Vérifier** : `bun test scripts/calendrier-regles.test.ts` → 0 fail.

### Étape 2 : la liste ne montre que les matchs ouverts
Dans `matchs/route.ts`, ajoute `date: { gte: limiteMatchsOuverts(new Date()) }` à
`whereClause`. Rien d'autre ne change.
**Vérifier** : `grep -n "limiteMatchsOuverts" src/app/api/calendrier/matchs/route.ts` → une ligne d'import et une d'usage ; `bun run type-check` → exit 0.

### Étape 3 : inscription contrôlée et créée dans une même transaction
Dans le `POST` de `inscriptions/route.ts`, après la validation du corps :
- importe `QUOTAS`, `matchOuvert`, `placeDisponible` depuis `@/lib/calendrier-regles` et
  supprime le `QUOTAS` local ;
- exécute lecture du match, contrôles (404, match fermé, quota, doublon) et `create`
  dans `prisma.$transaction(async (tx) => { … }, { isolationLevel: "Serializable" })` ;
  les refus sortent de la transaction par un objet résultat (pas par une exception) pour
  garder les mêmes statuts et messages qu'aujourd'hui ;
- un match non ouvert au sens de `matchOuvert` répond 400 avec
  « Les inscriptions pour ce match sont closes » (le cas `termine` garde son message actuel) ;
- un conflit de sérialisation (erreur Prisma de code `P2034`) est retenté une fois, puis
  répond 409 « Une autre inscription vient d'être enregistrée, réessayez ».
**Vérifier** : `bun run type-check && bun run lint && bun test scripts/` → exit 0, 0 fail ;
`grep -n "Serializable\|P2034" src/app/api/calendrier/inscriptions/route.ts` → au moins une ligne chacune.

## Critères de fin

- [ ] `bun run type-check`, `bun run lint`, `bun test scripts/` passent
- [ ] `src/lib/calendrier-regles.ts` existe, sans import de Prisma runtime ni de `next/*` (un `import type` du rôle est permis)
- [ ] la route `matchs` filtre sur la date ; la route `inscriptions` crée dans une transaction sérialisable
- [ ] les contrôles `sessionBenevoleActive()` et `rateLimit(...)` sont toujours en tête des deux handlers
- [ ] `git status` : seuls les fichiers du périmètre ont changé

## Conditions d'arrêt

- Le client Prisma généré avec l'adaptateur `pg` ne propose pas `isolationLevel` sur les
  transactions interactives (erreur de type) : rends compte, ne remplace pas par un verrou SQL brut.
- Les composants `src/components/calendrier/` dépendent d'un message d'erreur exact que
  tu devrais changer.

## Notes de maintenance

- Le délai de trois heures après le coup d'envoi est un choix : il laisse le match du
  jour visible pendant qu'il se joue. Il se règle dans `calendrier-regles.ts`.
- Non vérifié ici : la transaction contre une vraie base Postgres (Neon). À contrôler
  après fusion : une inscription normale, puis un rôle déjà complet.
- L'admin garde la vue complète des inscriptions, matchs passés compris, dans `/admin/inscriptions`.
