import { fetchCollectionCached } from "@/lib/firestore-cache";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const dynamic = "force-dynamic";

interface BlogDoc {
  id: string;
  title?: string;
  description?: string;
  datetime?: string;
  status?: string;
  deleted?: boolean;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
let cachedFeed: { xml: string; timestamp: number } | null = null;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  if (cachedFeed && Date.now() - cachedFeed.timestamp < CACHE_TTL_MS) {
    return new Response(cachedFeed.xml, { headers: { "Content-Type": "application/xml" } });
  }

  let itemsXml = "";
  try {
    const posts = await fetchCollectionCached<BlogDoc>("blog");
    const published = posts
      .filter((p) => p.deleted !== true && p.status !== "draft" && p.title)
      .sort(
        (a, b) => new Date(b.datetime ?? 0).getTime() - new Date(a.datetime ?? 0).getTime()
      )
      .slice(0, 20);

    itemsXml = published
      .map((post) => {
        const url = `${SITE_URL}/${post.id}`;
        return `    <item>
      <title>${escapeXml(post.title ?? "")}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.datetime ?? Date.now()).toUTCString()}</pubDate>
      <description>${escapeXml(post.description ?? "")}</description>
    </item>`;
      })
      .join("\n");
  } catch {
    // Firestore unreachable — serve the last known feed if we have one
    if (cachedFeed) {
      return new Response(cachedFeed.xml, { headers: { "Content-Type": "application/xml" } });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
${itemsXml}
  </channel>
</rss>`;

  cachedFeed = { xml, timestamp: Date.now() };
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=600",
    },
  });
}
