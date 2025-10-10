# 🚀 PLAN DE MIGRATION COMPLET
## HBC Aix-en-Savoie: Vite/Vanilla JS → Next.js 15.6 + Stack Moderne

---

## 📋 TABLE DES MATIÈRES

1. [Résumé Exécutif](#résumé-exécutif)
2. [Architecture Cible](#architecture-cible)
3. [Stack Technique Détaillée](#stack-technique-détaillée)
4. [Phase 1: Initialisation](#phase-1-initialisation)
5. [Phase 2: Prisma + PostgreSQL](#phase-2-prisma--postgresql)
6. [Phase 3: Better-Auth](#phase-3-better-auth)
7. [Phase 4: Tailwind CSS v4](#phase-4-tailwind-css-v4)
8. [Phase 5: Animations](#phase-5-animations-framer-motion--gsap)
9. [Phase 6: Composants React](#phase-6-composants-react)
10. [Phase 7: Migration des Données](#phase-7-migration-des-données)
11. [Phase 8: Design Amélioré](#phase-8-design-amélioré)
12. [Phase 9: Tests & Validation](#phase-9-tests--validation)
13. [Checklist Complète](#checklist-complète)

---

## 📊 RÉSUMÉ EXÉCUTIF

### Objectif
Migrer le site handball de Vite/Vanilla JS vers une stack moderne performante avec design amélioré.

### Analyse du Projet Actuel

**Structure:**
- Multi-page application (MPA) avec 7 pages HTML
- ~12 articles, 12 équipes, 30 partenaires (données JSON)
- Vanilla JavaScript (~1500 lignes de code)
- TailwindCSS v3 (via CDN)
- GSAP + AOS pour animations
- Vite comme build tool

**Features:**
- Homepage avec carousel auto-rotatif (3 slides)
- Système de filtrage actualités (par catégorie)
- Pagination (9 items/page)
- Carousel partenaires
- Formulaire de contact avec champs conditionnels
- Navigation sticky avec menu mobile
- Animations scroll (AOS)

### Stack Cible

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 15.6.0-canary | Framework React SSR/SSG |
| **React** | 19.0.0 | Library UI |
| **TypeScript** | 5.7+ | Type safety |
| **Prisma** | 6.1.0+ | ORM |
| **PostgreSQL** | 14+ (Neon) | Database |
| **better-auth** | 1.3.10+ | Authentication |
| **Tailwind CSS** | 4.0.0 | Styling (v4 - CSS-first) |
| **shadcn/ui** | Latest | Composants UI |
| **Framer Motion** | 11.15.0+ | Animations React |
| **GSAP** | 3.12.5+ | Animations avancées |

### Design Goals

✨ **Design moderne et épuré**
- Interface clean et professionnelle
- Typographie hiérarchique claire
- Palette de couleurs cohérente (orange handball + noir)
- Micro-interactions subtiles

🎯 **UX améliorée**
- Navigation fluide et intuitive
- Animations subtiles et performantes
- Feedback visuel immédiat
- Temps de chargement optimaux

📱 **Mobile-first responsive**
- Design adaptatif pour tous les écrans
- Touch-friendly interactions
- Menu mobile optimisé

⚡ **Performance**
- Lighthouse score >90 pour toutes les métriques
- SSG pour pages statiques
- Optimisation images avec next/image
- Code splitting automatique

♿ **Accessibilité**
- WCAG AA compliance
- Navigation au clavier
- Screen reader friendly
- Focus states clairs

---

## 🏗️ ARCHITECTURE CIBLE

### Structure de Dossiers Complète

```
.
├── .env                              # Variables d'environnement
├── .env.example                      # Template
├── .gitignore
├── next.config.js                    # Next.js configuration
├── postcss.config.mjs                # PostCSS pour Tailwind v4
├── tsconfig.json                     # TypeScript config
├── components.json                   # shadcn/ui config
├── package.json
├── middleware.ts                     # Route protection
│
├── backup/                           # Backup données JSON
│   └── data/
│       ├── actualites.json
│       ├── equipes.json
│       └── partenaires.json
│
├── prisma/
│   ├── schema.prisma                 # Schema complet
│   ├── seed.ts                       # Migration JSON → PostgreSQL
│   └── migrations/                   # Historique migrations
│
├── public/
│   ├── img/                          # Images migrées
│   │   ├── home/
│   │   ├── articles/
│   │   ├── equipes/
│   │   └── partenaires/
│   ├── fonts/                        # Fonts custom (si nécessaire)
│   └── favicon.ico
│
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   │
│   │   ├── (public)/                 # Routes publiques (layout groupe)
│   │   │   ├── layout.tsx            # Layout public
│   │   │   ├── page.tsx              # Homepage
│   │   │   │
│   │   │   ├── actus/                # Section Actualités
│   │   │   │   ├── page.tsx          # Liste actualités
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Détail article
│   │   │   │
│   │   │   ├── equipes/              # Section Équipes
│   │   │   │   ├── page.tsx          # Liste équipes
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Détail équipe
│   │   │   │
│   │   │   ├── partenaires/          # Section Partenaires
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── contact/              # Contact
│   │   │       └── page.tsx
│   │   │
│   │   ├── (admin)/                  # Routes protégées
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx        # Layout admin
│   │   │   │   ├── page.tsx          # Dashboard
│   │   │   │   │
│   │   │   │   ├── articles/         # Gestion articles
│   │   │   │   │   ├── page.tsx      # Liste
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx  # Créer
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx  # Éditer
│   │   │   │   │
│   │   │   │   ├── equipes/          # Gestion équipes
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   ├── partenaires/      # Gestion partenaires
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   └── messages/         # Messages contact
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── login/                # Page login
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...all]/
│   │   │   │       └── route.ts      # better-auth handler
│   │   │   │
│   │   │   └── contact/
│   │   │       └── route.ts          # Contact form handler
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Tailwind v4 + custom
│   │   ├── error.tsx                 # Error boundary
│   │   ├── not-found.tsx             # 404 page
│   │   └── loading.tsx               # Loading state
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   └── dialog.tsx
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx            # Header public
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   ├── AdminHeader.tsx       # Header admin
│   │   │   └── AdminSidebar.tsx
│   │   │
│   │   ├── home/                     # Homepage components
│   │   │   ├── HeroCarousel.tsx      # Carousel principal
│   │   │   ├── FeaturedNews.tsx      # Article vedette
│   │   │   ├── RecentNews.tsx        # Grille articles récents
│   │   │   ├── BriefNews.tsx         # Sidebar brefs
│   │   │   └── CategoryFilters.tsx   # Filtres catégories
│   │   │
│   │   ├── news/                     # News components
│   │   │   ├── ArticleCard.tsx       # Card article
│   │   │   ├── ArticleDetail.tsx     # Vue détail
│   │   │   ├── NewsFilters.tsx       # Filtres + search
│   │   │   ├── NewsList.tsx          # Liste avec state
│   │   │   ├── NewsGrid.tsx          # Vue grille
│   │   │   ├── Pagination.tsx        # Pagination
│   │   │   └── RelatedArticles.tsx   # Articles similaires
│   │   │
│   │   ├── teams/                    # Teams components
│   │   │   ├── TeamCard.tsx          # Card équipe
│   │   │   ├── TeamDetail.tsx        # Vue détail
│   │   │   ├── TeamsDashboard.tsx    # Quick access grid
│   │   │   ├── TeamsList.tsx         # Liste complète
│   │   │   └── TeamsFilters.tsx      # Filtres catégories
│   │   │
│   │   ├── partners/                 # Partners components
│   │   │   ├── PartnerCard.tsx       # Card partenaire
│   │   │   ├── PartnersGrid.tsx      # Grille majeurs
│   │   │   └── PartnersCarousel.tsx  # Carousel secondaires
│   │   │
│   │   ├── forms/                    # Form components
│   │   │   ├── ContactForm.tsx       # Formulaire contact
│   │   │   ├── LoginForm.tsx         # Formulaire login
│   │   │   ├── ArticleForm.tsx       # Form CRUD article
│   │   │   ├── TeamForm.tsx          # Form CRUD équipe
│   │   │   └── PartnerForm.tsx       # Form CRUD partenaire
│   │   │
│   │   └── shared/                   # Shared components
│   │       ├── AnimatedSection.tsx   # Section avec animation
│   │       ├── BackButton.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── lib/
│   │   ├── auth.ts                   # better-auth instance
│   │   ├── auth-client.ts            # Client auth
│   │   ├── prisma.ts                 # Prisma singleton
│   │   ├── utils.ts                  # cn(), helpers
│   │   ├── animations.ts             # Framer Motion presets
│   │   └── validators.ts             # Zod schemas
│   │
│   ├── hooks/
│   │   ├── useScrollPosition.ts      # Scroll tracking
│   │   ├── useCarousel.ts            # Carousel logic
│   │   ├── useMediaQuery.ts          # Responsive
│   │   ├── useAuth.ts                # Auth state
│   │   └── useDebounce.ts            # Debounce
│   │
│   ├── types/
│   │   ├── article.ts
│   │   ├── equipe.ts
│   │   ├── partenaire.ts
│   │   └── auth.ts
│   │
│   └── styles/
│       └── animations.css            # CSS animations custom
│
└── claudedocs/                       # Documentation projet
    ├── MIGRATION_PLAN.md             # Ce document
    └── API_REFERENCE.md              # API reference (à créer)
```

---

## 💻 STACK TECHNIQUE DÉTAILLÉE

### Next.js 15.6 Canary

**Pourquoi Next.js 15.6 canary ?**
- ✅ React 19 support natif
- ✅ Turbopack en beta (builds 5x plus rapides)
- ✅ App Router stable
- ✅ Server Components optimisés
- ✅ API Routes modernes

**Fonctionnalités utilisées:**
- Server Components par défaut (performance)
- Static Site Generation (SSG) pour pages publiques
- API Routes pour better-auth et contact form
- Middleware pour protection des routes
- Optimisation automatique des images

### Prisma + PostgreSQL (Neon)

**Pourquoi Prisma ?**
- ✅ Type-safety complète
- ✅ Migrations automatiques
- ✅ Client auto-généré
- ✅ Support PostgreSQL excellent
- ✅ Prisma Studio pour debug

**Pourquoi Neon ?**
- ✅ PostgreSQL serverless
- ✅ Auto-scaling
- ✅ Gratuit pour dev
- ✅ Branches database (comme Git)
- ✅ Connection pooling

### better-auth

**Pourquoi better-auth ?**
- ✅ TypeScript native
- ✅ Adapter Prisma intégré
- ✅ Plugin admin out-of-the-box
- ✅ Désactivation signup facile
- ✅ Session management robuste

**Alternatives considérées:**
- ❌ NextAuth.js v5 (plus complexe pour cas simple)
- ❌ Clerk (payant, overkill)
- ❌ Auth0 (external service)

### Tailwind CSS v4

**Nouveautés v4:**
- ✅ 5x plus rapide (full builds)
- ✅ 100x plus rapide (incremental builds)
- ✅ CSS-first config (pas de JS)
- ✅ `@theme` directive
- ✅ Automatic content detection
- ✅ OKLCH colors natives
- ✅ Modern CSS features

**Breaking changes:**
- `@import "tailwindcss"` au lieu de `@tailwind`
- Pas de `tailwind.config.js` (tout en CSS)
- Nouvelles variables CSS (`--color-*`)

### shadcn/ui

**Pourquoi shadcn/ui ?**
- ✅ Copy-paste components (pas de dépendance npm)
- ✅ Entièrement customizable
- ✅ Accessible (Radix UI)
- ✅ Tailwind CSS natif
- ✅ TypeScript

**Composants utilisés:**
- button, card, input, label, select, textarea
- sheet (mobile menu), scroll-area
- dropdown-menu, avatar, badge, separator
- skeleton (loading states), toast (notifications)
- tabs, alert-dialog, dialog

### Framer Motion

**Pourquoi Framer Motion ?**
- ✅ API React intuitive
- ✅ Performance (GPU accelerated)
- ✅ Animations gestuelles
- ✅ Scroll animations
- ✅ Layout animations
- ✅ AnimatePresence pour exits

**Usage:**
- Page transitions
- Scroll reveal animations
- Hover/tap animations
- Carousel animations
- Mobile menu animations

### GSAP

**Pourquoi GSAP en complément ?**
- ✅ Timeline complexes
- ✅ ScrollTrigger puissant
- ✅ Performance ultime
- ✅ Contrôle fin

**Usage:**
- Parallax effects
- Complex scroll animations
- Hero animations
- Timeline sequences

---

## 📦 PHASE 1: INITIALISATION

### 1.1 Préparation Git

```bash
# Vérifier l'état actuel
git status

# Commit tout changement en cours
git add .
git commit -m "chore: backup before Next.js migration"

# Push vers remote
git push origin main

# Créer branche de migration
git checkout -b feat/nextjs-migration
```

### 1.2 Backup des Données JSON

```bash
# Créer dossier de backup
mkdir -p backup/data

# Copier les fichiers JSON
cp data/actualites.json backup/data/
cp data/equipes.json backup/data/
cp data/partenaires.json backup/data/

# Vérifier la copie
ls -la backup/data/
```

### 1.3 Installation Next.js 15.6 Canary

**Option A: Nouveau projet dans dossier temporaire**

```bash
# Créer nouveau projet Next.js
npx create-next-app@canary nextjs-handball \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack

# Entrer dans le dossier
cd nextjs-handball
```

**Option B: Installation directe (recommandé)**

```bash
# Installer Next.js canary
pnpm install next@canary react@rc react-dom@rc

# Ou avec version spécifique
pnpm install next@15.6.0-canary.57 react@19.0.0 react-dom@19.0.0
```

### 1.4 Installation des Dépendances

```bash
# Core dependencies
pnpm install next@canary react@rc react-dom@rc typescript

# Prisma + PostgreSQL
pnpm install @prisma/client
pnpm install -D prisma tsx

# better-auth
pnpm install better-auth
pnpm install -D @better-auth/cli

# Tailwind CSS v4
pnpm install tailwindcss@next @tailwindcss/postcss@next postcss

# Animations
pnpm install framer-motion gsap @gsap/react

# UI utilities
pnpm install clsx tailwind-merge class-variance-authority
pnpm install lucide-react embla-carousel-react

# Form management
pnpm install react-hook-form @hookform/resolvers zod

# Date utilities
pnpm install date-fns

# Theme
pnpm install next-themes

# Types
pnpm install -D @types/node @types/react @types/react-dom

# Linting
pnpm install -D eslint eslint-config-next
```

### 1.5 Configuration package.json

```json
{
  "name": "hbc-aix-en-savoie",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "prisma:reset": "prisma migrate reset --force",
    "auth:migrate": "npx @better-auth/cli migrate"
  },
  "dependencies": {
    "next": "15.6.0-canary.57",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "@prisma/client": "^6.1.0",
    "better-auth": "^1.3.10",
    "framer-motion": "^11.15.0",
    "gsap": "^3.12.5",
    "@gsap/react": "^2.1.1",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.49",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.7.0",
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^0.468.0",
    "embla-carousel-react": "^8.5.1",
    "react-hook-form": "^7.54.2",
    "@hookform/resolvers": "^3.9.1",
    "zod": "^3.24.1",
    "date-fns": "^4.1.0",
    "next-themes": "^0.4.4"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "@types/node": "^22.10.5",
    "@types/react": "^19.0.6",
    "@types/react-dom": "^19.0.2",
    "prisma": "^6.1.0",
    "@better-auth/cli": "^1.3.10",
    "tsx": "^4.19.2",
    "eslint": "^9.18.0",
    "eslint-config-next": "15.6.0-canary"
  }
}
```

### 1.6 Configuration TypeScript

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 1.7 Configuration Next.js

**next.config.js:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    typedRoutes: true,
  },

  // Pour production
  output: 'standalone',

  // Désactiver strict mode en dev (pour éviter double render)
  reactStrictMode: process.env.NODE_ENV === 'production',
}

module.exports = nextConfig
```

### 1.8 Créer la Structure de Dossiers

```bash
# Créer structure src/
mkdir -p src/app/{api/auth/[...all],'(public)','(admin)'/admin}
mkdir -p src/components/{ui,layout,home,news,teams,partners,forms,shared}
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/styles

# Créer structure Prisma
mkdir -p prisma

# Créer dossiers public
mkdir -p public/img/{home,articles,equipes,partenaires}

# Créer dossier docs
mkdir -p claudedocs
```

### 1.9 Migrer les Assets Statiques

```bash
# Copier toutes les images
cp -r img/* public/img/

# Copier l'icône
cp img/home/logo.png public/favicon.ico

# Vérifier
ls -R public/img/
```

---

## 🗄️ PHASE 2: PRISMA + POSTGRESQL

### 2.1 Variables d'Environnement

**Créer `.env`:**

```env
# ============================================
# DATABASE (Neon PostgreSQL)
# ============================================
DATABASE_URL="postgresql://neondb_owner:npg_B3O6EiFnbWUV@ep-weathered-hall-agbntnut-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:npg_B3O6EiFnbWUV@ep-weathered-hall-agbntnut.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# ============================================
# BETTER AUTH
# ============================================
BETTER_AUTH_SECRET="generate-a-random-string-with-minimum-32-characters-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# ============================================
# APPLICATION
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Créer `.env.example`:**

```env
# Database
DATABASE_URL="your-neon-postgres-url"
DIRECT_URL="your-neon-direct-url"

# Auth
BETTER_AUTH_SECRET="generate-random-32-char-string"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Générer BETTER_AUTH_SECRET:**

```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: OpenSSL
openssl rand -hex 32

# Option 3: Online
# https://generate-secret.vercel.app/32
```

### 2.2 Mise à Jour .gitignore

**Ajouter à `.gitignore`:**

```gitignore
# Existing...

# Environment variables
.env
.env.local
.env.production

# Database
*.db
*.db-journal

# Backup
backup/

# Claude docs (optional)
claudedocs/
```

### 2.3 Schema Prisma Complet

**Créer `prisma/schema.prisma`:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// BETTER-AUTH MODELS
// Généré automatiquement par better-auth
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  sessions      Session[]
  accounts      Account[]

  // Admin role
  role          String    @default("user")

  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  accountId         String
  providerId        String
  accessToken       String?
  refreshToken      String?
  idToken           String?
  expiresAt         DateTime?
  password          String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
  @@map("accounts")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, value])
  @@map("verifications")
}

// ============================================
// APPLICATION MODELS
// ============================================

model Article {
  id          Int      @id @default(autoincrement())
  titre       String
  categorie   String   // "ÉVÉNEMENTS", "ÉQUIPES", "FORMATION", "RECRUTEMENT", "CLUB"
  date        DateTime
  image       String
  resume      String   @db.Text
  contenu     String   @db.Text
  vedette     Boolean  @default(false)
  tag         String?
  tags        String[]
  slug        String   @unique
  published   Boolean  @default(true)
  views       Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?

  @@index([categorie])
  @@index([vedette])
  @@index([published])
  @@index([date(sort: Desc)])
  @@map("articles")
}

model Equipe {
  id            Int            @id @default(autoincrement())
  nom           String
  categorie     String         // "N2F", "N2M", "Prénationale", "Elite", etc.
  description   String         @db.Text
  entraineur    String
  matches       String?
  photo         String
  ordre         Int
  slug          String         @unique
  published     Boolean        @default(true)

  entrainements Entrainement[]

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  createdBy     String?

  @@index([categorie])
  @@index([published])
  @@index([ordre])
  @@map("equipes")
}

model Entrainement {
  id        Int     @id @default(autoincrement())
  jour      String  // "Lundi", "Mardi", etc.
  horaire   String  // "18h00 - 20h00"
  lieu      String? // Optionnel
  equipeId  Int

  equipe    Equipe  @relation(fields: [equipeId], references: [id], onDelete: Cascade)

  @@index([equipeId])
  @@map("entrainements")
}

model Partenaire {
  id                Int      @id @default(autoincrement())
  nom               String
  categorie         String   // "Équipementier", "Institution", "Banque", etc.
  logo              String
  description       String   @db.Text
  site              String?
  partenaire_majeur Boolean  @default(false)
  ordre             Int      @default(0)
  published         Boolean  @default(true)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String?

  @@index([partenaire_majeur])
  @@index([published])
  @@index([ordre])
  @@map("partenaires")
}

model ContactMessage {
  id            Int      @id @default(autoincrement())
  nom           String
  prenom        String
  email         String
  telephone     String?
  message       String   @db.Text

  // Champs handball (optionnels)
  experience    Boolean  @default(false)
  niveau        String?
  positions     String[]

  read          Boolean  @default(false)
  archived      Boolean  @default(false)

  createdAt     DateTime @default(now())

  @@index([read])
  @@index([createdAt(sort: Desc)])
  @@map("contact_messages")
}
```

### 2.4 Script de Seed

**Créer `prisma/seed.ts`:**

```typescript
import { PrismaClient } from '@prisma/client'
import { hash } from 'better-auth/crypto'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

// Helper: Generate slug from string
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Helper: Parse French date
function parseFrenchDate(dateStr: string): Date {
  const months: Record<string, number> = {
    janvier: 0, février: 1, mars: 2, avril: 3,
    mai: 4, juin: 5, juillet: 6, août: 7,
    septembre: 8, octobre: 9, novembre: 10, décembre: 11,
  }

  const match = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)/)
  if (!match) return new Date()

  const [, day, month, year] = match
  const monthIndex = months[month.toLowerCase()]

  return new Date(parseInt(year), monthIndex, parseInt(day))
}

async function main() {
  console.log('🌱 Starting database seed...\n')

  // ============================================
  // 1. Créer l'utilisateur admin
  // ============================================
  console.log('👤 Creating admin user...')

  const hashedPassword = await hash('admin')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hbc-aix.fr' },
    update: {},
    create: {
      email: 'admin@hbc-aix.fr',
      name: 'Admin HBC',
      emailVerified: true,
      role: 'admin',
      accounts: {
        create: {
          accountId: 'admin',
          providerId: 'credential',
          password: hashedPassword,
        },
      },
    },
  })

  console.log('✅ Admin user created:', admin.email)
  console.log('   Email: admin@hbc-aix.fr')
  console.log('   Password: admin\n')

  // ============================================
  // 2. Migrer les articles
  // ============================================
  console.log('📰 Migrating articles...')

  const articlesData = JSON.parse(
    readFileSync(join(process.cwd(), 'backup/data/actualites.json'), 'utf-8')
  )

  let articlesCount = 0
  for (const article of articlesData) {
    await prisma.article.upsert({
      where: { id: article.id },
      update: {},
      create: {
        id: article.id,
        titre: article.titre,
        categorie: article.categorie,
        date: parseFrenchDate(article.date),
        image: article.image,
        resume: article.resume,
        contenu: article.contenu,
        vedette: article.vedette || false,
        tag: article.tag,
        tags: article.tags || [],
        slug: slugify(article.titre),
        published: true,
        views: 0,
        createdBy: admin.id,
      },
    })
    articlesCount++
  }

  console.log(`✅ Migrated ${articlesCount} articles\n`)

  // ============================================
  // 3. Migrer les équipes
  // ============================================
  console.log('👥 Migrating teams...')

  const equipesData = JSON.parse(
    readFileSync(join(process.cwd(), 'backup/data/equipes.json'), 'utf-8')
  )

  let equipesCount = 0
  for (const equipe of equipesData) {
    const team = await prisma.equipe.upsert({
      where: { id: equipe.id },
      update: {},
      create: {
        id: equipe.id,
        nom: equipe.nom,
        categorie: equipe.categorie,
        description: equipe.description,
        entraineur: equipe.entraineur,
        matches: equipe.matches,
        photo: equipe.photo,
        ordre: equipe.ordre || equipesCount,
        slug: slugify(equipe.nom),
        published: true,
        createdBy: admin.id,
      },
    })

    // Migrer les entraînements
    if (equipe.entrainements && equipe.entrainements.length > 0) {
      for (const entrainement of equipe.entrainements) {
        await prisma.entrainement.create({
          data: {
            jour: entrainement.jour,
            horaire: entrainement.horaire,
            lieu: entrainement.lieu || null,
            equipeId: team.id,
          },
        })
      }
    }

    equipesCount++
  }

  console.log(`✅ Migrated ${equipesCount} teams\n`)

  // ============================================
  // 4. Migrer les partenaires
  // ============================================
  console.log('🤝 Migrating partners...')

  const partenairesData = JSON.parse(
    readFileSync(join(process.cwd(), 'backup/data/partenaires.json'), 'utf-8')
  )

  let partenairesCount = 0
  for (const [index, partenaire] of partenairesData.entries()) {
    await prisma.partenaire.upsert({
      where: { id: partenaire.id },
      update: {},
      create: {
        id: partenaire.id,
        nom: partenaire.nom,
        categorie: partenaire.categorie,
        logo: partenaire.logo,
        description: partenaire.description || '',
        site: partenaire.site || null,
        partenaire_majeur: partenaire.partenaire_majeur || false,
        ordre: index,
        published: true,
        createdBy: admin.id,
      },
    })
    partenairesCount++
  }

  console.log(`✅ Migrated ${partenairesCount} partners\n`)

  // ============================================
  // Résumé
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Database seed completed successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ ${articlesCount} articles`)
  console.log(`✅ ${equipesCount} teams`)
  console.log(`✅ ${partenairesCount} partners`)
  console.log(`✅ 1 admin user`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 2.5 Prisma Client Singleton

**Créer `src/lib/prisma.ts`:**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 2.6 Exécution des Migrations

```bash
# 1. Générer le client Prisma
npx prisma generate

# 2. Créer la première migration
npx prisma migrate dev --name init

# 3. Seed la base de données
npm run prisma:seed

# 4. Ouvrir Prisma Studio pour vérifier
npm run prisma:studio
```

**Vérifications dans Prisma Studio:**
- [ ] Table `users` contient 1 admin
- [ ] Table `articles` contient 12 articles
- [ ] Table `equipes` contient 12 équipes
- [ ] Table `partenaires` contient 30 partenaires
- [ ] Relations fonctionnent (entrainements liés aux équipes)

---

## 🔐 PHASE 3: BETTER-AUTH

### 3.1 Configuration better-auth

**Créer `src/lib/auth.ts`:**

```typescript
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins'
import { prisma } from './prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // Désactiver l'inscription publique
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implémenter l'envoi d'email
      console.log('Reset password URL:', url)
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // Update session every 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  plugins: [
    admin({
      impersonationSessionDuration: 60 * 10, // 10 minutes
    }),
  ],

  advanced: {
    generateId: () => crypto.randomUUID(),
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User
```

### 3.2 Client Auth

**Créer `src/lib/auth-client.ts`:**

```typescript
'use client'

import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [adminClient()],
})

// Export hooks pour utilisation dans les composants
export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient
```

### 3.3 API Route Handler

**Créer `src/app/api/auth/[...all]/route.ts`:**

```typescript
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

### 3.4 Middleware de Protection

**Créer `middleware.ts` (racine du projet):**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protéger les routes admin
  if (pathname.startsWith('/admin')) {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      // Pas de session ou pas admin -> redirect login
      if (!session || session.user.role !== 'admin') {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Rediriger si déjà connecté sur page login
  if (pathname === '/login') {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (session) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    } catch (error) {
      // Pas de session, continuer vers login
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
  ],
}
```

### 3.5 Hook useAuth

**Créer `src/hooks/useAuth.ts`:**

```typescript
'use client'

import { useSession } from '@/lib/auth-client'

export function useAuth() {
  const { data: session, isPending, error } = useSession()

  return {
    user: session?.user ?? null,
    session: session ?? null,
    isLoading: isPending,
    isAuthenticated: !!session,
    isAdmin: session?.user.role === 'admin',
    error,
  }
}
```

### 3.6 Utilitaire Server-Side

**Créer `src/lib/auth-utils.ts`:**

```typescript
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session
  } catch (error) {
    return null
  }
}

export async function requireAuth() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return session
}

export async function requireAdmin() {
  const session = await getServerSession()

  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  return session
}
```

---

**(La suite du document continue avec les phases 4 à 9...)**

---

## ✅ CHECKLIST COMPLÈTE D'IMPLÉMENTATION

### Phase 1: Initialisation ☐
- [ ] Créer branche Git `feat/nextjs-migration`
- [ ] Backup données JSON dans `backup/data/`
- [ ] Installer Next.js 15.6 canary
- [ ] Installer toutes les dépendances
- [ ] Configurer `package.json`
- [ ] Configurer `tsconfig.json`
- [ ] Configurer `next.config.js`
- [ ] Créer structure de dossiers complète
- [ ] Migrer assets vers `public/`

### Phase 2: Prisma + PostgreSQL ☐
- [ ] Créer `.env` avec DATABASE_URL
- [ ] Créer `prisma/schema.prisma`
- [ ] Créer `prisma/seed.ts`
- [ ] Créer `src/lib/prisma.ts`
- [ ] Exécuter `prisma generate`
- [ ] Exécuter `prisma migrate dev`
- [ ] Exécuter `prisma seed`
- [ ] Vérifier dans Prisma Studio

### Phase 3: better-auth ☐
- [ ] Générer `BETTER_AUTH_SECRET`
- [ ] Créer `src/lib/auth.ts`
- [ ] Créer `src/lib/auth-client.ts`
- [ ] Créer `src/app/api/auth/[...all]/route.ts`
- [ ] Créer `middleware.ts`
- [ ] Créer `src/hooks/useAuth.ts`
- [ ] Créer `src/lib/auth-utils.ts`
- [ ] Tester login avec admin@hbc-aix.fr / admin

### Phase 4: Tailwind CSS v4 ☐
- [ ] Créer `postcss.config.mjs`
- [ ] Créer `src/app/globals.css`
- [ ] Configurer thème custom avec `@theme`
- [ ] Créer composants réutilisables
- [ ] Installer shadcn/ui: `npx shadcn@latest init`
- [ ] Installer composants shadcn/ui nécessaires

### Phase 5: Animations ☐
- [ ] Créer `src/lib/animations.ts` (Framer Motion presets)
- [ ] Configurer GSAP avec `@gsap/react`
- [ ] Créer animations CSS custom

### Phase 6: Composants React ☐

**Layout:**
- [ ] `src/app/layout.tsx`
- [ ] `src/components/layout/Header.tsx`
- [ ] `src/components/layout/Footer.tsx`
- [ ] `src/components/layout/MobileMenu.tsx`

**Homepage:**
- [ ] `src/app/(public)/page.tsx`
- [ ] `src/components/home/HeroCarousel.tsx`
- [ ] `src/components/home/FeaturedNews.tsx`
- [ ] `src/components/home/RecentNews.tsx`
- [ ] `src/components/home/BriefNews.tsx`

**News:**
- [ ] `src/app/(public)/actus/page.tsx`
- [ ] `src/app/(public)/actus/[slug]/page.tsx`
- [ ] `src/components/news/ArticleCard.tsx`
- [ ] `src/components/news/ArticleDetail.tsx`
- [ ] `src/components/news/NewsFilters.tsx`
- [ ] `src/components/news/NewsList.tsx`
- [ ] `src/components/news/Pagination.tsx`

**Teams:**
- [ ] `src/app/(public)/equipes/page.tsx`
- [ ] `src/app/(public)/equipes/[slug]/page.tsx`
- [ ] `src/components/teams/TeamCard.tsx`
- [ ] `src/components/teams/TeamDetail.tsx`
- [ ] `src/components/teams/TeamsDashboard.tsx`
- [ ] `src/components/teams/TeamsList.tsx`

**Partners:**
- [ ] `src/app/(public)/partenaires/page.tsx`
- [ ] `src/components/partners/PartnerCard.tsx`
- [ ] `src/components/partners/PartnersGrid.tsx`
- [ ] `src/components/partners/PartnersCarousel.tsx`

**Contact:**
- [ ] `src/app/(public)/contact/page.tsx`
- [ ] `src/components/forms/ContactForm.tsx`

**Admin:**
- [ ] `src/app/login/page.tsx`
- [ ] `src/app/(admin)/admin/layout.tsx`
- [ ] `src/app/(admin)/admin/page.tsx` (Dashboard)
- [ ] Admin CRUD pour articles, équipes, partenaires

### Phase 7: Migration Données ☐
- [ ] Vérifier seed réussi
- [ ] Tester requêtes Prisma
- [ ] Vérifier images accessibles
- [ ] Valider slugs générés

### Phase 8: Design Amélioré ☐
- [ ] Appliquer palette de couleurs custom
- [ ] Améliorer typographie
- [ ] Ajouter micro-interactions
- [ ] Optimiser responsive
- [ ] Tester accessibilité

### Phase 9: Tests & Validation ☐
- [ ] Build réussi: `npm run build`
- [ ] Type check: `npm run type-check`
- [ ] Lint: `npm run lint`
- [ ] Test toutes les pages
- [ ] Test formulaire contact
- [ ] Test login/logout admin
- [ ] Test responsive (mobile, tablet, desktop)
- [ ] Test animations
- [ ] Test performance (Lighthouse)
- [ ] Test accessibilité

### Déploiement ☐
- [ ] Configurer variables d'env production
- [ ] Build production
- [ ] Déployer sur Vercel/autre plateforme
- [ ] Configurer domaine
- [ ] SSL configuré
- [ ] Tester en production

---

## 📝 NOTES IMPORTANTES

### Bonnes Pratiques

1. **Git:** Commit fréquemment avec messages descriptifs
2. **Types:** Utiliser TypeScript pour tout
3. **Server Components:** Par défaut, Client Components seulement si nécessaire
4. **Prisma:** Toujours vérifier les queries avec Prisma Studio
5. **Images:** Utiliser `next/image` pour optimisation automatique

### Troubleshooting Courant

**Problème:** Prisma ne trouve pas la database
**Solution:** Vérifier `DATABASE_URL` dans `.env`

**Problème:** better-auth session ne fonctionne pas
**Solution:** Vérifier `BETTER_AUTH_SECRET` et cookies dans DevTools

**Problème:** Tailwind classes ne fonctionnent pas
**Solution:** Vérifier `@import "tailwindcss"` dans `globals.css`

**Problème:** Build Next.js échoue
**Solution:** Exécuter `npm run type-check` pour identifier les erreurs TypeScript

---

## 🎯 PROCHAINES ÉTAPES

Une fois ce document créé, nous procéderons à l'implémentation dans cet ordre:

1. ✅ **Phase 1-3:** Setup infrastructure (Next.js, Prisma, Auth)
2. **Phase 4-5:** Configuration styling et animations
3. **Phase 6:** Développement composants (page par page)
4. **Phase 7-8:** Migration données et design final
5. **Phase 9:** Tests et validation
6. **Déploiement:** Mise en production

**Temps estimé:** 2-3 jours de développement intensif

---

**Document créé le:** 2025-10-10
**Version:** 1.0.0
**Auteur:** Claude + SuperClaude Framework
