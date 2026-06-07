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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.title}
                className={`group bg-white/5 border rounded-xl overflow-hidden transition-all duration-200 hover:bg-white/[0.08] hover:scale-[1.02] ${
                  project.featured
                    ? "border-amber-500/40 hover:border-amber-500/60"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Cover image */}
                <div className="relative aspect-video w-full overflow-hidden">
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
                      <span className="secondary-color-text opacity-20 text-sm">No image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="secondary-color-text font-semibold font-heading text-lg line-clamp-1 flex-1">
                      {project.title}
                    </h3>
                    {project.featured && (
                      <span className="ml-2 w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-1.5" title="Featured" />
                    )}
                  </div>

                  <p className="secondary-color-text opacity-60 text-sm line-clamp-2 mb-4">
                    {project.description}
                  </p>

                  {/* Tech stack pills */}
                  {project.techStack && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.techStack.split(",").map((tech) => {
                        const t = tech.trim();
                        return t ? (
                          <span
                            key={t}
                            className="bg-white/5 text-[rgb(221,198,182)]/50 text-[10px] px-2.5 py-1 rounded-full"
                          >
                            {t}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex items-center gap-3">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[rgb(221,198,182)]/50 hover:text-[rgb(221,198,182)] transition-colors"
                        title="GitHub"
                      >
                        <FaGithub size={18} />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[rgb(221,198,182)]/50 hover:text-[rgb(221,198,182)] transition-colors"
                        title="Live Demo"
                      >
                        <FaExternalLinkAlt size={14} />
                      </a>
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
