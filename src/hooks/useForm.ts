"use client";

import { useState, useEffect, ChangeEvent } from "react";

type FormValues = Record<string, string | string[]>;

export function useForm<T extends FormValues>(
  initialData: T | undefined,
  defaultValues: T
) {
  const [formData, setFormData] = useState<T>(
    initialData || { ...defaultValues }
  );
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIsDirty(false);
    }
  }, [initialData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const setValue = (name: keyof T, value: T[keyof T]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const reset = () => {
    setFormData({ ...defaultValues });
    setIsDirty(false);
  };

  return {
    formData,
    setFormData,
    handleChange,
    setValue,
    reset,
    isDirty,
  };
}

export function useAsyncForm<T extends FormValues>(
  handleSubmit: (data: T) => Promise<void>,
  onSuccess?: () => void
) {
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (data: T) => {
    setIsLoading(true);
    try {
      await handleSubmit(data);
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    submit,
  };
}
