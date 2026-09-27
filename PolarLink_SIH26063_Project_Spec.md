 # PolarLink — SIH 2026 PS 26063 Project Specification

**For: Claude Code (or any coding agent building this).** This file is a complete, self-contained brief. Read it fully before writing any code. Where a decision was explicitly made by the team, it is marked **DECIDED**. Where something is a reasonable default that can be revisited, it is marked **ASSUMED**. Do not silently deviate from a DECIDED item; flag it to the user instead.

Generated: 2026-09-26. Team: P-JANN (Smart India Hackathon 2026).

---

## 1. Problem Statement (official, verbatim)

| Field | Value |
|---|---|
| Problem Statement ID | 26063 |
| Title | Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal |
| Description | Develop a comprehensive outreach portal that archives expedition reports, scientific datasets, publications, photographs, videos and institutional activities while generating content for websites and social media. |
| Organization | Ministry of Earth Sciences (MoES) |
| Department | National Centre for Polar and Ocean Research (NCPOR) |
| Category | Software |
| Theme | Smart Education |
| Official dataset/YouTube link | None provided by the organization |

**Read literally, the brief has two halves that most competing teams collapse into one:**
1. An **archive/repository** (expedition reports, datasets, publications, photos, videos, institutional activity records).
2. A **content generation** capability — turning that archive into ready-to-publish website and social media content.

Several existing public GitHub attempts at this exact PS (POLARIS-ncpor, SIH063-PolarCROSS, PolarVerse, polarform, PolarConnect, polar-science) read, from their public descriptions, as archive-only CRUD apps. The content-generation half of the brief is the differentiator this build should not skip.

---

## 2. Product name (ASSUMED)

Working name: **PolarLink**. Change freely — it's not load-bearing, just needed so file/repo/env names have something to reference. Replace every occurrence below if renamed.

---

## 3. Domain background (for realistic content, not fiction)

India's polar program, for grounding copy and demo data — verify specifics against ncpor.res.in before publishing anything as fact, but these are stable, well-known reference points:
- India's Antarctic Program began in 1981/82 (first expedition). Research stations: **Dakshin Gangotri** (first, now decommissioned/ice-buried), **Maitri** (operational since 1989), **Bharati** (operational since 2012).
- Arctic research station: **Himadri**, at Ny-Ålesund, Svalbard, Norway (since 2008).
- NCPOR also runs Himalayan/"third pole" cryosphere research (glaciers, snow cover).
- NCPOR publishes in outlets including *Polar Science* and produces annual reports and technical reports.
- There is **no confirmed public bulk open-data dump** from NCPOR that a student team can just download programmatically. Do not claim a live dataset feed exists. Seed the demo with a curated set of realistic sample records (real station names, real expedition numbering conventions, plausible report titles) and clearly label seed data as illustrative in any submission notes. If time allows, scrape/cite genuinely public NCPOR press material (with attribution) for a handful of real records to anchor credibility — do not fabricate quotes or attribute invented content to NCPOR.

---

## 4. Roles & permissions model — DECIDED (role-based/permissions-based app)

| Role | Access |
|---|---|
| **Public visitor** | Read-only. Browse/search archive, datasets, publications, media, institutional activity feed. No login required. |
| **Researcher / Contributor** | OAuth login required. Everything public visitors get, plus: submit expedition reports, dataset metadata, media, with a personal "My Submissions" tracker (draft / pending review / published / rejected states). Can edit only their own unpublished submissions. |
| **Editor / Moderator** | Everything above, plus: review queue for pending submissions, approve/reject/request-changes, and the **Content Generator** tool (draft website blurbs + social captions from an archive entry, edit, and publish). |
| **Admin** | Full control: user list, role assignment/approval, system configuration, audit log, analytics dashboard. |

New OAuth sign-ups land as **Public** by default. A user requests "Researcher" status (simple form: name, institutional affiliation, reason) which an Admin approves — this avoids self-elevated fake researcher accounts and is realistic for a government-affiliated portal.

Enforce this server-side (middleware/route guards), never just by hiding UI elements client-side.

---

## 5. OAuth — DECIDED: Google + GitHub + institutional-style

