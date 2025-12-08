"use client";

import { useState, useEffect } from "react";
import { MarkdownEditor } from "./MarkdownEditor";
import toast from "react-hot-toast";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";

interface BlogFormProps {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    content: string;
    image: string;
    category: string[];
    datetime: string;
    readingTime?: string;
  };
  onSuccess?: () => void;
}

export function BlogForm({ initialData, onSuccess }: BlogFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    image: initialData?.image || "",
    category: initialData?.category?.join(", ") || "",
    readingTime: initialData?.readingTime || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        content: initialData.content,
        image: initialData.image,
        category: initialData.category?.join(", ") || "",
        readingTime: initialData.readingTime || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.content.trim() ||
      !formData.image.trim() ||
      !formData.category.trim() ||
      !formData.readingTime.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const categories = formData.category
        .split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat.length > 0);

      // Generate UUID for new posts
      const postId = initialData?.id || crypto.randomUUID();

      const blogData = {
        id: postId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        image: formData.image.trim(),
        category: categories,
        readingTime: formData.readingTime.trim(),
        datetime:
          initialData?.datetime || new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString(),
      };

      if (initialData?.id) {
        // Update existing blog
        await updateDoc(doc(db, "blog", initialData.id), blogData);
        toast.success("Blog updated successfully!");
      } else {
        // Create new blog
        await addDoc(collection(db, "blog"), blogData);
        toast.success("Blog created successfully!");
        // Reset form
        setFormData({
          title: "",
          description: "",
          content: "",
          image: "",
          category: "",
          readingTime: "",
        });
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
      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          📖 Blog Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter an engaging blog title..."
          className="w-full px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          💬 Description
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Write a brief summary (2-3 sentences)..."
          className="w-full px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          🖼️ Featured Image
        </label>
        <input
          type="url"
          name="image"
          value={formData.image}
          onChange={handleInputChange}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
        />
        {formData.image && (
          <div className="mt-4 relative group">
            <img
              src={formData.image}
              alt="Preview"
              className="w-full max-h-56 rounded-lg object-cover border secondary-color-border opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          ⏱️ Reading Time
        </label>
        <input
          type="text"
          name="readingTime"
          value={formData.readingTime}
          onChange={handleInputChange}
          placeholder="e.g., 5 min"
          className="w-full px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
        />
        <p className="text-xs secondary-color-text opacity-60 mt-2">
          Estimated time to read the article
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          🏷️ Categories
        </label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          placeholder="e.g., Technology, Tutorial, News"
          className="w-full px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
        />
        <p className="text-xs secondary-color-text opacity-60 mt-2">
          Separate multiple categories with commas
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          ✍️ Content (Markdown)
        </label>
        <MarkdownEditor
          value={formData.content}
          onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 rounded-lg secondary-color-bg primary-color-text font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? "💾 Saving..."
          : initialData?.id
          ? "✅ Update Blog"
          : "✨ Create Blog"}
      </button>
    </form>
  );
}
