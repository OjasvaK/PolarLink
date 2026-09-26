import type { ContentRow } from "@/lib/content/repo";
import { expeditionName } from "@/lib/content/repo";
import { contentTypes, type ContentSlug, type FieldDef } from "@/lib/content/types";

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" });

async function renderValue(field: FieldDef, value: unknown) {
  if (value == null || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-muted-foreground">Not provided</span>;
  }
  switch (field.kind) {
    case "date":
      return dateFormat.format(value as Date);
    case "list":
      return (value as string[]).join(", ");
    case "select":
      return field.options?.find((option) => option.value === value)?.label ?? String(value);
    case "expedition":
      return (await expeditionName(value)) ?? <span className="text-muted-foreground">Unknown</span>;
    case "url":
      return (
        <a href={String(value)} target="_blank" rel="noreferrer" className="break-all underline underline-offset-4">
          {String(value)}
        </a>
      );
    case "textarea":
      return <span className="whitespace-pre-line">{String(value)}</span>;
    default:
      return String(value);
  }
}

// Read-only view of a submission's fields, used by owners and reviewers.
export async function ContentDetails({ slug, item }: { slug: ContentSlug; item: ContentRow }) {
  const type = contentTypes[slug];
  const rows = await Promise.all(
    type.fields.map(async (field) => ({ field, value: await renderValue(field, item[field.name]) }))
  );

  return (
    <dl className="grid gap-5">
      {rows.map(({ field, value }) => (
        <div key={field.name} className="grid gap-1 sm:grid-cols-[12rem_1fr] sm:gap-6">
          <dt className="text-sm font-medium text-muted-foreground">{field.label}</dt>
          <dd className="text-sm">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
