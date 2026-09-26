import { siteOrigin } from "@/lib/generator/source";
import { feedItems, publicHeaders, rateLimit, tooManyRequests } from "@/lib/public-api";

// GET /api/public/feed.xml: RSS 2.0 feed of newly published archive content
// across all types, newest first (spec section 8.8).

function xml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Characters XML 1.0 doesn’t allow at all.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

export async function GET(request: Request) {
  const limit = rateLimit(request);
  if (!limit.ok) return tooManyRequests(limit.resetAt);

  const origin = await siteOrigin();
  const items = await feedItems();
  const lastBuild = items[0]?.pubDate ?? new Date();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PolarLink archive</title>
    <link>${xml(origin)}/archive</link>
    <description>Newly published expedition reports, datasets, publications, media and activities from India’s polar research programs.</description>
    <language>en-in</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${xml(origin)}/api/public/feed.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (item) => `    <item>
      <title>${xml(item.title)}</title>
      <link>${xml(item.link)}</link>
      <guid isPermaLink="true">${xml(item.link)}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <category>${xml(item.category)}</category>
      <description>${xml(item.description)}</description>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      ...publicHeaders,
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
