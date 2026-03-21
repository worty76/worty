"use client";

import { useState, useEffect } from "react";
import { ImageUpload } from "./ImageUpload";
import toast from "react-hot-toast";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";

interface GalleryFormProps {
  initialData?: {
    id?: string;
    title: string;
    description?: string;
    imageUrl: string;
    date: string;
    location?: string;
    category?: string;
  };
  onSuccess?: () => void;
}

const CATEGORIES = [
  "Adventure",
  "Travel",
  "Food",
  "Friends",
  "Nature",
  "Events",
  "Other",
];

export function GalleryForm({ initialData, onSuccess }: GalleryFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    location: initialData?.location || "",
    category: initialData?.category || "Travel",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        imageUrl: initialData.imageUrl,
        date: initialData.date,
        location: initialData.location || "",
        category: initialData.category || "Travel",
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      toast.error("Please add an image and enter a title");
      return;
    }

    setIsLoading(true);
    try {
      const galleryData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim(),
        date: formData.date,
        location: formData.location.trim(),
        category: formData.category,
        updatedAt: new Date().toISOString(),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, "gallery", initialData.id), galleryData);
        toast.success("Memory updated successfully!");
      } else {
        await addDoc(collection(db, "gallery"), galleryData);
        toast.success("Memory added successfully!");
        // Reset form
        setFormData({
          title: "",
          description: "",
          imageUrl: "",
          date: new Date().toISOString().split("T")[0],
          location: "",
          category: "Travel",
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving memory:", error);
      toast.error("Failed to save memory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <ImageUpload
        value={formData.imageUrl}
        onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
        label="📷 Upload Image"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold secondary-color-text mb-3">
            📅 Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold secondary-color-text mb-3">
            🏷️ Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          ✏️ Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="A beautiful sunset at the beach..."
          required
          className="w-full px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          📍 Location
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="Da Nang, Vietnam"
          className="w-full px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          📝 Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Tell the story behind this memory..."
          rows={3}
          className="w-full px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 resize-none"
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
          ? "✅ Update Memory"
          : "✨ Add Memory"}
      </button>
    </form>
  );
}
