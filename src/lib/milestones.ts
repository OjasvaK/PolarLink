import type { Program } from "@/generated/prisma/enums";

// Fixed program milestones for the timeline (spec section 8.3). These are
// well-documented public events; expedition entries are added from the
// archive itself.

export type Milestone = {
  year: number;
  title: string;
  description: string;
  program: Program | null;
};

export const milestones: Milestone[] = [
  {
    year: 1981,
    title: "First Indian expedition to Antarctica",
    description: "The first Indian Antarctic expedition sets out from Goa in December 1981, reaching Antarctica in January 1982.",
    program: "ANTARCTIC",
  },
  {
    year: 1983,
    title: "Dakshin Gangotri established",
    description: "India’s first Antarctic station is built on the ice shelf during the third expedition.",
    program: "ANTARCTIC",
  },
  {
    year: 1989,
    title: "Maitri commissioned",
    description: "A permanent station opens in the Schirmacher Oasis, supporting year-round research.",
    program: "ANTARCTIC",
  },
  {
    year: 1990,
    title: "Dakshin Gangotri decommissioned",
    description: "Buried by accumulating ice, the first station is retired and later used as a supply base.",
    program: "ANTARCTIC",
  },
  {
    year: 1998,
    title: "NCAOR founded in Goa",
    description: "The National Centre for Antarctic and Ocean Research is set up to coordinate India’s polar program.",
    program: null,
  },
  {
    year: 2008,
    title: "Himadri opens in the Arctic",
    description: "India’s Arctic research station opens at Ny-Alesund, Svalbard.",
    program: "ARCTIC",
  },
  {
    year: 2012,
    title: "Bharati commissioned",
    description: "A third Antarctic station opens in the Larsemann Hills, East Antarctica.",
    program: "ANTARCTIC",
  },
  {
    year: 2016,
    title: "Himansh established",
    description: "A high-altitude station for glacier research opens in the Chandra basin of the Himalaya.",
    program: "HIMALAYAN",
  },
  {
    year: 2018,
    title: "NCAOR becomes NCPOR",
    description: "The centre is renamed the National Centre for Polar and Ocean Research.",
    program: null,
  },
  {
    year: 2022,
    title: "Indian Antarctic Act",
    description: "Parliament passes India’s first domestic legislation governing activities in Antarctica.",
    program: "ANTARCTIC",
  },
];
