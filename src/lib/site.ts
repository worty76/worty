/** Canonical site URL — override with NEXT_PUBLIC_SITE_URL if the domain changes */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://worty.id.vn";

export const SITE_NAME = "Le Thanh Dat";

/** archived first version of the site (the `v1` git branch) */
export const OLD_SITE_URL = process.env.NEXT_PUBLIC_OLD_SITE_URL ?? "https://v1.worty.id.vn";

export const SITE_DESCRIPTION =
  "Blog and portfolio of Le Thanh Dat (Dat) — a Go developer writing about backend engineering, projects, music, and the journey of getting a little better every day.";

/** flip to true to bring back the /journey page and its homepage button */
export const JOURNEY_ENABLED = false;
