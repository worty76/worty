import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

interface CacheEntry<T> {
  data: T[];
  timestamp: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_PREFIX = "worty-cache:";

// Instant per-tab cache — survives client-side navigation
const memoryCache = new Map<string, CacheEntry<unknown>>();

function readSession<T>(key: string, ttlMs: number): CacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.timestamp > ttlMs) {
      sessionStorage.removeItem(STORAGE_PREFIX + key);
      return null;
    }
    return entry;
  } catch {
    return null; // private mode / quota / corrupt entry
  }
}

function writeSession<T>(key: string, entry: CacheEntry<T>) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // storage unavailable — the memory cache still covers this session
  }
}

/**
 * Fetch a Firestore collection with two-layer caching (memory + sessionStorage).
 * Client-side navigations and full reloads within the TTL are served without
 * touching Firestore. Every cached doc includes its document id.
 */
export async function fetchCollectionCached<T>(
  collectionName: string,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T[]> {
  const memory = memoryCache.get(collectionName) as CacheEntry<T> | undefined;
  if (memory && Date.now() - memory.timestamp < ttlMs) {
    // hand out a copy so caller-side .sort() can't mutate the cached array
    return [...memory.data];
  }

  const session = readSession<T>(collectionName, ttlMs);
  if (session) {
    memoryCache.set(collectionName, session);
    return [...session.data];
  }

  const snapshot = await getDocs(collection(db, collectionName));
  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];

  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(collectionName, entry);
  writeSession(collectionName, entry);
  return data;
}

/** Drop every cached collection (memory + sessionStorage). */
export function clearFirestoreCache() {
  memoryCache.clear();
  if (typeof window === "undefined") return;
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // ignore storage errors
  }
}
