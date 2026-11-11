# Kit de l'administration — « Le tracé »

L'admin est dessinée avec les lignes d'un terrain de handball. La ligne est le seul outil de structure et son style porte l'état. Tout écran de l'admin se construit avec ce kit ; les écrans Articles (`src/app/(admin)/admin/articles/`) et le tableau de bord (`DashboardView.tsx`) sont les modèles à recopier.

Contrat de direction : `.impeccable/surfaces/src-app-admin-admin.md`. Thème : `src/styles/admin.css`.

## Les quatre règles

| Signe | Sens | Où |
|---|---|---|
| Trait plein noir, 2 px | Structure, état confirmé (publié, lu, terminé) | Sous l'en-tête de page, entre les sections de formulaire, contour de `StatusMark tone="solid"` |
| Pointillé (tiret = intervalle) | Provisoire : brouillon, facultatif, en attente, en chargement | `StatusMark tone="dashed"`, `FormSection optional`, zone de dépôt vide, squelettes |
| Orange `#D77F29` | Ce qui s'actionne ou attend une action | Bouton principal (un par écran), entrée courante de la navigation, compteurs « à traiter », `StatusMark tone="action"`, anneau de focus |
| Rouge `#B42318` | Suppression et erreur, rien d'autre | `DeleteDialog`, action `destructive` d'un menu, message d'erreur d'un champ |

Le reste est noir sur blanc. Le gris n'existe que pour le texte secondaire (`text-muted-foreground`) et les filets (`border-border`). Aucune surface grise ou teintée, aucun dégradé, aucune ombre dans la page : seules les surcouches (dialogue, menu, liste déroulante, toast) en portent une. Coins de 2 à 4 px. Une seule courbe, l'arc de zone, déjà posée par la coque, la connexion et `EmptyState`.

**Orange et contraste.** Sur fond orange, le texte est noir (`text-primary-foreground`), jamais blanc. L'orange en texte sur blanc est réservé aux grands chiffres (`adm-num-lg`, 40 px gras). Pour un petit texte orangé sur blanc, `text-[color:var(--adm-orange-ink)]` (5,2:1) ; à éviter si une marque de statut suffit.

## Jetons utiles

Les jetons shadcn sont redéfinis dans l'admin, donc les utilitaires habituels donnent déjà les bonnes valeurs :

| Utilitaire | Rendu |
|---|---|
| `bg-background` / `text-foreground` | blanc / noir `#222221` |
| `bg-foreground text-background` | bloc noir, texte blanc (survol, élément de menu actif) |
| `bg-primary text-primary-foreground` | bloc orange, texte noir |
| `text-muted-foreground` | texte secondaire `#5F5F5C` |
| `border-border` | filet `#D9D9D6` |
| `border-foreground` | trait noir (`border-b-2` = trait de structure) |
| `border-input` | contour de champ au repos |
| `text-destructive` | rouge |

Classes du thème (`admin.css`, couche `components` : un utilitaire Tailwind garde le dernier mot) :

| Classe | Usage |
|---|---|
| `adm-title` | Titre de page, Barlow Condensed 28 px (posé par `PageHeader`) |
| `adm-h2` / `adm-h3` | Titre de section 18 px / sous-titre 15 px |
| `adm-meta` / `adm-micro` | Texte secondaire 13 px / mention 12 px |
| `adm-num-lg` / `adm-num-md` / `adm-num-sm` | Rampe de chiffres : 40 px (ce qui attend une action), 24 px (totaux), 15 px (chiffre dans une ligne). Pas d'autre taille. |
| `adm-link` | Lien dans le texte : noir souligné |
| `adm-rows` | Sur un `ul` : filet entre les lignes, noir au survol |
| `adm-row-link` | Sur le lien principal d'une ligne : toute la ligne devient cliquable sur téléphone |
| `adm-rule` (+ `adm-rule--dashed`, `adm-rule--hair`) | Filet horizontal seul |

Corps de texte : 15 px. Échelle fixe en rem (12, 13, 15, 18, 28) : pas de `clamp`, pas de `text-3xl sm:text-4xl`. Les `h1`–`h6` n'ont dans l'admin que la taille qu'on leur donne. Les chiffres sont tabulaires partout.

