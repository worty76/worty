/**
 * Deferred image uploads for admin forms.
 *
 * Picking a file registers it here as a "pending upload" and hands back a
 * marker string the form can hold in its state. Nothing touches the network
 * until the form is saved — `resolvePendingImageUploads` then uploads every
 * pending file it finds in the payload and swaps the markers for real URLs.
 * Files never picked (form cancelled/discarded) are never uploaded.
 */

const PENDING_PREFIX = "pending-upload:";
const pending = new Map<string, File>();

/** Store a picked file locally and return the marker that stands in for its URL. */
export function registerPendingImageUpload(file: File): string {
  const marker = `${PENDING_PREFIX}${crypto.randomUUID()}`;
  pending.set(marker, file);
  return marker;
}

export function isPendingImageUpload(value: unknown): boolean {
  return typeof value === "string" && value.startsWith(PENDING_PREFIX);
}

/** Forget a pending file (image removed / replaced before saving). */
export function discardPendingImageUpload(marker: string) {
  if (isPendingImageUpload(marker)) pending.delete(marker);
}

async function uploadToImageKit(file: File): Promise<string> {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  if (!publicKey) throw new Error("ImageKit is not configured properly");

  const authResponse = await fetch("/api/imagekit-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!authResponse.ok) throw new Error("Failed to get upload authentication");
  const auth = await authResponse.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("publicKey", publicKey);
  formData.append("signature", auth.signature);
  formData.append("expire", auth.expire.toString());
  formData.append("token", auth.token);
  formData.append("folder", "/worty-gallery");

  const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });
  if (!uploadResponse.ok) {
    const err = await uploadResponse.json().catch(() => null);
    throw new Error(err?.message || "Upload failed");
  }
  const result = await uploadResponse.json();
  return result.url;
}

/**
 * Walk a payload and replace every pending-upload marker with the real
 * ImageKit URL (uploading the file at that point). Call in the form's save
 * handler right before writing to Firestore.
 */
export async function resolvePendingImageUploads<T extends Record<string, unknown>>(
  payload: T
): Promise<T> {
  const resolved: Record<string, unknown> = { ...payload };
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === "string" && value.startsWith(PENDING_PREFIX)) {
      const file = pending.get(value);
      pending.delete(value);
      resolved[key] = file ? await uploadToImageKit(file) : "";
    }
  }
  return resolved as T;
}
