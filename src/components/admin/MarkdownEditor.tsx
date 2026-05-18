"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  FaBold,
  FaItalic,
  FaHeading,
  FaLink,
  FaImage,
  FaCode,
  FaQuoteLeft,
  FaListUl,
  FaListOl,
  FaMinus,
  FaExpand,
  FaCompress,
} from "react-icons/fa";

/* eslint-disable @next/next/no-img-element */

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  blogId?: string;
  onSuccess?: () => void;
}

interface ToolbarButton {
  label: string;
  icon: React.ReactNode;
  prefix: string;
  suffix: string;
  block?: string;
}

const toolbarButtons: ToolbarButton[] = [
  { label: "Bold", icon: <FaBold />, prefix: "**", suffix: "**" },
  { label: "Italic", icon: <FaItalic />, prefix: "*", suffix: "*" },
  { label: "Heading", icon: <FaHeading />, prefix: "## ", suffix: "", block: "line" },
  { label: "Link", icon: <FaLink />, prefix: "[", suffix: "](url)" },
  { label: "Image", icon: <FaImage />, prefix: "![alt](", suffix: ")" },
  { label: "Code", icon: <FaCode />, prefix: "`", suffix: "`" },
  { label: "Code block", icon: <FaCode />, prefix: "```\n", suffix: "\n```", block: "block" },
  { label: "Quote", icon: <FaQuoteLeft />, prefix: "> ", suffix: "", block: "line" },
  { label: "List", icon: <FaListUl />, prefix: "- ", suffix: "", block: "line" },
  { label: "Ordered list", icon: <FaListOl />, prefix: "1. ", suffix: "", block: "line" },
  { label: "Horizontal rule", icon: <FaMinus />, prefix: "\n---\n", suffix: "" },
];

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your markdown content here...",
  blogId,
  onSuccess,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const draftKey = blogId ? `blog-draft-${blogId}` : "blog-draft-new";

  // Auto-save to localStorage every 3 seconds
  useEffect(() => {
    if (!value) return;
    const timer = setTimeout(() => {
      localStorage.setItem(draftKey, value);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 3000);
    return () => clearTimeout(timer);
  }, [value, draftKey]);

  // Restore draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft && draft !== value) {
      onChange(draft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear draft on success
  useEffect(() => {
    if (!onSuccess) return;
    const original = onSuccess;
    const wrapped = () => {
      localStorage.removeItem(draftKey);
      original();
    };
    // We can't override props, so we watch for external success via a flag
    // Instead, we'll expose a clearDraft via ref - but simpler: just clear on unmount if success happened
    return () => {
      // Clean up on unmount
    };
  }, [onSuccess, draftKey]);

  // Clear draft when onSuccess prop changes (called externally)
  const prevOnSuccessRef = useRef(onSuccess);
  useEffect(() => {
    if (onSuccess !== prevOnSuccessRef.current) {
      prevOnSuccessRef.current = onSuccess;
      localStorage.removeItem(draftKey);
    }
  }, [onSuccess, draftKey]);

  // Escape to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const insertMarkdown = useCallback(
    (btn: ToolbarButton) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      let before = value.substring(0, start);
      let after = value.substring(end);

      if (btn.block === "line" && before.length > 0 && !before.endsWith("\n")) {
        before += "\n";
      }

      const insertion =
        selectedText
          ? `${btn.prefix}${selectedText}${btn.suffix}`
          : `${btn.prefix}${btn.suffix}`;

      const newValue = before + insertion + after;
      onChange(newValue);

      // Restore cursor
      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPos = before.length + insertion.length;
        if (selectedText) {
          textarea.selectionStart = before.length + btn.prefix.length;
          textarea.selectionEnd = cursorPos - btn.suffix.length;
        } else {
          textarea.selectionStart = textarea.selectionEnd =
            before.length + btn.prefix.length;
        }
      });
    },
    [value, onChange]
  );

  // Custom components to style markdown elements
  const markdownComponents: Components = {
    code({ inline, className, children, ...props }: any) {
      if (!inline) {
        return (
          <pre className="rounded-md overflow-x-auto primary-color-bg">
            <code className="block whitespace-pre secondary-color-text text-sm font-mono">
              {children}
            </code>
          </pre>
        );
      }

      return (
        <code
          className="rounded text-sm secondary-color-text font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    h1({ children, ...props }) {
      return (
        <h1
          className="text-4xl font-bold secondary-color-text mt-8 mb-4 pb-3"
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2({ children, ...props }) {
      return (
        <h2
          className="text-3xl font-bold secondary-color-text mt-7 mb-4 pb-2"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3({ children, ...props }) {
      return (
        <h3
          className="text-2xl font-bold secondary-color-text mt-6 mb-3"
          {...props}
        >
          {children}
        </h3>
      );
    },
    h4({ children, ...props }) {
      return (
        <h4
          className="text-xl font-semibold secondary-color-text mt-5 mb-2"
          {...props}
        >
          {children}
        </h4>
      );
    },
    h5({ children, ...props }) {
      return (
        <h5
          className="text-lg font-semibold secondary-color-text mt-4 mb-2"
          {...props}
        >
          {children}
        </h5>
      );
    },
    h6({ children, ...props }) {
      return (
        <h6
          className="text-base font-semibold secondary-color-text mt-3 mb-2"
          {...props}
        >
          {children}
        </h6>
      );
    },
    p({ children, ...props }) {
      return (
        <p className="secondary-color-text leading-7 my-4" {...props}>
          {children}
        </p>
      );
    },
    a({ children, ...props }) {
      return (
        <a
          className="secondary-color-text underline hover:opacity-80 transition-opacity"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    ul({ children, ...props }) {
      return (
        <ul
          className="list-disc list-outside secondary-color-text my-4 ml-6 space-y-2"
          {...props}
        >
          {children}
        </ul>
      );
    },
    ol({ children, ...props }) {
      return (
        <ol
          className="list-decimal list-outside secondary-color-text my-4 ml-6 space-y-2"
          {...props}
        >
          {children}
        </ol>
      );
    },
    li({ children, ...props }) {
      return (
        <li className="secondary-color-text" {...props}>
          {children}
        </li>
      );
    },
    blockquote({ children, ...props }) {
      return (
        <blockquote
          className="border-l-4 secondary-color-border pl-4 py-2 my-4 secondary-color-text italic opacity-80 bg-primary-color-bg/10 rounded-r"
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    table({ children, ...props }) {
      return (
        <div className="overflow-x-auto my-6">
          <table
            className="min-w-full border-collapse border secondary-color-border"
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },
    thead({ children, ...props }) {
      return (
        <thead className="bg-primary-color-bg/20" {...props}>
          {children}
        </thead>
      );
    },
    tbody({ children, ...props }) {
      return <tbody {...props}>{children}</tbody>;
    },
    tr({ children, ...props }) {
      return (
        <tr className="border-b secondary-color-border" {...props}>
          {children}
        </tr>
      );
    },
    th({ children, ...props }) {
      return (
        <th
          className="border secondary-color-border px-4 py-3 secondary-color-text font-bold text-left"
          {...props}
        >
          {children}
        </th>
      );
    },
    td({ children, ...props }) {
      return (
        <td
          className="border secondary-color-border px-4 py-2 secondary-color-text"
          {...props}
        >
          {children}
        </td>
      );
    },
    img({ ...props }: any) {
      return (
        <img
          className="rounded-lg max-w-full h-auto my-6 border secondary-color-border shadow-md"
          alt={props.alt || "Image"}
          {...props}
        />
      );
    },
    hr({ ...props }) {
      return (
        <hr
          className="my-8 border-t-2 secondary-color-border opacity-30"
          {...props}
        />
      );
    },
    strong({ children, ...props }) {
      return (
        <strong className="font-bold secondary-color-text" {...props}>
          {children}
        </strong>
      );
    },
    em({ children, ...props }) {
      return (
        <em className="italic secondary-color-text" {...props}>
          {children}
        </em>
      );
    },
    del({ children, ...props }) {
      return (
        <del
          className="line-through secondary-color-text opacity-70"
          {...props}
        >
          {children}
        </del>
      );
    },
    input({ ...props }: any) {
      if (props.type === "checkbox") {
        return (
          <input
            type="checkbox"
            disabled
            className="mr-2 cursor-default"
            {...props}
          />
        );
      }
      return <input {...props} />;
    },
  };

  const editorContent = (
    <div className="w-full">
      {/* Top bar: tabs + fullscreen + draft indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 p-1 bg-white/5 rounded-lg inline-flex border secondary-color-border">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center gap-2 ${
              !showPreview
                ? "secondary-color-bg primary-color-text"
                : "secondary-color-text opacity-60 hover:opacity-100"
            }`}
          >
            ✏️ Editor
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center gap-2 ${
              showPreview
                ? "secondary-color-bg primary-color-text"
                : "secondary-color-text opacity-60 hover:opacity-100"
            }`}
          >
            👁️ Preview
          </button>
        </div>

        <div className="flex items-center gap-3">
          {draftSaved && (
            <span className="text-xs secondary-color-text/60 animate-pulse">
              Draft saved
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-md secondary-color-text/60 hover:bg-white/10 hover:secondary-color-text transition-all"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {/* Markdown toolbar */}
      {!showPreview && (
        <div className="flex flex-wrap gap-1 mb-3 p-2 bg-white/5 rounded-lg border secondary-color-border">
          {toolbarButtons.map((btn, i) => (
            <button
              key={i}
              type="button"
              onClick={() => insertMarkdown(btn)}
              className="p-2 rounded secondary-color-text/70 hover:bg-white/10 hover:secondary-color-text transition-all text-sm"
              title={btn.label}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      )}

      {/* Editor / Preview */}
      {!showPreview ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[600px] p-4 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 resize-y font-mono text-sm leading-relaxed"
        />
      ) : (
        <div className="w-full min-h-[600px] max-h-[600px] p-6 border secondary-color-border rounded-lg bg-white/5 overflow-y-auto">
          {value.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className="secondary-color-text opacity-50 text-center py-20">
              No content to preview. Start writing in the editor!
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[rgb(38,34,35)] p-6 flex flex-col">
        <div className="flex-1 flex flex-col overflow-hidden">{editorContent}</div>
      </div>
    );
  }

  return editorContent;
}
