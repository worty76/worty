"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck,  } from "@fortawesome/free-solid-svg-icons";
import { LoadingSpinner } from "@/components/ui/LoadingStates";

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
        const snap = await getDocs(collection(db, "bucketlist"));
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as BucketItem))
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
      <main className="min-h-screen primary-color-bg flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="min-h-screen primary-color-bg px-4 sm:px-8 md:px-16 lg:px-24 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="secondary-color-text font-heading text-3xl sm:text-4xl font-bold mb-2">
            Things to Do Before I Die
          </h1>
          <p className="text-[rgb(221,198,182)]/50 text-sm">
            A personal list of goals, dreams, and experiences.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[rgb(221,198,182)]/70 text-sm font-medium">
              {completedCount}/{totalCount} completed
            </span>
            <span className="text-[rgb(221,198,182)]/50 text-sm">{percentage}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-600/80 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-8">
          {/* Status pills */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s
                    ? "bg-white/10 text-[rgb(221,198,182)]"
                    : "text-[rgb(221,198,182)]/40 hover:text-[rgb(221,198,182)]/70 hover:bg-white/[0.03]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  categoryFilter === cat
                    ? "bg-white/10 text-[rgb(221,198,182)]"
                    : "bg-white/5 text-[rgb(221,198,182)]/50 hover:text-[rgb(221,198,182)]/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <p className="text-[rgb(221,198,182)]/30 text-sm text-center py-12">
              No items found.
            </p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all hover:bg-white/[0.03] ${
                  item.completed ? "opacity-50" : ""
                }`}
              >
                {/* Number */}
                <span className="text-[rgb(221,198,182)]/25 text-xs font-mono w-8 text-right shrink-0">
                  {item.order}
                </span>

                {/* Checkmark */}
                <span className={`shrink-0 ${item.completed ? "text-emerald-500" : "text-[rgb(221,198,182)]/15"}`}>
                  <FontAwesomeIcon icon={faCheck} size="xs" />
                </span>

                {/* Title */}
                <span
                  className={`flex-1 text-sm ${
                    item.completed
                      ? "line-through text-[rgb(221,198,182)]/40"
                      : "text-[rgb(221,198,182)]"
                  }`}
                >
                  {item.title}
                </span>

                {/* Category badge */}
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-[rgb(221,198,182)]/50">
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
