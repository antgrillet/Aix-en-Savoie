# Plan 004 : une action d'administration qui échoue ne détruit plus d'images ni d'horaires

> **Consignes à l'exécutant** : suis ce plan étape par étape. Lance chaque commande de
> vérification et confirme le résultat attendu avant de passer à la suite. Si une des
> « Conditions d'arrêt » se produit, arrête-toi et rends compte : n'improvise pas.
> Ne modifie pas `plans/README.md` : le relecteur tient l'index.
>
> **Contrôle de dérive (à lancer d'abord)** :
> `git diff --stat 7ce2291..HEAD -- "src/app/(admin)/admin/equipes/actions.ts" "src/app/(admin)/admin/articles/actions.ts" "src/app/(admin)/admin/partenaires/actions.ts" "src/app/(admin)/admin/parametres/actions.ts" src/lib/validations/setting.ts`
> Si un de ces fichiers a changé, compare les extraits de « État actuel » au code réel ;
> un écart est une condition d'arrêt.

## Statut

- **Priorité** : P2
- **Effort** : M
- **Risque** : LOW
- **Dépend de** : aucun
- **Catégorie** : bug, security
- **Écrit sur** : commit `7ce2291`, 2026-11-13

## Pourquoi

Les actions de mise à jour suppriment les anciennes images du stockage Vercel Blob
**avant** d'écrire en base, et `updateEquipe` efface tous les entraînements dans une
requête séparée avant la mise à jour. Si l'écriture échoue ensuite (le slug dérivé du nom
est `@unique` : renommer une équipe ou un article avec un nom déjà pris suffit), la fiche
garde des URLs d'images mortes et l'équipe n'a plus d'horaires. Un bénévole ne voit qu'un
message d'erreur générique et le site public est abîmé. L'ordre correct : écrire en base
dans une transaction, puis supprimer les images devenues inutiles ; au pire une image
orpheline, sans effet visible. Le plan valide aussi trois entrées d'actions aujourd'hui
libres (`updateOrdre`, `page`, image de fond).

## État actuel

Toutes les actions de ces fichiers commencent par `await requireAdmin()` (ou
`const session = await requireAdmin()`) : cette première ligne ne doit jamais bouger.

- `src/lib/blob.ts` : `deleteImage(url)` n'échoue jamais (il attrape et journalise).
- `src/app/(admin)/admin/equipes/actions.ts`, `updateEquipe`, lignes 118-153 :
  ```ts
  const validated = equipeSchema.parse(data)

  const existing = await prisma.equipe.findUnique({ where: { id } })
  if (existing) {
    if (existing.photo !== validated.photo) {
      await deleteImage(existing.photo)
    }
    if (existing.banniere && existing.banniere !== validated.banniere) {
      await deleteImage(existing.banniere)
    }
  }

  await prisma.entrainement.deleteMany({ where: { equipeId: id } })

  const slug = buildSlug(validated.nom)

  await prisma.equipe.update({ where: { id }, data: { …, slug, entrainements: { create: validated.entrainements } } })
  ```
  Même fichier : `deleteEquipe` (161-176) et `deleteMultipleEquipes` (193-216) appellent
  `deleteImage` avant `prisma.equipe.delete/deleteMany` ; `updateOrdre` (218-232) :
  ```ts
  export async function updateOrdre(updates: { id: number; ordre: number }[]) {
    await requireAdmin()
    await Promise.all(updates.map((update) =>
      prisma.equipe.update({ where: { id: update.id }, data: { ordre: update.ordre } })))
  ```
- `src/app/(admin)/admin/articles/actions.ts` : `updateArticle` (73-116) supprime
  l'ancienne image ligne 94 avant `prisma.article.update` (slug recalculé depuis le
  titre) ; `deleteArticle` (118-130) supprime l'image ligne 123 avant `prisma.article.delete`.
