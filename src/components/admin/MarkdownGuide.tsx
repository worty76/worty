"use client";

import { FaInfo, FaPlus, FaMinus } from "react-icons/fa";
import { useState } from "react";

export function MarkdownGuide() {
  const [isExpanded, setIsExpanded] = useState(true);

  const examples = [
    {
      category: "Headings",
      syntax: "# Heading 1",
      result: "Heading 1",
    },
    {
      category: "Headings",
      syntax: "## Heading 2",
      result: "Heading 2",
    },
    {
      category: "Text Formatting",
      syntax: "**bold text**",
      result: "bold text",
    },
    {
      category: "Text Formatting",
      syntax: "*italic text*",
      result: "italic text",
    },
    {
      category: "Text Formatting",
      syntax: "***bold italic***",
      result: "bold italic",
    },
    {
      category: "Text Formatting",
      syntax: "~~strikethrough~~",
      result: "strikethrough",
    },
    {
      category: "Links",
      syntax: "[Link text](https://example.com)",
      result: "Link text",
    },
    {
      category: "Links",
      syntax: "[Link text](https://example.com \"Hover text\")",
      result: "Link text with tooltip",
    },
    {
      category: "Images",
      syntax: "![Alt text](image-url.jpg)",
      result: "Embedded image",
    },
    {
      category: "Images",
      syntax: '<img src="url.jpg" data-align="center" />',
      result: "Centered image",
    },
    {
      category: "Lists",
      syntax: "- Item 1\n- Item 2\n  - Nested item",
      result: "Bullet list",
    },
    {
      category: "Lists",
      syntax: "1. First item\n2. Second item",
      result: "Numbered list",
    },
    {
      category: "Code",
      syntax: "`inline code`",
      result: "inline code",
    },
    {
      category: "Code",
      syntax: "```javascript\nconsole.log('Hello');\n```",
      result: "Code block with syntax highlighting",
    },
    {
      category: "Quotes",
      syntax: "> This is a quote",
      result: "Blockquote",
    },
    {
      category: "Horizontal Rule",
      syntax: "---",
      result: "Horizontal line",
    },
    {
      category: "Table",
      syntax: "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |",
      result: "Table",
    },
    {
      category: "Task List",
      syntax: "- [x] Completed task\n- [ ] Pending task",
      result: "Checklist",
    },
  ];

  return (
    <div className="border secondary-color-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FaInfo className="secondary-color-text" size={14} />
          <span className="text-sm font-semibold secondary-color-text">
            Markdown Quick Guide
          </span>
        </div>
        {isExpanded ? (
          <FaMinus className="secondary-color-text" size={12} />
        ) : (
          <FaPlus className="secondary-color-text" size={12} />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {examples.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-white/10 rounded text-xs secondary-color-text opacity-70">
                    {item.category}
                  </span>
                </div>
                <div className="bg-black/30 rounded p-3">
                  <code className="text-xs text-green-400 block whitespace-pre-wrap break-all">
                    {item.syntax}
                  </code>
                </div>
                <div className="text-xs secondary-color-text opacity-70">
                  {item.result}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t secondary-color-border">
            <p className="text-xs secondary-color-text opacity-70">
              💡 <strong>Tip:</strong> Use the Preview button above to see how your markdown renders in real-time!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
