// Placeholder landing-page content (build plan step 2/8). Numbers here are
// illustrative only — the real build computes these from row counts (spec
// section 8.1) rather than hardcoding them.

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

export const programSections = [
  {
    key: "antarctic",
    eyebrow: "Since 1981",
    title: "The Antarctic Program",
    description:
      "Maitri and Bharati stations anchor decades of Indian research into glaciology, atmospheric science, and the Southern Ocean.",
    overlayFrom: "rgba(10, 24, 44, 0.55)",
  },
  {
    key: "arctic",
    eyebrow: "Since 2008",
    title: "The Arctic Program",
    description:
      "Himadri, India's research station at Ny-Alesund, Svalbard, has hosted Indian researchers studying the Arctic climate system since 2008.",
    overlayFrom: "rgba(10, 40, 36, 0.55)",
  },
  {
    key: "himalayan",
    eyebrow: "The third pole",
    title: "The Himalayan Program",
    description:
      "NCPOR's cryosphere research tracks glaciers and snow cover across the Indian Himalaya, the source of the subcontinent's major rivers.",
    overlayFrom: "rgba(40, 28, 10, 0.55)",
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
