# PolarLink

An archive and outreach portal for India's polar science program — built for **Smart India Hackathon 2026, Problem Statement 26063** ("Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal"), issued by the Ministry of Earth Sciences / NCPOR.

PolarLink does two things:

1. **Archives** expedition reports, datasets, publications, photos, videos, and institutional activity from India's Antarctic, Arctic, and Himalayan research programs, searchable in one place.
2. **Turns that archive into publishable content** — a Content Generator drafts website blurbs, social captions, and Open Graph share images from an archive entry, ready for an editor to review and publish.

> Prototype built for a hackathon. Not an official website of NCPOR or the Government of India.

## Features

- **Public archive** — unified search (type, program, year, tags), expedition/dataset/publication/media detail pages, a hand-built SVG station map, and a program timeline from 1981 to today.
- **Role-based accounts** (Public → Researcher → Editor → Admin) via OAuth (Google, GitHub, ORCID), enforced server-side.
- **Researcher tools** — submit expedition reports, datasets, and media; track status in "My Submissions."
- **Editor tools** — a review queue (approve / reject / request changes) and the **Content Generator**: draft a rule-based blurb + social caption + OG share image from a published item, with an optional AI-assisted draft as an alternative.
- **Admin tools** — researcher-access approvals, audit trail, basic analytics.
- **Public read-only API** (`/api/public/*`) and an RSS feed (`/api/public/feed.xml`) for syndication.
- Legal/static pages (Terms, Privacy, About) with real DPDP Act disclosure.

## Tech stack

- **Next.js** (App Router) + **TypeScript**, **React 19**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **Prisma** ORM over **Postgres** (Supabase in production; local Postgres via Docker for development)
- **Auth.js (NextAuth v5)** for OAuth
- **Supabase Storage** for uploaded media/report files
- **Playwright** for end-to-end tests

## Getting started

### Prerequisites

- Node.js 20+
- Docker Desktop (for the local Postgres database)

### Setup

```bash
npm install
cp .env.example .env      # fill in real values — see below
docker compose up -d      # starts local Postgres on port 5433
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` / `DIRECT_URL` — Postgres connection (Supabase in production; point at the local Docker container via `.env.local` for development).
- `AUTH_SECRET` — generate with `npx auth secret`.
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`, `AUTH_ORCID_ID` / `AUTH_ORCID_SECRET` — OAuth provider credentials. Sign-in works with whichever of these are configured; none configured just disables that provider's button.
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Storage for uploads.
- `ANTHROPIC_API_KEY` — optional; enables the "Generate with AI" option in the Content Generator. The rule-based generator works without it.
- `NEXT_PUBLIC_CONTACT_EMAIL`, `SITE_URL` — contact address and absolute site URL for production.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright end-to-end tests |

## Project structure

```
src/app/          Routes (App Router) — landing, archive, dashboard, admin, review, generator, submissions, auth
src/components/   UI components (shadcn primitives, landing sections, archive views)
src/lib/          Domain logic (archive queries, content generator, map data)
src/generated/    Prisma client output
prisma/           Prisma schema and migrations
scripts/          One-off build/data scripts
```

See `PolarLink_SIH26063_Project_Spec.md` for the full project specification.
