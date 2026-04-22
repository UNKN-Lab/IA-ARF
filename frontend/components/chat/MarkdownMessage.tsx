"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Copy, Check } from "lucide-react";

type MarkdownMessageProps = {
  content: string;
};

const CodeBlock = ({ children, className }: any) => {
  const [copied, setCopied] = React.useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (language) {
    return (
      <div className="relative group my-3">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-300 text-xs font-mono rounded-t-lg border-b border-gray-700">
          <span className="text-gray-400">{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <pre className="!mt-0 !rounded-t-none bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
          <code className={className}>{children}</code>
        </pre>
      </div>
    );
  }

  return (
    <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  );
};

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        h1: ({ node, ...props }) => (
          <h1
            className="text-xl font-bold text-blue-700 mb-3 mt-4 border-b-2 border-blue-200 pb-2"
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="text-lg font-semibold text-blue-600 mb-2 mt-3"
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-base font-semibold text-blue-600 mb-2 mt-2"
            {...props}
          />
        ),
        p: ({ node, ...props }) => (
          <p className="mb-3 leading-relaxed text-gray-800" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul
            className="list-disc list-outside ml-5 mb-3 text-gray-800 space-y-1"
            {...props}
          />
        ),
        ol: ({ node, ...props }) => (
          <ol
            className="list-decimal list-outside ml-5 mb-3 text-gray-800 space-y-1"
            {...props}
          />
        ),
        li: ({ node, ...props }) => (
          <li className="marker:text-blue-600 pl-1" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-blue-500 bg-blue-50 px-4 py-2 my-3 italic text-gray-700 rounded-r"
            {...props}
          />
        ),
        a: ({ node, ...props }) => (
          <a
            className="text-blue-600 underline hover:text-blue-800 transition-colors font-medium"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-3 rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-left" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-50" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th
            className="font-semibold border border-gray-200 px-4 py-2 text-gray-900"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            className="border border-gray-200 px-4 py-2 text-gray-800"
            {...props}
          />
        ),
        code: CodeBlock,
        hr: ({ node, ...props }) => (
          <hr className="my-4 border-gray-300" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
