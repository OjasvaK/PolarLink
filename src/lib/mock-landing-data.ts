// Static landing-page copy. Stats and featured items are no longer here:
// they are computed from the database in src/app/page.tsx.

export const heroCopy = {
  eyebrow: "National Centre for Polar and Ocean Research",
  headline: "India’s polar science, archived and explained.",
  subheadline:
    "Browse expedition reports, datasets, publications, and media from India’s Antarctic, Arctic, and Himalayan research programs.",
};

export const programSections = [
  {
    key: "antarctic",
    eyebrow: "Since 1981",
    title: "The Antarctic Program",
    description:
      "Maitri and Bharati stations anchor decades of Indian research into glaciology, atmospheric science, and the Southern Ocean.",
  },
  {
    key: "arctic",
    eyebrow: "Since 2008",
    title: "The Arctic Program",
    description:
      "Himadri, India’s research station at Ny-Alesund, Svalbard, has hosted Indian researchers studying the Arctic climate system since 2008.",
  },
  {
    key: "himalayan",
    eyebrow: "The third pole",
    title: "The Himalayan Program",
    description:
      "NCPOR’s cryosphere research tracks glaciers and snow cover across the Indian Himalaya, the source of the subcontinent’s major rivers.",
  },
] as const;
