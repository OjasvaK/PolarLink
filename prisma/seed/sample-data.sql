-- PolarLink illustrative sample data (build plan step 9). See SEED_DATA_NOTE.md.
--
-- Every row here has "isSample" = true and is shown with a "Sample data"
-- badge. Station names, programs and coordinates are real; the expeditions,
-- datasets, publications and activities themselves are illustrative, and
-- no row claims to be an official NCPOR record. Media rows reuse the
-- licensed, credited Wikimedia Commons photos already in /public/images.
--
-- Idempotent: re-running replaces the previous sample rows.
--   Local:      docker compose exec -T db psql -U polarlink -d polarlink < prisma/seed/sample-data.sql
--   Supabase:   paste into the SQL editor (only when you want demo content there)

BEGIN;

DELETE FROM "GeneratedContent" WHERE "sourceId" LIKE 'sample-%';
DELETE FROM "Review" WHERE "targetId" LIKE 'sample-%';
DELETE FROM "MediaAsset" WHERE "isSample";
DELETE FROM "Dataset" WHERE "isSample";
DELETE FROM "Publication" WHERE "isSample";
DELETE FROM "InstitutionalActivity" WHERE "isSample";
DELETE FROM "Expedition" WHERE "isSample";

-- Owner of every sample row. No email, never signs in.
INSERT INTO "User" (id, name, role, "researcherStatus", affiliation)
VALUES ('sample-data-user', 'PolarLink sample data', 'RESEARCHER', 'APPROVED', 'Illustrative records')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Expeditions
-- ---------------------------------------------------------------------------
INSERT INTO "Expedition" (id, name, program, station, "startDate", "endDate", summary, status, "submittedById", "isSample", "publishedAt", "updatedAt") VALUES
('sample-exp-bharati-2324', 'Bharati summer glaciology campaign 2023-24', 'ANTARCTIC', 'Bharati', '2023-11-20', '2024-03-05',
$$A summer campaign based at Bharati in the Larsemann Hills, focused on the margin of the East Antarctic ice sheet. The team re-measured a network of mass-balance stakes on the ice margin, ran ground-penetrating radar profiles to map ice thickness near the coast, and serviced the station's automatic weather station.

Work was organised around short field trips from the station by snow vehicle, with daily weather briefings deciding which sites were reachable.$$,
'PUBLISHED', 'sample-data-user', true, '2024-06-12', now()),

('sample-exp-maitri-winter-2022', 'Maitri wintering team 2022', 'ANTARCTIC', 'Maitri', '2022-02-10', '2023-01-25',
$$A year-round team at Maitri in the Schirmacher Oasis kept the station's long-running observations going through the polar night: surface ozone, aerosol and meteorological measurements, and geomagnetic recordings.

The winter period also covered station maintenance and preparation for the incoming summer team.$$,
'PUBLISHED', 'sample-data-user', true, '2023-04-03', now()),

('sample-exp-schirmacher-lakes-2122', 'Schirmacher Oasis lake survey 2021-22', 'ANTARCTIC', 'Maitri', '2021-12-05', '2022-02-20',
$$A summer survey of freshwater lakes in the Schirmacher Oasis near Maitri. The team sampled lake water for major-ion chemistry and nutrients, measured temperature and conductivity profiles, and photographed microbial mats at lake margins.

The oasis lakes are ice-covered for most of the year, so sampling was timed for the short period of open water.$$,
'PUBLISHED', 'sample-data-user', true, '2022-08-18', now()),

('sample-exp-himadri-2023', 'Himadri summer field season 2023', 'ARCTIC', 'Himadri', '2023-06-10', '2023-08-30',
$$A summer season at Himadri in Ny-Alesund, Svalbard. The team collected water-column profiles in Kongsfjorden, monitored the fronts of nearby tidewater glaciers, and ran aerosol measurements from the research village.

Boat-based sampling was shared with other stations in Ny-Alesund, which coordinate their fieldwork in the fjord.$$,
'PUBLISHED', 'sample-data-user', true, '2023-11-07', now()),

('sample-exp-kongsfjorden-2022', 'Kongsfjorden mooring recovery 2022', 'ARCTIC', 'Himadri', '2022-07-01', '2022-07-28',
$$A short Arctic campaign to recover and redeploy an oceanographic mooring in Kongsfjorden, which records temperature, salinity and currents through the year.

The recovered instruments' data were quality-checked at Himadri before the mooring was redeployed for the following year.$$,
'PUBLISHED', 'sample-data-user', true, '2022-12-01', now()),

