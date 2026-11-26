# Plan 002 : le formulaire de match lit et écrit l'heure de Paris, et ses entrées sont validées

> **Consignes à l'exécutant** : suis ce plan étape par étape. Lance chaque commande de
> vérification et confirme le résultat attendu avant de passer à la suite. Si une des
> « Conditions d'arrêt » se produit, arrête-toi et rends compte : n'improvise pas.
> Ne modifie pas `plans/README.md` : le relecteur tient l'index.
>
> **Contrôle de dérive (à lancer d'abord)** :
> `git diff --stat 7ce2291..HEAD -- src/lib/dates.ts scripts/dates.test.ts "src/app/(admin)/admin/matchs" src/components/teams/TeamCardDetailed.tsx src/lib/validations`
> Si un de ces fichiers a changé, compare les extraits de « État actuel » au code réel ;
> un écart est une condition d'arrêt.

## Statut

- **Priorité** : P1
- **Effort** : M
- **Risque** : LOW
- **Dépend de** : aucun
- **Catégorie** : bug
- **Écrit sur** : commit `7ce2291`, 2026-11-13

## Pourquoi

Les dates de match sont stockées en instant UTC et le club vit à l'heure de Paris. Le
serveur (Vercel) tourne en UTC. Le formulaire d'administration des matchs convertit la
date avec le fuseau de la machine qui exécute le code : au rendu serveur le champ affiche
19:30 pour un match de 20:30, et à l'enregistrement le serveur lit « 20:30 » comme
20:30 UTC, soit 21:30 à Paris. Le formulaire renvoie toujours la date, même quand
l'admin ne saisit qu'un score : chaque enregistrement peut décaler le match d'une à deux
heures. Par ailleurs `createMatch` et `updateMatch` n'ont aucun schéma : un `parseInt`
en `NaN` ou une date invalide part directement à Prisma.

## État actuel

- `src/lib/dates.ts` : module de dates du site, fuseau explicite. Il exporte
  `FUSEAU_CLUB = 'Europe/Paris'`, `formatHeure`, `formatDateHeure` (« sam. 14 nov., 20:30 »),
  `bornesWeekend`, et contient deux fonctions internes utiles, non exportées :
  ```ts
  /** Décalage de Paris par rapport à UTC, en millisecondes, à l'instant donné. */
  function decalageParis(instant: Date): number { … }
  /** Instant correspondant à minuit, heure de Paris, pour une date civile. */
  function minuitParis(annee: number, mois: number, jour: number): Date {
    const approx = Date.UTC(annee, mois - 1, jour)
    const premier = new Date(approx - decalageParis(new Date(approx)))
    // Second passage pour les nuits de changement d'heure.
    return new Date(approx - decalageParis(premier))
  }
  ```
- `scripts/dates.test.ts` : tests `bun:test` de ce module (modèle à suivre) :
  ```ts
  test("l'heure d'hiver est UTC+1", () => {
    expect(formatHeure(new Date('2026-11-14T19:30:00Z'))).toBe('20:30')
  })
  ```
- `src/app/(admin)/admin/matchs/MatchForm.tsx` (composant client), lignes 103-112 :
  ```ts
  // Format date for input[type="datetime-local"]
  const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    …
    const hours = String(d.getHours()).padStart(2, '0')
    …
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  ```
  utilisé ligne 223 : `defaultValue={match?.date ? formatDateForInput(match.date) : ''}`
  sur `<input name="date" type="datetime-local">`. Le formulaire affiche les erreurs par
  `toast.error` (lignes 151 et 171) quand l'action lève une exception.
- `src/app/(admin)/admin/matchs/actions.ts`, `createMatch` (83-122) et `updateMatch`
  (124-169) lisent le `FormData` à la main :
  ```ts
  const equipeId = parseInt(formData.get('equipeId') as string)
  const adversaire = formData.get('adversaire') as string
  const dateStr = formData.get('date') as string
  …
  if (termine) { … scoreEquipe = parseInt(scoreEquipeStr) … }
  await prisma.match.create({ data: { equipeId, adversaire, date: new Date(dateStr), lieu, … } })
  ```
  Chaque action commence par `await requireAdmin()` : à conserver tel quel, en première ligne.
- `src/components/teams/TeamCardDetailed.tsx:162-168` (composant client, rendu aussi côté
  serveur) : `new Date(nextMatch.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })`
  sans fuseau, d'où une heure fausse au premier rendu et un écart d'hydratation.
- Convention de validation : schémas Zod dans `src/lib/validations/` (voir
  `src/lib/validations/article.ts`), messages en français, action qui fait
  `schema.parse(data)`. Style : guillemets simples, pas de point-virgule, noms métier en français.

## Environnement de travail

Worktree git jetable : pas de `node_modules`, pas de `.env`, pas de base de données.
Commence par `bun install`. Ne lance ni `bun run build`, ni `bun dev`, ni commande Prisma
de migration. Ne crée et ne copie aucun `.env`.

## Commandes

| But | Commande | Attendu |
|---|---|---|
| Installer | `bun install` | exit 0 |
| Typecheck | `bun run type-check` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Tests | `bun test scripts/` | 0 fail |

## Périmètre

**Dans le périmètre** : `src/lib/dates.ts`, `scripts/dates.test.ts`,
`src/lib/validations/match.ts` (à créer), `scripts/match-validation.test.ts` (à créer),
`src/app/(admin)/admin/matchs/MatchForm.tsx`, `src/app/(admin)/admin/matchs/actions.ts`,
`src/components/teams/TeamCardDetailed.tsx`.

**Hors périmètre** : `package.json` (les nouveaux tests tournent déjà avec `bun test scripts/`),
`src/lib/resultats-weekend.ts`, `src/lib/sync-matches.ts`, la mise en page du formulaire,
les autres actions du fichier (`getMatchs`, `deleteMatch`…), toute correction des dates
déjà en base.

## Git

Commite sur la branche du worktree, un commit par étape, conventional commits en anglais
(exemple du dépôt : `fix: show match times in Paris time and point SEO at the live domain`).
Aucune ligne d'attribution. Ne pousse rien.

## Étapes

### Étape 1 : deux conversions dans `src/lib/dates.ts`
Ajoute et exporte :
- `versChampDateHeure(date: Date): string` : renvoie `YYYY-MM-DDTHH:mm` à l'heure de Paris
  (format de `datetime-local`), via `Intl.DateTimeFormat` avec `timeZone: FUSEAU_CLUB` et
  `hourCycle: 'h23'`.
- `lireChampDateHeure(texte: string): Date | null` : accepte strictement
  `YYYY-MM-DDTHH:mm` (secondes optionnelles), l'interprète comme une heure de Paris et
  renvoie l'instant ; `null` si le format ou la date civile est invalide (mois 13, 30
  février, heure 25). Réutilise `decalageParis` avec la même technique en deux passages
  que `minuitParis`.
