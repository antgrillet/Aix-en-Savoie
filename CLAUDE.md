# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HBC Aix-en-Savoie - Official website for a French handball club. Built with Next.js 16 App Router, featuring a public-facing site and admin dashboard.

## Development Commands

```bash
# Development
pnpm dev              # Start dev server (default port 3000)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm type-check       # TypeScript check (tsc --noEmit)

# Database (Prisma)
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:seed      # Seed database
pnpm prisma:reset     # Reset database

# Match sync from FFHANDBALL
pnpm sync:matches     # Sync match data (scripts/sync-matches.ts)

# Auth migration
pnpm auth:migrate     # Run better-auth migrations
```

## Architecture

### Route Groups
- `src/app/(public)/` - Public pages (home, equipes, actus, calendrier, partenaires, contact)
- `src/app/(admin)/admin/` - Admin dashboard (protected via middleware)
- `src/app/api/` - API routes (auth, admin, calendrier, contact, sync, upload)

### Key Directories
- `src/lib/` - Core utilities: auth (better-auth), prisma client, email, animations, match sync
- `src/components/ui/` - shadcn/ui components (New York style)
- `src/components/` - Feature components organized by domain (admin, home, teams, calendrier, etc.)
- `src/lib/validations/` - Zod schemas for forms (article, equipe, partenaire, setting)
- `scripts/` - Admin/maintenance scripts (run with tsx)

### Authentication
Uses `better-auth` with Prisma adapter. Protected routes checked in `middleware.ts` via session cookie. Admin login at `/login`, dashboard at `/admin`.

### Database Models (Prisma)
Main entities: Article, Equipe (team), Match, Partenaire (partner), ContactMessage, Inscription, Classement, Setting. Auth models: User, Session, Account.

### External Integrations
- **Vercel Blob** - Image uploads (`@vercel/blob`)
- **Resend** - Email sending
- **FFHANDBALL** - Match data scraping via Playwright (`src/lib/scraping/`)
  - In production: requires `BROWSERLESS_TOKEN` env var (browserless.io)
  - In dev: uses local Chromium

## Conventions

- Path alias: `@/*` maps to `./src/*`
- French naming for domain entities (equipe, partenaire, entrainement)
- Server Actions in `actions.ts` files within admin routes
- shadcn/ui components with Tailwind CSS v4
- Framer Motion for animations (`src/lib/animations.ts`)
