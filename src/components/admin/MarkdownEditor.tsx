"use client";

import { useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your markdown content here...",
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

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
          className="border-l-4 secondary-color-border pl-4 py-2 my-4 secondary-color-text italic opacity-80 bg-black/10 rounded-r"
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
        <thead className="bg-black/20" {...props}>
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
      // For task lists
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

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4 p-1 bg-white/5 rounded-lg inline-flex border secondary-color-border">
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

      {!showPreview ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-[500px] p-4 border secondary-color-border rounded-lg bg-white/5 secondary-color-text placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 resize-none font-mono text-sm leading-relaxed"
        />
      ) : (
        <div className="w-full min-h-[500px] max-h-[500px] p-6 border secondary-color-border rounded-lg bg-white/5 overflow-y-auto">
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
}
