import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  className,
}) => (
  <div
    className={cn(
      'markdown-preview text-slate-700 text-sm leading-relaxed space-y-4',
      className,
    )}
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-3">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold text-slate-900 mt-5 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">{children}</h3>
        ),
        p: ({ children }) => <p className="mb-3">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        a: ({ href, children }) => (
          <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
        code: ({ className: codeClass, children }) => {
          const isBlock = codeClass?.includes('language-');
          if (isBlock) {
            return (
              <code className="block bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs font-mono my-3">
                {children}
              </code>
            );
          }
          return (
            <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="my-3">{children}</pre>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-3">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full border border-slate-200 text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-medium">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-slate-200 px-3 py-2">{children}</td>
        ),
        img: ({ src, alt }) => (
          <img src={src} alt={alt ?? ''} className="max-w-full rounded-lg my-3 border border-slate-200" />
        ),
      }}
    >
      {content || '*No content yet*'}
    </ReactMarkdown>
  </div>
);
