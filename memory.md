# PolarLink — Progress & Task Memory

Status as of 2026-09-26: build plan steps 1-2 done. Git repo initialized, Next.js scaffolded, Prisma schema written, and the landing page UI direction is picked and built for real at `/`. Blocked on real Supabase + OAuth credentials before the backend/auth work can proceed — see "Currently blocked on" below.

This file tracks what's been done and what's next. Update the two lists below as work actually progresses — don't let it drift out of sync with reality.

---

## Completed

- [x] Full project specification written and reviewed: problem statement, roles/permissions model, OAuth providers, tech stack, data model, feature list, design system rules, deployment plan, phased build plan, definition of done.
- [x] Git repo initialized at project root.
- [x] Next.js 16.3.6 (App Router, Turbopack) + TypeScript + Tailwind v4 scaffolded via `create-next-app`, moved up from a throwaway subfolder (npm rejects a package name derived from "Polar Link" — has a space and capitals).
- [x] shadcn/ui initialized **pinned to Radix** (`-b radix -p nova` → `radix-nova` style) — the CLI's own default (`-d`) is now Base UI (`base-nova`), which would have silently violated spec §6's "Radix primitives." See spec §14a.
- [x] Prisma pinned to stable `7.10.0` (not the `8.0.0-rc.*` Platform CLI `npm i prisma` grabs by default). Full schema written at `prisma/schema.prisma` per spec §7 (all models/enums, Auth.js tables included). `prisma7.config.ts` configured to use `DIRECT_URL` for CLI ops. `src/lib/db.ts` created with the required `@prisma/adapter-pg` driver adapter reading `DATABASE_URL`. `npx prisma generate` succeeds; build and typecheck both pass clean. See spec §14a for why all of this looks different from classic Prisma docs.
- [x] `.env.example` written per spec §11 (plus `ANTHROPIC_API_KEY` for the optional Content Generator path).
- [x] **UI direction gate resolved (spec §12 step 2).** Explored 3 hand-built mockups (Watermelon-inspired/CSS route diagram, Skiper UI-flavored, anime.js-driven), then a 4th direction after the user brought a reference site (marsrejects.com) for its full-bleed image-zoom mechanic — explicitly NOT its dark/comic-streetwear look, which would have violated the spec's institutional-credibility requirement. Final locked direction ("cinematic documentary"): a real-photo hero with Ken Burns zoom + scroll parallax, followed by 3 full-bleed program sections (Antarctic/Arctic/Himalayan) each crossfading through 2-4 real licensed photos, bold `font-extrabold` type throughout. Full record in spec §14a's "UI direction — DECIDED" entry.
- [x] **Promoted the chosen direction to the real `/` landing page** and deleted every exploratory `/preview/*` route (git history retains them). Reusable pieces live in `src/components/landing/` (`site-header.tsx`, `cinematic-hero.tsx`, `program-section.tsx`, `slideshow.tsx`); placeholder copy/data in `src/lib/mock-landing-data.ts`; all 8 real, licensed photos organized under `public/images/{hero,antarctic,arctic,himalayan}/` and cataloged with attribution in `src/lib/image-credits.ts` (feeds the About/attribution page requirement in spec §8.7 later). None of these photos are actual NCPOR photography — all illustrative placeholders per spec §3, clearly credited in-page.
- [x] Sourced images, all Wikimedia Commons, license-checked before use: Bharati Station (PD), Maitri Station aerial 2005 (GODL-India), Byrd Glacier/NASA Landsat (PD), ISS aurora australis over Antarctica (NASA, PD), aurora over Ny-Alesund/Svalbard (CC BY 2.0, Chris Pirner/NASA Goddard — the hero image), polar bear on Svalbard sea ice (CC BY-SA 4.0, Andreas Weith), Gaumukh/Gangotri glacier (CC BY-SA 3.0), Himalayas-from-Ranikhet panorama (CC BY-SA 4.0, Harshit SR).

## Currently blocked on

- **No real Supabase project yet.** Can't run the first migration (`npx prisma migrate dev`) or exercise the schema against a live database without a `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) from an actual Supabase project — creating one is a cloud-account action outside this session's ability to do unattended. Next concrete action: user creates a Supabase project (or says to use another Postgres for local dev instead) and supplies the two connection strings into `.env`.
- **OAuth app registrations** (Google Cloud Console, GitHub Developer Settings, ORCID sandbox) — also need the user's own accounts/consoles, per spec §11.

## Next steps (in order — per spec §12 build plan)

