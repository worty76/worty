"use client";

import { useState, useEffect } from "react";
import { ImageUpload } from "./ImageUpload";
import { Button } from "@/components/ui/Button";
import { FormInput, FormTextarea, FormSelect } from "@/components/ui/FormInput";
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
  { value: "Adventure", label: "Adventure" },
  { value: "Travel", label: "Travel" },
  { value: "Food", label: "Food" },
  { value: "Friends", label: "Friends" },
  { value: "Nature", label: "Nature" },
  { value: "Events", label: "Events" },
  { value: "Other", label: "Other" },
];

const defaultValues = {
  title: "",
  description: "",
  imageUrl: "",
  date: new Date().toISOString().split("T")[0],
  location: "",
  category: "Travel",
};

export function GalleryForm({ initialData, onSuccess }: GalleryFormProps) {
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
      });
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: typeof defaultValues) => ({ ...prev, [name]: value }));
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
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        date: form.date,
        location: form.location.trim(),
        category: form.category,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ImageUpload
        value={form.imageUrl}
        onChange={(url) => setForm((prev: typeof defaultValues) => ({ ...prev, imageUrl: url }))}
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