('sample-exp-chandra-2023', 'Chandra basin glacier monitoring 2023', 'HIMALAYAN', 'Himansh', '2023-09-01', '2023-10-15',
$$An end-of-season visit to glaciers in the Chandra basin, Himachal Pradesh, supported from Himansh. The team measured the stake network used to calculate annual mass balance, surveyed the glacier snout, and downloaded data from automatic weather and discharge stations.

End-of-season measurements close out the glaciological year, when summer melt has finished and before fresh snow covers the stakes.$$,
'PUBLISHED', 'sample-data-user', true, '2024-01-22', now());

-- ---------------------------------------------------------------------------
-- Datasets (no downloadable files: these describe what a real dataset
-- record looks like without inventing measurement values)
-- ---------------------------------------------------------------------------
INSERT INTO "Dataset" (id, title, description, tags, "collectionDate", format, license, "linkedExpeditionId", status, "submittedById", "isSample", "publishedAt", "updatedAt") VALUES
('sample-ds-bharati-aws', 'Bharati automatic weather station, hourly records 2023-24',
$$Hourly air temperature, pressure, relative humidity, wind speed and wind direction from the automatic weather station at Bharati, covering the 2023-24 summer campaign. Includes a data-quality flag for each value.$$,
'{meteorology,"weather station",Antarctica}', '2024-03-01', 'CSV', 'CC BY 4.0', 'sample-exp-bharati-2324', 'PUBLISHED', 'sample-data-user', true, '2024-06-20', now()),

('sample-ds-larsemann-gpr', 'Ground-penetrating radar profiles, Larsemann Hills ice margin',
$$Radar profiles of ice thickness along survey lines on the ice-sheet margin near Bharati, with GPS positions for each trace and a processing log describing filters and velocity assumptions.$$,
'{glaciology,"ice thickness",radar}', '2024-01-15', 'SEG-Y', 'CC BY 4.0', 'sample-exp-bharati-2324', 'PUBLISHED', 'sample-data-user', true, '2024-07-02', now()),

('sample-ds-maitri-ozone', 'Maitri surface ozone and aerosol observations 2022',
$$Continuous surface ozone concentrations and aerosol optical depth measured at Maitri through 2022, including the polar night. Provided as daily files with instrument calibration notes.$$,
'{atmosphere,ozone,aerosols}', '2022-12-31', 'NetCDF', 'CC BY 4.0', 'sample-exp-maitri-winter-2022', 'PUBLISHED', 'sample-data-user', true, '2023-05-10', now()),

('sample-ds-schirmacher-lakes', 'Schirmacher Oasis lake water chemistry 2021-22',
$$Major ions, nutrients, pH and conductivity for water samples from freshwater lakes in the Schirmacher Oasis, with sampling depth, coordinates and date for each sample.$$,
'{limnology,"water chemistry",Antarctica}', '2022-01-20', 'CSV', 'CC BY 4.0', 'sample-exp-schirmacher-lakes-2122', 'PUBLISHED', 'sample-data-user', true, '2022-09-05', now()),

('sample-ds-kongsfjorden-ctd', 'Kongsfjorden CTD profiles, summer 2023',
$$Conductivity, temperature and depth profiles from stations along Kongsfjorden, collected during the 2023 summer season at Himadri.$$,
'{oceanography,CTD,Arctic}', '2023-07-20', 'NetCDF', 'CC BY 4.0', 'sample-exp-himadri-2023', 'PUBLISHED', 'sample-data-user', true, '2023-12-04', now()),

('sample-ds-chandra-stakes', 'Chandra basin glacier mass-balance stakes 2023',
$$Stake readings, snow-pit densities and survey positions used to compute the 2022-23 glaciological mass balance of a benchmark glacier in the Chandra basin.$$,
'{glaciology,"mass balance",Himalaya}', '2023-10-05', 'CSV', 'CC BY 4.0', 'sample-exp-chandra-2023', 'PUBLISHED', 'sample-data-user', true, '2024-02-14', now());

