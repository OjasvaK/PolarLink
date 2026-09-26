import type { Program } from "@/generated/prisma/enums";

// Rule-based Content Generator (spec section 8.5, the required baseline).
// Pure functions over an item’s stored metadata: the same input always
// produces the same draft, and nothing is invented beyond what’s stored.

export type GeneratorSourceType = "expedition" | "dataset" | "media";

export type GeneratorSource =
  | {
      type: "expedition";
      name: string;
      program: Program;
      station: string;
      startDate: Date;
      endDate: Date | null;
      summary: string;
      counts: { datasets: number; publications: number; media: number };
    }
  | {
      type: "dataset";
      title: string;
      description: string;
      format: string;
      license: string | null;
      collectionDate: Date | null;
      tags: string[];
      expedition: { name: string; program: Program } | null;
    }
  | {
      type: "media";
      mediaType: "PHOTO" | "VIDEO";
      caption: string | null;
      altText: string;
      tags: string[];
      expedition: { name: string; program: Program; station: string } | null;
    };

const programNames: Record<Program, string> = {
  ANTARCTIC: "Antarctic",
  ARCTIC: "Arctic",
  HIMALAYAN: "Himalayan",
};

const programHashtags: Record<Program, string[]> = {
  ANTARCTIC: ["#Antarctica", "#PolarScience"],
  ARCTIC: ["#Arctic", "#Svalbard", "#PolarScience"],
  HIMALAYAN: ["#Himalaya", "#Cryosphere"],
};

const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const monthYear = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });

function sentences(text: string, count: number) {
  const parts = text.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [];
  return parts.slice(0, count).join("").trim();
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function listPhrase(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function days(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

// Social posts: keep within 280 characters, counting the link as 23 (the
// length X/Twitter assigns to any URL), and trim the body rather than the
// link or hashtags.
function fitSocial(body: string, hashtags: string[], url: string) {
  const tail = `\n\n${hashtags.join(" ")}\n${url}`;
  const budget = 280 - (tail.length - url.length + 23);
  const trimmed = body.length > budget ? `${body.slice(0, budget - 1).replace(/\s+\S*$/, "")}…` : body;
  return trimmed + tail;
}

export function websiteBlurb(source: GeneratorSource) {
  switch (source.type) {
    case "expedition": {
      const program = programNames[source.program];
      const when = source.endDate
        ? `The team was in the field from ${longDate.format(source.startDate)} to ${longDate.format(source.endDate)}, ${plural(days(source.startDate, source.endDate), "day")} in all.`
        : `Fieldwork began on ${longDate.format(source.startDate)}.`;
      const holdings = [
        source.counts.datasets && plural(source.counts.datasets, "dataset"),
        source.counts.publications && plural(source.counts.publications, "publication"),
        source.counts.media && plural(source.counts.media, "media item"),
      ].filter(Boolean) as string[];
      return [
        `${source.name} was part of India’s ${program} research program, based at ${source.station}. ${when}`,
        sentences(source.summary, 3),
        holdings.length
          ? `The PolarLink archive holds ${listPhrase(holdings)} from this expedition.`
          : "Its report and records are available in the PolarLink archive.",
      ].join("\n\n");
    }
    case "dataset": {
      const origin = source.expedition
        ? ` from ${source.expedition.name} (${programNames[source.expedition.program]} program)`
        : "";
      const collected = source.collectionDate ? `, collected in ${monthYear.format(source.collectionDate)}` : "";
      const topics = source.tags.length ? ` Topics: ${source.tags.join(", ")}.` : "";
      const license = source.license ? ` It is shared under ${source.license}.` : "";
      return [
        `${source.title} is a ${source.format} dataset${origin}${collected}.`,
        sentences(source.description, 3) + topics,
        `The data can be downloaded from the PolarLink archive.${license}`,
      ].join("\n\n");
    }
    case "media": {
      const kind = source.mediaType === "PHOTO" ? "photograph" : "video";
      const where = source.expedition
        ? ` from ${source.expedition.name} at ${source.expedition.station}`
        : "";
      return [
        `A ${kind}${where}: ${source.altText.replace(/\.$/, "")}.`,
        source.caption ? source.caption : null,
        "View and download it in the PolarLink media gallery.",
      ]
        .filter(Boolean)
        .join("\n\n");
    }
  }
}

export function socialCaption(source: GeneratorSource, url: string) {
  switch (source.type) {
    case "expedition": {
      const season = source.endDate
        ? `${monthYear.format(source.startDate)} to ${monthYear.format(source.endDate)}`
        : `from ${monthYear.format(source.startDate)}`;
      const body = `New in the PolarLink archive: ${source.name}, ${source.station}, ${season}. ${sentences(source.summary, 1)}`;
      return fitSocial(body, programHashtags[source.program], url);
    }
    case "dataset": {
      const origin = source.expedition ? ` from ${source.expedition.name}` : "";
      const body = `Open data${origin}: ${source.title} (${source.format}). ${sentences(source.description, 1)}`;
      const tags = source.expedition ? programHashtags[source.expedition.program] : ["#PolarScience"];
      return fitSocial(body, [...tags, "#OpenData"], url);
    }
    case "media": {
      const where = source.expedition ? ` from ${source.expedition.station}` : "";
      const body = `${source.caption || source.altText}${where}.`;
      const tags = source.expedition ? programHashtags[source.expedition.program] : ["#PolarScience"];
      return fitSocial(body, tags, url);
    }
  }
}
