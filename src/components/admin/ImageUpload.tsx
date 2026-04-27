"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { FaCloudUploadAlt, FaImage, FaTrash, FaCheckCircle } from "react-icons/fa";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageKitUrl = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  const imageKitPublicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

  const uploadFile = useCallback(async (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, PNG, WebP, GIF)");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert("File size must be less than 20MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setIsLoading(true);

    try {
      if (!imageKitUrl || !imageKitPublicKey) {
        throw new Error("ImageKit is not configured properly");
      }
      const authResponse = await fetch("/api/imagekit-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!authResponse.ok) throw new Error("Failed to get upload authentication");
      const authData = await authResponse.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", imageKitPublicKey);
      formData.append("signature", authData.signature);
      formData.append("expire", authData.expire.toString());
      formData.append("token", authData.token);
      formData.append("folder", "/worty-gallery");

      const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadResponse.ok) {
        const err = await uploadResponse.json();
        throw new Error(err.message || "Upload failed");
      }
      const result = await uploadResponse.json();
      onChange(result.url);
      setPreview(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload image. Please try again.");
      setPreview(null);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [imageKitUrl, imageKitPublicKey, onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemove = () => {
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
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-[3px] border-[rgb(221,198,182)] border-t-transparent rounded-full animate-spin" />
                <p className="text-[rgb(221,198,182)] text-sm font-medium">Uploading...</p>
              </div>
            </div>
          )}
          {!isLoading && (
            <>
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-3 right-3 p-2.5 bg-red-500/80 hover:bg-red-500 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg backdrop-blur-sm"
                title="Remove image"
              >
                <FaTrash size={14} />
              </button>
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs">
                <FaCheckCircle size={10} className="text-green-400" />
                Image uploaded
              </div>
            </>
          )}
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
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-300
          ${isLoading ? "border-[rgba(221,198,182,0.3)] bg-[rgba(221,198,182,0.05)] cursor-wait" : "cursor-pointer"}
          ${!isLoading && isDragOver ? "border-[rgb(221,198,182)] bg-[rgba(221,198,182,0.1)] scale-[1.01]" : ""}
          ${!isLoading && !isDragOver ? "border-[rgba(221,198,182,0.15)] bg-black/20 hover:bg-[rgba(221,198,182,0.05)] hover:border-[rgba(221,198,182,0.3)]" : ""}
        `}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 border-[3px] border-[rgb(221,198,182)] border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="secondary-color-text font-medium">Uploading image...</p>
              <p className="secondary-color-text opacity-50 text-sm mt-1">Please wait</p>
            </div>
          </div>
        ) : (
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
        )}
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