-- ---------------------------------------------------------------------------
-- Publications (no DOIs: none of these are real papers)
-- ---------------------------------------------------------------------------
INSERT INTO "Publication" (id, title, authors, year, abstract, "linkedExpeditionId", status, "submittedById", "isSample", "publishedAt", "updatedAt") VALUES
('sample-pub-bharati-seb', 'Summer surface energy balance at a coastal East Antarctic station',
'{"Sample Author A","Sample Author B"}', 2025,
$$Using automatic weather station data from the 2023-24 summer at Bharati, we estimate the components of the surface energy balance and discuss the role of katabatic winds and cloud cover in surface melt near the coast.$$,
'sample-exp-bharati-2324', 'PUBLISHED', 'sample-data-user', true, '2025-02-10', now()),

('sample-pub-maitri-ozone', 'Seasonal cycle of surface ozone at Maitri, Queen Maud Land',
'{"Sample Author C","Sample Author D","Sample Author E"}', 2024,
$$A full year of surface ozone observations from Maitri shows a winter maximum and spring depletion events. We relate the depletion episodes to air-mass history and sea-ice exposure.$$,
'sample-exp-maitri-winter-2022', 'PUBLISHED', 'sample-data-user', true, '2024-03-19', now()),

('sample-pub-schirmacher-lakes', 'Water chemistry of freshwater lakes in the Schirmacher Oasis',
'{"Sample Author F","Sample Author G"}', 2023,
$$We describe the major-ion chemistry of lakes across the Schirmacher Oasis and show how distance from the ice sheet and the sea shapes their composition.$$,
'sample-exp-schirmacher-lakes-2122', 'PUBLISHED', 'sample-data-user', true, '2023-06-27', now()),

('sample-pub-kongsfjorden', 'Freshwater input and water-column structure in Kongsfjorden, Svalbard',
'{"Sample Author H","Sample Author A"}', 2024,
$$Summer CTD profiles from Kongsfjorden are used to trace glacial meltwater through the fjord and to examine how it affects stratification near tidewater glacier fronts.$$,
'sample-exp-himadri-2023', 'PUBLISHED', 'sample-data-user', true, '2024-05-08', now()),

('sample-pub-chandra-mb', 'Recent mass balance of a benchmark glacier in the Chandra basin',
'{"Sample Author I","Sample Author J"}', 2024,
$$Stake and snow-pit measurements are combined to estimate the annual mass balance of a benchmark glacier in the Chandra basin and to compare it with the regional record.$$,
'sample-exp-chandra-2023', 'PUBLISHED', 'sample-data-user', true, '2024-08-30', now());

-- ---------------------------------------------------------------------------
-- Media: the site's licensed Wikimedia Commons photos, credited in captions
-- ---------------------------------------------------------------------------
INSERT INTO "MediaAsset" (id, type, url, caption, "altText", tags, "linkedExpeditionId", "uploadedById", status, "isSample", "publishedAt", "updatedAt") VALUES
('sample-media-bharati', 'PHOTO', '/images/antarctic/bharati-station.jpg',
'Bharati station, Larsemann Hills. Photo: public domain (Wikimedia Commons).',
'The main building of Bharati station on bare rock, with two white radomes behind it', '{stations,Bharati}', 'sample-exp-bharati-2324', 'sample-data-user', 'PUBLISHED', true, '2024-06-15', now()),

('sample-media-maitri', 'PHOTO', '/images/antarctic/maitri-aerial.jpg',
'Maitri station from the air, 2005. Photo: Government of India, Ministry of Earth Sciences (GODL-India).',
'Aerial view of Maitri station: long white modules and orange containers beside small lakes', '{stations,Maitri,aerial}', 'sample-exp-maitri-winter-2022', 'sample-data-user', 'PUBLISHED', true, '2023-04-10', now()),

('sample-media-aurora', 'PHOTO', '/images/antarctic/iss-aurora-australis.jpg',
'Aurora australis over Antarctica, seen from the International Space Station. Photo: NASA (public domain).',
'Green aurora curving above the dark Earth, seen from orbit with part of the space station in view', '{aurora,atmosphere}', 'sample-exp-maitri-winter-2022', 'sample-data-user', 'PUBLISHED', true, '2023-04-11', now()),