- **Google** — standard OAuth 2.0, broadest reach for the public.
- **GitHub** — standard OAuth 2.0, sensible for a tech-savvy hackathon jury and student researchers.
- **Institutional-style (ORCID-like)** — real academic identity portals (this is the credible reference point, not a guess) commonly support **ORCID** (orcid.org) OAuth for researcher identity. Recommended approach: register a real ORCID public API sandbox client (ORCID's public API has a sandbox mode, free to register) so the "institutional" login is a genuine OAuth integration and not a fake button. If sandbox registration proves impractical before the deadline, build the button behind a feature flag and clearly comment `// TODO: sandbox ORCID client pending` — never ship a login button that fakes success without a real provider behind it, since that is exactly the kind of fake-metric/fake-flow dishonesty the design brief explicitly bans in spirit.

**Auth library recommendation:** Auth.js (NextAuth v5) — has first-class Next.js App Router support, built-in Google/GitHub providers, and supports a custom OAuth provider config for ORCID (ORCID is a standard OAuth2/OIDC-shaped provider, so it fits Auth.js's generic OAuth provider interface). Store roles in your own database (Prisma) via the session callback, not in the OAuth provider's claims.

**Security baseline (student teams commonly get this wrong — don't):**
- Validate redirect URIs exactly; never use wildcard callback URLs.
- Store OAuth client secrets only in environment variables, never in client-side code or committed files.
- Use HttpOnly, Secure, SameSite cookies for session tokens (Auth.js does this by default — do not override it).
- CSRF protection on all state-changing routes (Auth.js provides this by default for its own routes; extend the same care to your own API routes).

---

## 6. Tech stack — DECIDED: Next.js + TypeScript

- **Framework:** Next.js (App Router), TypeScript throughout.
- **Styling/components:** Tailwind CSS + shadcn/ui (Radix primitives). This is the stack the Taste Skill ruleset explicitly expects and the Web Design Guidelines checklist below assumes (its own examples use Tailwind utility classes).
- **Animation & component libraries — DECIDED:**
  - **anime.js** (animejs.com) — lightweight JS animation engine for the hand-built animated sequences (the route-tracing map, timeline reveals, hero motion). Use it for anything the component libraries below don't already cover, keeping every animation on `transform`/`opacity` per §9 and gated behind `prefers-reduced-motion`.
  - **Skiper UI** (skiper-ui.com) — "un-common" animated components built specifically for Next.js + shadcn/ui + Tailwind, installed per-component via the shadcn CLI (`npx shadcn add @skiper-ui/<component>`), so it drops straight into the stack above with no extra dependency overhead. Free tier covers 24+ components; the paid tiers ($129 / $549 with Figma files) are optional, not required. **Caution:** Skiper UI's catalog includes an "image cursor trail" style component — do not use that one or anything like it; it is a direct cursor-follow animation, which is explicitly on the blocklist in §9. Pick components deliberately, not by grabbing the flashiest ones.
  - **Watermelon UI** (ui.watermelon.sh) — free, open-source React component/block/dashboard library, useful for landing-page section blocks and admin dashboard layouts without building every layout from scratch.
  - Treat all three as a source of building blocks to assemble and restyle to the institutional/scientific tone from §9's Taste Skill step, not as a template to ship unmodified — an unedited component-library look is still a form of generic templating.
- **Auth:** Auth.js (NextAuth v5).
- **ORM:** Prisma.
- **AI (optional, stretch goal) — DECIDED 2026-09-26:** Anthropic Claude API (via `@anthropic-ai/sdk`) as an opt-in enhancement to the Content Generator (§8.5). The required baseline stays rule-based/templated; the "Generate with AI" path is additive, not a replacement, and ships only if time allows after the rule-based baseline works end to end. Store `ANTHROPIC_API_KEY` server-side only, call it from a server action/route handler, never from the client.
- **Database & hosting — DECIDED: Vercel + Neon/Supabase Postgres.** Use Neon or Supabase (either is fine; Supabase also gives you file storage for media uploads out of the box, which this project needs — lean toward **Supabase** for that reason: Postgres + Storage + Auth-adjacent tooling in one place, generous free tier, and it's on the GitHub Student Developer Pack offers list).
- **File/media storage:** Supabase Storage (or Vercel Blob as a fallback) for uploaded expedition photos/videos/report PDFs.
- **Search:** Postgres full-text search (`tsvector`) is sufficient for hackathon scope — don't over-engineer with a separate search service unless time allows.
- **Testing/QA:** Playwright (via the `playwright-cli` tool, see §12) for end-to-end and visual QA passes.
- **Deployment:** Vercel (app), Supabase (DB + storage).

---

## 7. Data model (entities)

Design Prisma models covering at minimum:

- `User` (id, name, email, image, role: PUBLIC | RESEARCHER | EDITOR | ADMIN, affiliation, researcherStatus: NONE | PENDING | APPROVED | REJECTED, createdAt)
- `Account` / `Session` (Auth.js standard tables)
- `Expedition` (id, name, program: ANTARCTIC | ARCTIC | HIMALAYAN, station, startDate, endDate, summary, reportFileUrl, status: DRAFT | PENDING | PUBLISHED, submittedById, publishedAt)
- `Dataset` (id, title, description, topic tags, collectionDate, format, fileUrl or externalUrl, license, linkedExpeditionId, status, submittedById)
- `Publication` (id, title, authors, year, abstract, doiOrUrl, linkedExpeditionId, status)
- `MediaAsset` (id, type: PHOTO | VIDEO, url, caption, altText — required, tags, linkedExpeditionId, uploadedById, status)
- `InstitutionalActivity` (id, title, date, description, coverImageUrl, status)
- `GeneratedContent` (id, sourceType, sourceId, kind: WEBSITE_BLURB | SOCIAL_CAPTION, method: RULE_BASED | AI_ASSISTED, draftText, editedText, shareImageUrl, status: DRAFT | PUBLISHED, generatedById, publishedById)
- `AuditLog` (id, actorId, action, targetType, targetId, timestamp)

Every content table needs a `status` field driving the review workflow (draft → pending → published/rejected) tied to the roles in §4.

---

## 8. Feature list by area

### 8.1 Landing page (public, unauthenticated)
- Hero: 1–3 line, plain-language headline stating exactly what the portal is and does. No vague aspirational copy.
- Scroll- or autoplay-driven (not cursor-following) animated map/route visualization of India's Antarctic/Arctic/Himalayan sites — `transform`/`opacity` only, respects `prefers-reduced-motion`, has a pause control if the loop runs past 5 seconds.
- Real, computed stats block (expeditions archived / datasets indexed / publications catalogued / media items), pulled live from row counts — never hardcoded.
- Featured-content strip: latest published expedition, dataset, and media set.
- Two CTAs: "Explore the Archive" (public browse) and "Researcher Sign In" (OAuth).
- Footer: links to Terms of Service, Privacy Policy, and contact/attribution info. No fake social proof, no fake review carousel.

### 8.2 Auth
- Sign-in page: three OAuth buttons (Google, GitHub, ORCID/institutional), clear plain labels ("Continue with Google", not vague "Sign in").
- Post-login: Public users land on their dashboard with a visible "Request Researcher Access" action; Researchers see "My Submissions"; Editors see "Review Queue" + "Content Generator"; Admins see "Admin Console".

### 8.3 Archive & discovery (all users)
- Unified search with facets (type, program/station, year, tags).
- Expedition detail pages: metadata, report PDF viewer/download, linked datasets, linked media gallery, linked publications.
- Dataset catalog: filterable list, metadata cards, download/external link.
- Publications library: filterable list, abstract, citation copy/export (BibTeX).
- Media gallery: tag-filterable grid, lightbox viewer, attributed download.
- Interactive map of stations/expedition routes, clickable through to detail pages.
- Program timeline (1981–present).
- Institutional activities feed (chronological, filterable by type).

### 8.4 Researcher tools
- Submission forms for expedition report / dataset / media / publication, each with the full metadata fields from §7.
- "My Submissions" table with status badges and edit access while still in draft.

### 8.5 Editor tools
- Review queue: pending items across all content types, approve/reject/request-changes with a comment.
- **Content Generator** (the differentiator): pick a published expedition/dataset/media set → generate a draft website blurb and a draft social caption from its stored metadata and summary text → editor edits inline → publish (stored in `GeneratedContent`, surfaced on the landing page's featured-content strip and available as copyable text for actual social posting).
  - **Baseline (required) — DECIDED:** a real templated/rule-based generator over the stored structured data (title, program, station, dates, summary). This must exist and work end to end regardless of what follows below.
  - **Stretch goal (optional) — DECIDED 2026-09-26:** an additional "Generate with AI" action on the same screen that calls the Claude API (§6) with the item's structured metadata + summary as context, producing an alternative draft the editor can pick over the rule-based one. Ship this only after the rule-based baseline is fully working — it is additive, never a replacement, and never the only path (if the API key is missing or the call fails, the rule-based draft must still be available).
  - Either path: never present unlabelled generated prose as if NCPOR wrote it. Every draft — rule-based or AI-assisted — is tagged with its `method` (§7) and shown with a visible "Draft — review before publishing" label until an editor explicitly publishes it.
  - **Share image:** alongside the text draft, generate an Open Graph share image for the source item via a Next.js `opengraph-image` route (templated card: cover photo/media thumbnail + title + program/station, matching the locked design language from §12 step 2). Store its URL on `GeneratedContent.shareImageUrl` so the editor gets an actual shareable visual to go with the caption, not text alone — this directly serves the PS's "generating content for... social media" requirement rather than just producing copy.

### 8.6 Admin tools
- User list with role/researcher-status management and approval actions.
- Audit log viewer.
- Basic analytics (content counts by type/status, most-viewed items) — computed from real data, not simulated.

### 8.7 Static/legal pages
- Terms of Service.
- Privacy Policy — must disclose: what OAuth providers are used and what data is received from them (name, email, avatar), that this is a hackathon prototype not a production government service, cookie/session usage, no third-party data sale, contact info, and a plain note referencing India's Digital Personal Data Protection Act, 2023 (DPDP Act) given it processes personal data of Indian users via OAuth.
- Simple "About this project" / attribution page — no "Made with [AI tool]" badge anywhere in the shipped app, including in generated `<meta>` tags, footers, or default template boilerplate. Check every scaffold/template used for a default attribution badge and remove it.

### 8.8 Public API / syndication feed — DECIDED 2026-09-26

Added to reinforce the "dissemination portal" half of the brief: the web UI is not the only surface external channels should be able to pull from.

- Read-only, unauthenticated, published-content-only:
  - `GET /api/public/expeditions`, `/api/public/datasets`, `/api/public/publications`, `/api/public/media`, `/api/public/activities` — paginated JSON, only `status: PUBLISHED` rows, no PII (no submitter/reviewer identity beyond what's already public-facing).
  - `GET /api/public/feed.xml` — RSS 2.0 feed of newly published content across all types (title, link, pubDate, description from `GeneratedContent`/summary), sorted newest first.
- Rate-limit these routes (a simple in-memory or edge-middleware limiter is sufficient for hackathon scope) since they're unauthenticated and publicly reachable.
- No write access of any kind through this surface — read-only, full stop.
- This is scoped as a small addition, not a general-purpose public API product: no API keys, no versioning scheme, no SLA — just enough for NCPOR's own site or a social-media bot to realistically pull published content.

---

## 9. Design system & anti-slop rules — merge of Taste Skill + Web Design Guidelines + explicit blocklist

Treat every line below as a checklist item the build must honestly pass, not aspirational guidance.

**Explicit blocklist (DECIDED, non-negotiable):**
no purple gradients · no pill-shaped buttons · no fake reviews · no fake metrics/counters · no vague hero text · no emoji icons · no em dashes anywhere in copy · no AI-slop-looking stock photography · no AI-slop-sounding copy · no cursor-follow animations · no fake consumer/user counters.

**From the Web Design Guidelines checklist (apply throughout, not just on the landing page):**
- Accessibility: icon-only buttons need `aria-label`; every form control needs a real `<label>`; use `<button>` for actions and `<a>`/`<Link>` for navigation, never `<div onClick>`; images need `alt` (empty string if purely decorative); async UI updates use `aria-live="polite"`.
- Focus: visible focus via `focus-visible:ring-*`; never `outline-none` without a replacement.
- Forms: `autocomplete` + meaningful `name` + correct `type`/`inputmode`; never block paste; inline errors, focus the first error on submit; submit buttons stay enabled until the request actually starts, then show a spinner.
- Animation: only `transform`/`opacity`; honor `prefers-reduced-motion`; never `transition: all`; any autoplay motion over 5 seconds needs a pause/stop control.
- Typography: real ellipsis `…` and curly quotes; `text-wrap: balance` on headings; tabular numerals for number columns.
- Content handling: truncate/clamp long text safely; design real empty states; test with short, average, and very long sample content.
- Images: explicit `width`/`height` on every `<img>`; lazy-load below the fold, priority-load the hero image.
- Copy: active voice ("Save API Key," not "Continue"); Title Case headings/buttons; numerals for counts; second person; specific, non-vague labels everywhere.
- URL reflects state for filters/tabs/pagination on the archive/search pages.
- Dark mode: `color-scheme` set correctly, contrast/hierarchy parity in both themes (this is also a direct Taste Skill requirement — dual-mode by default).

**From Taste Skill (process discipline, apply to how the build is done, not just the output):**
- Before generating any screen, explicitly name the inferred industry/audience/mood/motion-depth/layout family for that screen (a government science-outreach portal reads very differently from a consumer SaaS landing page — keep it credible and institutional, not startup-glossy).
- Pick shadcn/Radix/Tailwind as the concrete design system (already decided in §6) and stay consistent — no per-page style drift.
- Run the "hard pre-flight check" before calling any screen done: does it honestly avoid every anti-pattern above, in both light and dark mode, at mobile and desktop width?

**From the Image-to-Code skill (once real reference mockups exist):**
- Build one section at a time against its own reference image, not a compressed multi-section board.
- Hero sections: cinematic, clean, 1–3 headline lines, no unnecessary pills/micro-labels, readable on small laptop viewports.
- Avoid cards-inside-cards-inside-cards nesting, giant rounded containers everywhere, and dashboard clutter with pseudo-technical labels.

---

## 10. Deployment, domain, favicon, badge removal

1. **Custom domain:** GitHub Student Developer Pack includes a free domain year via Namecheap (typically a `.me` domain) — register one and point it at the Vercel deployment (Vercel's dashboard gives the exact A/CNAME records to add at your registrar's DNS panel).
2. **Favicon:** generate a proper multi-size favicon set (not just a single `.ico`) — use a tool like RealFaviconGenerator from a simple vector mark, and include the standard `<link rel="icon">` tags plus `apple-touch-icon` and a web manifest for mobile home-screen icons.
3. **Remove "made with AI" / template attribution badges:** whatever starter template or scaffolding tool is used, explicitly search the generated project for any default attribution badge/link (these are typically template defaults, not platform requirements, and are safe to delete) and remove it before the final build — check the root layout, footer component, and `<head>` metadata.
4. **Vercel:** no "Powered by Vercel" badge appears on a real custom-domain deployment by default; if a chosen template adds one, remove it the same way.

---

## 11. Prerequisites — install before starting

- Node.js 20+ and a package manager (pnpm recommended).
- Git, GitHub CLI (`gh`) — team already has GitHub Student Pack access.
- Vercel CLI (`npm i -g vercel`).
- A Supabase project (free tier) — get the Postgres connection string and Storage credentials.
- Prisma CLI (`npx prisma`).
- Playwright + `playwright-cli` (`npm i -D @playwright/test` and follow github.com/microsoft/playwright-cli setup) for automated QA against the design checklist in §9.
- OAuth app registrations, done before writing auth code:
  - Google Cloud Console → OAuth 2.0 client (Web application), authorized redirect URI `https://<domain>/api/auth/callback/google`.
  - GitHub → Developer Settings → OAuth Apps, callback URL `https://<domain>/api/auth/callback/github`.
  - ORCID → register at orcid.org/developer-tools for a sandbox public API client.
- A registered custom domain (via Namecheap/Student Pack or otherwise).

### Environment variables (`.env`)
```
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
ORCID_CLIENT_ID=
ORCID_CLIENT_SECRET=
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 12. Build plan (phased, in order)

1. **Scaffold** — Next.js + TypeScript + Tailwind + shadcn init. Set up Prisma with the schema from §7, connect to Supabase Postgres, run first migration.
2. **UI direction prototyping — DECIDED, and this gates everything visual that follows.** Before building any real page, produce **3 distinct static mockups of the landing page** (same content, different visual direction — e.g. one built mostly with Watermelon UI blocks, one leaning on Skiper UI's animated components, one hand-built with anime.js-driven motion) as plain HTML/React preview routes. Use `playwright-cli` to capture full-page screenshots of each mockup in both light and dark mode. Present all screenshots together and **stop and wait for the user to pick one direction (or specify a merge of elements) before scaffolding any further page.** Do not proceed past this point on an assumed direction — this is the one open-ended creative decision in this whole spec that should not be guessed. Once a direction is picked, treat it as the locked design language (colors, type scale, motion style, component sourcing) for every subsequent screen.
3. **Auth** — wire Auth.js with Google + GitHub first (ORCID once its sandbox client is approved), session callback attaching role/researcherStatus, middleware enforcing the role matrix from §4 on every protected route.
4. **Core CRUD + review workflow** — expeditions, datasets, publications, media, institutional activities, all with the draft→pending→published/rejected states and role-gated actions.
5. **Public archive & search** — browse/search/filter pages, expedition/dataset/publication detail pages, media gallery, map, timeline, all built in the locked design language from step 2.
6. **Content Generator** — the differentiating tool from §8.5: rule-based baseline first and fully working, then the OG share-image route, then the optional AI-assisted draft path last (only if time remains).
6a. **Public API / RSS** — the read-only endpoints and feed from §8.8. Low priority relative to steps 1–8; do this after the core app works, not before.
7. **Content seeding** — populate with the curated realistic sample data from §3, clearly noting in a `SEED_DATA_NOTE.md` (or similar) which records are illustrative vs sourced from genuinely public material.
8. **Full landing page build + design pass** — implement the chosen direction from step 2 for real, against the checklist in §9; run the Taste Skill "hard pre-flight check" on each screen; verify light and dark mode both.
9. **Legal pages** — Terms of Service, Privacy Policy per §8.7.
10. **QA pass** — use `playwright-cli` to script through every role's core flows (public browse, researcher submit, editor review + generate content, admin manage users) and to visually check against the anti-pattern list in §9 (focus states, reduced-motion behavior, form behavior, empty states, long-content handling).
11. **Deploy & polish** — Vercel deploy, connect custom domain, add favicon set, strip any attribution badges, final read-through against the explicit blocklist in §9 with fresh eyes.

---

## 13. Definition of done

- Every item in the §9 blocklist is verifiably absent (a reviewer should be able to check the list against the live site and find nothing).
- Every role in §4 can complete its full flow end to end.
- Public visitor requires no login for any read path.
- OAuth works for all three configured providers, or the ORCID button is feature-flagged off with a visible `// TODO` rather than faking success.
- Landing page stats are computed from the database, not literals in the code.
- Custom domain resolves, favicon appears correctly on desktop and mobile, no template attribution badge anywhere.
- Terms of Service and Privacy Policy pages exist and are linked from the footer on every page.
- Playwright test suite passes for the core flow of each role.
- The user explicitly picked a UI direction from generated mockups (build plan step 2) before the full app was built on top of it — nothing visual was decided unilaterally. **Done 2026-09-26 — see §14a's "UI direction" entry for what was picked.**
- The Content Generator's rule-based baseline works end to end and produces a share image, regardless of whether the optional AI-assisted path shipped.
- `/api/public/*` endpoints and `/api/public/feed.xml` (§8.8) return only published content, are read-only, and are rate-limited.

---

## 14a. Implementation notes — environment realities found during scaffolding (2026-09-26)

The toolchain available at build time is newer than this spec assumed, and two of the DECIDED tools changed shape enough to need a documented adjustment. Read this before touching auth or the database.

- **Next.js 16 renamed Middleware to Proxy.** Everywhere this spec or common Next.js tutorials say "middleware.ts" (§5's route guards, §12 step 3's "middleware enforcing the role matrix"), the file is now `proxy.ts` at the project root (or inside `src/`), exporting a `proxy()` function instead of `middleware()`. Functionality is identical, only the name and file changed. Confirmed against the Next.js 16.3.6 docs bundled in `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`.
- **shadcn/ui's CLI now defaults to Base UI, not Radix.** Running `npx shadcn@latest init -d` picks the new `base-nova` preset built on `@base-ui/react`. Since this spec explicitly says "shadcn/ui (Radix primitives)," the project was initialized with `npx shadcn@latest init -t next -b radix -p nova` instead, which produces the `radix-nova` style on `radix-ui`. Use `-b radix` on every future `shadcn add` if that ever matters (it shouldn't — the base is a project-wide setting from `components.json`).
- **Prisma's CLI changed dramatically past v7.** `npm install prisma` with no version pin grabs `8.0.0-rc.*`, a pre-release "Prisma Platform" CLI (`prisma deploy`, `prisma project`, `prisma branch`, etc.) with a completely different command surface than the classic ORM workflow this spec assumes. The project is pinned to **Prisma `7.10.0`** instead (the latest actual stable release) — do not run `npm i prisma@latest` without re-checking this. Even at 7.10.0, the classic workflow changed:
  - `schema.prisma`'s `datasource` block no longer accepts `url` or `directUrl` — it's just `provider = "postgresql"`.
  - Connection URLs for the CLI (migrate/studio/introspect) now live in **`prisma7.config.ts`** at the project root (the filename is version-pinned by design — `prisma7.config.ts`, not `prisma.config.ts` — so a future major-version upgrade can coexist). It needs `import "dotenv/config"` since env files aren't auto-loaded anymore.
  - The generator defaults to `provider = "prisma-client"` (a newer ESM-style client), output to `src/generated/prisma` (gitignored) rather than living only inside `node_modules`.
  - **`PrismaClient` now requires an explicit driver adapter** — it no longer reads `DATABASE_URL` implicitly. This project uses `@prisma/adapter-pg` (`pg` under the hood): see `src/lib/db.ts`, which builds `new PrismaPg({ connectionString: process.env.DATABASE_URL })` and passes it as `new PrismaClient({ adapter })`.
  - **Env var split, matching Supabase's pooled-vs-direct pattern:** `DATABASE_URL` (pooled connection, port 6543 on Supabase) is read by the runtime adapter in `src/lib/db.ts`; `DIRECT_URL` (direct connection, port 5432) is read by `prisma7.config.ts` for `migrate`/`studio`/`introspect`, which need a stable session Postgres' pooler doesn't reliably give. Both still appear in `.env.example` under the same names §11 specified.
- None of this changes any DECIDED product/design/role/feature decision in this spec — it's purely "the same stack, newer patch/major versions than assumed." Treat this section as authoritative over any conflicting instruction elsewhere in this document about middleware filenames or Prisma schema syntax.
- **Turbopack dev-server HMR can go stale after large-scale file restructuring.** After moving/deleting many files across modules in one session (as happened when promoting a mockup to the real page), the running `next dev` server rendered every full-bleed background image as solid black even though the network requests for those images returned 200. A full stop (`taskkill /IM node.exe /F` on Windows) and restart of `next dev` fixed it immediately — the production build (`next build`) was correct the whole time, so this is purely a dev-server cache/HMR issue, not a code bug. If a screenshot ever looks wrong in a way the code doesn't explain, restart the dev server before assuming the code is broken.

### UI direction — DECIDED 2026-09-26

**Direction 4 ("cinematic documentary") is the locked design language**, superseding the three build-plan-step-2 mockups (all since deleted from the tree; git history has them if ever needed). Landing page structure, top to bottom:
1. Full-bleed hero: real photo (aurora over Ny-Alesund, Svalbard) with a continuous Ken Burns zoom + scroll parallax, bold `text-7xl font-extrabold` headline.
2. Three full-bleed program sections (Antarctic / Arctic / Himalayan), each running its own crossfading slideshow of 2-4 real licensed photos, program-tinted gradient overlay, `text-6xl font-extrabold` heading.
3. Stats strip, featured-content strip, footer — unchanged from the original landing-page spec in §8.1, following the site's light/dark toggle (only the photo sections stay permanently dark/cinematic regardless of toggle state).

This direction was arrived at through user-provided reference (a Framer site the user liked for its full-bleed image transitions), explicitly NOT adopted for its actual look (dark/red/black comic-streetwear aesthetic, which would have violated this spec's institutional-credibility requirement) — only its interaction mechanic was borrowed, restyled with real polar photography and a bolder-than-originally-planned type scale. See §14a for the Watermelon UI finding that fed into this same decision-making process.

All photography is real and licensed (not stock/AI-generated), organized under `public/images/{antarctic,arctic,himalayan,hero}/` and cataloged with license/attribution in `src/lib/image-credits.ts` — this feeds the About/attribution page requirement in §8.7. None of it is an actual NCPOR photograph; treat every current image as an illustrative placeholder to be swapped for real NCPOR/expedition photography per §3 and §14's open items.

### Database migrations run via GitHub Actions, not locally — DECIDED 2026-09-26

The dev machine's network blocks outbound Postgres ports (5432/6543) entirely — confirmed at the raw TCP level, not a Prisma/Supabase-specific issue. A mobile-hotspot fallback also failed, for an unrelated reason (broken IPv4 routing on that connection). Rather than keep fighting local network configuration, migrations run through `.github/workflows/db-migrate.yml`, a manual-trigger-only (`workflow_dispatch`) GitHub Actions workflow that runs `npx prisma migrate deploy` against Supabase using `DATABASE_URL`/`DIRECT_URL` repo secrets. The first migration (`20260926170629_init`) was applied this way; its `migration.sql` was reconstructed locally afterward via `prisma migrate diff --from-empty --to-schema` (schema-only, no DB connection needed) since the Actions runner's checkout doesn't persist back to git on its own. See memory.md's "Session tooling notes" for the exact commands to add future migrations the same way. This doesn't change the DECIDED Supabase/Prisma stack — it's an operational workaround for one developer's network, worth revisiting if the team works from a different network.
- **Watermelon UI's real catalog doesn't fit this project directly — DECIDED 2026-09-26.** Inspected via `npx shadcn search @watermelon-ui` (1178 items) and `npx shadcn view @watermelon-ui/<name>`. Its `landing-01` and `hero1` blocks are built for Vite + React Router (not Next.js App Router), pull in a fake testimonials section, AI-agent-selector widgets, random Unsplash filler images, and pink/purple gradient styling — several of which directly violate the §9 blocklist (no fake reviews, no purple gradients, no AI-slop stock photography). Skiper UI's catalog, by contrast, checked out fine: self-contained interactive widgets with no baked-in fake content. Decision: the Watermelon-led mockup direction (build plan step 2) uses Watermelon UI only as **layout/structure inspiration, hand-rebuilt** — no blocks installed from its registry as-is. Skiper UI components are still installed and used directly where they fit (excluding the already-blocklisted cursor-follow ones).

---

## 14. Open items to revisit with the team (not blocking, but don't forget)

- ORCID sandbox client approval timing — if it slips past the deadline, ship with the feature flag off rather than delay everything else.
- Exact real NCPOR content to cite for the "handful of real anchor records" mentioned in §3 — someone should spend an hour on ncpor.res.in and MoES press releases for a few genuinely real, attributable facts to mix into the otherwise-illustrative seed data.
- Final product name (currently the placeholder "PolarLink").
- If the AI-assisted Content Generator path (§8.5 stretch goal) ships, budget time to sanity-check Claude API output against the §9 blocklist tone (no AI-slop-sounding copy) before it's ever shown to an editor as a selectable draft.
- §6's three animation/component libraries (anime.js, Skiper UI, Watermelon UI) were reviewed on 2026-09-26 and kept as originally specified — if the step-2 mockup gate runs short on time, trimming to fewer sources is the fallback, not the default.
