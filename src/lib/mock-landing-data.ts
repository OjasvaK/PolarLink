// Placeholder content shared by all three landing-page mockups (build plan step 2).
// Numbers here are illustrative only — the real build computes these from row
// counts (spec section 8.1) rather than hardcoding them.

export const heroCopy = {
  eyebrow: "National Centre for Polar and Ocean Research",
  headline: "India's polar science, archived and explained.",
  subheadline:
    "Browse expedition reports, datasets, publications, and media from India's Antarctic, Arctic, and Himalayan research programs.",
};

export const stats = [
  { label: "Expeditions archived", value: 42 },
  { label: "Datasets indexed", value: 128 },
  { label: "Publications catalogued", value: 76 },
  { label: "Media items", value: 310 },
];

export const stations = [
  {
    id: "maitri",
    name: "Maitri",
    program: "Antarctic",
    detail: "Operational research station, Schirmacher Oasis, since 1989.",
    position: { x: 22, y: 78 },
  },
  {
    id: "bharati",
    name: "Bharati",
    program: "Antarctic",
    detail: "Operational research station, Larsemann Hills, since 2012.",
    position: { x: 62, y: 82 },
  },
  {
    id: "himadri",
    name: "Himadri",
    program: "Arctic",
    detail: "Research station at Ny-Alesund, Svalbard, since 2008.",
    position: { x: 48, y: 12 },
  },
] as const;

export const featured = [
  {
    kind: "Expedition",
    title: "41st Indian Antarctic Expedition",
    summary:
      "Summer research campaign covering glaciology and atmospheric science at Bharati station.",
  },
  {
    kind: "Dataset",
    title: "Schirmacher Oasis Ice Core Records",
    summary:
      "Depth-calibrated ice core measurements collected near Maitri station.",
  },
  {
    kind: "Media",
    title: "Himadri Field Season Photo Set",
    summary:
      "Photographs from the Arctic research station at Ny-Alesund, Svalbard.",
  },
];

export const footerLinks = {
  legal: ["Terms of Service", "Privacy Policy"],
  contact: "About this project",
};
