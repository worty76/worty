"use client";

import { FaEdit, FaClock, FaCheckCircle, FaEyeSlash } from "react-icons/fa";

type BlogStatus = "published" | "draft" | "in-progress" | "archived";

interface StatusBadgeProps {
  status: BlogStatus;
  size?: "sm" | "md";
}

const statusConfig = {
  published: {
    label: "Published",
    bgColor: "bg-green-500/20",
    textColor: "text-green-300",
    borderColor: "border-green-500/50",
    icon: <FaCheckCircle size={12} />,
  },
  draft: {
    label: "Draft",
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-300",
    borderColor: "border-yellow-500/50",
    icon: <FaEdit size={12} />,
  },
  "in-progress": {
    label: "In Progress",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-300",
    borderColor: "border-blue-500/50",
    icon: <FaClock size={12} />,
  },
  archived: {
    label: "Archived",
    bgColor: "bg-gray-500/20",
    textColor: "text-gray-300",
    borderColor: "border-gray-500/50",
    icon: <FaEyeSlash size={12} />,
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses} font-medium`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

export { type BlogStatus };
