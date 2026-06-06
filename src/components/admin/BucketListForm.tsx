"use client";

import { useState } from "react";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import toast from "react-hot-toast";

interface BucketItemData {
  id?: string;
  title: string;
  category: string;
  order: number;
  completed: boolean;
}

interface BucketListFormProps {
  initialData?: BucketItemData;
  onSuccess?: () => void;
}

const CATEGORIES = [
  "Travel",
  "Career",
  "Personal",
  "Adventure",
  "Learning",
  "Health",
  "Creative",
  "Financial",
  "Relationships",
  "Other",
];

export function BucketListForm({ initialData, onSuccess }: BucketListFormProps) {
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "Personal",
    order: initialData?.order || 1,
    completed: initialData?.completed || false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!confirm(`Are you sure you want to ${isEditing ? "update" : "add"} this item?`)) return;

    setIsLoading(true);
    try {
      if (isEditing && initialData?.id) {
        await updateDoc(doc(db, "bucketlist", initialData.id), {
          title: form.title.trim(),
          category: form.category,
          order: form.order,
          completed: form.completed,
          ...(form.completed ? { completedAt: new Date().toISOString() } : {}),
        });
        toast.success("Item updated!");
      } else {
        await addDoc(collection(db, "bucketlist"), {
          title: form.title.trim(),
          category: form.category,
          order: form.order,
          completed: false,
          deleted: false,
        });
        toast.success("Item added!");
      }
      onSuccess?.();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="e.g. Travel to Japan"
      />

      <div>
        <label className="block text-sm font-medium text-[rgb(221,198,182)]/70 mb-1.5">
          Category
        </label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-[rgba(221,198,182,0.1)] text-[rgb(221,198,182)] text-sm focus:outline-none focus:border-[rgba(221,198,182,0.3)]"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <FormInput
        label="Order"
        type="number"
        value={String(form.order)}
        onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
        placeholder="1-100"
      />

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.completed}
          onChange={(e) => setForm({ ...form, completed: e.target.checked })}
          className="w-4 h-4 rounded accent-amber-600"
        />
        <span className="text-sm text-[rgb(221,198,182)]/70">Completed</span>
      </label>

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSubmit} disabled={isLoading} icon={isEditing ? undefined : undefined}>
          {isEditing ? "Update Item" : "Add Item"}
        </Button>
      </div>
    </div>
  );
}
