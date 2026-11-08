"use client";

import { useState, useEffect } from "react";
import { fetchCollectionCached } from "@/lib/firestore-cache";
import { FaCheck } from "react-icons/fa";

export const dynamic = "force-dynamic";

interface BucketItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  completedAt?: string;
  order: number;
  deleted?: boolean;
}

const STATUS_FILTERS = ["All", "Completed", "Remaining"] as const;

export default function BucketListPage() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const list = (await fetchCollectionCached<BucketItem>("bucketlist"))
          .filter((item) => !item.deleted)
          .sort((a, b) => a.order - b.order);
        setItems(list);
      } catch (e) {
        console.error("Error fetching bucket list:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = items.filter((item) => {
    if (categoryFilter !== "All" && item.category !== categoryFilter) return false;
    if (statusFilter === "Completed" && !item.completed) return false;
    if (statusFilter === "Remaining" && item.completed) return false;
    return true;
  });

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length || 100;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-[rgb(var(--primary-text-rgb))] opacity-40 text-sm">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 mg-head">
          <span className="mg-kana">やりたいこと</span>
          <h1 className="secondary-color-text font-heading text-3xl md:text-4xl font-bold mb-4">
            100 Things To Do <span className="mg-brush">Before I Die</span>
          </h1>
          <p className="text-sm secondary-color-text opacity-50 mt-1">
            {completedCount} of {totalCount} completed
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mg-bar">
            <div
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-2">
          {/* Status */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`mg-chip ${statusFilter === s ? "is-on" : ""}`}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Category */}
          {categories.length > 2 && (
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`mg-chip ${categoryFilter === cat ? "is-on" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List */}
        <div className="space-y-0.5">
          {filtered.length === 0 ? (
            <p className="secondary-color-text opacity-30 text-sm text-center py-12">No items yet.</p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-3 px-2 border-b border-dashed border-[rgb(var(--primary-text-rgb)_/_0.15)] hover:bg-white/[0.03] transition-colors"
              >
                {/* Check */}
                {item.completed ? (
                  <span className="mg-check is-done"><FaCheck size={9} /></span>
                ) : (
                  <span className="mg-check" />
                )}

                {/* Title */}
                <span className={`flex-1 text-sm ${
                  item.completed
                    ? "secondary-color-text opacity-45 line-through decoration-[rgb(var(--primary-text-rgb)_/_0.5)]"
                    : "secondary-color-text"
                }`}>
                  {item.title}
                </span>

                {/* Category */}
                <span className="shrink-0 mg-caption !text-[10px] !font-semibold opacity-70">
                  {item.category}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
