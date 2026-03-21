"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaCloudUploadAlt, FaImage, FaTrash } from "react-icons/fa";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

  useEffect(() => {
    // Load Cloudinary widget script
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const openWidget = () => {
    if (!cloudName) {
      alert("Cloudinary cloud name is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your .env file.");
      return;
    }

    if (!uploadPreset) {
      alert("Cloudinary upload preset is not configured. Please add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env file.");
      return;
    }

    if (!window.cloudinary) {
      alert("Cloudinary widget is not loaded yet. Please wait a moment and try again.");
      return;
    }

    setIsLoading(true);

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ["local", "url", "camera"],
        multiple: false,
        maxFiles: 1,
        cropping: false, // Disable forced cropping for better quality
        folder: "worty-gallery",
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
        maxFileSize: 20000000, // 20MB
        maxImageWidth: 4000, // Increased for better quality
        maxImageHeight: 4000, // Increased for better quality
        quality: 95, // Higher quality
        // Quality transformation to ensure high-quality delivery
        transformation: [
          { quality: "auto:best" },
          { fetch_format: "auto" }
        ],
        styles: {
          palette: {
            window: "#1a1a1a",
            sourceBg: "#2d2d2d",
            windowBorder: "#4a4a4a",
            tabIcon: "#ddc6b6",
            inactiveTabIcon: "#696969",
            menuIcons: "#ddc6b6",
            link: "#ddc6b6",
            action: "#ddc6b6",
            inProgress: "#ddc6b6",
            complete: "#10b981",
            error: "#ef4444",
            textDark: "#000000",
            textLight: "#ffffff",
          },
        },
      },
      (error: any, result: any) => {
        setIsLoading(false);
        if (!error && result.event === "success") {
          // Add quality parameters to the URL for high-quality delivery
          let url = result.info.secure_url;
          // Add quality parameters if not already present
          if (!url.includes('q_')) {
            // Insert quality transformation before the file extension
            url = url.replace('/upload/', '/upload/q_auto:best,f_auto/');
          }
          onChange(url);
        }
        if (error) {
          console.error("Upload error:", error);
          alert("Failed to upload image. Please try again.");
        }
      }
    );

    widget.open();
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold secondary-color-text">
        {label}
      </label>

      {value ? (
        <div className="relative group">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5 border secondary-color-border">
            <Image
              src={value}
              alt="Preview"
              fill
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
            ✓ Image uploaded
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openWidget}
          disabled={!scriptLoaded || isLoading || !cloudName}
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
                {cloudName ? (
                  <FaCloudUploadAlt className="text-3xl secondary-color-text" />
                ) : (
                  <FaImage className="text-3xl secondary-color-text opacity-50" />
                )}
              </div>
              <div className="text-center">
                <p className="secondary-color-text font-medium">
                  {cloudName ? "Click to upload image" : "Cloudinary not configured"}
                </p>
                {!cloudName && (
                  <p className="secondary-color-text opacity-60 text-sm mt-1">
                    Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to .env
                  </p>
                )}
                {cloudName && (
                  <p className="secondary-color-text opacity-60 text-sm mt-1">
                    JPG, PNG, WebP up to 20MB
                  </p>
                )}
              </div>
            </>
          )}
        </button>
      )}

      {/* Hidden input to store the URL */}
      <input type="hidden" value={value} />
    </div>
  );
}
