---
version: 1
slug: "src-app-admin-admin"
primary_target: "src/app/(admin)/admin"
related_targets: ["src/app/login"]
---

# Admin HBC Aix-en-Savoie — brief de surface

Périmètre : `/admin` et toutes ses sections (tableau de bord, articles, équipes, matchs, résultats, inscriptions, partenaires, messages, paramètres) et `/login`. Mode : Operate.

Public : bénévoles et dirigeants du club, usage ponctuel, portable ou téléphone. Tâche : trouver, corriger, publier ; voir d'abord ce qui attend une action. Contraintes : Server Actions, validation, contrôles d'accès et textes métier inchangés ; seuls l'orange et le noir du club sont imposés (demande utilisateur du 11 novembre 2026, carte blanche pour le reste, direction choisie sans tour de décision à sa demande). Construction : code-led (pas de génération d'image disponible).

## Direction contract

THESIS: « Le tracé ». L'admin est dessinée avec la grammaire des lignes d'un terrain de handball : la ligne est le seul outil de structure et son style porte l'état. Refuse l'admin par défaut : grilles de cartes ombrées, tuiles de chiffres en dégradé, pastilles pastel vertes, bleues et violettes.

OWN-WORLD: deux encres, noir `#222221` et blanc, plus l'orange du logo `#D77F29`. Aucune surface grise, aucune teinte ; le gris n'existe que pour le texte secondaire et les filets. Trait plein 2 px noir = structure et état confirmé (publié). Pointillé (tirets et intervalles égaux, comme la ligne des 9 m) = provisoire (brouillon, optionnel, en attente). Orange = uniquement ce qui s'actionne ou attend une action. Rouge = uniquement suppression et erreur. Coins vifs (2–4 px) ; une seule grande courbe, l'arc de zone (quart de cercle), partagée par la coque, la connexion et les états vides. Une seule élévation : seules les surcouches portent une ombre. Barlow pour tout, Barlow Condensed pour titres de page et chiffres ; chiffres tabulaires sur une rampe fixe de trois tailles.

STORY: en arrivant, le bénévole voit ce qui l'attend (messages non lus, dossiers incomplets, brouillons), ouvre la ligne, corrige, publie ; le pointillé devient plein.

FIRST VIEWPORT: tableau de bord à 1440 px. À gauche, rail noir de 232 px (la touche) : écusson du club en haut, neuf entrées icône + libellé, l'entrée courante en bloc orange plein à texte noir, compteurs « à traiter » en chiffres orange, déconnexion en bas. À droite, surface blanche dont le coin haut-gauche est taillé par l'arc de zone. En tête, titre « Tableau de bord » en Barlow Condensed 28 px et l'action principale à droite. Dessous, sur toute la largeur, la zone « À traiter » : lignes séparées par des filets, chiffre orange 40 px à gauche, libellé en clair, flèche à droite. Puis deux colonnes de listes à filets : prochains matchs (date et heure tabulaires, domicile en plein, extérieur en contour) et derniers articles (statut plein ou pointillé). Les totaux par section tiennent sur une seule bande de chiffres séparés par des traits verticaux, pas en tuiles. Sur téléphone : barre noire en haut, barre d'onglets en bas (quatre sections + « Plus »).

SIGNATURE: « le pointillé devient plein » — à la publication, le contour en tirets du statut se trace en trait plein (180 ms, ease-out) ; aucun autre mouvement décoratif. Sur `/login`, le tracé du terrain se dessine une fois. Mouvements 150–200 ms, coupés sous `prefers-reduced-motion`.

RAISES: orange réservé à l'action (surface d'app grand public) ; barre d'onglets au pouce sur téléphone (idem) ; chaque liste annonce son compte et chaque champ limité sa place restante, en chiffres tabulaires à droite (jaquette de cassette) ; une seule géométrie d'arc partagée (plan de zoo) ; importance portée par la rampe de chiffres (atlas céleste) ; engagement total sur deux encres, sans gris de surface (Ikeda) ; une seule élévation (manuel à intercalaires).

FORM: le tracé du terrain, candidat 3 de la liste ancrée (feuille de match, tableau d'affichage, tracé du terrain, planning des créneaux, maillot floqué, affiche de match, classeur du secrétariat). Clé de tirage : dfdc4248.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
