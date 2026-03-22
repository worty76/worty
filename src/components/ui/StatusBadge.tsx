"use client";

type BlogStatus = "published" | "draft" | "in-progress" | "archived";

interface StatusBadgeProps {
  status: BlogStatus;
  size?: "sm" | "md";
}

const statusConfig = {
  published: {
    label: "(published)",
  },
  draft: {
    label: "(draft)",
  },
  "in-progress": {
    label: "(in progress)",
  },
  archived: {
    label: "(archived)",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses} font-medium secondary-color-text`}
    >
      {config.label}
    </span>
  );
}

export { type BlogStatus };
