---
name: Administration du HBC Aix-en-Savoie
description: « Bureau » — un outil de bureau calme et lisible, où la couleur ne sert qu'à dire un état et où l'urgent se place en haut, en gros.
colors:
  bg: "#f3f2ee"
  paper: "#ffffff"
  sunken: "#f7f5f0"
  line: "#e4e1da"
  line-2: "#efede7"
  ink: "#1f1e1b"
  logo: "#222221"
  text-2: "#5c5852"
  control: "#a8a398"
  orange: "#e8731a"
  orange-ink: "#9a4308"
  orange-soft: "#fdebdc"
  orange-wash: "#fffaf5"
  ok: "#15803d"
  ok-soft: "#e3f4e8"
  bad: "#b42318"
  bad-soft: "#fce8e6"
  warn: "#8a5a00"
  warn-soft: "#fbf0d4"
  chip: "#eceae4"
typography:
  title: { fontSize: "2rem (1.75rem sur téléphone)", fontWeight: 700 }
  h2: { fontSize: "1.0625rem", fontWeight: 650 }
  body: { fontSize: "0.9375rem", fontWeight: 400, lineHeight: 1.5 }
  meta: { fontSize: "0.875rem", color: "text-2" }
  micro: { fontSize: "0.75rem", fontWeight: 600, textTransform: uppercase, letterSpacing: "0.05em" }
  numbers: { family: "condensée du site", sizes: "40 / 36 / 24 / 15 px", fontFeature: "'tnum' 1" }
rounded:
  control: "8px"
  panel: "12px"
  mark: "999px"
layout:
  rail: "240px (à partir de lg)"
  topbar: "3.5rem"
  tabbar: "3.75rem (sous lg)"
  main: "max 80rem"
---

# Design System : Administration du HBC Aix-en-Savoie

## En bref

L'admin est l'outil des bénévoles du club : quelques minutes le vendredi soir pour vérifier le week-end, le samedi au gymnase sur un téléphone, le dimanche soir pour les scores. Il doit se lire sans apprentissage, en plein jour comme à trois mètres.

La direction « Bureau » remplace l'ancienne « Le tracé » et son principe des « deux encres » (noir et orange seulement, l'état porté par le style du trait). Ce principe rendait les écrans austères et faisait du pointillé un bruit de fond : quatorze matchs, quatorze traits pointillés, et l'on ne voyait plus ce qui manquait vraiment. On garde le logo et l'orange du club ; on ajoute des couleurs d'état, toujours accompagnées d'un libellé.

## Principes

1. **La couleur dit un état, et jamais seule.** Vert = fait (complet, publié, victoire). Rouge = bloquant (erreur, équipe sans lien, défaite). Orange du club, ou ambre, = à traiter (score à saisir, poste à pourvoir, message non lu ; synchro en retard). Le gris informe. Une couleur s'accompagne toujours d'un mot : pastille `StatusMark`, ou point suivi d'un texte.
2. **L'urgent en haut et en gros.** Le tableau de bord commence par les tâches, classées par échéance : le bloquant d'abord, puis ce qui devient un problème le plus tôt, le sans-échéance en dernier. La première, si elle presse, prend le grand chiffre.
3. **Une seule action principale par écran**, en orange avec un texte noir. Le reste est en blanc à bord clair ou sans bord.
4. **Le contexte toujours visible.** La barre haute dit la saison et l'état de la dernière synchro FFHandball ; les compteurs qui dépendent de la saison la citent (« 214 matchs · saison 2026-2027, celle du site »).
5. **Pas de chiffre sans décision.** Un compteur, une carte ou une pastille existe parce qu'il appelle une action ou répond à une question. Le bandeau de totaux décoratif de l'ancien tableau de bord a disparu.

## Couleurs

