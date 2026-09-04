"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FaCloudUploadAlt, FaImage, FaTrash, FaCheckCircle } from "react-icons/fa";
import { discardPendingImageUpload, registerPendingImageUpload } from "@/lib/image-uploads";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

/**
 * Picking a file only registers it as a pending upload (local preview, no
 * network). The form's save handler calls resolvePendingImageUploads, which
 * uploads the file to ImageKit and swaps the marker for the real URL.
 */
export function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const markerRef = useRef<string | null>(null);

  const imageKitUrl = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  const handleFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, WebP, GIF)");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // queue the upload — it runs when the form is saved
    if (markerRef.current) discardPendingImageUpload(markerRef.current);
    markerRef.current = registerPendingImageUpload(file);
    onChange(markerRef.current);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    if (markerRef.current) {
      discardPendingImageUpload(markerRef.current);
      markerRef.current = null;
    }
    onChange("");
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (value || preview) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold secondary-color-text">{label}</label>
        <div className="relative group rounded-2xl overflow-hidden bg-white/5 border secondary-color-border">
          <div className="relative aspect-video">
            <Image
              src={(preview as string) || value}
              alt="Preview"
              fill
              quality={100}
              unoptimized={!!preview}
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 p-2.5 bg-red-500/80 hover:bg-red-500 rounded-xl text-white shadow-lg backdrop-blur-sm transition-all duration-200 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
            title="Remove image"
          >
            <FaTrash size={14} />
          </button>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs">
            <FaCheckCircle size={10} className="text-white opacity-80" />
            Image ready — uploads when you save
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold secondary-color-text">{label}</label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragOver ? "border-[rgb(var(--primary-text-rgb))] bg-[rgb(var(--primary-text-rgb)_/_0.1)] scale-[1.01]" : "border-[rgb(var(--primary-text-rgb)_/_0.15)] bg-black/20 hover:bg-[rgb(var(--primary-text-rgb)_/_0.05)] hover:border-[rgb(var(--primary-text-rgb)_/_0.3)]"}
        `}
      >
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.06] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {imageKitUrl ? (
              <FaCloudUploadAlt className="text-4xl secondary-color-text" />
            ) : (
              <FaImage className="text-4xl secondary-color-text opacity-40" />
            )}
          </div>
          <div className="text-center">
            <p className="secondary-color-text font-medium text-lg">
              {imageKitUrl ? "Drop an image here or click to upload" : "ImageKit not configured"}
            </p>
            <p className="secondary-color-text opacity-50 text-sm mt-1.5">
              {imageKitUrl ? "JPG, PNG, WebP, GIF up to 20MB" : "Add ImageKit environment variables"}
            </p>
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
