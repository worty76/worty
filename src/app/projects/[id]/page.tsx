"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import {
  FaArrowLeft,
  FaStar,
  FaDownload,
  FaGithub,
  FaExternalLinkAlt,
  FaCheck,
} from "react-icons/fa";

interface ProjectDoc {
  id: string;
  title?: string;
  description?: string;
  techStack?: string;
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  contributed?: boolean;
  myRole?: string;
  contributions?: string[];
  features?: string[];
  stars?: number;
  installations?: number;
  deleted?: boolean;
}

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<ProjectDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const snap = await getDoc(doc(db, "projects", params.id));
        if (!snap.exists() || snap.data().deleted) {
          setNotFound(true);
          return;
        }
        setProject({ id: snap.id, ...snap.data() } as ProjectDoc);
      } catch (e) {
        console.error("Error fetching project:", e);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="min-h-screen primary-color-bg flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-[rgb(var(--primary-text-rgb))] border-t-transparent rounded-full animate-spin opacity-60" />
      </main>
    );
  }

  if (notFound || !project) {
    return (
      <main className="min-h-screen primary-color-bg flex flex-col items-center justify-center gap-5 px-4">
        <p className="secondary-color-text opacity-70 text-lg">
          This project could not be found.
        </p>
        <Link
          href="/projects"
          className="px-6 py-3 primary-color-bg secondary-color-text border secondary-color-border rounded-full font-medium hover:opacity-80 transition-opacity"
        >
          Back to projects
        </Link>
      </main>
    );
  }

  const techStack = (project.techStack ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const stats = [
    { label: "Stars", value: project.stars ?? 0, icon: <FaStar size={16} /> },
    {
      label: "Installations",
      value: project.installations ?? 0,
      icon: <FaDownload size={16} />,
    },
  ].filter((s) => s.value > 0);

  const contributions = (project.contributions ?? []).filter(Boolean);
  const features = (project.features ?? []).filter(Boolean);

  return (
    <main className="min-h-screen primary-color-bg px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 secondary-color-text opacity-60 hover:opacity-100 text-sm mb-8 transition-opacity"
        >
          <FaArrowLeft size={12} />
          Back to projects
        </Link>

        {/* Hero image */}
        {project.imageUrl && (
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl mb-8">
            <Image
              src={project.imageUrl}
              alt={project.title ?? "Project"}
              fill
              priority
              quality={90}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Title */}
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <h1 className="secondary-color-text font-heading text-3xl md:text-4xl font-bold">
            {project.title}
          </h1>
          {project.contributed && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold secondary-color-bg primary-color-text">
              Contributed
            </span>
          )}
        </div>

        {/* Description */}
        <p className="secondary-color-text opacity-80 text-lg leading-relaxed mb-5">
          {project.description}
        </p>

        {/* Links */}
        <div className="flex items-center gap-3 flex-wrap mb-8">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border secondary-color-border secondary-color-text text-sm font-medium hover:bg-white/[0.06] transition-colors"
            >
              <FaGithub /> Source code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl secondary-color-bg primary-color-text text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <FaExternalLinkAlt size={12} /> Live demo
            </a>
          )}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-[rgb(var(--primary-text-rgb)_/_0.1)] bg-white/[0.03] p-5 flex items-center gap-4"
              >
                <span className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center secondary-color-text opacity-70">
                  {s.icon}
                </span>
                <div>
                  <p className="secondary-color-text font-heading text-2xl font-bold leading-none mb-1">
                    {s.value.toLocaleString()}
                  </p>
                  <p className="secondary-color-text opacity-60 text-xs">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contributions (contributed projects) */}
        {project.contributed && (
          <section className="mb-10">
            <h2 className="secondary-color-text font-heading text-xl font-bold mb-4">
              My contributions
            </h2>
            {project.myRole && (
              <p className="secondary-color-text opacity-70 text-sm mb-4">
                Role: <span className="font-semibold">{project.myRole}</span>
              </p>
            )}
            {contributions.length > 0 && (
              <ul className="space-y-3">
                {contributions.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 shrink-0 w-5 h-5 rounded-full bg-white/[0.06] border border-[rgb(var(--primary-text-rgb)_/_0.15)] flex items-center justify-center">
                      <FaCheck size={9} className="secondary-color-text opacity-70" />
                    </span>
                    <span className="secondary-color-text opacity-85 leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Features (own projects) */}
        {!project.contributed && features.length > 0 && (
          <section className="mb-10">
            <h2 className="secondary-color-text font-heading text-xl font-bold mb-4">
              What it does
            </h2>
            <ul className="space-y-3">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 shrink-0 w-5 h-5 rounded-full bg-white/[0.06] border border-[rgb(var(--primary-text-rgb)_/_0.15)] flex items-center justify-center">
                    <FaCheck size={9} className="secondary-color-text opacity-70" />
                  </span>
                  <span className="secondary-color-text opacity-85 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tech stack */}
        {techStack.length > 0 && (
          <section className="mb-4">
            <h2 className="secondary-color-text font-heading text-xl font-bold mb-4">
              Built with
            </h2>
            <div className="flex flex-wrap gap-2">
              {techStack.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-[rgb(var(--primary-text-rgb)_/_0.1)] secondary-color-text opacity-80 text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
