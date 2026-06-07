"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import toast from "react-hot-toast";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";

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
  };
  onSuccess?: () => void;
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
};

export function ProjectForm({ initialData, onSuccess }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState(initialData ? {
    ...defaultValues,
    ...initialData,
  } : defaultValues);

  useEffect(() => {
    if (initialData) {
      setForm({ ...defaultValues, ...initialData });
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

    if (!confirm("Are you sure you want to save this project?")) return;

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
        updatedAt: new Date().toISOString(),
      };

      if (initialData?.docId) {
        await updateDoc(doc(db, "projects", initialData.docId), data);
        toast.success("Project updated successfully!");
      } else {
        await addDoc(collection(db, "projects"), {
          ...data,
          createdAt: new Date().toISOString(),
        });
        toast.success("Project created successfully!");
        setForm(defaultValues);
      }

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
          className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 secondary-color-text placeholder:opacity-30 focus:outline-none focus:border-white/20 transition-colors text-sm resize-none"
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

      <FormInput
        label="Image URL"
        name="imageUrl"
        value={form.imageUrl}
        onChange={handleChange}
        placeholder="https://example.com/screenshot.png"
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
              className="w-4 h-4 rounded bg-white/5 border-white/20 text-amber-400 focus:ring-amber-400/30"
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
