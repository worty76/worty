import type { Metadata } from "next";
import { fetchCollectionCached } from "@/lib/firestore-cache";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

interface BlogDoc {
  id: string;
  title?: string;
  titleVi?: string;
  description?: string;
  descriptionVi?: string;
  image?: string;
  datetime?: string;
  deleted?: boolean;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const fallback: Metadata = { title: "Article" };

  try {
    const posts = await fetchCollectionCached<BlogDoc>("blog");
    const post = posts.find((p) => p.id === params.id);
    if (!post || post.deleted) return fallback;

    const title = post.titleVi || post.title || "Article";
    const description = post.descriptionVi || post.description || `An article by ${SITE_NAME}`;

    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/${post.id}` },
      openGraph: {
        type: "article",
        title,
        description,
        url: `${SITE_URL}/${post.id}`,
        images: post.image ? [{ url: post.image }] : undefined,
        publishedTime: post.datetime,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: post.image ? [post.image] : undefined,
      },
    };
  } catch {
    return fallback;
  }
}

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
