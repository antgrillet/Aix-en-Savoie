# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Faits tirés du dépôt (inférés, non confirmés en entretien) :

- **Public** : licenciés, familles, supporters et partenaires du HBC Aix-en-Savoie, qui consultent actus, équipes, calendrier, résultats et contact.
- **Administration** : les bénévoles et dirigeants du club qui tiennent le site. Ils publient des articles, tiennent les équipes et leurs créneaux, suivent les matchs et les résultats du week-end, traitent les inscriptions et les messages de contact, gèrent les partenaires et quelques réglages. Usage ponctuel, souvent en fin de week-end ou entre deux tâches, sur ordinateur comme sur téléphone.

## Product Purpose

Site officiel du HBC Aix-en-Savoie (handball) : une vitrine publique et un espace d'administration (`/admin`, connexion `/login`) qui permet au club de tenir le site sans développeur.

## Operating Context

- Les matchs, lieux et classements viennent de FFHANDBALL (synchronisation planifiée, déclenchable depuis l'admin) ; l'admin corrige et complète.
- Les inscriptions arrivent par le formulaire public ; l'admin suit les dossiers et les pièces manquantes.
- Les images passent par Vercel Blob, les courriels par Resend.

## Capabilities and Constraints

- Sections de l'admin : tableau de bord, articles, équipes, matchs, résultats, inscriptions, partenaires, messages, paramètres.
- Next.js 16 App Router, Tailwind CSS v4, shadcn/ui (style New York), Better Auth, Prisma.
- Vocabulaire métier en français (équipe, partenaire, entraînement, inscription).
- Les Server Actions, la validation Zod et les contrôles d'accès de l'admin ne changent pas lors d'un travail visuel.

## Brand Commitments

- Nom : HBC Aix-en-Savoie.
- Couleurs du club : **orange et noir**. Seuls engagements visuels confirmés par l'utilisateur (11 novembre 2026) ; tout le reste de l'habillage de l'admin est libre.

## Evidence on Hand

- Données réelles en base (articles, équipes, matchs, inscriptions, messages, partenaires).
- Logo : `public/img/home/logo.png` (écusson tigre, fond transparent) et `public/img/logo_white.png`.
- Ne pas inventer de chiffres, de palmarès ni de témoignages.

## Product Principles

- L'admin sert une tâche : trouver, corriger, publier. L'interface s'efface derrière le contenu du club.
- Un bénévole qui revient après trois semaines doit s'y retrouver sans réapprendre.
- Ce qui attend une action (message non lu, dossier incomplet, brouillon) se voit avant le reste.
