"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import toast from "react-hot-toast";

export function useFirestore<T extends { id: string }>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async (sortBy?: keyof T) => {
    try {
      setLoading(true);
      setError(null);
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      if (sortBy) {
        items.sort((a, b) => {
          const aVal = a[sortBy];
          const bVal = b[sortBy];
          if (typeof aVal === "string" && typeof bVal === "string") {
            return new Date(bVal).getTime() - new Date(aVal).getTime();
          }
          return 0;
        });
      }

      setData(items);
      return items;
    } catch (err) {
      const message = `Failed to fetch ${collectionName}`;
      setError(message);
      toast.error(message);
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const add = async (item: Omit<T, "id">) => {
    try {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, item);
      const newItem = { id: docRef.id, ...item } as T;
      setData((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      const message = `Failed to add to ${collectionName}`;
      toast.error(message);
      console.error(err);
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updates as any);
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      );
    } catch (err) {
      const message = `Failed to update ${collectionName} item`;
      toast.error(message);
      console.error(err);
      throw err;
    }
  };

  const remove = async (id: string, confirmMessage = "Are you sure?") => {
    if (!confirm(confirmMessage)) return false;

    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success("Deleted successfully!");
      return true;
    } catch (err) {
      const message = `Failed to delete from ${collectionName}`;
      toast.error(message);
      console.error(err);
      return false;
    }
  };

  return {
    data,
    loading,
    error,
    fetchAll,
    add,
    update,
    remove,
  };
}

export function useFirestoreRefresh(refreshTrigger: number) {
  useEffect(() => {
    // Trigger re-render when refreshTrigger changes
  }, [refreshTrigger]);
}
