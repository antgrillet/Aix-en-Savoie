# Plan 009 : trancher deux comportements avant de coder (corrections manuelles écrasées, compteur de vues)

> **Plan de décision, pas d'exécution.** Il attend un choix du propriétaire du site. Un
> exécutant ne doit rien coder tant que la section « Décision » n'est pas remplie.

## Statut

- **Priorité** : P3
- **Effort** : M (option A de chaque sujet), S (option B)
- **Risque** : MED (migration de schéma sur la base de production)
- **Dépend de** : 003 (même fichier `src/lib/sync-matches.ts`)
- **Catégorie** : direction
- **Écrit sur** : commit `7ce2291`, 2026-11-13

## Sujet 1 : la synchronisation écrase une correction manuelle

`src/lib/sync-matches.ts` remet à la valeur fédérale, quatre fois par semaine, la date
(ligne 196), le score dès qu'il diffère (lignes 201-211) et le lieu dès que FFHandball
donne une salle (ligne 220). Aucun champ ne dit qu'un match a été corrigé à la main dans
`/admin/matchs`. Un score rectifié par le club (erreur de saisie fédérale, forfait) ou une
salle précisée disparaît donc à la synchronisation suivante, sans trace. Seuls le score
vide et le lieu « À déterminer » sont protégés aujourd'hui.

- **Option A, la correction du club fait foi.** Ajouter au modèle `Match` un horodatage
  `corrigeManuellementLe` renseigné par `updateMatch` quand date, score ou lieu changent
  sur un match relié à FFHandball. La synchronisation ne touche plus ces champs et écrit
  la divergence dans le message du journal, comme elle le fait déjà pour les matchs
  absents de FFHandball. Coût : une migration Prisma à écrire et à appliquer en
  production, un bouton « revenir aux données fédérales » dans le formulaire.
- **Option B, FFHandball fait foi (comportement actuel, à assumer).** Écrire la règle
  dans `README_SYNC.md` et afficher dans le formulaire de match, pour un match relié,
  « Ce match est synchronisé avec FFHandball : date, score et lieu seront remis à jour ».
  Aucune migration.

Recommandation : B d'abord (une demi-heure, supprime la surprise), A seulement si le club
rencontre réellement des corrections qui sautent.

## Sujet 2 : le compteur de vues n'est jamais alimenté

`Article.views` (`prisma/schema.prisma:100`, défaut 0) est affiché sur la page publique
(`src/components/article/ArticleHero.tsx:62`), dans la liste admin
(`src/app/(admin)/admin/articles/ArticlesList.tsx:163`) et sert au classement « articles
populaires » du tableau de bord (`src/app/(admin)/admin/page.tsx:29` et `:50`). Aucun code
n'incrémente ce champ : tout affiche 0, et le classement « populaire » est arbitraire.

- **Option A, compter.** Incrément côté serveur à la lecture d'un article publié. À
  cadrer : exclure les robots et les admins, ne pas rendre la page dynamique pour cela
  (route d'API appelée par le navigateur), mention dans la politique de confidentialité.
- **Option B, retirer.** Supprimer l'affichage public et admin et le bloc « populaires »
  du tableau de bord ; laisser la colonne en base. `PRODUCT.md` demande de ne pas
  afficher de chiffre décoratif sans décision associée.

Recommandation : B. Un chiffre faux est pire que pas de chiffre, et aucune décision du
club ne dépend aujourd'hui du nombre de vues.

## Décision

- Sujet 1 : _à remplir (A ou B)_
- Sujet 2 : _à remplir (A ou B)_

Une fois la décision prise, ce plan est réécrit en plan d'exécution (périmètre, étapes,
vérifications) avant d'être confié à un exécutant.
