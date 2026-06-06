"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaRecycle } from "react-icons/fa";
import { LoadingSkeleton } from "@/components/ui/LoadingStates";
import { Button } from "@/components/ui/Button";

interface BucketItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  order: number;
  deleted?: boolean;
  completedAt?: string;
}

interface BucketListProps {
  onEdit: (item: BucketItem) => void;
  refreshTrigger: number;
}

export function BucketList({ onEdit, refreshTrigger }: BucketListProps) {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snap = await getDocs(collection(db, "bucketlist"));
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as BucketItem))
          .sort((a, b) => a.order - b.order);
        setItems(list);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Move this item to trash?")) return;
    try {
      await updateDoc(doc(db, "bucketlist", id), { deleted: true });
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item moved to trash");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await updateDoc(doc(db, "bucketlist", id), { deleted: false });
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item restored");
    } catch (e) {
      toast.error("Failed to restore");
    }
  };

  const visible = showDeleted
    ? items.filter((i) => i.deleted)
    : items.filter((i) => !i.deleted);

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant={showDeleted ? "primary" : "ghost"}
          size="sm"
          onClick={() => setShowDeleted(!showDeleted)}
          icon={showDeleted ? <FaRecycle size={12} /> : <FaTrash size={12} />}
        >
          {showDeleted ? "Active Items" : "Trash"}
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="text-[rgb(221,198,182)]/30 text-sm text-center py-8">
          {showDeleted ? "No deleted items" : "No items yet"}
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-[rgba(221,198,182,0.06)] hover:border-[rgba(221,198,182,0.15)] transition-all"
            >
              <span className="text-[rgb(221,198,182)]/25 text-xs font-mono w-8 text-right shrink-0">
                {item.order}
              </span>
              <span className={`flex-1 text-sm ${item.completed ? "line-through text-[rgb(221,198,182)]/40" : "text-[rgb(221,198,182)]"}`}>
                {item.title}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-[rgb(221,198,182)]/50 shrink-0">
                {item.category}
              </span>
              {item.completed && (
                <span className="text-emerald-500 text-xs shrink-0">✓</span>
              )}
              <div className="flex gap-2 shrink-0">
                {showDeleted ? (
                  <Button variant="ghost" size="sm" onClick={() => handleRestore(item.id)} icon={<FaRecycle size={12} />}>
                    Restore
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)} icon={<FaEdit size={12} />} />
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} icon={<FaTrash size={12} />} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
