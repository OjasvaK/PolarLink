import type { Program } from "@/generated/prisma/enums";

// India's polar and high-altitude research stations (spec section 8.3).
// Coordinates and dates are public facts about the stations themselves.

export type Station = {
  name: string;
  program: Program;
  lat: number;
  lon: number;
  established: number;
  status: string;
  description: string;
  // Nudges the label away from a neighbouring marker on the small-scale map.
  label: { dx: number; dy: number; anchor: "start" | "end" | "middle" };
};

export const headquarters = {
  name: "NCPOR, Goa",
  lat: 15.41,
  lon: 73.87,
};

export const stations: Station[] = [
  {
    name: "Dakshin Gangotri",
    program: "ANTARCTIC",
    lat: -70.08,
    lon: 12.0,
    established: 1983,
    status: "Decommissioned 1990, later used as a supply base",
    description: "India's first Antarctic station, built on the ice shelf during the third expedition.",
    label: { dx: -10, dy: -8, anchor: "end" },
  },
  {
    name: "Maitri",
    program: "ANTARCTIC",
    lat: -70.77,
    lon: 11.73,
    established: 1989,
    status: "Operational, year-round",
    description: "Year-round station in the Schirmacher Oasis, Queen Maud Land.",
    label: { dx: -10, dy: 14, anchor: "end" },
  },
  {
    name: "Bharati",
    program: "ANTARCTIC",
    lat: -69.41,
    lon: 76.19,
    established: 2012,
    status: "Operational, year-round",
    description: "Year-round station in the Larsemann Hills, East Antarctica.",
    label: { dx: 10, dy: 4, anchor: "start" },
  },
  {
    name: "Himadri",
    program: "ARCTIC",
    lat: 78.92,
    lon: 11.93,
    established: 2008,
    status: "Operational",
    description: "India's Arctic research station at Ny-Alesund, Svalbard.",
    label: { dx: 10, dy: 4, anchor: "start" },
  },
  {
    name: "Himansh",
    program: "HIMALAYAN",
    lat: 32.37,
    lon: 77.58,
    established: 2016,
    status: "Operational, seasonal",
    description: "High-altitude glaciology station in the Chandra basin, Himachal Pradesh.",
    label: { dx: 10, dy: -6, anchor: "start" },
  },
];

export function formatCoordinates(lat: number, lon: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}
