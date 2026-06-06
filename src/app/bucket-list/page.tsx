"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
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
        <div className="text-[rgb(221,198,182)] opacity-40 text-sm">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen primary-color-bg px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest secondary-color-text opacity-30 mb-2">Personal</p>
          <h1 className="secondary-color-text text-2xl font-bold">100 Things To Do Before I Die</h1>
          <p className="text-sm secondary-color-text opacity-40 mt-1">
            {completedCount} of {totalCount} completed
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%`, backgroundColor: "rgb(217, 164, 65)" }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap mb-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-[rgb(221,198,182)] text-[rgb(38,34,35)]"
                    : "bg-white/5 secondary-color-text opacity-50 hover:opacity-80"
                }`}
              >
                {s}
              </button>
            ))}
            {categories.filter(c => c !== "All").map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? "bg-[rgb(221,198,182)] text-[rgb(38,34,35)]"
                    : "bg-white/5 secondary-color-text opacity-50 hover:opacity-80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-0.5">
          {filtered.length === 0 ? (
            <p className="secondary-color-text opacity-30 text-sm text-center py-12">No items yet.</p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                {/* Number */}
                <span className="text-xs font-mono secondary-color-text opacity-25 w-6 text-right shrink-0">
                  {item.order}
                </span>

                {/* Check */}
                {item.completed ? (
                  <span className="shrink-0 text-emerald-500"><FaCheck size={10} /></span>
                ) : (
                  <span className="shrink-0 w-2.5 h-2.5 rounded-full border border-[rgb(221,198,182)]/20" />
                )}

                {/* Title */}
                <span className={`flex-1 text-sm ${
                  item.completed
                    ? "secondary-color-text opacity-45"
                    : "secondary-color-text"
                }`}>
                  {item.title}
                </span>

                {/* Category */}
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] bg-white/5 secondary-color-text opacity-40">
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
