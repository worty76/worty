import {
  getAnalytics,
  isSupported,
  logEvent,
  setUserId,
  type Analytics,
} from "firebase/analytics";
import { firebaseApp } from "./config";

let instance: Analytics | null = null;

/**
 * Google Analytics, wired into the existing Firebase project.
 * Inactive (safe no-op) until NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID is set
 * in .env — get it from Firebase console → Project settings → General.
 */
async function getAnalyticsIfEnabled(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return null;
  if (instance) return instance;
  try {
    if (!(await isSupported())) return null;
    instance = getAnalytics(firebaseApp);
    return instance;
  } catch {
    return null;
  }
}

export async function logPageView(path: string) {
  const analytics = await getAnalyticsIfEnabled();
  if (!analytics) return;
  logEvent(analytics, "page_view", {
    page_path: path,
    page_title: document.title,
  });
}

/** Attach the logged-in admin identity so your own visits are filterable. */
export async function identifyAdmin(userId: string) {
  const analytics = await getAnalyticsIfEnabled();
  if (!analytics) return;
  setUserId(analytics, userId);
}
