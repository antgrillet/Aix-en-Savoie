---
name: Administration du HBC Aix-en-Savoie
description: « Le tracé » — l'administration du club dessinée avec les lignes d'un terrain de handball, où le style du trait porte l'état.
colors:
  ink: "#222221"
  paper: "#ffffff"
  orange: "#d77f29"
  orange-ink: "#a35a14"
  text-2: "#5f5f5c"
  placeholder: "#6b6b68"
  rule: "#d9d9d6"
  control: "#8a8a86"
  red: "#b42318"
  on-ink-2: "#c2c2c0"
  red-on-ink: "#ff8a75"
typography:
  title:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0"
  headline:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0"
  subhead:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum' 1"
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.375
  meta:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
  micro:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.35
  num-lg:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "'tnum' 1"
  num-md:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "'tnum' 1"
  num-sm:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    fontFeature: "'tnum' 1"
rounded:
  xs: "2px"
  sm: "2px"
  md: "3px"
  lg: "4px"
  arc: "3.5rem"
spacing:
  hair: "1px"
  line: "2px"
  dash: "6px"
  field-gap: "20px"
  header-gap: "24px"
  block-gap: "40px"
  row: "56px"
  page-x: "2.5rem"
  page-x-tablet: "2rem"
  page-x-phone: "1rem"
  rail: "232px"
  topbar: "3.5rem"
  tabbar: "3.75rem"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-primary-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  button-ghost-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-destructive:
    backgroundColor: "{colors.red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  status-mark:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.micro}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "24px"
  status-mark-action:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
  status-mark-fill:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  nav-item:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  nav-item-current:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.meta}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "28px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
  toast-error:
    backgroundColor: "{colors.red}"
    textColor: "{colors.paper}"
---

# Design System: Administration du HBC Aix-en-Savoie

**Portée.** Ce document décrit l'administration (`/admin` et ses neuf sections) et la page de connexion (`/login`), telles qu'elles sont livrées : thème `src/styles/admin.css`, kit `src/components/admin/`, écrans `src/app/(admin)/admin/**`. Le site public (`src/app/(public)/**`, `src/styles.css`, `src/components/home/**`) a son propre habillage, en cours de refonte par ailleurs : il n'est pas décrit ici et aucune de ces règles ne s'y applique. Les seuls engagements de marque communs aux deux sont l'orange et le noir du club.

