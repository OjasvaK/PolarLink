type CitablePublication = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  doiOrUrl: string | null;
};

function doiOf(value: string | null) {
  if (!value) return null;
  const match = value.match(/10\.\d{4,9}\/\S+/);
  return match ? match[0] : null;
}

export function publicationLink(value: string | null) {
  if (!value) return null;
  const doi = doiOf(value);
  if (doi) return `https://doi.org/${doi}`;
  return /^https?:\/\//.test(value) ? value : null;
}

// "Surname, Given" -> "Surname"; "Given Surname" -> "Surname".
function surname(author: string) {
  const trimmed = author.trim();
  if (trimmed.includes(",")) return trimmed.split(",")[0].trim();
  return trimmed.split(/\s+/).pop() ?? trimmed;
}

export function plainCitation(p: CitablePublication) {
  const authors =
    p.authors.length > 3 ? `${p.authors.slice(0, 3).join(", ")}, et al.` : p.authors.join(", ");
  const doi = doiOf(p.doiOrUrl);
  const link = doi ? ` https://doi.org/${doi}` : p.doiOrUrl ? ` ${p.doiOrUrl}` : "";
  return `${authors} (${p.year}). ${p.title}.${link}`;
}

export function bibtex(p: CitablePublication) {
  const key = `${surname(p.authors[0] ?? "anon").toLowerCase().replace(/[^a-z]/g, "")}${p.year}${p.id.slice(-4)}`;
  const escape = (value: string) => value.replace(/[{}\\]/g, "");
  const doi = doiOf(p.doiOrUrl);
  const fields = [
    `  title = {${escape(p.title)}}`,
    `  author = {${p.authors.map(escape).join(" and ")}}`,
    `  year = {${p.year}}`,
    doi ? `  doi = {${doi}}` : null,
    !doi && p.doiOrUrl ? `  url = {${escape(p.doiOrUrl)}}` : null,
  ].filter(Boolean);
  return `@article{${key},\n${fields.join(",\n")}\n}`;
}
