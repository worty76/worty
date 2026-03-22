"use client";

import { useState, useEffect } from "react";
import { MarkdownEditor } from "./MarkdownEditor";
import { ImageUpload } from "./ImageUpload";
import { Button } from "@/components/ui/Button";
import { FormInput, FormSelect } from "@/components/ui/FormInput";
import { BlogStatus } from "@/components/ui/StatusBadge";
import { MarkdownGuide } from "./MarkdownGuide";
import toast from "react-hot-toast";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";

interface BlogFormProps {
  initialData?: {
    docId?: string; // Firestore document ID
    title: string;
    description: string;
    content: string;
    image: string;
    category: string[];
    datetime: string;
    readingTime?: string;
    status?: BlogStatus;
  };
  onSuccess?: () => void;
}

const STATUS_OPTIONS: Array<{ value: BlogStatus; label: string }> = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "in-progress", label: "In Progress" },
  { value: "archived", label: "Archived" },
];

const defaultValues = {
  title: "",
  description: "",
  content: "",
  image: "",
  category: "",
  readingTime: "",
  status: "draft" as BlogStatus,
};

export function BlogForm({ initialData, onSuccess }: BlogFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formData = initialData
    ? {
        ...initialData,
        category: initialData.category?.join(", ") || "",
        readingTime: initialData.readingTime || "",
        status: initialData.status || "draft" as BlogStatus,
      }
    : defaultValues;

  const [form, setForm] = useState(formData);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        description: initialData.description,
        content: initialData.content,
        image: initialData.image,
        category: initialData.category?.join(", ") || "",
        readingTime: initialData.readingTime || "",
        status: initialData.status || "draft",
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: typeof formData) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev: typeof formData) => ({ ...prev, status: e.target.value as BlogStatus }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = ["title", "description", "content", "image", "category", "readingTime"] as const;
    const missingField = requiredFields.find((field) => !form[field]?.trim());

    if (missingField) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const categories = form.category
        .split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat.length > 0);

      const blogData = {
        // NO custom 'id' field - use Firestore document ID instead
        title: form.title.trim(),
        description: form.description.trim(),
        content: form.content.trim(),
        image: form.image.trim(),
        category: categories,
        readingTime: form.readingTime.trim(),
        status: form.status,
        datetime: initialData?.datetime || new Date().toISOString().split("T")[0],
        createdAt: initialData?.datetime || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (initialData?.docId) {
        // Update existing blog - use document ID
        await updateDoc(doc(db, "blog", initialData.docId), blogData);
        toast.success("Blog updated successfully!");
      } else {
        // Create new blog - let Firestore auto-generate document ID
        const docRef = await addDoc(collection(db, "blog"), blogData);
        toast.success("Blog created successfully!");
        setForm(defaultValues);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save blog. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <FormSelect
          label="Status"
          name="status"
          value={form.status}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
        />
        <FormInput
          label="Reading Time"
          name="readingTime"
          value={form.readingTime}
          onChange={handleInputChange}
          placeholder="e.g., 5 min"
          required
        />
      </div>
      <p className="text-xs secondary-color-text opacity-60 -mt-4">
        {form.status === "published"
          ? "This post will be visible to everyone"
          : form.status === "in-progress"
          ? "Readers will see this is still being worked on"
          : form.status === "draft"
          ? "This post is hidden from readers"
          : "This post is archived and won't appear in lists"}
      </p>

      <FormInput
        label="Blog Title"
        name="title"
        value={form.title}
        onChange={handleInputChange}
        placeholder="Enter an engaging blog title..."
        required
      />

      <FormInput
        label="Description"
        name="description"
        value={form.description}
        onChange={handleInputChange}
        placeholder="Write a brief summary (2-3 sentences)..."
        required
      />

      <ImageUpload
        value={form.image}
        onChange={(url) => setForm((prev: typeof defaultValues) => ({ ...prev, image: url }))}
        label="Featured Image"
      />

      <FormInput
        label="Categories"
        name="category"
        value={form.category}
        onChange={handleInputChange}
        placeholder="e.g., Technology, Tutorial, News"
        required
      />
      <p className="text-xs secondary-color-text opacity-60 -mt-4">
        Separate multiple categories with commas
      </p>

      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          Content (Markdown)
        </label>
        <MarkdownEditor
          value={form.content}
          onChange={(content) => setForm((prev: typeof defaultValues) => ({ ...prev, content }))}
        />
      </div>

      <MarkdownGuide />

      <Button
        type="submit"
        loading={isLoading}
        fullWidth
      >
        {initialData?.docId ? "Update Blog" : "Create Blog"}
      </Button>
    </form>
  );
}