Tous les jetons sont posés sur `:root:has([data-admin])` : ils n'existent que lorsqu'une page porte `data-admin` (coque de l'admin, page de connexion), et atteignent ainsi les surcouches rendues dans `body`. Le guide d'emploi des composants est `src/components/admin/README.md`.

## Overview

**Creative North Star: "Le tracé"**

L'administration est dessinée avec la grammaire des lignes d'un terrain de handball. La ligne est le seul outil de structure, et son style dit l'état de ce qu'elle entoure : un trait plein pour ce qui est confirmé, un pointillé pour ce qui est provisoire. Il n'y a que deux encres, le noir et le blanc, plus l'orange du logo ; le gris n'existe que pour le texte secondaire et les filets, jamais pour remplir une surface.

L'ensemble est dense et calme : des listes à filets plutôt que des cartes, une bande de chiffres plutôt que des tuiles, des coins vifs, et une seule grande courbe, l'arc de zone, qui taille le coin de la surface de travail et revient sur la connexion et dans les états vides. L'orange et le rouge sont rares parce qu'ils ont chacun un seul sens. Le bénévole qui revient après trois semaines lit l'écran sans légende : ce qui est orange l'attend, ce qui est en pointillé n'est pas fini.

Le seul mouvement de signature est « le pointillé devient plein » : à la publication, le contour en tirets d'une marque de statut se referme en trait plein. Tout le reste des transitions est un retour d'état court, coupé sous `prefers-reduced-motion`.

**Key Characteristics:**
- Deux encres (noir du logo, blanc) et l'orange du club ; aucune surface grise, aucun dégradé.
- Le style du trait porte l'état : plein = confirmé, pointillé = provisoire.
- Orange = ce qui s'actionne ou attend une action. Rouge = suppression et erreur.
- Listes à filets et bande de chiffres, pas de cartes ni de tuiles.
- Coins de 2 à 4 px, une seule courbe : l'arc de zone.
- Aucune ombre dans la page ; seules les surcouches en portent une.
- Barlow partout, Barlow Condensed pour le titre de page et les chiffres, toujours tabulaires.

## Colors

Une palette à deux encres et un accent : tout est noir sur blanc (ou blanc sur noir dans la coque et la connexion), et la couleur n'apparaît que chargée d'un sens.

### Primary
- **Orange du logo** (`#d77f29`) : fond du bouton principal, entrée courante de la navigation, marque de statut « attend une action », grands chiffres « à traiter », compteurs de la coque, anneau de focus, curseur de saisie et sélection de texte. Sur fond orange, le texte est noir (5,3:1), jamais blanc. Sur blanc, l'orange n'atteint que 3,0:1 : il n'y sert qu'en grand chiffre gras (40 px) ou en chiffre de total (24 px).
- **Orange encre** (`#a35a14`) : version assombrie pour un petit texte orangé sur blanc (5,2:1). Employée pour les liens dans le texte de l'éditeur d'articles.

### Secondary
- **Rouge de suppression** (`#b42318`) : bouton de confirmation d'une suppression, action destructive d'un menu, message et contour d'un champ en erreur, toast d'erreur. Texte blanc sur fond rouge (6,6:1).
- **Rouge sur noir** (`#ff8a75`) : le même sens, éclairci pour rester lisible sur l'encre noire de la connexion (6,9:1).

### Neutral
- **Noir du logo** (`#222221`) : texte, traits de structure, rail et barres de la coque, fond de la connexion, bloc de survol des boutons et des éléments de menu, toast de confirmation.
- **Blanc** (`#ffffff`) : surface de travail, champs, dialogues. C'est la seule couleur de surface claire.
- **Gris de texte secondaire** (`#5f5f5c`) : descriptions, aides, mentions, en-têtes de colonnes (6,4:1 sur blanc).
- **Gris d'indication** (`#6b6b68`) : texte d'exemple dans un champ vide (5,3:1).
- **Gris de champ** (`#8a8a86`) : contour d'un champ au repos (3,5:1), pointillé des squelettes, soulignement d'un lien au repos.
- **Gris de filet** (`#d9d9d6`) : filet fin entre les lignes d'une liste et entre les cellules de la bande de chiffres. Jamais un fond.
- **Gris clair sur noir** (`#c2c2c0`) : texte secondaire posé sur l'encre noire (rail, barre haute, connexion ; 8,9:1).

### Named Rules
**La règle de l'orange.** L'orange désigne ce qui s'actionne ou attend une action, et rien d'autre : un seul bouton orange par écran, l'entrée courante de la navigation, les compteurs et marques « à traiter », le focus. Il ne décore jamais.

**La règle du rouge.** Le rouge ne sert qu'à la suppression et à l'erreur. Un état négatif qui n'est ni l'une ni l'autre (défaite, extérieur, archivé) s'écrit en noir.

**La règle des deux encres.** Aucune surface grise ou teintée : dans le thème, le jeton de fond « atténué » vaut blanc. Le gris n'a que trois emplois : texte secondaire, filet, contour de champ.

## Typography

**Display Font:** Barlow Condensed, graisses 600 et 700 (repli : Barlow, puis system-ui)
**Body Font:** Barlow, graisses 400 à 700 (repli : system-ui, sans-serif)

**Character:** une seule famille, en deux largeurs. La version normale porte tout le texte ; la version condensée est réservée au titre de page et aux chiffres, où elle donne le ton d'un tableau d'affichage sans jamais devenir un titre d'affiche.

### Hierarchy
- **Titre de page** (600, 1.75rem / 28 px, interligne 1.1, Barlow Condensed) : le `h1` de l'écran, un seul par page, équilibré sur deux lignes au besoin.
- **Titre de section** (600, 1.125rem / 18 px, interligne 1.3) : bloc titré d'une page, section de formulaire, titre de dialogue, titre d'état vide.
- **Sous-titre** (600, 0.9375rem / 15 px, interligne 1.35) : sous-division dans une section.
- **Corps** (400, 0.9375rem / 15 px, interligne 1.5) : texte courant, lignes de liste, champs à partir de 768 px. Longueur de ligne bornée à 75ch pour une description d'en-tête, 60ch dans un état vide.
- **Libellé** (600, 0.9375rem / 15 px) : libellé de champ, texte de bouton. Casse de phrase, sans capitales ni interlettrage.
- **Texte secondaire** (400, 0.8125rem / 13 px, interligne 1.45, gris de texte secondaire) : aides, descriptions, en-têtes de colonnes (600), lien de retour.
- **Mention** (400, 0.75rem / 12 px, interligne 1.35) : compteur de caractères, libellé d'un total, texte d'une marque de statut (600).

### Rampe de chiffres
Les chiffres qui comptent sont en Barlow Condensed, tabulaires, sur trois tailles :
- **Grand** (700, 2.5rem / 40 px, interligne 1) : ce qui attend une action. C'est le seul chiffre en orange sur blanc.
- **Moyen** (600, 1.5rem / 24 px, interligne 1) : totaux de la bande de chiffres, saisie d'un score.
- **Petit** (600, 0.9375rem / 15 px) : chiffre dans une ligne ou à côté d'un titre (compte d'une liste, d'un onglet, nombre de vues).

### Named Rules
**La règle de l'échelle fixe.** Cinq tailles de texte en rem (12, 13, 15, 18, 28 px), sans `clamp` ni taille qui change d'un point de rupture à l'autre. Dans l'admin, un `h1`–`h6` n'a que la taille qu'on lui donne. Seule exception relevée : le texte d'un champ passe à 16 px sous 768 px, pour que le téléphone ne zoome pas à la saisie.

**La règle des trois chiffres.** L'importance d'un chiffre se lit à sa marche sur la rampe : 40, 24 ou 15 px. Tous les chiffres sont tabulaires, y compris dans le corps de texte.

**La règle du lien noir.** Un lien dans le texte est noir et souligné (soulignement gris de champ, noir et épaissi à 2 px au survol). Jamais d'orange en petit corps sur blanc.

## Layout

La coque a deux formes. À partir de 1024 px : un rail noir fixe à gauche (232 px) avec l'écusson, les neuf sections, puis le lien vers le site et la déconnexion ; à droite, la surface de travail blanche, dont le coin haut-gauche est taillé par l'arc de zone. En dessous de 1024 px : une barre noire en haut (3.5rem), une barre d'onglets noire en bas (3.75rem, plus la zone sûre) avec quatre sections et « Plus », qui ouvre un panneau noir montant du bas avec toutes les sections.

La surface de travail est une seule colonne, centrée, de 76rem au plus. Marges latérales : 2.5rem, puis 2rem sous 1024 px et 1rem sous 768 px. Pas de grille de cartes : une page est un en-tête, puis des blocs empilés.

Rythme vertical relevé : 24 px sous l'en-tête de page, 40 px entre deux blocs, 20 px entre deux champs, 32 px sous une section de formulaire. Une ligne de liste fait 56 px (en-tête de tableau 36 px) ; une ligne « à traiter » 72 px au moins.

Formes de page :
- **Liste** : en-tête, barre de filtres (recherche, listes déroulantes, compte à droite), puis tableau à filets à partir de 768 px et lignes empilées en dessous, à partir de la même définition de colonnes. Sur téléphone, toute la ligne est la cible.
- **Formulaire** : sections séparées par un trait ; à partir de 1024 px, titre de section à gauche (15rem) et champs à droite sur 40rem au plus. Une barre d'enregistrement reste collée en bas, au-dessus de la barre d'onglets sur téléphone.
- **Tableau de bord** : zone « À traiter » sur toute la largeur, puis deux colonnes de listes à partir de 1024 px (gouttière 40 px), et les totaux sur une seule bande entre deux traits pleins, séparés par des filets verticaux (trois par rangée sur téléphone).
- **Connexion** : fond noir ; à partir de 1024 px, formulaire à gauche (colonne de 32rem au plus) et demi-terrain tracé à droite ; sur téléphone, le haut du terrain en bandeau au-dessus du formulaire.

Toute cible tactile fait 44 px sous 768 px (boutons, champs, onglets, éléments de menu) et redescend à 40 px au-delà (36 px pour un bouton-icône, 32 px pour un petit bouton).

### Named Rules
**La règle du compte annoncé.** Toute liste dit combien elle contient (affichés et total), à droite, en chiffres tabulaires ; tout champ limité annonce sa place restante.

## Elevation & Depth

La page est plate. Dans l'arbre de l'admin, toute ombre de boîte ou de texte est annulée d'autorité (`box-shadow: none !important`), et la profondeur est rendue par le contraste des deux encres : rail noir contre surface blanche, bloc noir au survol, trait de 2 px sous ce qui structure. Seules les surcouches, rendues hors de cet arbre, portent une ombre ; à l'intérieur d'une surcouche, l'ombre appartient au panneau, pas à ce qu'il contient. Un voile noir à 60 % passe derrière les dialogues et le panneau « Plus ».

### Shadow Vocabulary
- **Dialogue** (`box-shadow: 0 16px 40px -8px rgb(34 34 33 / 0.45)`) : dialogue et confirmation de suppression, avec un contour noir de 2 px.
- **Panneau du bas** (`box-shadow: 0 -16px 40px -8px rgb(34 34 33 / 0.45)`) : la même ombre retournée, pour le panneau « Plus » du téléphone.
- **Menus, listes déroulantes, toasts** : ils gardent l'ombre par défaut de leur bibliothèque (shadcn, sonner) ; le kit ne la redéfinit pas et leur donne seulement un contour noir.

### Named Rules
**La règle de l'élévation unique.** Une ombre signifie « au-dessus de la page » et rien d'autre. Elle n'apparaît jamais au survol, jamais sur une ligne, un bloc ou un bouton.

## Shapes

Le trait est la forme. Deux épaisseurs : 2 px pour ce qui structure (sous l'en-tête de page, entre deux sections de formulaire, autour de la bande de totaux, au-dessus de la barre d'enregistrement, sous l'onglet courant, contour d'une marque de statut) et 1 px pour ce qui sépare (filets de liste, contours de champ, trait noir sous un titre de section et sous l'en-tête d'un tableau).

Le pointillé a un seul motif : tiret égal à l'intervalle, 6 px et 6 px, comme la ligne de jet franc à 9 m (4 px et 4 px dans une marque de statut, plus petite). Il est tracé soit en filet horizontal, soit en contour autour d'un bloc ; le contour est un rectangle SVG dont les tirets se referment en trait plein quand l'état passe de provisoire à confirmé (180 ms).

Les coins sont vifs : 2 px pour les petits éléments (marque, étiquette, case à cocher, élément de menu), 3 px pour les contrôles (bouton, champ, entrée de navigation, toast), 4 px pour un dialogue. Toutes les marches de rayon de la bibliothèque sont rabattues entre 2 et 4 px, si bien qu'aucun utilitaire ne peut produire un grand arrondi.

La seule grande courbe est l'arc de zone, un quart de cercle : il taille le coin haut-gauche de la surface de travail (rayon 3.5rem, 2.5rem sous 1024 px), le coin du panneau « Plus », et revient dans les états vides (un arc plein et un arc pointillé concentriques, comme les lignes des 6 m et des 9 m) et sur la connexion (le demi-terrain entier).

### Named Rules
**La règle du trait plein.** Un trait plein noir de 2 px dit « structure » ou « confirmé » : publié, lu, terminé. Il ne s'emploie pas pour entourer un bloc provisoire.

**La règle du pointillé.** Le pointillé dit « provisoire » : brouillon, facultatif, en attente, zone de dépôt vide, contenu en cours de chargement. Il n'est jamais décoratif, et un état confirmé n'est jamais en pointillé.

**La règle de l'arc unique.** Une seule géométrie courbe, le quart de cercle de la zone. Pas de pilule, pas de cercle décoratif, pas de grand arrondi.

## Components

Les composants sont sobres et francs : au repos, un contour ou rien ; au survol, un bloc noir. Les transitions de couleur durent 150 ms.

### Buttons
- **Shape:** coins vifs (3 px), 40 px de haut (44 px sous 768 px), libellé en 15 px semi-gras qui nomme l'action.
- **Primary:** bloc orange, texte noir, contour orange de 2 px. Un seul par écran.
- **Hover / Focus:** au survol, le contour passe au noir ; à l'appui, le bouton s'inverse en bloc noir à texte blanc. Focus clavier : anneau orange de 2 px décalé de 2 px, identique sur tout contrôle. Sur le fond noir de la connexion, le contour de survol et le bloc d'appui passent au blanc.
- **Outline / Ghost:** contour noir de 1 px sur blanc, ou aucun contour ; les deux s'inversent en bloc noir au survol, à l'appui et à l'état enfoncé.
- **Destructive:** bloc rouge à texte blanc, réservé à la confirmation d'une suppression. Dans une barre de sélection, la suppression groupée est un bouton à contour rouge qui se remplit au survol.
- **Disabled / Loading:** opacité 45 % ; en chargement, une roue tourne dans le bouton, jamais au milieu du contenu.

### Marque de statut
- **Style:** 24 px de haut, coins de 2 px, texte de 12 px semi-gras, icône facultative de 12 px. Elle remplace toute pastille de couleur.
- **State:** quatre tons. *Plein* (contour plein) : confirmé. *Pointillé* (contour en tirets) : provisoire. *Action* (bloc orange, texte noir) : attend une action. *Bloc* (bloc noir, texte blanc) : fait marquant confirmé, comme un match à domicile ou un article à la une.
- **Signature:** quand un état passe de provisoire à confirmé, le même élément reste monté et son contour se referme en trait plein en 180 ms.

### Étiquette
- **Style:** étiquette neutre de 28 px, contour noir de 1 px, coins de 2 px, texte de 13 px. Pour un mot-clé, une catégorie, un rôle ; jamais pour un état. Le bouton de retrait s'inverse en bloc noir au survol.

### Listes à filets
- **Corner Style:** aucun ; une liste n'a pas de boîte.
- **Background:** blanc, sans alternance de fond.
- **Shadow Strategy:** aucune (voir Elevation & Depth).
- **Border:** trait noir de 1 px sous l'en-tête, filet gris de 1 px sous chaque ligne ; le filet de la ligne survolée passe au noir. C'est le seul retour de survol d'une ligne.
- **Internal Padding:** lignes de 56 px, 12 px entre colonnes, aucune marge latérale.
- **Vignette et actions:** vignette à coins de 2 px ; les actions d'une ligne tiennent dans un menu, la suppression en dernier après un séparateur.

### Inputs / Fields
- **Style:** fond blanc, contour gris de champ de 1 px, coins de 3 px, 40 px de haut (44 px sous 768 px). Libellé semi-gras au-dessus, aide en texte secondaire dessous, compteur de place restante à droite du libellé.
- **Focus:** le contour passe au noir (au survol aussi) et l'anneau orange apparaît.
- **Error / Disabled:** contour rouge et message rouge de 13 px sous le champ, avec une icône ; désactivé à 50 % d'opacité.
- **Case et bascule:** case de 20 px à contour noir, pleine noire une fois cochée ; bascule rectangulaire de 44 × 24 px à contour noir, dont le curseur carré glisse et dont le fond passe au noir.
- **Section de formulaire:** séparée de la précédente par un trait plein de 2 px ; par un pointillé si elle est facultative, avec la mention « facultatif ».
- **Zone de dépôt d'image:** contour pointillé tant qu'elle est vide, plein et orange pendant le glisser, plein et noir autour de l'image déposée.

### Navigation
- **Rail (à partir de 1024 px):** entrées de 40 px, icône et libellé blancs sur noir, coins de 3 px. Survol : filet gris clair de 1 px autour de l'entrée. Section courante : bloc orange plein à texte noir semi-gras. Compteur « à traiter » à droite, en chiffre condensé orange (noir sur l'entrée courante).
- **Barre d'onglets (téléphone):** icône de 20 px au-dessus d'un libellé de 11 px ; onglet courant en bloc orange à texte noir ; compteur orange en exposant de l'icône.
- **Onglets dans une page:** libellés de 15 px sur un filet gris ; un trait noir de 2 px se déploie sous l'onglet courant en 150 ms ; compte tabulaire à côté du libellé.
- **En-tête de page:** titre condensé, description d'une phrase, actions à droite (la principale en dernier), trait plein de 2 px dessous. Rien au-dessus du titre, sauf le lien de retour d'une sous-page.

