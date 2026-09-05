"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchCollectionCached } from "@/lib/firestore-cache";
import { FaGithub, FaExternalLinkAlt, FaStar } from "react-icons/fa";
import { LoadingSpinner } from "@/components/ui/LoadingStates";

interface Project {
  id?: string;
  category?: string;
  title: string;
  description: string;
  techStack: string;
  imageUrl: string;
  githubUrl?: string;
  liveUrl?: string;
  order: number;
  featured: boolean;
  deleted?: boolean;
  contributed?: boolean;
  stars?: number;
}

/** Shared card content — thumbnail, title, description, tech pills, arrow */
const CATEGORY_FILTERS = [
  { key: "all", label: "All" },
  { key: "own", label: "My projects" },
  { key: "contribute", label: "Contributions" },
];

function projectCategory(p: Project): string {
  return p.category ?? (p.contributed ? "contribute" : "own");
}

function CardContent({ project }: { project: Project }) {
  return (
    <>
      {/* Thumbnail */}
      <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-white/[0.06] flex items-center justify-center">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            width={64}
            height={64}
            className="object-cover"
          />
        ) : (
          <span className="secondary-color-text/20 text-xl font-bold font-heading">
            {project.title.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="secondary-color-text font-semibold font-heading text-base truncate">
            {project.title}
          </h3>
          {project.contributed && (
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider secondary-color-text opacity-70 bg-white/[0.06] px-2 py-0.5 rounded-full">
              Contributed
            </span>
          )}
          {project.featured && (
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider secondary-color-bg primary-color-text px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
          {!!project.stars && project.stars > 0 && (
            <span className="shrink-0 flex items-center gap-1 text-[11px] secondary-color-text opacity-50">
              <FaStar size={9} /> {project.stars.toLocaleString()}
            </span>
          )}
        </div>
        <p className="secondary-color-text/50 text-sm leading-relaxed line-clamp-2">
          {project.description}
        </p>
      </div>

      {/* Tech pills */}
      <div className="hidden sm:flex flex-wrap gap-1.5 shrink-0">
        {project.techStack?.split(",").slice(0, 3).map((tech) => {
          const t = tech.trim();
          return t ? (
            <span
              key={t}
              className="bg-white/[0.05] text-secondary-color-text/40 text-xs font-medium px-2.5 py-1 rounded-md"
            >
              {t}
            </span>
          ) : null;
        })}
      </div>

      {/* Arrow */}
      <div className="shrink-0 text-secondary-color-text/20 group-hover:text-secondary-color-text/60 transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-[-30deg] group-hover:rotate-[-45deg] group-hover:translate-x-0.5 transition-all duration-200">
          <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const visibleProjects = projects
    .filter(
      (p) =>
        !p.deleted &&
        (categoryFilter === "all" || projectCategory(p) === categoryFilter)
    )
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const list = (await fetchCollectionCached<Project & { id: string }>("projects"))
          .filter((p) => !p.deleted)
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        setProjects(list);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen primary-color-bg flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="min-h-screen primary-color-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="secondary-color-text font-heading text-4xl font-bold mb-3">Projects</h1>
          <p className="secondary-color-text opacity-60 text-lg">A collection of things I&apos;ve built and tinkered with.</p>
        </div>

        {projects.length === 0 ? (
          <p className="text-center secondary-color-text opacity-40 text-lg">No projects yet. Check back soon!</p>
        ) : (
          <>
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap justify-center mb-8">
              {CATEGORY_FILTERS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategoryFilter(c.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    categoryFilter === c.key
                      ? "bg-[rgb(var(--primary-text-rgb))] text-[rgb(var(--primary-bg-rgb))]"
                      : "bg-white/5 secondary-color-text opacity-50 hover:opacity-80"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {visibleProjects.map((project) => {
              const cardClass = `group flex items-center gap-5 rounded-xl p-6 transition-all duration-200 hover:bg-white/[0.06] cursor-pointer border ${
                project.featured
                  ? "border-[rgb(var(--primary-text-rgb)_/_0.25)] hover:border-[rgb(var(--primary-text-rgb)_/_0.45)] bg-white/[0.04]"
                  : "border-[rgb(var(--primary-text-rgb)_/_0.06)] bg-white/[0.02]"
              }`;

              // showcase entries without a document keep their external link
              if (!project.id) {
                const external = project.liveUrl || project.githubUrl || "#";
                return (
                  <a
                    key={project.title}
                    href={external}
                    target={external === "#" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    <CardContent project={project} />
                  </a>
                );
              }

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={cardClass}
                >
                  <CardContent project={project} />
                </Link>
              );
            })}

            {visibleProjects.length === 0 && (
              <p className="text-center secondary-color-text opacity-40 text-lg">
                No projects in this category yet.
              </p>
            )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
