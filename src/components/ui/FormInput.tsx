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

interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ label, description, checked, onChange, disabled = false }: SwitchProps) {
  return (
    <div className={`flex items-center justify-between p-4 bg-white/5 border secondary-color-border rounded-lg ${disabled ? "opacity-50" : ""}`}>
      <div>
        <label className="block text-sm font-semibold secondary-color-text">
          {label}
        </label>
        {description && (
          <p className="text-xs secondary-color-text opacity-60 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
          checked ? "primary-color-bg" : "bg-white/20"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