### Surcouches
- **Dialogue:** blanc, contour noir de 2 px, coins de 4 px, ombre de dialogue ; apparaît en fondu et léger agrandissement (150 ms). Réservé aux confirmations.
- **Menu et liste déroulante:** blancs, contour noir de 1 px, coins de 3 px ; l'élément actif est un bloc noir à texte blanc, l'élément destructif un bloc rouge.
- **Toast:** bloc noir à texte blanc pour une confirmation, bloc rouge pour une erreur, en haut à droite.

### État vide et chargement
- **État vide:** l'arc de zone part du coin du bloc (un arc plein, un arc pointillé), puis un titre de 18 px, une phrase qui dit comment remplir la liste, et l'action.
- **Squelette:** des lignes en pointillé gris à la place du texte, dont l'opacité oscille (1,2 s). Pas de bloc gris.

### Tracé du terrain (connexion)
Demi-terrain vu de dessus, en trait blanc atténué de 2 px sur fond noir : lignes de touche, but, zone des 6 m en trait plein, jet franc des 9 m en pointillé, jet de 7 m, ligne médiane. Chaque ligne se trace une fois à l'affichage (200 à 800 ms selon sa longueur, l'ensemble en 1,4 s environ) ; sous mouvement réduit, le tracé est simplement là. Sur cet écran, seuls le bouton et le focus sont orange.

