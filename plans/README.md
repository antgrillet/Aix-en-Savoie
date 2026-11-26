# Plans d'implémentation

Produits par l'audit `/improve` du 13 novembre 2026, écrits sur le commit `7ce2291`.
Chaque plan est autonome : un exécutant le lit en entier, respecte ses conditions d'arrêt
et travaille dans un worktree. Le relecteur tient ce tableau.

L'audit a d'abord porté sur `2fc34ee`. Trois commits arrivés pendant l'audit
(`eeb22b4`, `a47059b`, `7ce2291`) ont corrigé une partie des constats ; ils sont listés
plus bas et n'ont pas de plan.

## Ordre d'exécution et statut

| Plan | Titre | Priorité | Effort | Dépend de | Statut |
|------|-------|----------|--------|-----------|--------|
| 001 | Commande `check`, CI, dépendances à jour et sans poids mort | P1 | M | — | DONE (relu, à fusionner) |
| 002 | Formulaire de match à l'heure de Paris, entrées validées | P1 | M | — | DONE (relu, à fusionner) |
| 003 | Synchronisation : une page illisible n'est plus un succès | P1 | S | — | DONE (relu, à fusionner) |
| 004 | Actions d'admin : écrire en base avant de supprimer des images | P2 | M | — | DONE (relu après une retouche, à fusionner) |
| 005 | Espace bénévoles : matchs passés masqués, quota atomique | P2 | S | — | DONE (relu, à fusionner) |
| 006 | HTML assaini côté serveur, pagination `/actus` robuste | P2 | M | — | DONE (relu, à fusionner) |
| 007 | Origines de confiance, images distantes, en-têtes, API en 401 | P2 | M | — | DONE (relu, à fusionner) |
| 008 | Scripts à identifiants en dur supprimés, docs et `.env.example` | P2 | S | — | DONE (relu, à fusionner) |
| 009 | Décisions : corrections manuelles écrasées, compteur de vues | P3 | S à M | 003 | TODO (attend une décision) |

Valeurs de statut : TODO | IN PROGRESS | DONE | BLOCKED (raison) | REJECTED (raison).
« DONE (relu, à fusionner) » : le diff est approuvé dans son worktree ; rien n'est
fusionné dans `main`, c'est la décision du propriétaire du dépôt.

## Branches des exécutants

Chaque plan vit sur une branche de worktree sous `.claude/worktrees/`, partie de `7ce2291`.

| Plan | Branche |
|------|---------|
| 001 | `worktree-agent-aa8e83a07d0e9a6ee` |
| 002 | `worktree-agent-a6552e260e5627d34` |
| 003 | `worktree-agent-a654360900e74eabf` |
| 004 | `worktree-agent-af9033484d6d1aab7` |
| 005 | `worktree-agent-a5dc8dd456469451f` |
| 006 | `worktree-agent-aa09af658d2ea7373` |
| 007 | `worktree-agent-ada01e700a5a68228` |
| 008 | `worktree-agent-a1b5991eaf4f49116` |
| Les huit réunis | `advisor/integration-check` (worktree `.claude/worktrees/integration-check`) |

La branche `advisor/integration-check` fusionne les huit branches sur `7ce2291`. Seul
conflit rencontré : `package.json` et `bun.lock` entre 001 et 006, résolu en gardant la
version de 001 puis en rajoutant `sanitize-html` et `@types/sanitize-html` par `bun add`.
Sur cette branche, `bun run check` passe (lint, typecheck, 141 tests).

## Écarts acceptés à la relecture

