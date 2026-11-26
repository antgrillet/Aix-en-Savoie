# Plan 006 : le HTML saisi dans l'admin est assaini côté serveur, et `/actus` ne plante plus sur un numéro de page invalide

> **Consignes à l'exécutant** : suis ce plan étape par étape. Lance chaque commande de
> vérification et confirme le résultat attendu avant de passer à la suite. Si une des
> « Conditions d'arrêt » se produit, arrête-toi et rends compte : n'improvise pas.
> Ne modifie pas `plans/README.md` : le relecteur tient l'index.
>
> **Contrôle de dérive (à lancer d'abord)** :
> `git diff --stat 7ce2291..HEAD -- "src/app/(public)/actus" "src/app/(public)/equipes/[slug]/page.tsx" src/components/seo/StructuredData.tsx src/lib/validations/article.ts src/lib/validations/equipe.ts`
> Si un de ces fichiers a changé, compare les extraits de « État actuel » au code réel ;
> un écart est une condition d'arrêt.

## Statut

- **Priorité** : P2
- **Effort** : M
- **Risque** : MED (un assainissement trop strict retire de la mise en forme légitime)
- **Dépend de** : aucun (conflit de fusion attendu avec 001 sur `package.json` et `bun.lock`)
- **Catégorie** : security, bug
- **Écrit sur** : commit `7ce2291`, 2026-11-13

## Pourquoi

Le contenu des articles et la description des équipes sont du HTML produit par l'éditeur
TipTap de l'admin, stocké tel quel et injecté dans les pages publiques par
`dangerouslySetInnerHTML`. Le seul filtrage a lieu dans le navigateur de l'admin : rien
ne le garantit côté serveur. Un contenu collé depuis le Web ou un compte admin compromis
suffit pour exécuter du script chez chaque visiteur, sur la même origine que `/admin`.
Les blocs JSON-LD sont écrits par `JSON.stringify` brut dans une balise `<script>` : un
titre contenant `</script>` en sort. Enfin `/actus?page=0` ou `?page=abc` produit un
`skip` négatif ou `NaN` que Prisma rejette : erreur 500 sur une URL triviale.

## État actuel

- `src/app/(public)/actus/[slug]/page.tsx:173` :
  `dangerouslySetInnerHTML={{ __html: article.contenu }}`.
- `src/app/(public)/equipes/[slug]/page.tsx:160` :
  `dangerouslySetInnerHTML={{ __html: equipe.description }}`.
- `src/components/seo/StructuredData.tsx`, lignes 58, 107 et 127, trois fois :
  `dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}` dans un
  `<script type="application/ld+json">`.
- `src/lib/validations/article.ts:9` :
  `contenu: z.string().min(50, 'Le contenu doit contenir au moins 50 caractères'),`
  et `src/lib/validations/equipe.ts:13` :
  `description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),`.
  Les actions font `articleSchema.parse(data)` / `equipeSchema.parse(data)` et écrivent
  le résultat : une transformation dans le schéma s'applique donc à l'écriture.
- L'éditeur est `src/components/admin/RichTextEditor.tsx` : extensions `StarterKit`,
  `Link`, `ResizableImageExtension` (paquet `tiptap-extension-resize-image`),
  `FileHandler`, `Placeholder`, configurées lignes 146-180. Lis ces lignes : la liste
  blanche doit couvrir tout ce que cet éditeur peut produire.
- Constat sur la base réelle (lecture seule, 13 novembre 2026) : les articles n'utilisent
  que les balises `p br h2 strong em ul li a img` ; aucune description d'équipe ne
  contient de HTML ; aucun contenu ne contient de `<script>`, d'`<iframe>` ni d'attribut `on…`.
  Les images sont hébergées sur `*.public.blob.vercel-storage.com`.
- `src/app/(public)/actus/page.tsx` : `const page = parseInt(params.page || '1')` aux
  lignes 23 (dans `generateMetadata`) et 52 (dans la page), puis
  `skip: (page - 1) * perPage` ; ligne 138 :
  ``href={`/actus?${categorie ? `categorie=${categorie}&` : ''}page=${pageNum}`}``
  sans encodage de `categorie`.
- Conventions : modules purs dans `src/lib/`, noms en français, guillemets simples, pas
  de point-virgule ; tests `bun:test` dans `scripts/*.test.ts` (modèle : `scripts/dates.test.ts`).

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

**Dans le périmètre** : `package.json` et `bun.lock` (ajout de `sanitize-html` et de
`@types/sanitize-html` uniquement), `src/lib/html.ts` (à créer), `src/lib/pagination.ts`
(à créer), `scripts/html.test.ts` (à créer), `src/lib/validations/article.ts`,
`src/lib/validations/equipe.ts`, `src/app/(public)/actus/[slug]/page.tsx`,
`src/app/(public)/equipes/[slug]/page.tsx`, `src/app/(public)/actus/page.tsx`,
`src/components/seo/StructuredData.tsx`.

**Hors périmètre** : `src/components/admin/RichTextEditor.tsx` et `src/lib/editor-paste.ts`
(le filtrage côté éditeur reste tel quel), les `actions.ts` de l'admin, les en-têtes HTTP
et toute politique CSP, `src/components/admin/AdminTheme.tsx` (son
`dangerouslySetInnerHTML` injecte une feuille de style produite par le code, pas une saisie).

## Git

Commite sur la branche du worktree, conventional commits en anglais (exemple du dépôt :
`fix: lock down the upload, volunteer and contact endpoints`). Aucune ligne
d'attribution. Ne pousse rien.

## Étapes

### Étape 1 : `src/lib/html.ts` et ses tests
`bun add sanitize-html` et `bun add -d @types/sanitize-html`. Exporte :
- `assainirHtml(html: string): string`, liste blanche stricte bâtie sur ce que l'éditeur
  produit : balises de `StarterKit` (`p br h1 h2 h3 h4 h5 h6 strong b em i s u code pre
  blockquote ul ol li hr`), `a` (`href`, `target`, `rel` ; `rel="noopener noreferrer"`
  forcé quand `target` est présent), `img` (`src`, `alt`, `title`, `width`, `height`) et
  ce que `ResizableImageExtension` émet réellement autour des images (lis sa
  configuration et, au besoin, le code du paquet dans `node_modules` : conteneur et
  attribut `style`). Si `style` est nécessaire, limite-le aux propriétés de taille,
  d'alignement et de marge avec `allowedStyles`. Schémas d'URL : `http`, `https`,
  `mailto`, `tel` ; pour `img`, `https` seulement. Tout le reste est retiré.
- `jsonPourScript(valeur: unknown): string` : `JSON.stringify(valeur)` où `<`, `>` et `&`
  sont remplacés par leurs échappements `<`, `>`, `&`.
Tests dans `scripts/html.test.ts` : un contenu d'article réaliste (les neuf balises
citées, un lien, une image Blob) ressort inchangé à l'identique près des normalisations
de `sanitize-html` (vérifie la présence de chaque balise et attribut) ; `<script>`,
`<iframe>`, `<style>`, attribut `onerror`, `href="javascript:…"`, `src` en `http:` ou
`data:` sont retirés ; `jsonPourScript({ t: '</script><script>' })` ne contient pas la
chaîne `</script` et `JSON.parse` du résultat redonne l'objet.
**Vérifier** : `bun test scripts/html.test.ts` → 0 fail.

