import type { Metadata } from "next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";

export const dynamic = "force-dynamic";

interface ProjectDoc {
  title?: string;
  description?: string;
  imageUrl?: string;
  deleted?: boolean;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const fallback: Metadata = { title: "Project" };

  try {
    const snap = await getDoc(doc(db, "projects", params.id));
    if (!snap.exists()) return fallback;
    const p = snap.data() as ProjectDoc;
    if (p.deleted) return fallback;

    const title = p.title || "Project";
    return {
      title,
      description: p.description,
      alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/projects/${params.id}` },
      openGraph: {
        type: "article",
        title,
        description: p.description,
        images: p.imageUrl ? [{ url: p.imageUrl }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: p.description,
      },
    };
  } catch {
    return fallback;
  }
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
