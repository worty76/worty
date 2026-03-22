"use client";

import { useState, useEffect } from "react";
import { ImageUpload } from "./ImageUpload";
import { Button } from "@/components/ui/Button";
import { FormInput, FormTextarea } from "@/components/ui/FormInput";
import { TagInput } from "@/components/ui/TagInput";
import toast from "react-hot-toast";
import { collection, addDoc, updateDoc, doc, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

interface MusicFormProps {
  initialData?: {
    id?: string;
    title: string;
    artist: string;
    album?: string;
    coverImage: string;
    year: string;
    genre: string[];
    spotifyLink?: string;
  };
  onSuccess?: () => void;
  existingGenres?: string[];
}

const defaultValues = {
  title: "",
  artist: "",
  album: "",
  coverImage: "",
  year: new Date().getFullYear().toString(),
  genre: [] as string[],
  spotifyLink: "",
};

export function MusicForm({ initialData, onSuccess, existingGenres = [] }: MusicFormProps) {
  const [form, setForm] = useState(defaultValues);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        artist: initialData.artist,
        album: initialData.album || "",
        coverImage: initialData.coverImage,
        year: initialData.year,
        genre: initialData.genre || [],
        spotifyLink: initialData.spotifyLink || "",
      });
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (genre: string[]) => {
    setForm((prev) => ({ ...prev, genre }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.artist.trim() || !form.coverImage.trim()) {
      toast.error("Please fill in title, artist, and cover image");
      return;
    }

    setIsLoading(true);
    try {
      const musicData = {
        title: form.title.trim(),
        artist: form.artist.trim(),
        album: form.album.trim(),
        coverImage: form.coverImage.trim(),
        year: form.year,
        genre: form.genre,
        spotifyLink: form.spotifyLink.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, "music", initialData.id), musicData);
        toast.success("Music updated successfully!");
      } else {
        await addDoc(collection(db, "music"), musicData);
        toast.success("Music added successfully!");
        setForm(defaultValues);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving music:", error);
      toast.error("Failed to save music. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ImageUpload
        value={form.coverImage}
        onChange={(url) => setForm((prev) => ({ ...prev, coverImage: url }))}
        label="Cover Image"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <FormInput
          label="Title"
          type="text"
          name="title"
          value={form.title}
          onChange={handleInputChange}
          placeholder="Song title..."
          required
        />

        <FormInput
          label="Artist"
          type="text"
          name="artist"
          value={form.artist}
          onChange={handleInputChange}
          placeholder="Artist name..."
          required
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <FormInput
          label="Album"
          type="text"
          name="album"
          value={form.album}
          onChange={handleInputChange}
          placeholder="Album name..."
        />

        <FormInput
          label="Year"
          type="number"
          name="year"
          value={form.year}
          onChange={handleInputChange}
          placeholder="2024"
          required
        />

        <FormInput
          label="YouTube Link"
          type="text"
          name="spotifyLink"
          value={form.spotifyLink}
          onChange={handleInputChange}
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          Genres
        </label>
        <TagInput
          tags={form.genre}
          onChange={handleGenreChange}
          suggestions={existingGenres}
          placeholder="Add genres (e.g., Pop, Rock, Jazz)..."
        />
        <p className="text-xs secondary-color-text opacity-60 mt-1.5">
          Add one or more genres to categorize this track
        </p>
      </div>

      <Button type="submit" loading={isLoading} fullWidth>
        {initialData?.id ? "Update Music" : "Add Music"}
      </Button>
    </form>
  );
}