- `src/app/(admin)/admin/partenaires/actions.ts` : `updatePartenaire` supprime logo et
  photo de couverture lignes 186-191 avant `prisma.partenaire.update` (ligne 200) ;
  `deletePartenaire` (222-233) et `deleteMultiplePartenaires` (264-…) suppriment les
  images avant la ligne en base ; `updateOrdre` (249-262) a la même forme que pour les équipes.
- `src/app/(admin)/admin/parametres/actions.ts` :
  - `updateHeroBackground` (15-34) : ne vérifie que la présence de `heroBackgroundImage`,
    supprime l'ancienne image (ligne 27) avant `updateHeroBackgroundImage` (ligne 30) ;
  - `updatePageBackground` (58-78) et `removePageBackground` (80-93) : `page` est une
    chaîne libre qui sert de clé `${page}_background_image` et alimente
    `revalidatePath(`/${page}`)` ; image supprimée avant l'écriture ;
  - `getPageBackground(page)` (52-56) : même `page` libre ;
  - lignes 95-132 (`getCalendrierPassword`, `updateCalendrierPassword`) : hors périmètre.
- Pages réellement utilisées avec un fond : `partenaires`, `actus`, `equipes`, `contact`
  (formulaires de `src/app/(admin)/admin/parametres/page.tsx`), plus `legal` lu par
  `src/app/(public)/mentions-legales/page.tsx:13`. Vérifie la clé lue par
  `src/app/(public)/politique-confidentialite/page.tsx:13` et ajoute-la si elle diffère.
- `src/lib/validations/setting.ts` contient un schéma jamais utilisé :
  `heroBackgroundSchema = z.object({ heroBackgroundImage: z.string().url('URL d\'image invalide').optional() })`.
- Conventions : schémas Zod dans `src/lib/validations/`, `schema.parse(...)` dans
  l'action, messages en français, guillemets simples, pas de point-virgule.

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

**Dans le périmètre** : les quatre fichiers `actions.ts` cités (pour
`parametres/actions.ts`, lignes 1 à 93 seulement), `src/lib/validations/setting.ts`,
`src/lib/validations/ordre.ts` (à créer), `scripts/admin-validations.test.ts` (à créer).

**Hors périmètre** : `parametres/actions.ts` lignes 95-132 (mot de passe du calendrier),
`src/app/(admin)/admin/matchs/`, `src/lib/blob.ts`, `src/lib/settings.ts`, les
composants de formulaire, `package.json`, le schéma Prisma. Ne change pas les signatures
des actions exportées (les formulaires les appellent telles quelles) ni les
`revalidatePath` et `redirect` existants.

## Git

Commite sur la branche du worktree, conventional commits en anglais (exemple du dépôt :
`fix: require an admin session for match server actions`). Aucune ligne d'attribution.
Ne pousse rien.

## Étapes

### Étape 1 : schémas de validation
- `src/lib/validations/ordre.ts` : `ordreSchema` = tableau (1 à 500 éléments) de
  `{ id: entier > 0, ordre: entier ≥ 0 }`.
- `src/lib/validations/setting.ts` : ajoute `PAGES_AVEC_FOND` (liste constante des pages
  citées plus haut), `pageAvecFondSchema = z.enum(PAGES_AVEC_FOND)` et
  `imageDeFondSchema = z.string().url('URL d\'image invalide')`. Laisse `settingSchema` tel quel.
- `scripts/admin-validations.test.ts` (modèle : `scripts/dates.test.ts`) : ordre valide,
  `ordre` négatif refusé, `id` non entier refusé, tableau vide refusé ; page connue
  acceptée, page inconnue et chaîne contenant `/` refusées ; URL d'image invalide refusée.
**Vérifier** : `bun test scripts/admin-validations.test.ts` → 0 fail.

### Étape 2 : équipes
- `updateEquipe` : avant toute écriture, si le nouveau slug appartient à une autre équipe
  (`findFirst` sur `slug` avec `id: { not: id }`), lève
  `new Error('Une autre équipe porte déjà ce nom')`. Puis, dans un seul
  `prisma.$transaction([...])`, le `deleteMany` des entraînements et l'`update`. Après la
  transaction seulement, supprime l'ancienne photo et l'ancienne bannière si elles ont changé.
