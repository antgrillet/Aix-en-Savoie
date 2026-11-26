# Plan 003 : la synchronisation FFHandball signale une page devenue illisible au lieu de réussir à vide

> **Consignes à l'exécutant** : suis ce plan étape par étape. Lance chaque commande de
> vérification et confirme le résultat attendu avant de passer à la suite. Si une des
> « Conditions d'arrêt » se produit, arrête-toi et rends compte : n'improvise pas.
> Ne modifie pas `plans/README.md` : le relecteur tient l'index.
>
> **Contrôle de dérive (à lancer d'abord)** :
> `git diff --stat 7ce2291..HEAD -- src/lib/ffhandball src/lib/sync-matches.ts scripts/sync-matches.ts scripts/ffhandball.test.ts`
> Si un de ces fichiers a changé, compare les extraits de « État actuel » au code réel ;
> un écart est une condition d'arrêt.

## Statut

- **Priorité** : P1
- **Effort** : S
- **Risque** : LOW
- **Dépend de** : aucun
- **Catégorie** : bug
- **Écrit sur** : commit `7ce2291`, 2026-11-13

## Pourquoi

Les matchs et classements sont lus dans le JSON embarqué des pages ffhandball.fr, une
source tierce dont la structure peut changer sans préavis. Aujourd'hui, si un champ est
renommé, chaque rencontre est rejetée en silence par son schéma, la liste lue est vide,
le bloc d'écriture est sauté et un journal `success` (« 0 créés… ») est écrit. GitHub
Actions reste vert, l'admin voit « dernière synchronisation réussie », et plus aucun
score n'arrive. Ce plan rend ce cas visible : erreur quand la page contient des
rencontres dont aucune n'est lisible, avertissement quand elles perdent toutes leur date.

## État actuel

- `src/lib/ffhandball/donnees.ts` : lecture pure des pages (aucun accès réseau ni base).
  Lignes 192-199, l'aide qui écarte en silence :
  ```ts
  function lireListe<T>(valeur: unknown, schema: z.ZodType<T>): T[] {
    const liste = deserialiser(valeur)
    if (!Array.isArray(liste)) return []
    return liste.flatMap((element) => {
      const resultat = schema.safeParse(element)
      return resultat.success ? [resultat.data] : []
    })
  }
  ```
  Dans `lireCalendrierEquipe` (début ligne 455), lignes 474-481 :
  ```ts
  const liste = composants.get('competitions---rencontre-list')
  if (!Array.isArray(deserialiser(liste?.rencontres))) {
    throw new Error('La page FFHandball ne contient pas la liste des rencontres')
  }
  const rencontres = lireListe(liste?.rencontres, schemaRencontre)
    .filter((brute) => brute.equipe1Id === equipe.id || brute.equipe2Id === equipe.id)
    .map((brute) => versRencontre(brute, equipe.id))
    .filter((rencontre) => rencontre.adversaire.length > 0)
  ```
  `lireClassement` (lignes 390-406) renvoie `null` dès qu'une ligne est illisible, saute
  les lignes d'une autre poule (`continue` ligne 397) et renvoie le tableau, éventuellement vide.
- `scripts/ffhandball.test.ts` : tests `bun:test` construits avec une aide `bloc(nom, données)`
  qui fabrique un fragment de page. Un test existant fixe un comportement **voulu** :
  ```ts
  const vide = sans + bloc('competitions---mini-classement-or-ads', { classements: [] })
  expect(lireCalendrierEquipe(extraireComposants(vide)).classement).toEqual([])
  ```
  Un bloc de classement explicitement vide reste lu comme `[]` : ne change pas ce test.
- `src/lib/sync-matches.ts`, `syncTeamMatches` (116-340) : lit le calendrier, calcule
  ```ts
  const datees = calendrier.rencontres.filter(
    (rencontre): rencontre is RencontreFfhb & { date: Date } => rencontre.date !== null
  )
  ```
  n'écrit les matchs que `if (calendrier.rencontres.length > 0)`, puis écrit toujours
  `prisma.syncLog.create({ data: { …, status: 'success', message: … } })` (ligne 272) et
  renvoie `status: 'success'`. Une exception est attrapée, journalisée en `status: 'error'`
  et renvoyée en `status: 'error'`.
- `prisma/schema.prisma:291` : `status String // "success", "error", "warning"` : la valeur
  `warning` est prévue, aucune migration n'est nécessaire.
- `scripts/sync-matches.ts` (lancé par GitHub Actions) : affiche chaque résultat, sort en
  code 1 si toutes les équipes sont en erreur, 2 si au moins une l'est, 0 sinon.
- `src/app/(admin)/admin/resultats/page.tsx:369` lit le dernier journal `status: 'success'`
  pour afficher la dernière synchronisation réussie : un `warning` ne doit pas compter.

## Environnement de travail

Worktree git jetable : pas de `node_modules`, pas de `.env`, pas de base de données.
Commence par `bun install`. Ne lance jamais `bun run sync:matches` (il écrirait en base de
production s'il trouvait une connexion), ni `bun run build`, ni `bun dev`.

## Commandes

| But | Commande | Attendu |
|---|---|---|
| Installer | `bun install` | exit 0 |
| Typecheck | `bun run type-check` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Tests | `bun test scripts/` | 0 fail |

## Périmètre

**Dans le périmètre** : `src/lib/ffhandball/donnees.ts`, `src/lib/sync-matches.ts`,
`scripts/sync-matches.ts`, `scripts/ffhandball.test.ts`.

**Hors périmètre** : `src/lib/ffhandball/client.ts`, la logique de rapprochement des
matchs (`trouverExistant`, `versMatch`), le schéma Prisma, `.github/workflows/`, les
pages d'administration, `package.json`.

## Git

Commite sur la branche du worktree, conventional commits en anglais (exemple du dépôt :
`feat: sync FFHandball without a browser and add weekend results`). Aucune ligne
d'attribution. Ne pousse rien.

## Étapes

### Étape 1 : `lireCalendrierEquipe` refuse une liste devenue illisible
Dans `donnees.ts`, compte les éléments bruts du tableau `rencontres` et ceux qui passent
`schemaRencontre`. Si le tableau brut n'est pas vide et qu'aucun élément ne passe, ou que
plus de la moitié sont rejetés, lève
`new Error('La page FFHandball contient des rencontres illisibles (N sur M)')`.
Ne lève rien quand le tableau brut est vide (équipe sans match en début de phase), ni
quand les rencontres valides concernent simplement d'autres équipes de la poule.
Tests à ajouter dans `scripts/ffhandball.test.ts`, en partant de la page de test existante :
toutes les rencontres privées d'un champ requis → `toThrow(/illisibles/)` ; une seule
rencontre abîmée sur plusieurs → pas d'exception et les autres sont lues ; tableau vide →
pas d'exception, `rencontres` vaut `[]`.
**Vérifier** : `bun test scripts/ffhandball.test.ts` → 0 fail.

### Étape 2 : `lireClassement` ne vide pas le classement sur un filtre de poule sans résultat
Si le tableau brut contient au moins une ligne et qu'aucune n'est retenue après le filtre
de poule, renvoie `null` (classement en base conservé). Un tableau brut vide reste `[]`.
Mets à jour le commentaire de la fonction. Test à ajouter : classement dont toutes les
lignes portent un autre `pouleId` → `classement` vaut `null`. Le test existant du tableau
vide (`toEqual([])`) doit rester vert sans modification.
**Vérifier** : `bun test scripts/ffhandball.test.ts` → 0 fail.

### Étape 3 : statut `warning` dans `syncTeamMatches`
Ajoute `'warning'` au type du champ `status` de `SyncResult`. Après la lecture du
calendrier : si `calendrier.rencontres.length > 0` et `datees.length === 0`, le résultat
est un avertissement, avec le message préfixé par
`Aucune rencontre datée sur N lues : format de date FFHandball à vérifier. `.
Dans ce cas le journal est écrit avec `status: 'warning'` et la fonction renvoie
`status: 'warning'`. Le reste du traitement ne change pas.
**Vérifier** : `bun run type-check` → exit 0 ; `grep -n "'warning'" src/lib/sync-matches.ts` → au moins deux lignes.

### Étape 4 : le script sort en erreur sur un avertissement
Dans `scripts/sync-matches.ts` : affiche les équipes en `warning` avec le pictogramme `⚠️`
et leur message ; compte-les avec les erreurs pour le code de sortie 2 (le cas « toutes
en erreur → 1 » ne compte que les `error`). Ajuste le message final.
**Vérifier** : `bun run type-check && bun run lint && bun test scripts/` → exit 0, 0 fail.

## Critères de fin

- [ ] `bun run type-check`, `bun run lint`, `bun test scripts/` passent
- [ ] au moins quatre nouveaux tests dans `scripts/ffhandball.test.ts`, dont un `toThrow(/illisibles/)`
- [ ] le test existant `classement).toEqual([])` est inchangé et vert
- [ ] `SyncResult['status']` accepte `'warning'` et le script sort en code non nul dans ce cas
- [ ] `git status` : seuls les fichiers du périmètre ont changé

## Conditions d'arrêt

- La page de test de `scripts/ffhandball.test.ts` ne permet pas de fabriquer les cas
  demandés sans réécrire l'aide `bloc`.
- `SyncResult` est consommé ailleurs avec un test exhaustif sur `status` qui casse le
  typecheck hors périmètre (cherche `status === 'success'` dans `src/`) : rends compte.
- Tu constates qu'une équipe réelle peut légitimement avoir toutes ses rencontres sans
  date pendant plusieurs semaines (commentaire ou test qui le dit) : rends compte au lieu
  de poser l'avertissement.

## Notes de maintenance

- Le seuil « plus de la moitié rejetées » est un choix de prudence ; s'il déclenche à
  tort, l'ajuster dans `lireCalendrierEquipe` et dans son test.
- L'écriture en base de `syncTeamMatches` reste sans test (il faudrait une base
  jetable) : c'est un chantier distinct.
- Non couvert : la synchronisation qui écrase un score ou une salle corrigés à la main
  (voir plan 009).