Espacements : 24 px sous l'en-tête de page, 40 px entre deux blocs (`mt-10`), 20 px entre deux champs (`space-y-5`), lignes de liste de 56 px. Sur téléphone, toute cible tactile fait 44 px : les composants du kit le font déjà.

## Composants

Chaque composant s'importe par son fichier : `@/components/admin/<Fichier>`. Pas de fichier d'index.

### Coque (déjà en place, rien à faire)

`AdminShell` est rendu par le layout : rail noir de 232 px à partir de `lg`, barre haute et barre d'onglets en dessous, surface blanche avec l'arc de zone, toasts. La section courante est reconnue par préfixe de chemin. Pour ajouter une entrée ou un compteur : `navigation.ts` (`ADMIN_SECTIONS`) et `a-traiter.ts` (`getATraiter`, lectures seules mises en cache par requête).

Retours d'action : `import { toast } from 'sonner'` ; `toast.success('Article publié')`, `toast.error('…', { description: '…' })`. Le toaster est monté par la coque.

### PageHeader, Section — `PageHeader.tsx`

```tsx
<PageHeader
  title="Articles"
  description="Une phrase : ce qu'on fait ici."
  actions={<Button asChild><Link href="/admin/articles/new"><Plus aria-hidden="true" />Nouvel article</Link></Button>}
  back={{ href: '/admin/articles', label: 'Articles' }}  // sous-pages seulement
/>
```

Props : `title`, `description?`, `actions?`, `back?`, `className?`. Un seul par écran : il porte le `h1` et le trait plein. Rien au-dessus du titre, sauf le lien de retour.

```tsx
<Section title="Prochains matchs" count={5} action={<Link href="/admin/matchs" className="adm-link">Tous les matchs</Link>}>
  <ul className="adm-rows">…</ul>
</Section>
```

Props : `title`, `count?`, `action?`, `className?`. Bloc titré dans une page (titre 18 px, filet noir dessous).

### Button — `Button.tsx`

```tsx
<Button>Publier l'article</Button>
<Button variant="outline">Annuler</Button>
<Button variant="ghost" size="icon" aria-label="Fermer"><X aria-hidden="true" /></Button>
<Button isLoading={isSaving}>Enregistrer</Button>
<Button asChild><Link href="…">…</Link></Button>
```

Mêmes props que le bouton shadcn, plus `isLoading`. Variantes : `default` (orange, **une seule par écran**), `outline`, `ghost`, `destructive` (confirmation de suppression seulement), `link`. Tailles : `default`, `sm`, `lg`, `icon`. Un bouton nomme son action : « Publier l'article », pas « Valider ». `LoadingButton` reste disponible pour les écrans existants.

### Field, Input, Textarea, Checkbox, Switch — `Field.tsx`

```tsx
<Field id="titre" label="Titre" required error={errors.titre} counter={{ value: titre.length, max: 200 }}>
  <Input name="titre" value={titre} onChange={…} />
</Field>

<Field id="resume" label="Résumé" hint="Deux ou trois phrases." optional>
  <Textarea name="resume" rows={3} />
</Field>

<SwitchField id="published" label="Publié" description="Visible sur le site." checked={published}
  onCheckedChange={setPublished} aside={<StatusBadge status={published ? 'published' : 'draft'} />} />
<CheckboxField id="domicile" label="Match à domicile" checked={domicile} onCheckedChange={…} />
```

`Field` : `id`, `label`, `hint?`, `error?`, `required?`, `optional?`, `counter?`, `className?`. Il transmet `id`, `aria-describedby`, `aria-invalid` et `aria-required` à son enfant si c'est un composant unique (`Input`, `Textarea`, `SimpleSelect`, `ImageUpload`, `RichTextEditor`). Si l'enfant est un groupe (un `div` avec un champ et un bouton), poser `id` et `aria-describedby="{id}-aide"` sur le champ à la main.

- `counter` : tout champ limité annonce sa place restante.
- `error` : dit le problème et comment le corriger (« Le résumé est trop court : 10 caractères au moins. »).
- `Input`, `Textarea`, `Label`, `Checkbox`, `Switch` : mêmes props que leurs équivalents shadcn. `SwitchField` et `CheckboxField` ajoutent `label`, `description?`, `aside?`.
- **Attention** : une bascule ou une case Radix envoie `on` dans un `FormData`, pas `true`. Tenir l'état en React et l'écrire à la main : `formData.set('published', published.toString())`.