1. ~~Scaffold Next.js + Prisma schema.~~ Done.
2. ~~UI direction gate — pick and build a landing-page direction.~~ Done, see Completed above.
3. Run the first migration against real Supabase Postgres once credentials exist (schema itself is already written).
4. Register OAuth apps (Google, GitHub, ORCID sandbox) and populate `.env` per §11.
5. Wire Auth.js — Google + GitHub first, ORCID once its sandbox client is approved — with role/researcherStatus in the session callback and **`proxy.ts`** (Next.js 16 renamed middleware to Proxy — see spec §14a) enforcing §4 server-side.
6. Build core CRUD + review workflow for Expedition / Dataset / Publication / MediaAsset / InstitutionalActivity (draft → pending → published/rejected, role-gated).
7. Build public archive & search: browse/filter, detail pages, media gallery, interactive map, timeline — in the locked design language.
8. Build the Content Generator tool (§8.5) — the brief's differentiator, editor-only. Order within this step: rule-based baseline working end to end → OG share-image route → optional AI-assisted draft path (Claude API) last, only if time remains.
8a. Build the public API/RSS feed (§8.8) — read-only `/api/public/*` JSON + `/api/public/feed.xml`, rate-limited. Lower priority than steps 1–8; do this after the core app works.
9. Seed realistic sample content; write `SEED_DATA_NOTE.md` distinguishing illustrative records from anything sourced from genuinely public NCPOR material. Also swap in real NCPOR/expedition photography for the current placeholder images when it becomes available.
10. Legal pages: Terms of Service, Privacy Policy (must mention DPDP Act 2023), About/attribution page (surface `src/lib/image-credits.ts` here).
11. QA pass with Playwright across all four roles' core flows, plus the §9 anti-pattern checklist (focus states, reduced motion, forms, empty states, long content).
12. Deploy to Vercel, connect custom domain, add full favicon set, strip any template/AI attribution badges.

## Decisions made this session (2026-09-26) — already reflected in the spec

- **Content Generator:** hybrid. Rule-based templating is the required baseline (must work end to end on its own); an optional "Generate with AI" action calling the Claude API is a stretch goal added on top, never a replacement, never the only path. See spec §6, §7 (`GeneratedContent.method`), §8.5.
- **OG share images:** added. Each Content Generator draft also produces a templated Open Graph share image via a Next.js `opengraph-image` route, stored at `GeneratedContent.shareImageUrl`. See spec §8.5, §7.
- **Public API/RSS:** added as new §8.8 — read-only, unauthenticated, published-content-only JSON endpoints (`/api/public/*`) plus an RSS feed (`/api/public/feed.xml`), rate-limited, no write access. Lower priority than the core build (build plan step 8a, after steps 1–8).
- **Watermelon UI is not used as installable blocks.** Its real catalog (checked via `npx shadcn search`/`view`) is Vite/React-Router-oriented with fake testimonials, AI-agent widgets, and purple/pink gradients — several of which the §9 blocklist bans outright. Used only as layout/structure inspiration for one of the exploratory mockups (since deleted). Skiper UI checked out fine as a real component source.
- **UI direction:** "cinematic documentary" — see Completed above and spec §14a for the full record.

Full detail lives in the spec file itself (`PolarLink_SIH26063_Project_Spec.md`) — treat that as the source of truth, this is just a pointer.

## Session tooling notes (things that cost time to learn — don't relearn them)

- **Inline tool-result images are NOT visible to the user in this environment.** Only `SendUserFile` actually reaches them. If asked to "show me the image," use `SendUserFile`, not just a Read-tool image display.
- **Large images can fail `SendUserFile` uploads silently (server 400) with no size threshold given.** An 8566px-wide/4MB panorama failed twice; resizing to ~2400px wide via PowerShell + `System.Drawing` (see git log for the snippet) fixed it. Keep hero/background images around 2400px wide, ~80% JPEG quality as a safe default — good enough for web display, small enough to upload reliably.
- **Turbopack dev-server HMR can go stale after large-scale file restructuring.** After moving/deleting many files across modules in one session, `next dev` rendered every background image as solid black despite the network requests succeeding (200). `npm run build` was correct the whole time. A full `taskkill /IM node.exe /F` + fresh `npm run dev` fixed it immediately. If a screenshot ever looks wrong in a way the code doesn't explain, restart the dev server before assuming the code is broken.
- When downloading images from Wikimedia Commons via `curl`, always check the actual bytes downloaded (`head -c 300 file.jpg`) before trusting the file — at least one download silently returned an HTML "Wikimedia Error" page instead of the image (fixed by retrying with a browser-like User-Agent header).

## Non-negotiables (don't relitigate without the user)

- §9 blocklist is absolute: no purple gradients, no pill buttons, no fake reviews/metrics/counters, no vague hero text, no emoji icons, no em dashes, no AI-slop stock photography or copy, no cursor-follow animation.
- Content Generator output is always labeled "Draft — review before publishing" until an editor explicitly publishes it — never presented as NCPOR's own unlabelled voice.
- No "made with AI" / template attribution badges anywhere in the shipped app (layout, footer, `<head>` metadata all need checking per template used).
- Landing page stats must be computed from real DB row counts, never hardcoded literals (still hardcoded in `mock-landing-data.ts` for now — must be swapped for a real query once the database is connected, per build plan step 3+).
- Every non-NCPOR photo used anywhere must stay real, licensed, and credited (`src/lib/image-credits.ts`) — never swap in AI-generated or uncredited stock imagery.
