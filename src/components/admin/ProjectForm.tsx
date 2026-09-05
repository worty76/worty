"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { ImageUpload } from "./ImageUpload";
import toast from "react-hot-toast";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { invalidateCollectionCache } from "@/lib/firestore-cache";
import { resolvePendingImageUploads } from "@/lib/image-uploads";

interface ProjectFormProps {
  initialData?: {
    docId?: string;
    title: string;
    description: string;
    techStack: string;
    imageUrl: string;
    githubUrl?: string;
    liveUrl?: string;
    order: number;
    featured: boolean;
    /** legacy field — old docs used a boolean instead of category */
    contributed?: boolean;
    category?: string;
    myRole?: string;
    contributions?: string;
    features?: string;
    stars?: number | string;
    installations?: number | string;
  };
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const defaultValues = {
  title: "",
  description: "",
  techStack: "",
  imageUrl: "",
  githubUrl: "",
  liveUrl: "",
  order: 0,
  featured: false,
  category: "own",
  myRole: "",
  contributions: "",
  features: "",
  stars: "",
  installations: "",
};

export function ProjectForm({ initialData, onSuccess, onDirtyChange }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const initialValues = initialData
    ? {
        ...defaultValues,
        ...initialData,
        category: initialData.category ?? (initialData.contributed ? "contribute" : "own"),
      }
    : defaultValues;
  const [form, setForm] = useState(initialValues);
  const pristineRef = useRef(JSON.stringify(initialValues));
  const isDirty = JSON.stringify(form) !== pristineRef.current;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (initialData) {
      const next = { ...defaultValues, ...initialData };
      setForm(next);
      pristineRef.current = JSON.stringify(next);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please fill in title and description");
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        title: form.title.trim(),
        description: form.description.trim(),
        techStack: form.techStack.trim(),
        imageUrl: form.imageUrl.trim(),
        githubUrl: form.githubUrl?.trim() || "",
        liveUrl: form.liveUrl?.trim() || "",
        order: Number(form.order) || 0,
        featured: form.featured,
        category: form.category,
        contributed: form.category === "contribute",
        myRole: form.myRole.trim(),
        contributions: form.contributions.split("\n").map((s) => s.trim()).filter(Boolean),
        features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
        stars: Number(form.stars) || 0,
        installations: Number(form.installations) || 0,
        updatedAt: new Date().toISOString(),
      };

      if (initialData?.docId) {
        await updateDoc(doc(db, "projects", initialData.docId), await resolvePendingImageUploads(data));
        toast.success("Project updated successfully!");
      } else {
        await addDoc(collection(db, "projects"), {
          ...(await resolvePendingImageUploads(data)),
          createdAt: new Date().toISOString(),
        });
        toast.success("Project created successfully!");
        setForm(defaultValues);
      }

      invalidateCollectionCache("projects");
      onSuccess?.();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        label="Project Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="My Awesome Project"
        required
      />

      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-2">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="A brief description of the project..."
          required
          rows={3}
          className="w-full rounded-xl px-4 py-3 bg-white/5 border border-[rgb(var(--primary-text-rgb)_/_0.1)] secondary-color-text placeholder:opacity-30 focus:outline-none focus:border-[rgb(var(--primary-text-rgb)_/_0.2)] transition-colors text-sm resize-none"
        />
      </div>

      <FormInput
        label="Tech Stack"
        name="techStack"
        value={form.techStack}
        onChange={handleChange}
        placeholder="Go, PostgreSQL, Docker"
      />
      <p className="text-xs secondary-color-text opacity-60 -mt-4">Separate with commas</p>

      <ImageUpload
        value={form.imageUrl}
        onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
        label="Project image"
      />

      <FormInput
        label="GitHub URL"
        name="githubUrl"
        value={form.githubUrl || ""}
        onChange={handleChange}
        placeholder="https://github.com/user/repo"
      />

      <FormInput
        label="Live Demo URL"
        name="liveUrl"
        value={form.liveUrl || ""}
        onChange={handleChange}
        placeholder="https://example.com"
      />

      {/* Project type */}
      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-2">
          Project type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: "own", label: "My own project", hint: "Something I built and maintain" },
            { value: "contribute", label: "Contribution", hint: "Work I did for a company or an existing product" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                form.category === opt.value
                  ? "border-[rgb(var(--primary-text-rgb)_/_0.4)] bg-white/[0.06]"
                  : "border-[rgb(var(--primary-text-rgb)_/_0.1)] hover:bg-white/[0.03]"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={opt.value}
                checked={form.category === opt.value}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 accent-[rgb(var(--primary-text-rgb))]"
              />
              <span>
                <span className="block text-sm font-medium secondary-color-text">{opt.label}</span>
                <span className="block text-xs secondary-color-text opacity-50 mt-0.5">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {form.category === "contribute" && (
        <FormInput
          label="Your role"
          name="myRole"
          value={form.myRole}
          onChange={handleChange}
          placeholder="e.g., Backend Contributor"
        />
      )}

      {form.category === "contribute" ? (
        <div>
          <label className="block text-sm font-semibold secondary-color-text mb-2">
            My contributions (one per line)
          </label>
          <textarea
            name="contributions"
            value={form.contributions}
            onChange={handleChange}
            rows={4}
            placeholder={"Implemented the authentication service\nOptimized database queries"}
            className="w-full rounded-xl px-4 py-3 bg-white/5 border border-[rgb(var(--primary-text-rgb)_/_0.1)] secondary-color-text placeholder:opacity-30 focus:outline-none focus:border-[rgb(var(--primary-text-rgb)_/_0.2)] transition-colors text-sm resize-none"
          />
          <p className="text-xs secondary-color-text opacity-60 mt-1">
            Shown on the project page as a list
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold secondary-color-text mb-2">
            Key features (one per line)
          </label>
          <textarea
            name="features"
            value={form.features}
            onChange={handleChange}
            rows={4}
            placeholder={"Realtime chat with rooms\nDark mode support"}
            className="w-full rounded-xl px-4 py-3 bg-white/5 border border-[rgb(var(--primary-text-rgb)_/_0.1)] secondary-color-text placeholder:opacity-30 focus:outline-none focus:border-[rgb(var(--primary-text-rgb)_/_0.2)] transition-colors text-sm resize-none"
          />
          <p className="text-xs secondary-color-text opacity-60 mt-1">
            Shown on the project page as a list
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="GitHub Stars"
          name="stars"
          type="number"
          value={String(form.stars)}
          onChange={handleChange}
          placeholder="0"
        />
        <FormInput
          label="Installations"
          name="installations"
          type="number"
          value={String(form.installations)}
          onChange={handleChange}
          placeholder="0"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Order"
          name="order"
          type="number"
          value={String(form.order)}
          onChange={handleChange}
          placeholder="0"
        />

        <div className="flex items-end pb-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="w-4 h-4 rounded bg-white/5 border-[rgb(var(--primary-text-rgb)_/_0.2)] accent-[rgb(var(--primary-text-rgb))]"
            />
            <span className="text-sm secondary-color-text">Featured project</span>
          </label>
        </div>
      </div>

      <Button type="submit" loading={isLoading} fullWidth>
        {initialData?.docId ? "Update Project" : "Create Project"}
      </Button>
    </form>
  );
}
