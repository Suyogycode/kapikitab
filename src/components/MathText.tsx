// components/MathText.tsx
"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  content: string;
  className?: string;
}

export function MathText({ content, className = "" }: MathTextProps) {
  if (!content) return null;

  // Normalize accidental double-escaped backslashes from JSON if any slipped through
  const cleanContent = content.replace(/\\\\/g, '\\');

  return (
    <span className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Render paragraphs as inline spans so they don't break button flex layouts
          p: ({ children }) => <span className="inline">{children}</span>,
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </span>
  );
}