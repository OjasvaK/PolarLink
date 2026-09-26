# Seed data note

PolarLink ships with a small set of **illustrative sample records** so the
archive, search, map, timeline, Content Generator and public API can be
demonstrated before real NCPOR material is loaded. This note says exactly
what is real and what is not.

The data lives in [`prisma/seed/sample-data.sql`](prisma/seed/sample-data.sql).

## How sample records are marked

- Every seeded row has `isSample = true` and is owned by the user
  `PolarLink sample data` (no email; it can't sign in).
- The site shows a **"Sample data"** badge on these records in the archive,
  on their detail pages (with a sentence saying they are not official NCPOR
  records) and on the landing page's "Recently published" cards.
- The public API returns `"isSample": true` on each of them.

## What is real

- **Programs, stations and their coordinates**: Antarctic (Dakshin Gangotri,
  Maitri, Bharati), Arctic (Himadri, Ny-Alesund) and Himalayan (Himansh,
  Chandra basin). These are facts about the stations, also used by the
  station map (`src/lib/stations.ts`).
- **Program milestones on the timeline** (`src/lib/milestones.ts`), such as
  the first expedition in 1981 and the years each station opened. These are
  not seed data; they are fixed content based on well-documented public
  events and should still be checked by the team before submission.
- **All photographs.** Media rows reuse the licensed Wikimedia Commons photos
  already in `public/images`, each credited in its caption and catalogued in
  `src/lib/image-credits.ts`. None of them are NCPOR photographs.

## What is illustrative

- **Expeditions (6)**: realistic campaigns at real stations, but the names,
  dates and summaries are invented for the demo. They deliberately avoid
  official expedition numbering (for example "44th ISEA").
- **Datasets (6)**: describe the kind of data such campaigns produce. They
  have **no download files or links**, so no measurement values are
  fabricated.
- **Publications (5)**: plausible titles and abstracts with placeholder
  authors ("Sample Author A" and so on) and **no DOIs**, so they can't be
  mistaken for, or cited as, real papers.
- **Institutional activities (3)**: generic events (a pre-departure briefing,
  a school open day, a data workshop) with invented dates.
- **Media links to expeditions**: the photos are real, but which sample
  expedition a photo is attached to is illustrative. Some photos (the Adelie
  penguins in the Ross Sea, Pindari and Gaumukh glaciers) are shown without
  an expedition because they aren't from Indian stations or the Chandra basin.

## Loading and removing

```sh
# Local Docker database (safe to re-run; it replaces earlier sample rows)
docker compose exec -T db psql -U polarlink -d polarlink < prisma/seed/sample-data.sql
```

For Supabase, paste the file into the SQL editor only when demo content is
wanted there. To remove all sample content, delete rows where `"isSample"`
is true (the first statements of the seed file do exactly this), then
delete the `sample-data-user` user.

## Replacing with real content

Real records should come in through the normal researcher submission and
editor review workflow, not through SQL. Once enough real material is
published, remove the sample rows as described above. Real NCPOR expedition
photography should also replace the illustrative Wikimedia photos on the
landing page when it becomes available.
