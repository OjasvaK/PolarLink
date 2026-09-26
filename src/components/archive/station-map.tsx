import Link from "next/link";
import { InView } from "@/components/archive/in-view";
import { programLabel } from "@/lib/archive";
import { prisma } from "@/lib/db";
import { MAP, project } from "@/lib/map/projection.mjs";
import { worldPath } from "@/lib/map/world-path";
import { formatCoordinates, headquarters, stations } from "@/lib/stations";

// Hand-built SVG map (no map library or tiles): Natural Earth land outlines
// projected ahead of time (scripts/build-world-path.mjs), station markers
// linking into the archive, and schematic routes from NCPOR in Goa. Routes
// fade in and markers scale in once, on scroll, using only opacity and
// transform (spec section 9); reduced motion shows everything immediately.

async function expeditionCounts() {
  const rows = await prisma.expedition.groupBy({
    by: ["station"],
    where: { status: "PUBLISHED" },
    _count: { _all: true },
  });
  return new Map(
    stations.map((station) => [
      station.name,
      rows
        .filter((row) => row.station.toLowerCase().includes(station.name.toLowerCase()))
        .reduce((sum, row) => sum + row._count._all, 0),
    ])
  );
}

function route(from: { x: number; y: number }, to: { x: number; y: number }) {
  // A gentle arc: control point pushed sideways from the midpoint.
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const bend = 0.18;
  return `M${from.x} ${from.y} Q${mx - dy * bend} ${my + dx * bend} ${to.x} ${to.y}`;
}

const graticule = {
  lats: [60, 30, 0, -30, -60],
  lons: [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150],
};

export async function StationMap({ showList = true }: { showList?: boolean }) {
  const counts = showList ? await expeditionCounts() : new Map<string, number>();
  const hq = project(headquarters.lat, headquarters.lon);

  return (
    <div>
      <InView className="station-map relative">
        <svg
          viewBox={`0 0 ${MAP.width} ${MAP.height}`}
          role="img"
          aria-labelledby="station-map-title"
          className="h-auto w-full"
        >
          <title id="station-map-title">
            Map of India’s research stations in Antarctica, the Arctic and the Himalaya
          </title>

          <g className="stroke-foreground/10" strokeWidth={0.5} fill="none">
            {graticule.lats.map((lat) => {
              const { y } = project(lat, 0);
              return <line key={`lat${lat}`} x1={0} x2={MAP.width} y1={y} y2={y} strokeDasharray={lat === 0 ? undefined : "2 4"} />;
            })}
            {graticule.lons.map((lon) => {
              const { x } = project(0, lon);
              return <line key={`lon${lon}`} y1={0} y2={MAP.height} x1={x} x2={x} strokeDasharray="2 4" />;
            })}
          </g>

          <path d={worldPath} className="fill-foreground/12 stroke-foreground/20" strokeWidth={0.4} />

          <g fill="none" strokeWidth={1.4} strokeLinecap="round" className="stroke-primary">
            {stations.map((station, i) => (
              <path
                key={station.name}
                d={route(hq, project(station.lat, station.lon))}
                className="map-route"
                style={{ transitionDelay: `${i * 180}ms` }}
              />
            ))}
          </g>

          <g>
            <circle cx={hq.x} cy={hq.y} r={4} className="fill-foreground" />
            <text x={hq.x - 8} y={hq.y + 4} textAnchor="end" className="fill-foreground text-[11px] font-medium">
              {headquarters.name}
            </text>
          </g>

          {stations.map((station, i) => {
            const point = project(station.lat, station.lon);
            return (
              <a
                key={station.name}
                href={`/archive?type=expedition&q=${encodeURIComponent(station.name)}`}
                className="map-station group outline-none"
                style={{ transitionDelay: `${600 + i * 180}ms` }}
              >
                <circle cx={point.x} cy={point.y} r={9} className="fill-primary/20 transition-[r] group-hover:fill-primary/35 group-focus-visible:fill-primary/35" />
                <circle cx={point.x} cy={point.y} r={4} className="fill-primary stroke-background" strokeWidth={1.5} />
                <text
                  x={point.x + station.label.dx}
                  y={point.y + station.label.dy}
                  textAnchor={station.label.anchor}
                  className="fill-foreground text-[12px] font-semibold group-hover:underline group-focus-visible:underline"
                >
                  {station.name}
                </text>
              </a>
            );
          })}
        </svg>
      </InView>
      <p className="mt-2 text-xs text-muted-foreground">
        Land outlines: Natural Earth (public domain). Routes are schematic, not actual voyage tracks.
      </p>

      {showList && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stations.map((station) => {
            const count = counts.get(station.name) ?? 0;
            return (
              <li key={station.name} className="rounded-lg border p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold">{station.name}</h3>
                  <span className="text-xs text-muted-foreground">{programLabel(station.program)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                  {formatCoordinates(station.lat, station.lon)} · Est. {station.established}
                </p>
                <p className="mt-3 text-sm">{station.description}</p>
                <p className="mt-2 text-sm text-muted-foreground">{station.status}</p>
                <Link
                  href={`/archive?type=expedition&q=${encodeURIComponent(station.name)}`}
                  className="mt-3 inline-block text-sm underline underline-offset-4"
                >
                  {count === 1 ? "1 published expedition" : `${count} published expeditions`}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