- `deleteEquipe`, `deleteMultipleEquipes` : supprime la ou les lignes en base d'abord,
  les images ensuite.
- `updateOrdre` : `ordreSchema.parse(updates)` après `requireAdmin()`, puis les mises à
  jour dans un `prisma.$transaction([...])`.
**Vérifier** : `bun run type-check` → exit 0. Dans `updateEquipe`, la première occurrence
de `deleteImage` est située après `$transaction` (`grep -n "deleteImage\|\$transaction" "src/app/(admin)/admin/equipes/actions.ts"`).

### Étape 3 : articles
- `updateArticle` : même contrôle préalable du slug (`'Un autre article porte déjà ce titre'`),
  `prisma.article.update`, puis suppression de l'ancienne image si elle a changé.
- `deleteArticle` : ligne en base d'abord, image ensuite.
**Vérifier** : `bun run type-check` → exit 0 ; dans `updateArticle` et `deleteArticle`,
`deleteImage` apparaît après l'appel Prisma d'écriture.

### Étape 4 : partenaires
- `updatePartenaire` : déplace les deux `deleteImage` après `prisma.partenaire.update`.
  Le slug y est déjà rendu unique par `ensureUniqueSlug` : n'y touche pas.
- `deletePartenaire`, `deleteMultiplePartenaires` : base d'abord, images ensuite.
- `updateOrdre` : comme pour les équipes.
**Vérifier** : `bun run type-check` → exit 0.

### Étape 5 : paramètres (lignes 1 à 93)
- `updateHeroBackground` : valide l'URL avec `imageDeFondSchema`, écrit le réglage, puis
  supprime l'ancienne image si elle diffère. `removeHeroBackground` : écrit, puis supprime.
- `getPageBackground`, `updatePageBackground`, `removePageBackground` : valide `page`
  avec `pageAvecFondSchema` après `requireAdmin()` ; même ordre écriture puis suppression ;
  valide l'image avec `imageDeFondSchema` dans `updatePageBackground`.
**Vérifier** : `bun run type-check && bun run lint && bun test scripts/` → exit 0, 0 fail ;
`git diff 7ce2291 -- "src/app/(admin)/admin/parametres/actions.ts"` ne montre aucun
changement après la ligne `// Calendrier password`.

## Critères de fin

- [ ] `bun run type-check`, `bun run lint`, `bun test scripts/` passent
- [ ] dans les quatre fichiers, aucun `deleteImage` ne précède l'écriture en base de la même action
- [ ] `updateEquipe` regroupe `deleteMany` et `update` dans un `$transaction`
- [ ] chaque action exportée commence toujours par `requireAdmin()` (`grep -c "requireAdmin()"` identique ou supérieur à avant, fichier par fichier)
- [ ] les deux `updateOrdre` valident leur entrée avec `ordreSchema`
- [ ] `git status` : seuls les fichiers du périmètre ont changé

## Conditions d'arrêt

- Une action a changé de forme par rapport aux extraits (autre ordre, autre nom).
- Le typage de `prisma.$transaction([...])` avec l'adaptateur `pg` refuse le tableau
  d'opérations : rends compte au lieu de contourner par une transaction interactive.
- Une page publique lit une clé de fond qui ne peut pas entrer dans une liste fermée.

## Notes de maintenance

- Les messages d'erreur levés par une Server Action sont masqués en production par
  Next.js : le bénévole verra toujours un message générique. Afficher la cause demande
  de faire renvoyer un résultat aux actions et d'adapter les formulaires : chantier distinct.
- Une image peut désormais rester orpheline dans le Blob si la suppression échoue après
  l'écriture ; `scripts/clean-blob.ts` existe pour ce ménage.
- Non vérifié ici : le comportement réel contre une base. À contrôler après fusion :
  modifier une équipe avec changement de photo, renommer une équipe avec un nom déjà pris.
