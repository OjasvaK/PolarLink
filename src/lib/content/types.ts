import type { Role } from "@/generated/prisma/enums";
import type { UploadBucket } from "@/lib/upload-rules";

// One registry describing every submittable content type (spec sections 7,
// 8.4, 8.5). Forms, validation, My Submissions, and the review queue are all
// driven from here, so adding a field means touching this file and the
// Prisma schema, nothing else.

export type FieldKind =
  | "text"
  | "textarea"
  | "url"
  | "date"
  | "year"
  | "select"
  | "list"
  | "expedition";

export type FieldDef = {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: readonly { value: string; label: string }[];
  maxLength?: number;
  // For url fields: also offer a file upload into this storage bucket.
  upload?: UploadBucket;
};

export type ContentTypeDef = {
  slug: ContentSlug;
  label: string;
  plural: string;
  // Minimum role allowed to create this type.
  minRole: Role;
  // Field shown as the item’s title in lists.
  titleField: string;
  // Column holding the submitting user’s id.
  ownerField: "submittedById" | "uploadedById";
  fields: readonly FieldDef[];
  // Cross-field rule, returns an error keyed by field name.
  refine?: (data: Record<string, unknown>) => Record<string, string> | undefined;
};

export const programOptions = [
  { value: "ANTARCTIC", label: "Antarctic" },
  { value: "ARCTIC", label: "Arctic" },
  { value: "HIMALAYAN", label: "Himalayan" },
] as const;

export const contentSlugs = ["expedition", "dataset", "publication", "media", "activity"] as const;
export type ContentSlug = (typeof contentSlugs)[number];

export function isContentSlug(value: string): value is ContentSlug {
  return (contentSlugs as readonly string[]).includes(value);
}

const expeditionLink: FieldDef = {
  name: "linkedExpeditionId",
  label: "Linked expedition",
  kind: "expedition",
  help: "Optional. Only published expeditions are listed.",
};

export const contentTypes: Record<ContentSlug, ContentTypeDef> = {
  expedition: {
    slug: "expedition",
    label: "Expedition Report",
    plural: "Expeditions",
    minRole: "RESEARCHER",
    titleField: "name",
    ownerField: "submittedById",
    fields: [
      { name: "name", label: "Expedition name", kind: "text", required: true, maxLength: 200, placeholder: "e.g. 44th Indian Scientific Expedition to Antarctica" },
      { name: "program", label: "Program", kind: "select", required: true, options: programOptions },
      { name: "station", label: "Station", kind: "text", required: true, maxLength: 120, placeholder: "e.g. Bharati" },
      { name: "startDate", label: "Start date", kind: "date", required: true },
      { name: "endDate", label: "End date", kind: "date" },
      { name: "summary", label: "Summary", kind: "textarea", required: true, maxLength: 10000 },
      { name: "reportFileUrl", label: "Report PDF", kind: "url", upload: "documents", help: "Upload the report, or paste a link to it." },
    ],
    refine: (data) => {
      const start = data.startDate as Date | null;
      const end = data.endDate as Date | null;
      if (start && end && end < start) return { endDate: "End date can’t be before the start date." };
    },
  },
  dataset: {
    slug: "dataset",
    label: "Dataset",
    plural: "Datasets",
    minRole: "RESEARCHER",
    titleField: "title",
    ownerField: "submittedById",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, maxLength: 200 },
      { name: "description", label: "Description", kind: "textarea", required: true, maxLength: 10000 },
      { name: "tags", label: "Topic tags", kind: "list", help: "Comma-separated, e.g. glaciology, ice cores" },
      { name: "collectionDate", label: "Collection date", kind: "date" },
      { name: "format", label: "Format", kind: "text", required: true, maxLength: 60, placeholder: "e.g. NetCDF, CSV" },
      { name: "fileUrl", label: "Data file", kind: "url", upload: "documents", help: "CSV, NetCDF, JSON, ZIP, XLSX or PDF, up to 50 MB." },
      { name: "externalUrl", label: "External repository link", kind: "url" },
      { name: "license", label: "License", kind: "text", maxLength: 80, placeholder: "e.g. CC BY 4.0" },
      expeditionLink,
    ],
    refine: (data) => {
      if (!data.fileUrl && !data.externalUrl) {
        return { fileUrl: "Upload a data file or give an external repository link." };
      }
    },
  },
  publication: {
    slug: "publication",
    label: "Publication",
    plural: "Publications",
    minRole: "RESEARCHER",
    titleField: "title",
    ownerField: "submittedById",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, maxLength: 300 },
      { name: "authors", label: "Authors", kind: "list", required: true, help: "Comma-separated, in citation order" },
      { name: "year", label: "Year", kind: "year", required: true },
      { name: "abstract", label: "Abstract", kind: "textarea", required: true, maxLength: 10000 },
      { name: "doiOrUrl", label: "DOI or URL", kind: "text", maxLength: 300, placeholder: "e.g. 10.1016/j.polar.2024.101010" },
      expeditionLink,
    ],
  },
  media: {
    slug: "media",
    label: "Media Item",
    plural: "Media",
    minRole: "RESEARCHER",
    titleField: "altText",
    ownerField: "uploadedById",
    fields: [
      {
        name: "type",
        label: "Type",
        kind: "select",
        required: true,
        options: [
          { value: "PHOTO", label: "Photo" },
          { value: "VIDEO", label: "Video" },
        ],
      },
      { name: "url", label: "Photo or video", kind: "url", required: true, upload: "media", help: "JPEG, PNG, WebP, AVIF, MP4 or WebM, up to 50 MB." },
      { name: "altText", label: "Alt text", kind: "text", required: true, maxLength: 300, help: "Describe what the image or video shows, for screen-reader users." },
      { name: "caption", label: "Caption", kind: "textarea", maxLength: 1000 },
      { name: "tags", label: "Tags", kind: "list", help: "Comma-separated" },
      expeditionLink,
    ],
  },
  activity: {
    slug: "activity",
    label: "Institutional Activity",
    plural: "Institutional activities",
    minRole: "EDITOR",
    titleField: "title",
    ownerField: "submittedById",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, maxLength: 200 },
      { name: "date", label: "Date", kind: "date", required: true },
      { name: "description", label: "Description", kind: "textarea", required: true, maxLength: 10000 },
      { name: "coverImageUrl", label: "Cover image", kind: "url", upload: "media" },
    ],
  },
};

