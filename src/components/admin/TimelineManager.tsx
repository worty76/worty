"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { invalidateCollectionCache } from "@/lib/firestore-cache";

interface MilestoneDoc {
  id?: string;
  title?: string;
  date?: string;
  description?: string;
  category?: string;
  deleted?: boolean;
}

const CATEGORIES = ["Career", "Education", "Personal", "Achievement", "Other"];

const emptyForm = { title: "", date: "", category: "Career", description: "" };

export function TimelineManager() {
  const [milestones, setMilestones] = useState<MilestoneDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { confirm, dialog } = useConfirm();

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const snap = await getDocs(collection(db, "timeline"));
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as MilestoneDoc))
          .filter((m) => m.deleted !== true)
          .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
        setMilestones(list);
      } catch (e) {
        console.error("Error fetching timeline:", e);
        toast.error("Failed to load milestones");
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
  }, []);

  const invalidate = () => invalidateCollectionCache("timeline");

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (m: MilestoneDoc) => {
    setEditingId(m.id ?? null);
    setForm({
      title: m.title ?? "",
      date: m.date ?? "",
      category: m.category ?? "Other",
      description: m.description ?? "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.date || !form.description.trim()) {
      toast.error("Please fill in the title, date, and description");
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: form.title.trim(),
        date: form.date,
        category: form.category,
        description: form.description.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateDoc(doc(db, "timeline", editingId), data);
        toast.success("Milestone updated!");
      } else {
        await addDoc(collection(db, "timeline"), { ...data, deleted: false });
        toast.success("Milestone added!");
      }

      invalidate();
      const snap = await getDocs(collection(db, "timeline"));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as MilestoneDoc))
        .filter((m) => m.deleted !== true)
        .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
      setMilestones(list);
      closeForm();
    } catch (error) {
      console.error("Error saving milestone:", error);
      toast.error("Failed to save milestone");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: MilestoneDoc) => {
    const ok = await confirm({
      title: "Delete this milestone?",
      message: "It will be moved to trash. You can restore it later.",
      confirmLabel: "Move to Trash",
      danger: true,
    });
    if (!ok || !m.id) return;

    try {
      await updateDoc(doc(db, "timeline", m.id), { deleted: true });
      invalidate();
      setMilestones((prev) => prev.filter((item) => item.id !== m.id));
      toast.success("Milestone moved to trash!");
    } catch (e) {
      console.error("Error deleting milestone:", e);
      toast.error("Failed to delete milestone");
    }
  };

  if (loading) {
    return <p className="secondary-color-text opacity-60 text-sm">Loading…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="secondary-color-text opacity-60 text-sm">
          {milestones.length} {milestones.length === 1 ? "milestone" : "milestones"}
        </p>
        <Button
          onClick={startAdd}
          icon={<FaPlus size={12} />}
          className={showForm ? "opacity-50 pointer-events-none" : ""}
        >
          Add milestone
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSave}
          className="mb-6 p-4 rounded-2xl border border-[rgb(var(--primary-text-rgb)_/_0.1)] bg-white/[0.03] space-y-4"
        >
          <FormInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g., Graduated from university"
            required
          />
          <FormInput
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />
          <FormInput
            label="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="Career, Education, Personal…"
            list="timeline-category-suggestions"
          />
          <datalist id="timeline-category-suggestions">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <div>
            <label className="block text-sm font-semibold secondary-color-text mb-2">
              Describe what you did
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              required
              placeholder="e.g., Led the team that rebuilt the payment service in Go…"
              className="w-full rounded-xl px-4 py-3 bg-white/5 border border-[rgb(var(--primary-text-rgb)_/_0.1)] secondary-color-text placeholder:opacity-30 focus:outline-none focus:border-[rgb(var(--primary-text-rgb)_/_0.2)] transition-colors text-sm resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" loading={saving}>
              {editingId ? "Update milestone" : "Add milestone"}
            </Button>
            <Button type="button" variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {milestones.length === 0 ? (
        <p className="secondary-color-text opacity-50 text-sm text-center py-10">
          No milestones yet — add your first one above.
        </p>
      ) : (
        <ul className="space-y-2">
          {milestones.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-[rgb(var(--primary-text-rgb)_/_0.08)] hover:bg-white/[0.05] transition-colors"
            >
              <span className="text-xs secondary-color-text opacity-50 shrink-0 w-20">
                {m.date}
              </span>
              {m.category && (
                <span className="px-2 py-0.5 rounded-full bg-white/[0.06] secondary-color-text opacity-60 text-[10px] uppercase tracking-wider shrink-0">
                  {m.category}
                </span>
              )}
              <span className="flex-1 min-w-0 text-sm secondary-color-text truncate">
                {m.title}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(m)}
                  className="p-2 secondary-color-text opacity-60 hover:opacity-100 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <FaEdit size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(m)}
                  className="p-2 text-red-400 opacity-60 hover:opacity-100 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <FaTrash size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {dialog}
    </div>
  );
}