## Do's and Don'ts

### Do:
- **Do** structurer avec la ligne : trait plein de 2 px pour ce qui structure ou est confirmé, filet de 1 px pour ce qui sépare, pointillé (6 px / 6 px) pour ce qui est provisoire.
- **Do** garder un seul bouton orange par écran, à texte noir, et réserver l'orange à ce qui s'actionne ou attend une action.
- **Do** réserver le rouge (`#b42318`) à la suppression et à l'erreur.
- **Do** écrire un état avec une marque de statut à quatre tons (plein, pointillé, action, bloc), et garder l'élément monté quand l'état change pour que le pointillé devienne plein.
- **Do** tenir les chiffres sur la rampe (40, 24, 15 px), en Barlow Condensed tabulaire, et annoncer le compte de chaque liste.
- **Do** garder les coins entre 2 et 4 px et réutiliser l'arc de zone quand une courbe est nécessaire.
- **Do** donner 44 px à toute cible tactile sous 768 px, et le même anneau de focus orange (2 px, décalé de 2 px) à tout contrôle.
- **Do** limiter les transitions à 150–200 ms et les couper sous `prefers-reduced-motion`.

### Don't:
- **Don't** remplir une surface de gris ou d'une teinte : pas de fond atténué, pas de fond orangé clair, pas de flou d'arrière-plan.
- **Don't** utiliser de couleur de palette (vert, bleu, violet, nuances d'orange ou de gris) : ni pour un état, ni pour une catégorie.
- **Don't** poser d'ombre dans la page ni de dégradé ; l'ombre appartient aux surcouches.
- **Don't** structurer une page ou une ligne avec des cartes, ni présenter des chiffres en grille de tuiles.
- **Don't** écrire de petit texte orange sur blanc : l'orange du logo n'y atteint que 3,0:1.
- **Don't** arrondir en pilule ni au-delà de 4 px, et ne pas ajouter de bordure latérale colorée.
- **Don't** employer de taille de titre fluide ou empilée par point de rupture, ni une quatrième taille de chiffre.
- **Don't** appliquer ces règles au site public : elles valent pour l'administration et la connexion seulement.
