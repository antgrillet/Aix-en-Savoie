# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HBC Aix-en-Savoie - Official website for a French handball club. Built with Next.js 16 App Router, featuring a public-facing site and admin dashboard.

## Development Commands

```bash
# Development
bun dev              # Start dev server (default port 3000)
bun run build        # Production build
bun lint             # ESLint
bun type-check       # TypeScript check (tsc --noEmit)

# Database (Prisma)
bun prisma:generate  # Generate Prisma client
bun prisma:migrate   # Run migrations
bun prisma:studio    # Open Prisma Studio
bun prisma:seed      # Seed database
bun prisma:reset     # Reset database

# Match sync from FFHANDBALL
bun sync:matches     # Sync match data (scripts/sync-matches.ts)
bun ffhb:equipes     # List the club's teams on FFHANDBALL with the link to set in the admin
bun test:sync        # Tests for the FFHANDBALL reader and the admin results page

# Auth schema
bun auth:generate    # Generate the Better Auth Prisma schema
```

## Architecture

### Route Groups
- `src/app/(public)/` - Public pages (home, equipes, actus, calendrier, partenaires, contact)
- `src/app/(admin)/admin/` - Admin dashboard (protected via middleware)
- `src/app/api/` - API routes (auth, admin, calendrier, contact, sync, upload)

### Key Directories
- `src/lib/` - Core utilities: auth (better-auth), prisma client, email, animations, match sync (`sync-matches.ts`, `ffhandball/`)
- `src/components/ui/` - shadcn/ui components (New York style)
- `src/components/` - Feature components organized by domain (admin, home, teams, calendrier, etc.)
- `src/lib/validations/` - Zod schemas for forms (article, equipe, partenaire, setting)
- `scripts/` - Admin/maintenance scripts and `bun test` files (run with Bun)

### Authentication
Uses `better-auth` with Prisma adapter. Protected routes checked in `middleware.ts` via session cookie. Admin login at `/login`, dashboard at `/admin`.

### Database Models (Prisma)
Main entities: Article, Equipe (team), Match, Partenaire (partner), ContactMessage, Inscription, Classement, Setting. Auth models: User, Session, Account.

### External Integrations
- **Vercel Blob** - Image uploads (`@vercel/blob`)
- **Resend** - Email sending
- **FFHANDBALL** - Matches, venues and standings read with plain `fetch` from the JSON embedded in ffhandball.fr pages (`src/lib/ffhandball/`), no browser. See `README_SYNC.md`
  - Sync runs via GitHub Actions (`.github/workflows/sync-matches.yml`)
  - Schedule: daily 7h, Friday 18h, Saturday 22h30, Sunday 20h
  - Can trigger manually from GitHub Actions tab
  - Team links change every season/phase: `bun ffhb:equipes` finds them again

## Conventions

- Path alias: `@/*` maps to `./src/*`
- French naming for domain entities (equipe, partenaire, entrainement)
- Server Actions in `actions.ts` files within admin routes
- shadcn/ui components with Tailwind CSS v4
- Framer Motion for animations (`src/lib/animations.ts`)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