### Select — `Select.tsx`

```tsx
<SimpleSelect value={categorie} onValueChange={setCategorie} options={[{ value: 'CLUB', label: 'Club' }]}
  placeholder="Choisir une catégorie" />            // dans un Field
<SimpleSelect value={statut} onValueChange={setStatut} options={…} aria-label="Statut" className="md:w-44" />  // dans une FilterBar
```

`SimpleSelect` : `value`, `onValueChange`, `options`, `placeholder?`, `id?`, `name?`, `disabled?`, `className?`, `aria-label?`. Pour un cas composé (groupes, séparateurs), le fichier exporte aussi `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectValue`.

### FormSection, SaveBar — `FormSection.tsx`

```tsx
<form onSubmit={handleSubmit} noValidate>
  <FormSection title="Texte" description="Ce que les visiteurs lisent.">…champs…</FormSection>
  <FormSection title="Réseaux sociaux" optional>…</FormSection>
  <SaveBar status="Dernière modification le 8 novembre 2026">
    <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
    <Button type="submit" isLoading={isSubmitting}>Enregistrer</Button>
  </SaveBar>
</form>
```

`FormSection` : `title`, `description?`, `optional?` (filet en pointillé + mention « facultatif »), `className?`. Titre à gauche sur grand écran, champs à droite sur 40 rem. La première section n'a pas de trait : celui de l'en-tête en tient lieu, donc les sections sont les enfants directs du `form`.

