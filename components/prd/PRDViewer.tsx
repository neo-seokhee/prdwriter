'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ValidationMarker {
  id: number;
  feature_name: string;
  marker_type: 'user_need_verification' | 'additional_research_needed' | 'unclear_problem_solution';
  description: string | null;
  section_context: string | null;
  created_at: string;
}

interface PRDViewerProps {
  content: string;
  validationMarkers: ValidationMarker[];
  versionNumber: number;
}

export function PRDViewer({
  content,
  validationMarkers,
  versionNumber,
}: PRDViewerProps) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
      {/* Version Badge */}
      <div className="mb-6 flex items-center gap-4 not-prose">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          버전 {versionNumber}
        </span>
        {validationMarkers.length > 0 && (
          <span className="text-sm text-gray-600">
            {validationMarkers.length}개 검증 항목 검토 필요
          </span>
        )}
      </div>

      {/* PRD Content */}
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="mb-4 space-y-2 list-disc list-inside" {...props} />,
          ol: ({ node, ...props }) => <ol className="mb-4 space-y-2 list-decimal list-inside" {...props} />,
          li: ({ node, ...props }) => <li className="ml-4" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !className?.includes('language-');
            return isInline ? (
              <code className="px-1.5 py-0.5 rounded bg-gray-100 text-sm font-mono text-gray-800" {...props}>
                {children}
              </code>
            ) : (
              <code className="block p-4 rounded-lg bg-gray-100 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-words" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre className="overflow-x-auto mb-4" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
