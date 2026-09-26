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

## Decisions made this session (2026-09-26, continued) — already reflected in the spec

- **Watermelon UI is not used as installable blocks.** Its real catalog (checked via `npx shadcn search`/`view`) is Vite/React-Router-oriented with fake testimonials, AI-agent widgets, and purple/pink gradients — several of which the §9 blocklist bans outright. It's used only as layout/structure inspiration for the hand-rebuilt mockup-1 direction. Skiper UI checked out fine and is used directly. See spec §14a.

## Completed (continued)

- [x] Build plan step 2 (mockup gate): three landing-page direction mockups built and screenshotted in light + dark mode at `/preview/mockup-1`, `/preview/mockup-2`, `/preview/mockup-3` (also `/preview` as an index). Awaiting the user's pick before any further page gets built — do not proceed past this gate on an assumed direction.
  - Mockup 1: hand-rebuilt, Watermelon-inspired layout (calm/structured), CSS-driven route diagram.
  - Mockup 2: Skiper UI's `ProgressiveBlur` (skiper41, installed via shadcn CLI) plus a hand-rolled scroll-reveal (`IntersectionObserver`), bolder hero treatment. Skiper UI free-tier attribution note added to the footer per its license.
  - Mockup 3: anime.js hand-built — hero entrance stagger and the station route diagram are both driven by anime.js (`animate`/`stagger`, v4 API), no third-party UI kit.
  - Shared: `src/lib/mock-landing-data.ts` (same placeholder content across all three, per the spec's "same content, different visual direction"), `src/components/theme-toggle.tsx`, `next-themes` wired into root layout.
  - Found and fixed a real scaffold bug while building these: `globals.css` had `--font-sans: var(--font-sans)` (circular/invalid), which silently fell back headings and card titles to the browser's default serif font. Fixed to `--font-sans: var(--font-geist-sans)`. Worth remembering — this kind of bug is invisible in the editor and only shows up in a rendered screenshot, so screenshot/visually-check new layouts rather than trusting the code alone.
  - Added a light institutional accent color (polar blue, `--primary`/`--ring`/`--accent` in `globals.css`) instead of shadcn's default grayscale — applies to all three mockups equally, not a "direction" variable.
  - `scripts/screenshot-mockups.mjs` (Playwright, not the test runner) captures all six screenshots on demand — rerun it after any change to the mockups.

## Completed (continued, 2026-09-26 session 2)

- [x] Explored a reference site the user liked (marsrejects.com) via Playwright screenshots — a dark/edgy comic-style Framer site for a graphic-novel collection. Not usable as a literal template (tone conflicts with spec's institutional requirement), but its *mechanic* (full-bleed photo backgrounds with scroll-triggered zoom/transitions) was the useful takeaway.
- [x] User direction, confirmed via questions: "cinematic documentary" mood (BBC Earth / NatGeo Explorer / NASA-ESA style) — dark, dramatic real photography, still institutionally credible. Not the comic/streetwear intensity of the reference site itself.
- [x] Sourced 4 real, properly licensed candidate photos (Wikimedia Commons) and sent them to the user directly via SendUserFile — inline tool-result images are NOT visible to the user in this environment, only SendUserFile actually reaches them. Remember this for any future "show me the image" request.
  - Bharati Station (Antarctica) — public domain
  - Maitri Station aerial 2005 — GODL-India, requires attribution to Ministry of Earth Sciences
  - Byrd Glacier (NASA Landsat) — public domain
  - **Aurora over Ny-Alesund, Svalbard — CC BY 2.0, credit: Chris Pirner / NASA Goddard — this is the one the user picked.**
- [x] Built Direction 4 at `/preview/mockup-4`: a cinematic hero using the aurora photo with a continuous Ken Burns zoom (CSS keyframes on an inner wrapper) plus JS scroll-parallax (translateY on an outer wrapper — kept as two separate DOM layers so the two transforms don't clobber each other), both skipped under `prefers-reduced-motion`. Photo credit rendered as a small linked caption in the hero's corner. Rest of the page (stats/featured/footer) still follows the light/dark toggle; only the hero stays permanently dark/cinematic.
- [x] `src/lib/image-credits.ts` created — real license/attribution metadata per image, meant to also feed the About/attribution page later (spec §8.7 needs real credits, not fake ones).
- [x] Real image asset committed at `public/images/hero/ny-alesund-aurora.jpg` (resized to 2400px wide, ~480KB, via a PowerShell/System.Drawing resize — the original 8566px panorama was too large for SendUserFile's upload, a useful trick to remember).
- [x] User pushed further: wants multiple images in a background slideshow (not one static photo) across multiple sections, and wants the bold/high-contrast type treatment pushed further (while keeping real photography, not the reference site's illustrated characters). Sourced 4 more real licensed photos (ISS aurora australis over Antarctica — NASA PD; Gaumukh/Gangotri glacier and a Himalayas-from-Ranikhet panorama — both CC BY-SA, for the previously-thin Himalayan set; polar bear on Svalbard sea ice — CC BY-SA 4.0). Dropped one candidate (a "Nanda Devi Sunset" file) after downloading it full-res and finding it's actually monochrome/desaturated despite the name — doesn't fit the photo palette.
- [x] Built 3 full-bleed `ProgramSection`s (Antarctic / Arctic / Himalayan) on mockup-4, each running its own crossfading `Slideshow` of real photos (2-4 images per program), bold `font-extrabold` headings, a program-tinted gradient overlay, live per-image attribution caption. All 8 real photos now organized under `public/images/{antarctic,arctic,himalayan}/` and cataloged in `src/lib/image-credits.ts` (`programSlideshows` export groups them by program). Hero headline also bumped to `text-7xl font-extrabold` per the "bolder" direction.
- **Awaiting the user's confirmation on Direction 4** (now hero + 3 program slideshow sections + stats/featured/footer) before locking it in as the real landing page and updating the spec's design-direction record.

## Currently blocked on

- **Waiting on the user to pick a landing-page direction** (or ask for a merge) from the three mockups above before any further page is built. This is a hard gate per spec §12 step 2 — do not guess.
- **No real Supabase project yet.** Can't run the first migration (`npx prisma migrate dev`) or exercise the schema against a live database without a `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) from an actual Supabase project — creating one is a cloud-account action outside this session's ability to do unattended. Next concrete action: user creates a Supabase project (or says to use another Postgres for local dev instead) and supplies the two connection strings into `.env`.
- OAuth app registrations (Google Cloud Console, GitHub Developer Settings, ORCID sandbox) — also need the user's own accounts/consoles, per spec §11.

## Next steps (in order — per spec §12 build plan)

1. ~~Initialize git repo; scaffold Next.js (App Router) + TypeScript + Tailwind + shadcn/ui.~~ Done.
2. ~~GATE: produce 3 distinct landing-page mockups, screenshot in light+dark, stop for user pick.~~ Done — see Completed above. **Waiting on the user's pick now.**
3. Run the first migration against real Supabase Postgres once credentials exist (schema itself is already written — see Completed above).
4. Register OAuth apps (Google, GitHub, ORCID sandbox) and populate `.env` per §11.
5. Once a direction is picked: rebuild it as the real `/` landing page (not a `/preview/*` route) in the locked design language, then wire Auth.js — Google + GitHub first, ORCID once its sandbox client is approved — with role/researcherStatus in the session callback and **`proxy.ts`** (Next.js 16 renamed middleware to Proxy — see spec §14a) enforcing §4 server-side.
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
