// Real, properly licensed photography used as placeholder imagery until NCPOR
// provides its own. Surface these credits wherever the image appears (the
// spec's anti-slop rules ban unattributed/fake imagery) and again on the
// About/attribution page (spec section 8.7).

export type ImageCredit = {
  file: string;
  title: string;
  credit: string;
  license: string;
  sourceUrl: string;
  note?: string;
};

export const imageCredits = {
  nyAlesundAurora: {
    file: "/images/hero/ny-alesund-aurora.jpg",
    title: "Night Sky Over Ny-Alesund, Svalbard",
    credit: "Chris Pirner / NASA Goddard Space Flight Center",
    license: "CC BY 2.0",
    sourceUrl: "https://www.flickr.com/photos/gsfc/45414074544/",
    note: "Ny-Alesund is the site of India's Himadri Arctic research station.",
  },
  bharatiStation: {
    file: "/images/antarctic/bharati-station.jpg",
    title: "Bharati permanent Antarctic research station",
    credit: "Public domain (US)",
    license: "Public domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Bharati_permanent_Antarctic_research_station.jpg",
  },
  maitriAerial: {
    file: "/images/antarctic/maitri-aerial.jpg",
    title: "Aerial view of Maitri Station, Antarctica (2005)",
    credit: "Government of India, Ministry of Earth Sciences",
    license: "GODL-India",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:An_aerial_view_of_the_Indian_Station_Maitri,_Antarctica_on_February_2,_2005.jpg",
  },
  byrdGlacier: {
    file: "/images/antarctic/byrd-glacier.jpg",
    title: "Byrd Glacier, Antarctica (Landsat 7)",
    credit: "NASA / USGS Landsat",
    license: "Public domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Byrd_Glacier,_Antarctica_(15473582067).jpg",
  },
  issAuroraAustralis: {
    file: "/images/antarctic/iss-aurora-australis.jpg",
    title: "Aurora australis above Antarctica, seen from the ISS",
    credit: "NASA",
    license: "Public domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:ISS-52_Aurora_australis_above_Antarctica.jpg",
  },
  polarBearSvalbard: {
    file: "/images/arctic/polar-bear-svalbard.jpg",
    title: "Polar bear in the drift ice region north of Svalbard",
    credit: "Andreas Weith",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Polar_bear_(Ursus_maritimus)_in_the_drift_ice_region_north_of_Svalbard.jpg",
  },
  gaumukhGangotri: {
    file: "/images/himalayan/gaumukh-gangotri.jpg",
    title: "Gaumukh, terminus of Gangotri Glacier, Uttarakhand",
    credit: "Wikimedia Commons contributor",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gaumukh_Gangotri_glacier.jpg",
  },
  himalayaRanikhet: {
    file: "/images/himalayan/himalaya-ranikhet-panorama.jpg",
    title: "Panorama of the Himalayas from Ranikhet",
    credit: "Harshit SR",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Panorama_of_Himalayas_from_Ranikhet.jpg",
  },
} as const satisfies Record<string, ImageCredit>;

export const programSlideshows = {
  antarctic: [
    imageCredits.bharatiStation,
    imageCredits.maitriAerial,
    imageCredits.byrdGlacier,
    imageCredits.issAuroraAustralis,
  ],
  arctic: [imageCredits.nyAlesundAurora, imageCredits.polarBearSvalbard],
  himalayan: [imageCredits.gaumukhGangotri, imageCredits.himalayaRanikhet],
} satisfies Record<string, ImageCredit[]>;
