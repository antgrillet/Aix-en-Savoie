# Système de Synchronisation des Matchs

Ce système synchronise automatiquement les matchs depuis le site FFHB vers la base de données.

## Fonctionnement

Le système utilise :
- **Playwright** pour scraper les pages FFHB
- **Node-cron** pour les tâches planifiées
- **Prisma** pour la base de données

## Calendrier de Synchronisation

Les matchs sont synchronisés automatiquement :
- **Quotidien** : Tous les jours à 7h00
- **Vendredi** : À 18h00 (avant le weekend)
- **Dimanche** : À 20h00 (après le weekend)

Le système ne synchronise que les matchs de **cette semaine et de la semaine prochaine**.

## Synchronisation Manuelle

### Via la ligne de commande

```bash
pnpm sync:matches
```

### Via l'interface admin

Accédez à `/admin` et cliquez sur le bouton de synchronisation.

### Via l'API

**GET** `/api/sync/matches` (nécessite authentification admin)

**POST** `/api/sync/matches` (pour les cron jobs externes, nécessite le token CRON_SECRET)

## Configuration

### Variables d'environnement

```env
# Pour activer les cron jobs en développement (optionnel)
ENABLE_CRON=true

# Pour les cron jobs externes (Vercel Cron, etc.)
CRON_SECRET=your_secret_token_here
```

### Ajout d'une équipe

1. Dans Prisma Studio ou l'interface admin, ajouter une équipe
2. Renseigner le champ `matches` avec l'URL de la poule sur FFHB
3. La synchronisation se fera automatiquement

Exemple d'URL :
```
https://www.ffhandball.fr/competitions/saison-2025-2026-21/regional/prenationale-feminine-aura-27880/poule-168418/
```

## Logs de Synchronisation

Les logs de synchronisation sont stockés dans la table `SyncLog` :
- Status : success / error / warning
- Message : détail de la synchronisation
- Statistiques : matchs créés, mis à jour, ignorés

## Architecture

```
src/
├── lib/
│   ├── scraping/
│   │   └── ffhandball.ts        # Scraper FFHB
│   ├── sync-matches.ts          # Logique de synchronisation
│   └── cron.ts                  # Configuration des cron jobs
├── app/api/sync/matches/
│   └── route.ts                 # Route API de synchronisation
└── instrumentation.ts           # Démarrage des cron jobs

scripts/
└── sync-matches.ts              # Script CLI pour test manuel
```

## Dépannage

### Les matchs ne se synchronisent pas

1. Vérifier que le champ `matches` de l'équipe contient une URL valide
2. Vérifier les logs dans la table `SyncLog`
3. Tester manuellement avec `pnpm sync:matches`

### Le scraper échoue

Le scraper gère automatiquement :
- Les différents formats de scores (U15 avec 5 chiffres, Seniors avec 4 chiffres)
- Les matchs à venir (format `--`) et terminés
- La détection automatique domicile/extérieur
- La popup de cookies FFHB

Si le scraper échoue, vérifier que la structure HTML du site FFHB n'a pas changé.
