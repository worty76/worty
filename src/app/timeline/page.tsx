"use client";

import { useEffect, useState } from "react";
import { fetchCollectionCached } from "@/lib/firestore-cache";

interface Milestone {
  id?: string;
  title?: string;
  date?: string; // "YYYY-MM-DD"
  description?: string;
  category?: string;
  deleted?: boolean;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const docs = await fetchCollectionCached<Milestone>("timeline");
        setMilestones(docs.filter((m) => m.deleted !== true));
      } catch {
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visible = milestones ?? [];
  const categories = Array.from(
    new Set(visible.map((m) => m.category).filter(Boolean))
  ).sort() as string[];

  const filtered = visible
    .filter((m) => categoryFilter === "all" || m.category === categoryFilter)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="secondary-color-text font-heading text-4xl font-bold mb-3">
            My Journey
          </h1>
          <p className="secondary-color-text opacity-60 text-lg">
            Milestones that shaped my path.
          </p>
        </div>

        {loading ? (
          <p className="text-center secondary-color-text opacity-40 text-sm">
            Loading…
          </p>
        ) : (
          <>
            {/* Category filter */}
            {categories.length > 1 && (
              <div className="flex gap-2 flex-wrap justify-center mb-10">
                {["all", ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      categoryFilter === cat
                        ? "bg-[rgb(var(--primary-text-rgb))] text-[rgb(var(--primary-bg-rgb))]"
                        : "bg-white/5 secondary-color-text opacity-50 hover:opacity-80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <p className="text-center secondary-color-text opacity-40 text-lg">
                No milestones in this category yet.
              </p>
            ) : (
              <div className="relative">
                {/* vertical line */}
                <div className="absolute left-[7px] top-1 bottom-1 w-px bg-[rgb(var(--primary-text-rgb)_/_0.15)]" />
                <ul>
                  {filtered.map((m, i) => (
                    <li
                      key={m.id ?? i}
                      className="group relative pl-8 pb-10 last:pb-0"
                    >
                      {/* dot */}
                      <span className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-2 border-[rgb(var(--primary-text-rgb))] bg-[var(--color-primary-bg)] transition-all duration-300 group-hover:shadow-[0_0_14px_rgb(var(--primary-text-rgb)_/_0.45)]" />
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="secondary-color-text opacity-50 text-xs font-medium uppercase tracking-wider">
                          {formatDate(m.date ?? "")}
                        </span>
                        {m.category && (
                          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] secondary-color-text opacity-70 text-[10px] uppercase tracking-wider">
                            {m.category}
                          </span>
                        )}
                      </div>
                      <h3 className="secondary-color-text font-heading font-semibold text-lg mb-1">
                        {m.title}
                      </h3>
                      {m.description && (
                        <p className="secondary-color-text opacity-70 text-sm leading-relaxed">
                          {m.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
