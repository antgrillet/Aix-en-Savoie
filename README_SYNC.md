# Synchronisation des matchs

Les matchs, les salles et les classements sont lus sur le site FFHandball et enregistrés en base.

## Fonctionnement

Le site fédéral embarque les données de chaque page en JSON dans le HTML (balises
`<smartfire-component>`). Un simple `fetch` suffit : **aucun navigateur, aucun Playwright**.

Pour chaque équipe publiée qui a un lien FFHandball :

1. la page « équipe » de la compétition donne tout le calendrier de la saison, les scores et le classement ;
2. la salle est lue sur la page détail d'un match, une seule fois par salle (cache dans le réglage `ffhb_salles`) ;
3. chaque rencontre est rapprochée d'un match en base (même adversaire, à moins d'un jour) puis créée ou mise à jour.

Règles métier :

- **Domicile / extérieur** : l'équipe citée en premier reçoit. En plateau (moins de 11, moins de 9),
  l'ordre ne veut rien dire : on est à domicile quand la salle est à Aix-les-Bains (73100).
- **Plateaux** : la fédération affiche « 1 - 1 » pour un match joué dont le score n'est pas compté.
  Le match est alors marqué joué, sans score.
- **Forfait** (« FO ») : zéro but pour l'équipe forfait.
- **Match sans date réelle** (pas de date, ou minuit) : ignoré jusqu'à ce qu'il soit programmé.
- **Matchs absents de FFHandball** (reportés, anciens doublons) : signalés dans le journal, jamais supprimés.

## Planification

GitHub Actions (`.github/workflows/sync-matches.yml`) :

- tous les jours à 7h00 ;
- vendredi à 18h00 ;
- samedi à 22h30 ;
- dimanche à 20h00.

Le job échoue si une équipe est en erreur, pour que le problème soit visible.

## Lancer à la main

```bash
bun run sync:matches     # toutes les équipes
bun run test:sync        # tests de la lecture FFHandball et de la page résultats
```

Dans l'admin : bouton « Synchroniser les matchs » sur une équipe (appel direct à FFHandball),
ou déclenchement du workflow complet via `POST /api/sync/matches` (`GITHUB_TOKEN`, `GITHUB_REPO`).

## Lien d'une équipe

Champ « Lien calendrier matches » de l'équipe. Le lien d'équipe est le plus sûr :

```
https://www.ffhandball.fr/competitions/saison-2026-2027-22/regional/excellence-masculin-aura-30497/equipe-2117212/
```

Un lien de poule est accepté tant qu'une seule équipe du club y joue.

**À chaque nouvelle saison ou nouvelle phase**, les liens changent. Pour les retrouver :

```bash
bun run ffhb:equipes                       # saison en cours
bun run ffhb:equipes saison-2027-2028-23   # autre saison
```

La commande parcourt les compétitions du Comité de Savoie et de la ligue AURA et affiche, pour chaque
équipe du club, le lien à coller dans l'admin. Les championnats nationaux sont à copier à la main.

## Journal

Table `SyncLog` : statut (`success` / `error`), message, matchs créés, mis à jour, inchangés.
La page admin « Résultats » affiche la date de la dernière synchronisation réussie.

## Architecture

```
src/lib/
├── ffhandball/
│   ├── donnees.ts          # Lecture et conversion des pages (pur, testé)
│   └── client.ts           # Appels réseau à www.ffhandball.fr
├── sync-matches.ts         # Rapprochement avec la base, cache des salles
├── resultats-weekend.ts    # Calculs de la page admin « Résultats »
└── cron.ts                 # Planification locale optionnelle (ENABLE_CRON)

scripts/
├── sync-matches.ts         # Synchronisation complète
└── ffhb-equipes.ts         # Retrouver les liens des équipes du club
```

## Dépannage

- **Une équipe n'a plus de matchs** : son lien date d'une autre saison ou phase. Relancer `bun run ffhb:equipes`.
- **« Aucune équipe du club dans cette poule »** : même cause.
- **Plus rien ne remonte pour personne** : la structure des pages FFHandball a changé ; voir `donnees.ts`
  (noms des blocs `competitions---…`).
