"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { FaTag, FaTimes } from "react-icons/fa";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({
  tags,
  onChange,
  suggestions = [],
  placeholder = "Add a tag...",
  maxTags = 20,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get all existing tags from suggestions + current tags
  const allTags = Array.from(new Set([...suggestions, ...tags]));

  useEffect(() => {
    if (input) {
      const filtered = allTags.filter(
        (tag) =>
          tag.toLowerCase().includes(input.toLowerCase()) &&
          !tags.includes(tag)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions(
        allTags.filter((tag) => !tags.includes(tag)).slice(0, 8)
      );
      setShowSuggestions(false);
    }
  }, [input, tags, allTags]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setInput("");
    }
  };

  const addTag = (tagToAdd?: string) => {
    const newTag = (tagToAdd || input).trim().toLowerCase();
    if (
      newTag &&
      !tags.includes(newTag) &&
      tags.length < maxTags &&
      newTag.length <= 30
    ) {
      onChange([...tags, newTag]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const selectSuggestion = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-3 min-h-[50px] bg-white/5 border border-secondary-color-border rounded-lg focus-within:ring-2 focus-within:ring-opacity-50 transition-all">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 primary-color-bg secondary-color-text rounded-full text-sm font-medium animate-in fade-in slide-in-from-bottom-1 duration-200"
          >
            <FaTag size={10} />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 hover:opacity-70 transition-opacity"
            >
              <FaTimes size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Delay to allow click on suggestions
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent secondary-color-text placeholder-secondary/40 focus:outline-none text-sm"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white/10 border secondary-color-border rounded-lg shadow-lg overflow-hidden backdrop-blur-xl">
          <div className="max-h-48 overflow-y-auto">
            <p className="px-3 py-2 text-xs secondary-color-text opacity-50 border-b secondary-color-border">
              Click a tag or type and press Enter
            </p>
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => selectSuggestion(suggestion)}
                className="w-full px-3 py-2 text-left secondary-color-text hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
              >
                <FaTag size={10} className="opacity-50" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tag count */}
      {tags.length > 0 && (
        <p className="text-xs secondary-color-text opacity-50 mt-1.5">
          {tags.length} {tags.length === 1 ? "tag" : "tags"}
          {maxTags && ` (max ${maxTags})`}
        </p>
      )}
    </div>
  );
}
