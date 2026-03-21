"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

interface BaseInputProps {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

type InputProps = BaseInputProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseInputProps & TextareaHTMLAttributes<HTMLTextAreaElement>;
type SelectProps = BaseInputProps & SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ value: string; label: string }>;
};

const baseClassName = "px-4 py-3 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200";
const widthClassName = "w-full";

export function FormInput({ label, error, fullWidth = true, className = "", ...props }: InputProps) {
  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          {label}
        </label>
      )}
      <input
        className={`${baseClassName} ${fullWidth ? widthClassName : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export function FormTextarea({ label, error, fullWidth = true, className = "", rows = 4, ...props }: TextareaProps) {
  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`${baseClassName} ${fullWidth ? widthClassName : ""} resize-none ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export function FormSelect({ label, error, fullWidth = true, className = "", options, ...props }: SelectProps) {
  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label className="block text-sm font-semibold secondary-color-text mb-3">
          {label}
        </label>
      )}
      <select
        className={`${baseClassName} ${fullWidth ? widthClassName : ""} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