('sample-media-dakshin-gangotri', 'PHOTO', '/images/antarctic/dakshin-gangotri.jpg',
'Dakshin Gangotri, India''s first Antarctic station, in 1984. Photo: Col. Pavan Nair (retd.) (CC BY-SA 4.0).',
'Low coloured station buildings with a satellite dome on a flat snowfield', '{stations,history}', NULL, 'sample-data-user', 'PUBLISHED', true, '2022-01-26', now()),

('sample-media-penguins', 'PHOTO', '/images/antarctic/adelie-penguins-iceberg.jpg',
'Adelie penguins on an iceberg in the Ross Sea. Photo: Brocken Inaglory (CC BY-SA 3.0).',
'A group of Adelie penguins standing on a blue-tinged iceberg', '{wildlife,penguins}', NULL, 'sample-data-user', 'PUBLISHED', true, '2023-02-14', now()),

('sample-media-ny-alesund', 'PHOTO', '/images/arctic/ny-alesund-town.jpg',
'Ny-Alesund research village, Svalbard, home of Himadri. Photo: Harvey Barrison (CC BY-SA 2.0).',
'A red wooden building, a flagpole and a radio mast under a clear sky, with snowy mountains behind', '{stations,Svalbard}', 'sample-exp-himadri-2023', 'sample-data-user', 'PUBLISHED', true, '2023-11-10', now()),

('sample-media-raudfjordbreen', 'PHOTO', '/images/arctic/raudfjordbreen-glacier.jpg',
'The calving front of Raudfjordbreen, northern Svalbard. Photo: Andreas Weith (CC BY-SA 4.0).',
'A tall blue-white glacier front meeting the sea beneath a dark mountain', '{glaciers,Svalbard}', 'sample-exp-himadri-2023', 'sample-data-user', 'PUBLISHED', true, '2023-11-12', now()),

('sample-media-kongsfjorden', 'PHOTO', '/images/arctic/kongsfjorden.jpg',
'Kongsfjorden from Blomstrandhalvoya, Svalbard. Photo: Wikimedia Commons user Sphinx (public domain).',
'Mossy tundra and still water in the foreground, with a fjord, glaciers and mountains behind', '{fjord,Svalbard}', 'sample-exp-kongsfjorden-2022', 'sample-data-user', 'PUBLISHED', true, '2022-12-03', now()),

('sample-media-pindari', 'PHOTO', '/images/himalayan/pindari-glacier.jpg',
'Pindari Glacier, Uttarakhand. Photo: Yann (CC BY-SA 4.0).',
'A glacier descending between steep grey mountains above a green valley with boulders', '{glaciers,Himalaya}', NULL, 'sample-data-user', 'PUBLISHED', true, '2024-01-25', now()),

('sample-media-gaumukh', 'PHOTO', '/images/himalayan/gaumukh-gangotri.jpg',
'Gaumukh, the snout of the Gangotri Glacier. Photo: Wikimedia Commons contributor (CC BY-SA 3.0).',
'A rocky valley with prayer flags on a stone cairn, below the snout of a glacier and snowy peaks', '{glaciers,Himalaya,rivers}', NULL, 'sample-data-user', 'PUBLISHED', true, '2024-01-26', now());

-- ---------------------------------------------------------------------------
-- Institutional activities
-- ---------------------------------------------------------------------------
INSERT INTO "InstitutionalActivity" (id, title, date, description, "coverImageUrl", status, "submittedById", "isSample", "publishedAt", "updatedAt") VALUES
('sample-act-briefing', 'Pre-departure briefing for the Antarctic summer team', '2023-11-10',
$$Members of the summer team met in Goa for safety training, medical checks and science planning before travelling south.$$,
'/images/antarctic/bharati-station.jpg', 'PUBLISHED', 'sample-data-user', true, '2023-11-11', now()),

('sample-act-open-day', 'Open day for school students', '2024-02-28',
$$Researchers showed visiting students how ice cores, weather records and satellite images are used to study the polar regions.$$,
NULL, 'PUBLISHED', 'sample-data-user', true, '2024-02-29', now()),

('sample-act-data-workshop', 'Workshop on sharing polar research data', '2024-09-18',
$$A one-day workshop on describing, licensing and publishing field datasets so that they can be found and reused.$$,
NULL, 'PUBLISHED', 'sample-data-user', true, '2024-09-19', now());

COMMIT;