### Étape 2 : assainir à l'écriture et au rendu
- Dans les deux schémas Zod, garde la contrainte `min` puis ajoute
  `.transform(assainirHtml)` sur `contenu` et sur `description`.
- Dans les deux pages publiques, remplace `__html: article.contenu` par
  `__html: assainirHtml(article.contenu)` et `__html: equipe.description` par
  `__html: assainirHtml(equipe.description)` (le contenu déjà en base est ainsi couvert).
**Vérifier** : `bun run type-check` → exit 0 ; `grep -rn "__html: article.contenu\|__html: equipe.description" src` → aucune ligne.

### Étape 3 : JSON-LD
Dans `StructuredData.tsx`, remplace les trois `JSON.stringify(schema)` par `jsonPourScript(schema)`.
**Vérifier** : `grep -c "JSON.stringify" src/components/seo/StructuredData.tsx` → `0`.

### Étape 4 : numéro de page
`src/lib/pagination.ts` exporte `lireNumeroPage(valeur: string | undefined): number` :
entier ≥ 1, `1` pour toute valeur absente, non numérique, nulle, négative ou non entière,
plafonné à 10 000. Tests (dans `scripts/html.test.ts` ou un fichier voisin) : `undefined`,
`''`, `'0'`, `'-3'`, `'abc'`, `'2.5'`, `'7'`, `'999999999'`. Utilise-la aux lignes 23 et
52 de `actus/page.tsx`, et encode la catégorie ligne 138 avec `encodeURIComponent`.
**Vérifier** : `grep -n "parseInt" "src/app/(public)/actus/page.tsx"` → aucune ligne ;
`bun run type-check && bun run lint && bun test scripts/` → exit 0, 0 fail.

## Critères de fin

- [ ] `bun run type-check`, `bun run lint`, `bun test scripts/` passent
- [ ] `assainirHtml` conserve les neuf balises réellement utilisées et retire script, iframe, gestionnaires d'événements et URL `javascript:` (tests à l'appui)
- [ ] plus aucun `dangerouslySetInnerHTML` alimenté par une valeur de base non assainie dans `src/app/(public)` et `src/components/seo`
- [ ] `lireNumeroPage` testée et utilisée aux deux endroits
- [ ] `git diff --stat` : `package.json` ne gagne que deux lignes de dépendances
- [ ] `git status` : seuls les fichiers du périmètre ont changé

## Conditions d'arrêt

- `ResizableImageExtension` produit un balisage (conteneur, styles, attributs `data-*`)
  que tu ne peux pas autoriser sans ouvrir `style` à des propriétés arbitraires : rends
  compte avec le balisage exact observé.
- `sanitize-html` ne s'installe pas ou casse `bun run type-check`.
- Une des pages citées est devenue un composant client (présence de `'use client'`).

## Notes de maintenance

- Toute nouvelle extension TipTap ajoutée à `RichTextEditor.tsx` doit être reflétée dans
  la liste blanche de `src/lib/html.ts`, sinon sa mise en forme disparaît à l'enregistrement.
- Non vérifié ici : le rendu réel des articles existants. À contrôler après fusion sur
  deux ou trois articles avec images redimensionnées et listes.
- À la fusion avec le plan 001 : résoudre `package.json` à la main, puis `bun install`
  pour régénérer `bun.lock`.
- Une politique CSP reste la défense complémentaire ; elle est volontairement hors de ce plan.
