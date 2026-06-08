"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { LoadingSpinner } from "@/components/ui/LoadingStates";

interface Project {
  title: string;
  description: string;
  techStack: string;
  imageUrl: string;
  githubUrl?: string;
  liveUrl?: string;
  order: number;
  featured: boolean;
  deleted?: boolean;
}

const FALLBACK_PROJECTS: Project[] = [
  {
    title: "ChatApp Realtime",
    description: "Full-stack real-time chat application with rooms, typing indicators, and message history. Built with WebSockets and a responsive UI.",
    techStack: "React, Node.js, Socket.io, MongoDB",
    imageUrl: "",
    githubUrl: "https://github.com/worty/chatapp",
    liveUrl: "https://chatapp-demo.vercel.app",
    order: 1,
    featured: true,
  },
  {
    title: "DevDash Analytics",
    description: "Developer productivity dashboard that aggregates GitHub stats, CI/CD pipelines, and sprint metrics into one clean view.",
    techStack: "Next.js, TypeScript, Tailwind CSS, Chart.js",
    imageUrl: "",
    githubUrl: "https://github.com/worty/devdash",
    liveUrl: "",
    order: 2,
    featured: true,
  },
  {
    title: "BudgetTracker",
    description: "Personal finance tracker with expense categorization, monthly budgets, and visual spending breakdowns.",
    techStack: "Vue.js, Firebase, Vuetify",
    imageUrl: "",
    githubUrl: "https://github.com/worty/budget-tracker",
    order: 3,
    featured: false,
  },
  {
    title: "Markdown Blog Engine",
    description: "Lightweight static blog engine that renders markdown files with syntax highlighting and automatic RSS feed generation.",
    techStack: "Astro, MDX, TypeScript",
    imageUrl: "",
    githubUrl: "https://github.com/worty/markdown-blog",
    liveUrl: "https://blog-demo.vercel.app",
    order: 4,
    featured: false,
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(collection(db, "projects"));
        const list = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Project & { id: string }))
          .filter((p) => !p.deleted)
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        if (list.length > 0) {
          setProjects(list);
        } else {
          setProjects(FALLBACK_PROJECTS);
        }
      } catch {
        setProjects(FALLBACK_PROJECTS);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
            {projects.map((project) => (
              <div
                key={project.title}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] ${
                  project.featured
                    ? "bg-gradient-to-br from-amber-500/10 to-white/[0.04] border border-amber-500/30 hover:border-amber-400/50 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/10"
                    : "bg-white/[0.04] border border-white/[0.08] hover:border-white/20 shadow-lg shadow-black/20 hover:shadow-black/30"
                }`}
              >
                {/* Featured badge */}
                {project.featured && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-amber-500/90 text-primary-color-bg rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-color-bg/60" />
                    Featured
                  </div>
                )}

                {/* Cover image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl mb-1 opacity-15">
                          {project.title.charAt(0)}
                        </div>
                        <span className="secondary-color-text opacity-15 text-xs font-medium tracking-wide uppercase">
                          {project.title.split(" ")[0]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 pb-6">
                  <h3 className="secondary-color-text font-semibold font-heading text-xl mb-2 line-clamp-1">
                    {project.title}
                  </h3>

                  <p className="secondary-color-text opacity-50 text-sm leading-relaxed line-clamp-2 mb-5">
                    {project.description}
                  </p>

                  {/* Tech stack pills */}
                  {project.techStack && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.techStack.split(",").map((tech) => {
                        const t = tech.trim();
                        return t ? (
                          <span
                            key={t}
                            className="bg-white/[0.06] text-secondary-color-text/60 text-[11px] font-medium px-3 py-1 rounded-lg border border-white/[0.06]"
                          >
                            {t}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex items-center gap-4 pt-3 border-t border-white/[0.06]">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-secondary-color-text/40 hover:text-secondary-color-text text-sm transition-colors"
                      >
                        <FaGithub size={16} />
                        <span>Source</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-secondary-color-text/40 hover:text-secondary-color-text text-sm transition-colors"
                      >
                        <FaExternalLinkAlt size={12} />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {!project.githubUrl && !project.liveUrl && (
                      <span className="text-secondary-color-text/20 text-xs italic">No links available</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
