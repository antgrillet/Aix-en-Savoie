# Calendrier Interactif - Guide d'utilisation

## Vue d'ensemble

Le calendrier interactif permet aux bénévoles de s'inscrire pour aider lors des matchs à domicile. Cette fonctionnalité facilite l'organisation et assure une couverture complète pour chaque match.

## Fonctionnalités

### Pour les Bénévoles (Page Publique `/calendrier`)

1. **Authentification**
   - Accès protégé par un mot de passe unique
   - Le mot de passe est partagé avec tous les bénévoles
   - Mot de passe par défaut : `handball2025` (modifiable dans l'admin)

2. **Vue Calendrier Hebdomadaire**
   - **Grille calendrier** : Samedi et Dimanche avec horaires de 7h à 22h
   - **Navigation** : Boutons pour passer d'une semaine à l'autre
   - **Bouton "Aujourd'hui"** : Retour rapide à la semaine actuelle
   - **Actualisation** : Bouton pour rafraîchir les données en temps réel

3. **Visualisation des Matchs**
   - Matchs positionnés sur la grille aux bonnes heures
   - Cartes visuelles avec :
     - Nom de l'équipe
     - Adversaire
     - Badge Domicile/Extérieur
     - Indicateur "Recherche bénévoles" si besoin
     - Compteurs rapides (TM 1/2, Arb 0/2, RS 0/1)
   - Couleur orange pour les matchs manquant de bénévoles

4. **Inscription aux Matchs**
   - **Clic sur un match** : Ouvre une fenêtre modale avec détails
   - **Formulaire** : Prénom, Nom, Rôle
   - Rôles disponibles avec quotas :
     - **Table de marque** : max 2 personnes
     - **Arbitre** : max 2 personnes
     - **Responsable de salle** : max 1 personne
     - **Buvette** : illimité
   - Validation instantanée avec blocage si quota atteint

5. **Vue des Inscriptions**
   - Dans la modale de chaque match :
     - Liste des personnes déjà inscrites par rôle
     - Compteurs visuels (ex: 1/2 pour les arbitres)
     - Mise à jour en temps réel après inscription

### Pour les Administrateurs

#### 1. Configuration (`/admin/parametres`)

**Mot de passe du calendrier**
- Configurer le mot de passe unique pour accéder au calendrier
- Visible en clair pour faciliter le partage
- Modifiable à tout moment

#### 2. Gestion des Inscriptions (`/admin/inscriptions`)

**Résumé des Besoins**
- Vue d'ensemble des matchs manquant de bénévoles
- Compteur des postes à pourvoir
- Détail par match : manques pour chaque rôle
- Indicateur visuel (orange) pour les matchs nécessitant des bénévoles

**Tableau des Inscriptions**
- Liste complète de toutes les inscriptions
- Filtres par équipe et par rôle
- Informations détaillées :
  - Match (équipe vs adversaire)
  - Date et heure
  - Bénévole (nom et prénom)
  - Rôle assigné
  - Date d'inscription
- Actions :
  - Suppression d'une inscription (avec confirmation)

## Workflow Complet

### Mise en place initiale

1. **Configurer le mot de passe**
   ```
   Admin → Paramètres → Calendrier Interactif
   Définir un mot de passe facile à retenir
   ```

2. **Créer des matchs**
   ```
   Admin → Matchs → Nouveau match
   OU
   Admin → Équipes → Synchroniser les matchs (depuis FFHANDBALL)
   ```

### Utilisation par les bénévoles

1. **Accès au calendrier**
   ```
   Navigation publique → Calendrier
   Entrer le mot de passe
   ```

2. **Navigation dans le calendrier**
   ```
   Vue par défaut : Week-end actuel (Samedi + Dimanche)
   Changer de semaine : Flèches gauche/droite
   Retour rapide : Bouton "Aujourd'hui"
   Scroll horizontal : Pour voir toute la grille horaire
   ```

3. **S'inscrire à un match**
   ```
   Cliquer sur une carte de match dans la grille
   → Fenêtre modale s'ouvre avec les détails
   Voir les inscriptions existantes
   Remplir le formulaire : Prénom, Nom, Rôle
   Valider l'inscription
   → Retour automatique au calendrier
   ```

4. **Voir qui est inscrit**
   ```
   Vue rapide : Compteurs sur chaque carte de match (TM 1/2, etc.)
   Vue détaillée : Cliquer sur le match pour voir tous les noms
   ```

### Suivi administrateur

1. **Vérifier les besoins**
   ```
   Admin → Inscriptions
   Consulter le résumé des manques
   Relancer les bénévoles si nécessaire
   ```

2. **Gérer les inscriptions**
   ```
   Admin → Inscriptions → Tableau
   Filtrer par équipe ou rôle
   Supprimer une inscription si besoin
   ```

## Règles de Gestion

### Quotas par Rôle
- **Table de marque** : 2 personnes max
- **Arbitre** : 2 personnes max
- **Responsable de salle** : 1 personne max
- **Buvette** : Illimité

### Restrictions
- Impossible de s'inscrire si le quota est atteint
- Impossible de s'inscrire à un match terminé
- Une personne peut s'inscrire plusieurs fois au même match (avec des rôles différents)
- Les inscriptions sont liées aux matchs publiés uniquement

### Indicateurs Visuels
- **Badge orange "Bénévoles recherchés"** : Le match manque de bénévoles
- **Badge vert avec compteur** : Le quota est atteint pour ce rôle
- **Badge outline** : Places encore disponibles

## Base de Données

### Nouveau Modèle : `Inscription`
```prisma
model Inscription {
  id        Int              @id @default(autoincrement())
  matchId   Int
  nom       String
  prenom    String
  role      RoleInscription
  match     Match            @relation(...)
  createdAt DateTime         @default(now())
}

enum RoleInscription {
  TABLE_DE_MARQUE
  ARBITRE
  RESPONSABLE_SALLE
  BUVETTE
}
```

### Relation sur `Match`
- Un match peut avoir plusieurs inscriptions
- Suppression en cascade : si un match est supprimé, ses inscriptions le sont aussi

## API Routes

### Publiques (accessibles après authentification)
- `POST /api/calendrier/auth` - Vérifier le mot de passe
- `GET /api/calendrier/matchs` - Liste des matchs avec inscriptions
- `POST /api/calendrier/inscriptions` - Créer une inscription
- `DELETE /api/calendrier/inscriptions/[id]` - Supprimer une inscription

### Administrateur
- Toutes les routes admin nécessitent une authentification admin

## Sécurité

- Mot de passe en clair dans la base (intentionnel, pas de données sensibles)
- Session stockée côté client (sessionStorage)
- Pas de création de comptes utilisateurs (simplicité)
- Authentification admin requise pour la gestion

## Design du Calendrier

### Vue Grille Hebdomadaire

**Structure :**
- 3 colonnes : Heures | Samedi | Dimanche
- 16 lignes : 7h à 22h (créneaux d'une heure)
- Colonne des heures fixe (sticky) lors du scroll horizontal
- Headers des jours fixe lors du scroll vertical

**Cartes de Match :**
- Positionnées dans le créneau horaire correspondant
- Couleur normale : fond blanc avec bordure grise
- Couleur alerte : fond orange clair avec bordure orange (manque de bénévoles)
- Hover : Ombre portée pour indiquer la cliquabilité
- Contenu :
  - Nom de l'équipe (gras)
  - "vs Adversaire" (texte secondaire)
  - Badge Domicile (bleu) ou Extérieur (gris)
  - Badge "Recherche bénévoles" (rouge) si besoin
  - 3 badges compteurs (TM, Arb, RS)

**Interactions :**
- Clic sur une carte → Ouvre modale avec détails complets
- Hover sur créneau vide → Fond gris clair
- Scroll horizontal : Permet de voir toute la journée
- Responsive : Largeur minimale de 800px (scroll sur mobile)

### Modale de Match

**Layout 2 colonnes (desktop) :**
- Colonne gauche : Inscriptions existantes
  - 4 sections (Table de marque, Arbitre, Responsable salle, Buvette)
  - Icônes par rôle
  - Liste des noms inscrits
  - Compteurs visuels (badges verts si complet)
- Colonne droite : Formulaire d'inscription
  - 2 champs (Prénom, Nom)
  - Select pour le rôle (avec compteurs et état "Complet")
  - Bouton de validation

**Mobile :** Vue empilée verticalement

## Améliorations Futures Possibles

1. **Notifications**
   - Email de rappel aux bénévoles
   - Alerte admin si manque de bénévoles

2. **Statistiques**
   - Historique des participations par bénévole
   - Matchs les plus couverts

3. **Export**
   - Export Excel des inscriptions
   - Planning imprimable

4. **Multi-mot de passe**
   - Un mot de passe par catégorie d'équipe
   - Accès restreint par équipe

5. **Vue Mensuelle**
   - Vue calendrier mois complet
   - Filtre par équipe
   - Export PDF du planning

## Support

En cas de problème :
1. Vérifier que le mot de passe est configuré dans `/admin/parametres`
2. Vérifier que les matchs sont bien créés et publiés
3. Consulter les logs du serveur pour les erreurs API

## Notes Techniques

- Next.js 16 avec App Router
- Server Actions pour les mutations
- Prisma pour l'ORM
- shadcn/ui pour les composants
- Validation côté serveur des quotas
