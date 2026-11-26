# Kit de l'administration — « Bureau »

Un outil de bureau calme et lisible : fond clair chaud, panneaux blancs, l'orange et le logo du club. Ce fichier dit comment s'en servir ; `DESIGN.md` à la racine en donne les raisons. Les styles vivent dans `src/styles/admin.css`, sous `[data-admin]`.

## Les quatre règles

1. **La couleur dit un état, et jamais seule.** Vert = fait, rouge = bloquant, orange (ou ambre) = à traiter. Toujours avec un libellé : `StatusMark`, ou un point suivi d'un texte.
2. **L'urgent en haut et en gros.** Le tableau de bord classe les tâches par échéance (`classerUrgences`) ; la première, si elle presse, prend le grand chiffre.
3. **Une action principale orange par écran.** Le reste en `outline` ou `ghost`.
4. **Lisible à 3 m.** Texte courant à 14 px au moins, cibles de 44 px sur téléphone, chiffres tabulaires.

## Jetons utiles

| Jeton | Valeur | Usage |
|---|---|---|
| `--adm-bg` | `#f3f2ee` | Fond de page, clair et chaud |
| `--adm-paper` | `#ffffff` | Panneaux, barre latérale, barre haute |
| `--adm-sunken` | `#f7f5f0` | Bandeau de jour, survol, zone de dépôt (`bg-muted`) |
| `--adm-line` / `--adm-line-2` | `#e4e1da` / `#efede7` | Bord des panneaux (`border-border`) / filet entre lignes |
| `--adm-ink` / `--adm-text-2` | `#1f1e1b` / `#5c5852` | Texte / texte secondaire (`text-muted-foreground`) |
| `--adm-orange` | `#e8731a` | Action principale (`bg-primary`, texte noir dessus), onglet courant |
| `--adm-orange-ink` | `#9a4308` | Petit texte orangé sur blanc, grand chiffre « à traiter » |
| `--adm-orange-soft` / `-wash` | `#fdebdc` / `#fffaf5` | Pastille « à traiter » / ligne qui attend une action (`data-attention`) |
| `--adm-ok` / `-soft` | `#15803d` / `#e3f4e8` | Fait, complet, victoire |
| `--adm-bad` / `-soft` | `#b42318` / `#fce8e6` | Bloquant, erreur, défaite |
| `--adm-warn` / `-soft` | `#8a5a00` / `#fbf0d4` | À surveiller, synchro en retard |

Classes : `adm-title` (32 px, 28 sur téléphone), `adm-h2`, `adm-h3`, `adm-meta` (14 px gris), `adm-micro` (capitales 12 px, en-têtes de colonne et de groupe), `adm-num-xl|lg|md|sm` (chiffres condensés tabulaires), `adm-panel` + `adm-panel-head`, `adm-table` (avec `tr.adm-day` pour un bandeau de jour et `tr[data-attention]`), `adm-rows`, `adm-row-link`, `adm-seg` (filtres segmentés à compteur, `aria-current="page"`), `adm-urgence` (carte du tableau de bord), `adm-link`, `adm-more`.

## Composants

Chaque composant s'importe par son fichier : `@/components/admin/<Fichier>`. Pas de fichier d'index.

### Coque (déjà en place, rien à faire)

`AdminShell` est rendu par le layout : barre latérale blanche de 240 px à partir de `lg` (logo, sections rangées en quatre groupes : Ce week-end, Calendrier, Site public, Club), barre d'onglets en bas en dessous avec la feuille « Plus ». En haut, `AdminTopBar` : état de la dernière synchro FFHandball (`etat-synchro.ts`), sélecteur de saison (`saisons-admin.ts`, il pilote le filtre `?saison=` de Matchs et renvoie vers `/admin/parametres#saison`), menu « Créer » et compte. Pour ajouter une entrée ou un compteur : `navigation.ts` (`ADMIN_GROUPS`, `countTone`) et `a-traiter.ts` (`getATraiter`, lectures seules mises en cache par requête). Le tableau de bord classe ces tâches avec `classerUrgences` (`urgences.ts`).

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

Props : `title`, `description?`, `actions?`, `back?`, `className?`. Un seul par écran : il porte le `h1`, posé sur le fond sans filet. Rien au-dessus du titre, sauf le lien de retour.

```tsx
<Section title="Messages" count="3 non lus" action={<Link href="/admin/messages" className="adm-more">Tout voir</Link>}>
  <ul className="adm-rows">…</ul>
</Section>
```

Props : `title`, `count?` (texte ou nombre, gris à côté du titre), `action?`, `bare?`, `className?`, `bodyClassName?`. Panneau blanc à en-tête ; `bare` le pose sans panneau.

### Button — `Button.tsx`

```tsx
<Button>Publier l'article</Button>
<Button variant="outline">Annuler</Button>
<Button variant="ghost" size="icon" aria-label="Fermer"><X aria-hidden="true" /></Button>
<Button isLoading={isSaving}>Enregistrer</Button>
<Button asChild><Link href="…">…</Link></Button>
```

Mêmes props que le bouton shadcn, plus `isLoading`. Variantes : `default` (orange, texte noir, **une seule par écran**), `outline` (blanc à bord clair), `secondary`, `ghost`, `destructive` (confirmation de suppression seulement), `link`. Tailles : `default`, `sm`, `lg`, `icon`. Un bouton nomme son action : « Publier l'article », pas « Valider ». `LoadingButton` reste disponible pour les écrans existants.

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

`FormSection` : `title`, `description?`, `optional?` (mention « facultatif »), `id?` (ancre, par exemple `#saison`), `className?`. Chaque section est un panneau blanc ; titre à gauche sur grand écran, champs à droite. Les sections sont les enfants directs du `form`.

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

