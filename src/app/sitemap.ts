import type { MetadataRoute } from "next";
import { fetchCollectionCached } from "@/lib/firestore-cache";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

interface BlogDoc {
  id: string;
  datetime?: string;
  status?: string;
  deleted?: boolean;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/gallery",
    "/projects",
    "/music",
    "/bucket-list",
    "/support",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  try {
    const posts = await fetchCollectionCached<BlogDoc>("blog");
    const articles = posts
      .filter((p) => p.deleted !== true && p.status !== "draft")
      .map((p) => ({
        url: `${SITE_URL}/${p.id}`,
        lastModified: p.datetime ? new Date(p.datetime) : new Date(),
      }));
    return [...staticRoutes, ...articles];
  } catch {
    // Firestore unreachable — still ship the static pages
    return staticRoutes;
  }
}
