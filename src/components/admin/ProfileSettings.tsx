"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { invalidateCollectionCache } from "@/lib/firestore-cache";
import { resolvePendingImageUploads } from "@/lib/image-uploads";
import toast from "react-hot-toast";
import { ImageUpload } from "./ImageUpload";
import { Button } from "@/components/ui/Button";

export function ProfileSettings() {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "profile", "main"));
        if (snap.exists()) {
          setAvatarUrl((snap.data().avatarUrl as string) ?? "");
        }
      } catch (e) {
        console.error("Error loading profile settings:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, "profile", "main"),
        { ...(await resolvePendingImageUploads({ avatarUrl: avatarUrl.trim() })), updatedAt: new Date().toISOString() },
        { merge: true }
      );
      invalidateCollectionCache("profile");
      toast.success("Avatar updated!");
    } catch (e) {
      console.error("Error saving avatar:", e);
      toast.error("Failed to update avatar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="secondary-color-text opacity-60 text-sm">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <ImageUpload value={avatarUrl} onChange={setAvatarUrl} label="Your avatar" />
      <p className="text-xs secondary-color-text opacity-60 -mt-2">
        Remove the image and save to hide your photo on the homepage.
      </p>
      <Button onClick={handleSave} loading={saving}>
        Save avatar
      </Button>
    </div>
  );
}