`FilterBar` : `label`, `children`, `count?`, `onReset?`, `className?`. **Toute liste annonce son compte** : passer `count`, ou poser `<ListCount shown={n} singular="match" plural="matchs" />` seul si la liste n'a pas de filtre. Une liste qui dépend de la saison le dit avec `scope` : `scope: 'saison 2026-2027, celle du site'`. `FilterGroup` met deux listes côte à côte sur téléphone ; garder des libellés courts (« Tous statuts »).

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

Dans un panneau blanc : tableau à partir de `md`, lignes empilées en dessous, avec la même définition de colonnes. `DataColumn` : `id`, `header`, `cell`, `align?`, `className?` (grand écran), `phone?` : `title` (une colonne), `meta` (ligne grise, par défaut), `marks` (rangée de marques), `hidden`. `DataList` : `caption`, `items`, `columns`, `getKey`, `media?`, `actions?`, `empty?`, `bare?` (sans panneau, dans une `Section`), `className?`. Les colonnes sont des fonctions : `DataList` se rend depuis un composant client ou serveur, mais on ne passe pas `columns` d'un composant serveur à un composant client.

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

### StatusMark, StatusDot, StatusBadge — `StatusMark.tsx`, `StatusBadge.tsx`

```tsx
<StatusBadge status="published" />   // published, draft, read, unread, archived, featured
<StatusMark tone="ok">Victoire</StatusMark>
<StatusMark tone="bad">Défaite</StatusMark>
<StatusMark tone="action">Score à saisir</StatusMark>
<StatusMark tone="ink">Domicile</StatusMark>  <StatusMark>Extérieur</StatusMark>
<StatusDot tone="bad" />               // point seul, toujours à côté d'un texte
```

`tone` : `ok` (vert : fait, complet, publié), `bad` (rouge : bloquant, erreur, défaite), `action` (orange : attend une action), `warn` (ambre : à surveiller, provisoire), `ink` (noir : fait marquant, domicile), `neutral` (gris, par défaut : information). `icon?`, `className?`. **La couleur ne vient jamais seule** : la pastille porte toujours un libellé, le point est toujours suivi d'un texte.

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

Onglets à filet, trait orange de 2 px sous l'onglet courant. `count?` sur `TabsTrigger`.

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

`title`, `children?`, `action?`, `inset?` (sans panneau, dans une `Section`), `className?`. Deux cas à distinguer : la liste est vide (dire comment la remplir) ; les filtres ne donnent rien (proposer « Effacer les filtres »).

### Squelettes — `Skeleton.tsx`

```tsx
// loading.tsx d'une section
export default function Loading() { return <PageSkeleton /> }           // liste
export default function Loading() { return <PageSkeleton variant="form" /> }  // formulaire
```

`PageSkeleton`, `ListSkeleton` (`rows?`, `media?`), `FormSkeleton` (`fields?`), `PageHeaderSkeleton`, `SkeletonLine`. Des barres grises claires à la place du texte, dans les mêmes panneaux que la page ; pas de roue au milieu du contenu. `admin/loading.tsx` et `admin/error.tsx` couvrent déjà toutes les sections ; dans ce Next.js, `error.tsx` reçoit `retry`, pas `reset`.

### ImageUpload, RichTextEditor, SlugInput, SyncButton

`ImageUpload` accepte `previewAlt` et se place dans un `Field` ; ses erreurs s'affichent sous la zone. `RichTextEditor` accepte `label` (nom accessible). `SyncProvider` + `SyncButton` (`admin/equipes/SyncButton.tsx`) lancent la synchronisation FFHandball ; ils servent sur Équipes, Résultats et le tableau de bord.

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

Pas de `Card` autour (le panneau vient de `DataList`), pas de titre répété au-dessus de la liste.

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
- Une couleur d'état sans texte : point, bordure ou fond coloré seul.
- Dégradés : `bg-gradient-*`, `from-*`, `to-*`, `bg-clip-text text-transparent`.
- Pointillés répétés pour dire « provisoire » (`border-dashed`, l'ancien `adm-rule--dashed`, `Contour`) : un état se dit avec `StatusMark`.
- Traits noirs de structure (`border-foreground`, `border-b-2`) : les panneaux et filets clairs suffisent.
- `Card`, `CardHeader`, `CardContent` comme structure de page ou de ligne ; bandeau de totaux sans décision derrière ; icône dans une pastille colorée à côté d'un titre.
- Imports directs de `@/components/ui/*` quand le kit a l'équivalent (`button`, `input`, `textarea`, `label`, `select`, `switch`, `checkbox`, `tabs`, `dialog`, `alert-dialog`, `badge`, `table`, `skeleton`). `dropdown-menu` passe par `RowActions` ou la barre haute.
- `Badge` coloré pour un état : `StatusMark`.
- Bordure latérale colorée (`border-l-4 border-l-orange-500`), boutons pilule (`rounded-full`).
- Texte courant sous 14 px ; tailles de titre fluides ou empilées (`text-xl sm:text-3xl`).
- `alert()` et `confirm()` : message sous le champ, toast, ou `DeleteDialog`.
- `date-fns/format` côté serveur pour une heure de match : `Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', … })` ou les aides de `temps.ts`.
- Chiffres inventés ou estimés : n'afficher que ce que le schéma Prisma sait.

## Avant de rendre une section

`bun run check` (lint, type-check, tests), puis vérifier à 390, 768, 1280 et 1440 px : pas de défilement horizontal, focus clavier visible sur chaque contrôle, menus navigables au clavier, état vide et état d'erreur présents.