`SaveBar` : `status?` (masqué sur téléphone), `children` (Annuler puis l'action principale), `className?`. Dernier enfant du `form` ; elle reste collée en bas, au-dessus de la barre d'onglets sur téléphone.

### FilterBar, FilterGroup, SearchField, ListCount — `FilterBar.tsx`

```tsx
<FilterBar label="Filtrer les articles" onReset={hasActiveFilters ? clearFilters : undefined}
  count={{ shown: filtered.length, total: articles.length, singular: 'article', plural: 'articles' }}>
  <SearchField value={search} onChange={setSearch} label="Rechercher un article par son titre" placeholder="Rechercher un titre" />
  <FilterGroup>
    <SimpleSelect … aria-label="Catégorie" className="md:w-52" />
    <SimpleSelect … aria-label="Statut" className="md:w-44" />
  </FilterGroup>
</FilterBar>
```

`FilterBar` : `label`, `children`, `count?`, `onReset?`, `className?`. **Toute liste annonce son compte** : passer `count`, ou poser `<ListCount shown={n} singular="match" plural="matchs" />` seul si la liste n'a pas de filtre. `FilterGroup` met deux listes côte à côte sur téléphone ; garder des libellés courts (« Tous statuts »).

### DataList, Thumb — `DataList.tsx`

```tsx
const columns: DataColumn<Article>[] = [
  { id: 'titre', header: 'Titre', phone: 'title',
    cell: (a) => <Link href={`/admin/articles/${a.id}`} className="adm-row-link font-semibold hover:underline">{a.titre}</Link> },
  { id: 'categorie', header: 'Catégorie', className: 'hidden lg:table-cell', cell: (a) => a.categorie },
  { id: 'statut', header: 'Statut', phone: 'marks', cell: (a) => <StatusBadge status={a.published ? 'published' : 'draft'} /> },
  { id: 'vues', header: 'Vues', align: 'end', cell: (a) => <span className="adm-num-sm">{a.views}</span> },
]

<DataList caption="Articles" items={filtered} columns={columns} getKey={(a) => a.id}
  media={(a) => <Thumb src={a.image} />}
  actions={(a) => <RowActions label={`Actions pour « ${a.titre} »`} items={[…]} />}
  empty={<EmptyState title="Aucun article pour l'instant">…</EmptyState>} />
```

Tableau à partir de `md`, lignes empilées en dessous, avec la même définition de colonnes. `DataColumn` : `id`, `header`, `cell`, `align?`, `className?` (grand écran), `phone?` : `title` (une colonne), `meta` (ligne grise, par défaut), `marks` (rangée de marques), `hidden`. `DataList` : `caption`, `items`, `columns`, `getKey`, `media?`, `actions?`, `empty?`, `className?`. Les colonnes sont des fonctions : `DataList` se rend depuis un composant client ou serveur, mais on ne passe pas `columns` d'un composant serveur à un composant client.

`Thumb` : `src`, `alt?`, `fit?` (`cover` pour une photo, `contain` pour un logo), `className?`.

Pour une liste simple sans colonnes (tableau de bord, détail), un `ul className="adm-rows"` suffit.

### RowActions — `RowActions.tsx`

```tsx
<RowActions label={`Actions pour « ${article.titre} »`} items={[
  { label: 'Modifier', icon: Pencil, href: `/admin/articles/${article.id}` },
  { label: 'Prévisualiser', icon: ExternalLink, href: `/actus/${article.slug}`, external: true },
  { label: article.published ? 'Dépublier' : 'Publier', icon: article.published ? EyeOff : Eye, onSelect: () => … },
  'separator',
  { label: 'Supprimer', icon: Trash2, destructive: true, onSelect: () => setDeleteId(article.id) },
]} />
```

`label` (nom accessible, avec le titre de la ligne), `items` : `{ label, icon?, href?, external?, onSelect?, destructive?, disabled? }` ou `'separator'`. La suppression en dernier, après un séparateur, et elle ouvre toujours `DeleteDialog`.

### StatusMark, StatusBadge — `StatusMark.tsx`, `StatusBadge.tsx`

```tsx
<StatusBadge status="published" />   // published, draft, read, unread, archived, featured
<StatusMark tone="dashed">En attente</StatusMark>
<StatusMark tone="action">À compléter</StatusMark>
<StatusMark tone="fill">Domicile</StatusMark>  <StatusMark tone="solid">Extérieur</StatusMark>
```

`tone` : `solid` (contour plein : confirmé), `dashed` (contour pointillé : provisoire), `action` (bloc orange : attend une action), `fill` (bloc noir : fait marquant, domicile). `icon?`, `className?`. Elle remplace toutes les pastilles de couleur : pas de vert pour « victoire », pas de bleu pour « extérieur ».

**Signature.** Quand un état passe de provisoire à confirmé, garder le même élément monté et ne changer que `tone` (ou `status`) : le contour en tirets se referme en trait plein en 180 ms. C'est le seul mouvement décoratif de l'admin ; il est coupé sous `prefers-reduced-motion`. Voir la bascule « Publié » d'`ArticleForm` et le menu « Publier » d'`ArticlesList`.

### Tag — `Tag.tsx`

```tsx
<Tag>N2F</Tag>
<Tag onRemove={() => removeTag(tag)} removeLabel={`Retirer le tag ${tag}`}>{tag}</Tag>
```

Étiquette neutre (mot-clé, catégorie, rôle). Pour un état, `StatusMark`.

### Tabs — `Tabs.tsx`

```tsx
<Tabs defaultValue="all">
  <TabsList>
    <TabsTrigger value="all" count={12}>Tous</TabsTrigger>
    <TabsTrigger value="unread" count={3}>Non lus</TabsTrigger>
  </TabsList>
  <TabsContent value="all">…</TabsContent>
</Tabs>
```

Onglets à filet, trait plein de 2 px sous l'onglet courant. `count?` sur `TabsTrigger`.

### Dialog, DeleteDialog — `Dialog.tsx`, `DeleteDialog.tsx`

```tsx
<DeleteDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}
  onConfirm={handleDelete} isLoading={isDeleting}
  title="Supprimer cet article ?" description="Définitif. L'article et son image seront supprimés."
  confirmLabel="Supprimer l'article" />
```

`Dialog.tsx` exporte `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` (mêmes noms que shadcn). Un dialogue seulement quand la tâche demande une interruption : une confirmation, pas un formulaire qui tiendrait dans la page.

### EmptyState — `EmptyState.tsx`

```tsx
<EmptyState title="Aucun article pour l'instant"
  action={<Button asChild><Link href="/admin/articles/new">Écrire le premier article</Link></Button>}>
  <p>Ce que contient cette liste et ce qui la remplit.</p>
</EmptyState>
```

`title`, `children?`, `action?`, `className?`. Deux cas à distinguer : la liste est vide (dire comment la remplir) ; les filtres ne donnent rien (proposer « Effacer les filtres »).

### Squelettes — `Skeleton.tsx`

```tsx
// loading.tsx d'une section
export default function Loading() { return <PageSkeleton /> }           // liste
export default function Loading() { return <PageSkeleton variant="form" /> }  // formulaire
```

`PageSkeleton`, `ListSkeleton` (`rows?`, `media?`), `FormSkeleton` (`fields?`), `PageHeaderSkeleton`, `SkeletonLine`. Des lignes en pointillé à la place du texte ; pas de roue au milieu du contenu, pas de bloc gris. `admin/loading.tsx` et `admin/error.tsx` couvrent déjà toutes les sections ; dans ce Next.js, `error.tsx` reçoit `retry`, pas `reset`.

### ImageUpload, RichTextEditor, SlugInput, SyncMatchesButton, Contour

Mêmes props qu'avant. `ImageUpload` accepte en plus `previewAlt` et se place dans un `Field` ; ses erreurs s'affichent sous la zone. `RichTextEditor` accepte `label` (nom accessible). `Contour` (`dashed?`) trace le contour d'un bloc en `relative` : à utiliser pour toute zone qui passe de provisoire à confirmé.

## Gabarit d'une page liste

Modèle : `articles/page.tsx` + `articles/ArticlesList.tsx`.

```tsx
// page.tsx (serveur)
<div>
  <PageHeader title="…" description="…" actions={<Button asChild>…</Button>} />
  <MaListe initialItems={items} />
</div>

// MaListe.tsx (client)
<>
  <FilterBar label="…" count={…} onReset={…}>…</FilterBar>
  <DataList … empty={…} />
  <DeleteDialog … />
</>
```

Pas de `Card` autour, pas de titre répété au-dessus de la liste.

## Gabarit d'une page formulaire

Modèle : `articles/new/page.tsx`, `articles/[id]/page.tsx` + `articles/ArticleForm.tsx`.

```tsx
// page.tsx (serveur)
<div>
  <PageHeader title="Modifier l'article" description={article.titre} back={{ href: '/admin/articles', label: 'Articles' }} />
  <MonFormulaire action={…} initialData={…} />
</div>

// MonFormulaire.tsx (client) : <form noValidate> → FormSection… → SaveBar
```

Les erreurs s'affichent sous chaque champ (`Field error`), la première est aussi dite en toast et son champ reçoit le focus. Les contrôles côté client reprennent exactement les bornes du schéma Zod, sans en ajouter.

## À ne plus utiliser dans l'admin

- Couleurs de palette : `secondary-*`, `primary-50…950`, `blue-*`, `green-*`, `purple-*`, `red-*`, `orange-*`, `neutral-*`, `gray-*`, `zinc-*`. Utiliser les jetons ci-dessus.
- Dégradés : `bg-gradient-*`, `from-*`, `to-*`, `bg-clip-text text-transparent`.
- Ombres : `shadow`, `shadow-*` (elles sont de toute façon annulées dans la page).
- Fonds gris ou teintés : `bg-muted`, `bg-muted/50`, `bg-orange-50`, `bg-white/20`, `backdrop-blur`.
- `Card`, `CardHeader`, `CardContent` comme structure de page ou de ligne ; grilles de tuiles de chiffres ; icône dans une pastille colorée à côté d'un titre.
- Imports directs de `@/components/ui/*` quand le kit a l'équivalent (`button`, `input`, `textarea`, `label`, `select`, `switch`, `checkbox`, `tabs`, `dialog`, `alert-dialog`, `badge`, `table`, `skeleton`). `dropdown-menu` passe par `RowActions`.
- `Badge` coloré pour un état : `StatusMark`.
- Bordure latérale colorée (`border-l-4 border-l-orange-500`), boutons pilule (`rounded-full`), `rounded-xl` et plus.
- Étiquette en capitales au-dessus d'un titre, numéros de section, texte monospace décoratif, italique dans un titre.
- Tailles de titre fluides ou empilées (`text-xl sm:text-3xl`), `font-display`.
- `alert()` et `confirm()` : message sous le champ, toast, ou `DeleteDialog`.
- `date-fns/format` côté serveur pour une heure de match : `Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', … })`.
- Chiffres inventés ou estimés : n'afficher que ce que le schéma Prisma sait.

## Avant de rendre une section

`bun type-check`, `bun lint`, puis vérifier à 390, 768, 1280 et 1440 px : pas de défilement horizontal, focus clavier visible sur chaque contrôle, menus navigables au clavier, état vide et état d'erreur présents.
