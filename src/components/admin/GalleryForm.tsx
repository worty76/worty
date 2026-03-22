"use client";

import { useState, useEffect, useMemo } from "react";
import { ImageUpload } from "./ImageUpload";
import { Button } from "@/components/ui/Button";
import { FormInput, FormTextarea, FormSelect, Switch } from "@/components/ui/FormInput";
import { TagInput } from "@/components/ui/TagInput";
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
    tags?: string[];
    featured?: boolean;
  };
  onSuccess?: () => void;
  existingTags?: string[];
}

const CATEGORIES = [
  { value: "Adventure", label: "Adventure" },
  { value: "Travel", label: "Travel" },
  { value: "Food", label: "Food" },
  { value: "Friends", label: "Friends" },
  { value: "Nature", label: "Nature" },
  { value: "Events", label: "Events" },
  { value: "Other", label: "Other" },
];

// Common tag suggestions per category
const TAG_SUGGESTIONS: Record<string, string[]> = {
  Adventure: ["hiking", "camping", "climbing", "roadtrip", "extreme", "outdoors"],
  Travel: ["beach", "city", "mountains", "cultural", "sightseeing", "solo", "backpacking"],
  Food: ["restaurant", "street-food", "home-cooked", "dessert", "coffee", "local-cuisine"],
  Friends: ["gathering", "party", "celebration", "reunion", "weekend", "group"],
  Nature: ["landscape", "wildlife", "sunset", "sunrise", "forest", "ocean", "waterfall"],
  Events: ["wedding", "birthday", "conference", "concert", "festival", "workshop", "meetup"],
  Other: ["memory", "moment", "favorite", "throwback"],
};

const defaultValues = {
  title: "",
  description: "",
  imageUrl: "",
  date: new Date().toISOString().split("T")[0],
  location: "",
  category: "Travel",
  tags: [] as string[],
  featured: false,
};

export function GalleryForm({ initialData, onSuccess, existingTags = [] }: GalleryFormProps) {
  const [form, setForm] = useState(defaultValues);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        description: initialData.description || "",
        imageUrl: initialData.imageUrl,
        date: initialData.date,
        location: initialData.location || "",
        category: initialData.category || "Travel",
        tags: initialData.tags || [],
        featured: initialData.featured || false,
      });
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (tags: string[]) => {
    setForm((prev) => ({ ...prev, tags }));
  };

  const handleFeaturedChange = (checked: boolean) => {
    setForm((prev) => ({ ...prev, featured: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.imageUrl.trim()) {
      toast.error("Please add an image and enter a title");
      return;
    }

    setIsLoading(true);
    try {
      const galleryData = {
        title: form.title.trim(),
        description: form.description.trim() || "",
        imageUrl: form.imageUrl.trim(),
        date: form.date,
        location: form.location.trim() || "",
        category: form.category,
        tags: form.tags,
        featured: form.featured,
        updatedAt: new Date().toISOString(),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, "gallery", initialData.id), galleryData);
        toast.success("Memory updated successfully!");
      } else {
        await addDoc(collection(db, "gallery"), galleryData);
        toast.success("Memory added successfully!");
        setForm(defaultValues);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving memory:", error);
      toast.error("Failed to save memory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized suggestions
  const combinedSuggestions = useMemo(() => {
    const categorySuggestions = TAG_SUGGESTIONS[form.category] || [];
    return Array.from(new Set([...categorySuggestions, ...existingTags]));
  }, [form.category, existingTags]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ImageUpload
        value={form.imageUrl}
        onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
        label="Upload Image"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <FormInput
          label="Date"
          type="date"
          name="date"
          value={form.date}
          onChange={handleInputChange}
          required
        />

        <FormSelect
          label="Category"
          name="category"
          value={form.category}
          onChange={handleInputChange}
          options={CATEGORIES}
        />
      </div>

      <FormInput
        label="Title"
        type="text"
        name="title"
        value={form.title}
        onChange={handleInputChange}
        placeholder="A beautiful sunset at the beach..."
        required
      />

      <FormInput
        label="Location"
        type="text"
        name="location"
        value={form.location}
        onChange={handleInputChange}
        placeholder="Da Nang, Vietnam"
      />

      <FormTextarea
        label="Description"
        name="description"
        value={form.description}
        onChange={handleInputChange}
        placeholder="Tell the story behind this memory..."
        rows={3}
      />

      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          Tags
        </label>
        <TagInput
          tags={form.tags}
          onChange={handleTagsChange}
          suggestions={combinedSuggestions}
          placeholder="Add tags (e.g., beach, sunset, friends)..."
        />
        <p className="text-xs secondary-color-text opacity-60 mt-1.5">
          Tags help organize and filter your memories
        </p>
      </div>

      <Switch
        label="Featured Memory"
        description="Highlight this memory on the gallery page"
        checked={form.featured}
        onChange={handleFeaturedChange}
      />

      <Button
        type="submit"
        loading={isLoading}
        fullWidth
      >
        {initialData?.id ? "Update Memory" : "Add Memory"}
      </Button>
    </form>
  );
}
