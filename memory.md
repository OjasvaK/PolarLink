# PolarLink — Progress & Task Memory

Status as of 2026-09-26: build plan step 1 (scaffold) is mostly done. Git repo initialized, Next.js + TypeScript + Tailwind + shadcn/ui (Radix) scaffolded, Prisma schema written and client generated. Blocked on real Supabase credentials before the first migration can run — see "Currently blocked on" below.

This file tracks what's been done and what's next. Update the two lists below as work actually progresses — don't let it drift out of sync with reality.

---

## Completed

- [x] Full project specification written and reviewed: problem statement, roles/permissions model, OAuth providers, tech stack, data model, feature list, design system rules, deployment plan, phased build plan, definition of done.
- [x] Git repo initialized at project root.
- [x] Next.js 16.3.6 (App Router, Turbopack) + TypeScript + Tailwind v4 scaffolded via `create-next-app`, moved up from a throwaway subfolder (npm rejects a package name derived from "Polar Link" — has a space and capitals).
- [x] shadcn/ui initialized **pinned to Radix** (`-b radix -p nova` → `radix-nova` style) — the CLI's own default (`-d`) is now Base UI (`base-nova`), which would have silently violated spec §6's "Radix primitives." See spec §14a.
- [x] Prisma pinned to stable `7.10.0` (not the `8.0.0-rc.*` Platform CLI `npm i prisma` grabs by default). Full schema written at `prisma/schema.prisma` per spec §7 (all models/enums, Auth.js tables included). `prisma7.config.ts` configured to use `DIRECT_URL` for CLI ops. `src/lib/db.ts` created with the required `@prisma/adapter-pg` driver adapter reading `DATABASE_URL`. `npx prisma generate` succeeds; `npm run build` and `npx tsc --noEmit` both pass clean. See spec §14a for why all of this looks different from classic Prisma docs.
- [x] `.env.example` written per spec §11 (plus `ANTHROPIC_API_KEY` for the optional Content Generator path).

## Currently blocked on

- **No real Supabase project yet.** Can't run the first migration (`npx prisma migrate dev`) or exercise the schema against a live database without a `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) from an actual Supabase project — creating one is a cloud-account action outside this session's ability to do unattended. Next concrete action: user creates a Supabase project (or says to use another Postgres for local dev instead) and supplies the two connection strings into `.env`.
- OAuth app registrations (Google Cloud Console, GitHub Developer Settings, ORCID sandbox) — also need the user's own accounts/consoles, per spec §11.

## Next steps (in order — per spec §12 build plan)

1. ~~Initialize git repo; scaffold Next.js (App Router) + TypeScript + Tailwind + shadcn/ui.~~ Done.
2. Run the first migration against real Supabase Postgres once credentials exist (schema itself is already written — see Completed above).
3. Register OAuth apps (Google, GitHub, ORCID sandbox) and populate `.env` per §11.
4. **GATE — do not skip:** produce 3 distinct static landing-page mockups (different visual direction each) as preview routes, screenshot each in light + dark mode via `playwright-cli`, and stop for the user to pick a direction before any further page is built. Nothing visual gets decided unilaterally past this point.
5. Wire Auth.js — Google + GitHub first, ORCID once its sandbox client is approved — with role/researcherStatus in the session callback and **`proxy.ts`** (Next.js 16 renamed middleware to Proxy — see spec §14a) enforcing §4 server-side.
6. Build core CRUD + review workflow for Expedition / Dataset / Publication / MediaAsset / InstitutionalActivity (draft → pending → published/rejected, role-gated).
7. Build public archive & search: browse/filter, detail pages, media gallery, interactive map, timeline — in the locked design language from step 4.
8. Build the Content Generator tool (§8.5) — the brief's differentiator, editor-only. Order within this step: rule-based baseline working end to end → OG share-image route → optional AI-assisted draft path (Claude API) last, only if time remains.
8a. Build the public API/RSS feed (§8.8) — read-only `/api/public/*` JSON + `/api/public/feed.xml`, rate-limited. Lower priority than steps 1–8; do this after the core app works.
9. Seed realistic sample content; write `SEED_DATA_NOTE.md` distinguishing illustrative records from anything sourced from genuinely public NCPOR material.
10. Full landing page build against the §9 checklist; verify both themes.
11. Legal pages: Terms of Service, Privacy Policy (must mention DPDP Act 2023).
12. QA pass with `playwright-cli` across all four roles' core flows, plus the §9 anti-pattern checklist (focus states, reduced motion, forms, empty states, long content).
13. Deploy to Vercel, connect custom domain, add full favicon set, strip any template/AI attribution badges.

## Decisions made this session (2026-09-26) — already reflected in the spec

- **Content Generator:** hybrid. Rule-based templating is the required baseline (must work end to end on its own); an optional "Generate with AI" action calling the Claude API is a stretch goal added on top, never a replacement, never the only path. See spec §6, §7 (`GeneratedContent.method`), §8.5.
- **OG share images:** added. Each Content Generator draft also produces a templated Open Graph share image via a Next.js `opengraph-image` route, stored at `GeneratedContent.shareImageUrl`. See spec §8.5, §7.
- **Public API/RSS:** added as new §8.8 — read-only, unauthenticated, published-content-only JSON endpoints (`/api/public/*`) plus an RSS feed (`/api/public/feed.xml`), rate-limited, no write access. Lower priority than the core build (build plan step 6a, after steps 1–8).
- **Animation/component library scope:** reviewed, kept as originally specified (anime.js + Skiper UI + Watermelon UI, all three). Noted in §14 as the trim-down fallback if the step-4 mockup gate runs short on time, not the default.

Full detail lives in the spec file itself (`PolarLink_SIH26063_Project_Spec.md`) — treat that as the source of truth, this is just a pointer.

## Non-negotiables (don't relitigate without the user)

- §9 blocklist is absolute: no purple gradients, no pill buttons, no fake reviews/metrics/counters, no vague hero text, no emoji icons, no em dashes, no AI-slop stock photography or copy, no cursor-follow animation.
- UI direction must come from the user picking between real mockups (build step 4) — this is the one open creative decision the spec explicitly reserves for a human.
- Content Generator output is always labeled "Draft — review before publishing" until an editor explicitly publishes it — never presented as NCPOR's own unlabelled voice.
- No "made with AI" / template attribution badges anywhere in the shipped app (layout, footer, `<head>` metadata all need checking per template used).
- Landing page stats must be computed from real DB row counts, never hardcoded literals.