- 001 : le palier `next` 16.3.8 laisse deux avis critiques qui visent toute la série
  16.3 (optimisation d'images SVG, fonctions `use cache`). Le site n'active ni
  `dangerouslyAllowSVG` ni `use cache` ; le passage en 16.4 reste à faire.
- 006 : la description d'équipe est du texte brut saisi dans une zone de texte, pas du
  HTML de l'éditeur. Elle est assainie au rendu seulement, pas à l'écriture, pour ne pas
  transformer `&` en entité dans l'admin.
- 006 : les classes CSS posées par l'éditeur sont retirées ; vérifié en lecture seule sur
  les 15 articles réels : aucune image, aucun lien, aucun texte perdu, et la page publique
  applique déjà les mêmes styles.
- 008 : `.env.example` liste `ENABLE_CRON`, que le plan 001 rend sans objet. Ligne à
  retirer une fois les deux branches fusionnées.
- 001 : dans `README_SYNC.md`, la dernière ligne de l'arborescence `src/lib/` garde `├──`
  au lieu de `└──`.

## Notes de dépendance et de fusion

- Les plans touchent des fichiers disjoints, sauf deux recouvrements connus :
  - 001 et 006 modifient `package.json` et `bun.lock`. Fusionner 001 d'abord ; pour 006,
    résoudre `package.json` à la main puis `bun install` pour régénérer `bun.lock`.
  - 003 ajoute le statut `warning` à la synchronisation ; 007 fait suivre le champ
    `status` dans la réponse de la route `admin/equipes/[id]/sync-matches`. Sans conflit
    de texte, mais à relire ensemble.
- Ordre de fusion conseillé : 001, 002, 003, 005, 004, 007, 008, 006.
- Après fusion de l'ensemble : `bun install`, `bun run check`, puis un déploiement de
  prévisualisation Vercel pour ce qu'aucun worktree n'a pu vérifier (build, connexion
  admin, upload, rendu des articles, transaction d'inscription sur la vraie base).
- 009 se réécrit en plan d'exécution une fois les deux décisions prises.

## Constats corrigés hors plans (commits `eeb22b4`, `a47059b`, `7ce2291`)

- `/api/upload` sans session : corrigé (session admin, types, taille, dossiers).
- API de l'espace bénévoles sans contrôle serveur : corrigé (cookie signé, 401, suppression réservée à l'admin).
- Formulaire de contact sans validation ni échappement, échec Resend non détecté : corrigé.
- Heures de match en UTC sur les pages publiques, week-end de l'accueil décalé : corrigé (`src/lib/dates.ts`).
- Équipes dépubliées visibles sur `/equipes` : corrigé.

## Constats examinés et écartés

- Mot de passe du calendrier stocké en clair : choix documenté dans
  `CALENDRIER_INTERACTIF.md` (mot de passe partagé entre bénévoles), pas un défaut.
- Classement vidé quand FFHandball renvoie un bloc explicitement vide : comportement
  voulu et testé (`scripts/ffhandball.test.ts`) ; seul le cas « toutes les lignes d'une
  autre poule » est traité (plan 003).
- Avis critique `better-auth` sur OAuth et liens magiques : fonctions non utilisées ; la
  montée de version est faite quand même (plan 001).
- Index Prisma supplémentaires, pagination des listes d'admin : volume trop faible.
- Réécriture des animations Framer Motion en CSS : gain négligeable à ce trafic.
- Tests de bout en bout avec Playwright : les tests de modules purs couvrent le risque réel.
- Suppression de `tailwind.config.ts` : fichier mort, mais non vérifiable sans build ; laissé.
- Épinglage des actions GitHub par SHA : utile, faible priorité, non planifié.
- Politique CSP : à faire avec un navigateur pour la régler, hors de portée d'un exécutant sans rendu.
- Passage à `next` 16.4 : montée mineure à valider sur un déploiement de prévisualisation ;
  le plan 001 s'arrête au palier 16.3.8.

## Pistes produit (non planifiées)

- Résultats du week-end sur une page publique : la logique existe dans `src/lib/resultats-weekend.ts`.
- Alerte « bénévoles manquants » par courriel : les manques sont déjà calculés dans `admin/inscriptions/actions.ts`.
- Mesure de l'usage des promotions partenaires.
- Inscription au club en ligne : à décider avec le club avant tout code.
