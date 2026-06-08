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
          <div className="max-w-3xl mx-auto space-y-4">
            {projects.map((project) => (
              <a
                key={project.title}
                href={project.liveUrl || project.githubUrl || "#"}
                target={project.liveUrl || project.githubUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`group flex items-center gap-5 rounded-xl p-6 transition-all duration-200 hover:bg-white/[0.06] border ${
                  project.featured
                    ? "border-amber-500/20 hover:border-amber-500/40 bg-amber-500/[0.04]"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
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
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="secondary-color-text font-semibold font-heading text-base truncate">
                      {project.title}
                    </h3>
                    {project.featured && (
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        Featured
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
                        className="bg-white/[0.05] text-secondary-color-text/40 text-[10px] font-medium px-2 py-0.5 rounded-md"
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
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
