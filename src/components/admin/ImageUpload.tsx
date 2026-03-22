"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FaCloudUploadAlt, FaImage, FaTrash } from "react-icons/fa";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageKitUrl = process.env.NEXT_PUBLIC_IMAGEKIT_URL;
  const imageKitPublicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const imageKitAuthEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_AUTH_ENDPOINT;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, PNG, WebP, GIF)");
      return;
    }

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert("File size must be less than 20MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsLoading(true);

    try {
      // Check if ImageKit is configured
      if (!imageKitUrl || !imageKitPublicKey || !imageKitAuthEndpoint) {
        throw new Error("ImageKit is not configured properly");
      }

      // Get authentication signature from server
      const authResponse = await fetch(imageKitAuthEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!authResponse.ok) {
        throw new Error("Failed to get upload authentication");
      }

      const authData = await authResponse.json();

      // Create FormData for ImageKit upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", imageKitPublicKey);
      formData.append("signature", authData.signature);
      formData.append("expire", authData.expire.toString());
      formData.append("token", authData.token);
      // Use folder if needed
      formData.append("folder", "/worty-gallery");

      // Upload to ImageKit
      const uploadResponse = await fetch(
        `https://upload.imagekit.io/api/v1/files/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await uploadResponse.json();

      // Store the clean URL - we'll add quality parameters when displaying
      // This preserves the original quality
      const imageUrl = result.url;

      onChange(imageUrl);
      setPreview(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload image. Please try again.");
      setPreview(null);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold secondary-color-text">
        {label}
      </label>

      {(value || preview) ? (
        <div className="relative group">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5 border secondary-color-border">
            <Image
              src={(preview as string) || value}
              alt="Preview"
              fill
              quality={100}
              unoptimized={!!preview} // Don't optimize base64 preview
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove image"
          >
            <FaTrash size={14} />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs">
            {isLoading ? "⏳ Uploading..." : "✓ Image uploaded"}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          className="w-full aspect-video rounded-lg border-2 border-dashed secondary-color-border bg-white/5 hover:bg-white/10 transition-all duration-200 flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <>
              <div className="w-12 h-12 border-3 border-current border-t-transparent rounded-full animate-spin secondary-color-text" />
              <p className="secondary-color-text">Uploading...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                {imageKitUrl ? (
                  <FaCloudUploadAlt className="text-3xl secondary-color-text" />
                ) : (
                  <FaImage className="text-3xl secondary-color-text opacity-50" />
                )}
              </div>
              <div className="text-center">
                <p className="secondary-color-text font-medium">
                  {imageKitUrl ? "Click to upload image" : "ImageKit not configured"}
                </p>
                {!imageKitUrl && (
                  <p className="secondary-color-text opacity-60 text-sm mt-1">
                    Add ImageKit environment variables
                  </p>
                )}
                {imageKitUrl && (
                  <p className="secondary-color-text opacity-60 text-sm mt-1">
                    JPG, PNG, WebP, GIF up to 20MB
                  </p>
                )}
              </div>
            </>
          )}
        </button>
      )}

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
