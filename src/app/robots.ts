import type { MetadataRoute } from "next";

/** v1 is an archive: ask every crawler to stay away (the current site is worty.id.vn) */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
