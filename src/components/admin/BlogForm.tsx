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
    titleVi?: string;
    descriptionVi?: string;
    contentVi?: string;
    readingTimeVi?: string;
  };
  onSuccess?: () => void;
}

const STATUS_OPTIONS: Array<{ value: BlogStatus; label: string }> = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "in-progress", label: "In Progress" },
  { value: "archived", label: "Archived" },
];

type LanguageTab = "en" | "vi";

const defaultValues = {
  title: "",
  description: "",
  content: "",
  image: "",
  category: "",
  readingTime: "",
  status: "draft" as BlogStatus,
  titleVi: "",
  descriptionVi: "",
  contentVi: "",
  readingTimeVi: "",
};

export function BlogForm({ initialData, onSuccess }: BlogFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [langTab, setLangTab] = useState<LanguageTab>("en");

  const formData = initialData
    ? {
        ...initialData,
        category: initialData.category?.join(", ") || "",
        readingTime: initialData.readingTime || "",
        status: initialData.status || "draft" as BlogStatus,
        titleVi: initialData.titleVi || "",
        descriptionVi: initialData.descriptionVi || "",
        contentVi: initialData.contentVi || "",
        readingTimeVi: initialData.readingTimeVi || "",
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
        titleVi: initialData.titleVi || "",
        descriptionVi: initialData.descriptionVi || "",
        contentVi: initialData.contentVi || "",
        readingTimeVi: initialData.readingTimeVi || "",
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

    if (!confirm("Are you sure you want to save this post?")) return;

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
        titleVi: (form as any).titleVi?.trim() || "",
        descriptionVi: (form as any).descriptionVi?.trim() || "",
        contentVi: (form as any).contentVi?.trim() || "",
        readingTimeVi: (form as any).readingTimeVi?.trim() || "",
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
      {/* Language Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLangTab("en")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            langTab === "en"
              ? "bg-white/[0.12] secondary-color-text border border-[rgba(221,198,182,0.2)]"
              : "secondary-color-text opacity-50 hover:opacity-80 border border-transparent"
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLangTab("vi")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            langTab === "vi"
              ? "bg-white/[0.12] secondary-color-text border border-[rgba(221,198,182,0.2)]"
              : "secondary-color-text opacity-50 hover:opacity-80 border border-transparent"
          }`}
        >
          Tiếng Việt
        </button>
        {langTab === "vi" && (
          <span className="text-xs secondary-color-text opacity-40 ml-1">Optional — English shown as fallback</span>
        )}
      </div>

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
          name={langTab === "vi" ? "readingTimeVi" : "readingTime"}
          value={langTab === "vi" ? (form as any).readingTimeVi : form.readingTime}
          onChange={handleInputChange}
          placeholder="e.g., 5 min"
          required={langTab === "en"}
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
        label={langTab === "vi" ? "Blog Title (Tiếng Việt)" : "Blog Title"}
        name={langTab === "vi" ? "titleVi" : "title"}
        value={langTab === "vi" ? (form as any).titleVi : form.title}
        onChange={handleInputChange}
        placeholder={langTab === "vi" ? "Nhập tiêu đề..." : "Enter an engaging blog title..."}
        required={langTab === "en"}
      />

      <FormInput
        label={langTab === "vi" ? "Description (Tiếng Việt)" : "Description"}
        name={langTab === "vi" ? "descriptionVi" : "description"}
        value={langTab === "vi" ? (form as any).descriptionVi : form.description}
        onChange={handleInputChange}
        placeholder={langTab === "vi" ? "Viết tóm tắt ngắn..." : "Write a brief summary (2-3 sentences)..."}
        required={langTab === "en"}
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
          Content (Markdown){langTab === "vi" ? " — Tiếng Việt" : ""}
        </label>
        <MarkdownEditor
          value={langTab === "vi" ? (form as any).contentVi : form.content}
          onChange={(content) => {
            setForm((prev: any) => ({
              ...prev,
              [langTab === "vi" ? "contentVi" : "content"]: content,
            }));
          }}
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