- **Fond** `#f3f2ee`, clair et chaud. **Panneaux** blancs à bord `#e4e1da`, rayon 12 px. Filet entre les lignes `#efede7`. Fond enfoncé `#f7f5f0` pour les bandeaux de jour et le survol.
- **Texte** `#1f1e1b`, secondaire `#5c5852` (contraste AA sur blanc et sur le fond).
- **Orange du club** `#e8731a` : bouton principal (texte noir dessus), onglet et section courants, compteurs « à traiter ». En petit texte sur blanc, la variante `#9a4308`. Une ligne qui attend une action prend le fond `#fffaf5`.
- **États** : vert `#15803d` sur `#e3f4e8`, rouge `#b42318` sur `#fce8e6`, ambre `#8a5a00` sur `#fbf0d4`, gris `#3d3a35` sur `#eceae4`. Noir logo `#222221` pour un fait marquant (domicile, vedette) et pour le filtre segmenté actif.

Les jetons vivent dans `src/styles/admin.css`, posés sur `:root:has([data-admin])` pour que les surcouches Radix rendues dans `body` les reçoivent. Les variables shadcn (`--primary`, `--muted`, `--border`…) y sont remappées.

## Typographie

La famille du site. Texte courant à 15 px, **jamais sous 14 px** (méta, cellules, pastilles). Titre de page 32 px (28 sur téléphone), titre de panneau 17 px. Les capitales de 12 px sont réservées aux en-têtes de colonne, de groupe de navigation et aux bandeaux de jour. Les chiffres sont condensés et tabulaires (`adm-num-xl` 40, `lg` 36, `md` 24, `sm` 15) : ils s'alignent d'une ligne à l'autre.

## Gabarit

- **Grand écran (≥ 1024 px)** : barre latérale blanche de 240 px (logo, sections en quatre groupes : Ce week-end, Calendrier, Site public, Club ; « Voir le site » en pied), barre haute collée (synchro, saison, menu Créer, compte), contenu jusqu'à 80 rem.
- **Téléphone et tablette** : barre haute compacte avec le logo, barre d'onglets au pouce (Accueil, Résultats, Messages, Plus) ; « Plus » ouvre une feuille avec le reste des sections et la déconnexion.
- Une page : titre posé sur le fond, puis des panneaux. Listes en tableau à partir de `md`, en lignes empilées en dessous, avec la même définition de colonnes.

## Profondeur

Les panneaux se détachent par leur bord et le contraste blanc sur fond chaud. Ombres réservées à ce qui flotte : menus, dialogues, feuille « Plus », toasts, ligne en cours de déplacement.

## Formes

Contrôles et boutons à 8 px, panneaux à 12 px, pastilles d'état arrondies. Pas de pointillé pour dire « provisoire », pas de trait noir de structure : un état se dit avec une pastille, une structure avec un panneau.

## Composants

Le mode d'emploi détaillé est dans `src/components/admin/README.md`. Repères :

- **Tableau de bord** : titre « Week-end du 28 et 29 novembre » avec matchs à domicile, à l'extérieur et la saison ; cartes d'urgence classées (`classerUrgences`) ; « Ce week-end au gymnase » avec la liste des matchs à domicile ; synchronisation FFHandball (dernier passage, journal, bouton) ; derniers messages.
- **Résultats** : tableau groupé par jour (bandeau « Samedi 28 novembre · 7 matchs »), filtres segmentés à compteur (Tous, Sans score, À venir, Joués), bilan (joués, victoires en vert, défaites en rouge, scores à saisir en orange). Depuis « À traiter », le filtre Sans score montre tous les scores en attente des 30 derniers jours.
- **Pastille d'état** (`StatusMark`) : `ok`, `bad`, `action`, `warn`, `ink`, `neutral`.
- **Barre de remplissage** (`adm-bar`) : verte une fois complète.
- **Filtres segmentés** (`adm-seg`) : le choix actif en noir logo.

## À faire / à ne pas faire

**À faire**
- Dire l'état en mots, puis le colorer.
- Classer par échéance, pas par type.
- Citer la saison dès qu'un chiffre en dépend.
- Garder des cibles de 44 px sur téléphone et un focus visible partout.
- N'afficher que ce que la base sait : pas de chiffre estimé.

**À ne pas faire**
- Un point, un fond ou une bordure de couleur sans texte.
- Plusieurs boutons orange sur un écran.
- Des pointillés répétés, des traits noirs épais, des dégradés.
- Du texte courant sous 14 px.
- Une carte ou un KPI sans décision associée.