Tests à ajouter dans `scripts/dates.test.ts` :
- hiver : `lireChampDateHeure('2026-11-14T20:30')` → `2026-11-14T19:30:00.000Z` ;
- été : `'2026-09-12T20:30'` → `2026-09-12T18:30:00.000Z` ;
- `versChampDateHeure(new Date('2026-11-14T19:30:00Z'))` → `'2026-11-14T20:30'` ;
- aller-retour identique pour au moins quatre instants, dont un le jour du passage à
  l'heure d'été (2027-03-28) et un le jour du passage à l'heure d'hiver (2026-10-25) ;
- entrées invalides (`''`, `'demain'`, `'2026-13-01T10:00'`, `'2026-02-30T10:00'`) → `null`.
**Vérifier** : `bun test scripts/dates.test.ts` → 0 fail.

### Étape 2 : schéma `src/lib/validations/match.ts`
Exporte `matchSchema` (Zod) et une fonction `lireMatchFormData(formData: FormData)` qui
construit l'objet depuis le `FormData` puis fait `matchSchema.parse`. Règles :
`equipeId` entier > 0 ; `adversaire` chaîne rognée, 1 à 120 caractères ; `date` obtenue par
`lireChampDateHeure`, erreur « Date du match invalide » si `null` ; `lieu` rogné, 1 à 200 ;
`domicile`, `termine`, `published` booléens (`=== 'true'`, comme aujourd'hui) ;
`competition` rognée ou `null` si vide ; `scoreEquipe` et `scoreAdversaire` : `null` si
`termine` est faux ou si le champ est vide, sinon entier de 0 à 99.
Tests dans `scripts/match-validation.test.ts` : un cas valide complet (vérifie l'instant
UTC de la date), date invalide, `equipeId` non numérique, score négatif, score ignoré
quand `termine` est faux, adversaire vide.
**Vérifier** : `bun test scripts/match-validation.test.ts` → 0 fail.

### Étape 3 : brancher les actions
Dans `createMatch` et `updateMatch`, garde `await requireAdmin()` en première ligne, puis
remplace la lecture manuelle par `lireMatchFormData(formData)` et utilise ses valeurs dans
`prisma.match.create/update`. Ne change ni les `revalidatePath`, ni les `redirect`, ni
`revalidateMatchsPublic`.
**Vérifier** : `grep -n "new Date(dateStr)\|parseInt" "src/app/(admin)/admin/matchs/actions.ts"` → aucune ligne ; `bun run type-check` → exit 0.

### Étape 4 : brancher le formulaire et la carte d'équipe
- `MatchForm.tsx` : supprime `formatDateForInput`, importe `versChampDateHeure` depuis
  `@/lib/dates` et utilise-le ligne 223.
- `TeamCardDetailed.tsx:162-168` : remplace l'appel `toLocaleDateString` par
  `formatDateHeure(new Date(nextMatch.date))` importé de `@/lib/dates`.
**Vérifier** : `grep -n "getHours\|toLocaleDateString" "src/app/(admin)/admin/matchs/MatchForm.tsx" src/components/teams/TeamCardDetailed.tsx` → aucune ligne ; `bun run type-check && bun run lint && bun test scripts/` → exit 0, 0 fail.

## Critères de fin

- [ ] `bun run type-check`, `bun run lint`, `bun test scripts/` passent
- [ ] `versChampDateHeure` et `lireChampDateHeure` exportés et testés (aller-retour, changements d'heure, entrées invalides)
- [ ] `createMatch` et `updateMatch` commencent par `requireAdmin()` et passent par `lireMatchFormData`
- [ ] plus de `getHours` ni de `toLocaleDateString` dans les deux composants cités
- [ ] `git status` : seuls les fichiers du périmètre ont changé

## Conditions d'arrêt

- `MatchForm.tsx` construit la valeur de date ailleurs qu'aux lignes citées (par exemple
  un état contrôlé qui reformate la date) : rends compte avant de modifier.
- Importer `@/lib/dates` dans un composant client provoque une erreur de lint ou de type.
- Un des tests existants de `scripts/dates.test.ts` échoue après tes ajouts.

## Notes de maintenance

- Les matchs saisis ou modifiés à la main avant ce correctif peuvent être décalés d'une
  ou deux heures en base. Les matchs reliés à FFHandball sont remis à l'heure par la
  synchronisation ; les matchs purement manuels sont à contrôler dans `/admin/matchs`.
- Non vérifié ici : le comportement dans le navigateur. À contrôler après fusion : ouvrir
  un match, enregistrer sans rien changer, vérifier que l'heure publique ne bouge pas.
- Toute nouvelle date affichée ou saisie doit passer par `src/lib/dates.ts`.