// ---------------------------------------------------------------------------
// FormData -> typed values, with per-field errors
// ---------------------------------------------------------------------------

export type ParseResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; errors: Record<string, string>; values: Record<string, string> };

function parseField(field: FieldDef, raw: string): { value: unknown; error?: string } {
  const empty = raw === "";
  if (empty) {
    if (field.required) return { value: null, error: `${field.label} is required.` };
    return { value: field.kind === "list" ? [] : null };
  }
  if (field.maxLength && raw.length > field.maxLength) {
    return { value: null, error: `Keep this under ${field.maxLength} characters.` };
  }

  switch (field.kind) {
    case "url": {
      try {
        const url = new URL(raw);
        if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
        return { value: url.toString() };
      } catch {
        return { value: null, error: "Enter a full link starting with https://" };
      }
    }
    case "date": {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { value: null, error: "Enter a valid date." };
      const date = new Date(`${raw}T00:00:00.000Z`);
      if (Number.isNaN(date.getTime())) return { value: null, error: "Enter a valid date." };
      return { value: date };
    }
    case "year": {
      const year = Number(raw);
      const max = new Date().getFullYear() + 1;
      if (!Number.isInteger(year) || year < 1900 || year > max) {
        return { value: null, error: `Enter a year between 1900 and ${max}.` };
      }
      return { value: year };
    }
    case "select": {
      if (!field.options?.some((option) => option.value === raw)) {
        return { value: null, error: `Choose a ${field.label.toLowerCase()}.` };
      }
      return { value: raw };
    }
    case "list": {
      const items = [...new Set(raw.split(",").map((item) => item.trim()).filter(Boolean))];
      if (field.required && items.length === 0) return { value: [], error: `${field.label} is required.` };
      return { value: items };
    }
    default:
      return { value: raw };
  }
}

export function parseContentForm(type: ContentTypeDef, formData: FormData): ParseResult {
  const data: Record<string, unknown> = {};
  const values: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const field of type.fields) {
    const entry = formData.get(field.name);
    const raw = typeof entry === "string" ? entry.trim() : "";
    values[field.name] = raw;
    const { value, error } = parseField(field, raw);
    if (error) errors[field.name] = error;
    else data[field.name] = value;
  }

  if (Object.keys(errors).length === 0) {
    Object.assign(errors, type.refine?.(data) ?? {});
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors, values };
  return { ok: true, data };
}

// Prisma row -> string values for re-populating a form.
export function toFormValues(type: ContentTypeDef, row: Record<string, unknown>) {
  const values: Record<string, string> = {};
  for (const field of type.fields) {
    const value = row[field.name];
    if (value == null) values[field.name] = "";
    else if (value instanceof Date) values[field.name] = value.toISOString().slice(0, 10);
    else if (Array.isArray(value)) values[field.name] = value.join(", ");
    else values[field.name] = String(value);
  }
  return values;
}
