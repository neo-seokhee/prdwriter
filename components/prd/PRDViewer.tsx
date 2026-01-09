'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { CopyButton } from '@/components/ui/CopyButton';

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
  // MVP 프롬프트 추출
  const mvpPrompt = useMemo(() => {
    const match = content.match(/## MVP 생성용 프롬프트\s*([\s\S]*?)(?=\n##|$)/);
    if (match && match[1]) {
      // 코드 블록 안의 내용만 추출
      const codeBlockMatch = match[1].match(/```\s*([\s\S]*?)\s*```/);
      return codeBlockMatch ? codeBlockMatch[1].trim() : '';
    }
    return '';
  }, [content]);

  // MVP 프롬프트 섹션 이전의 PRD 내용
  const prdContentBeforeMVP = useMemo(() => {
    const match = content.match(/([\s\S]*?)(?=## MVP 생성용 프롬프트|$)/);
    return match ? match[1] : content;
  }, [content]);

  return (
    <div className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
      {/* Version Badge and Copy Button */}
      <div className="mb-6 flex items-center justify-between gap-4 not-prose">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            버전 {versionNumber}
          </span>
          {validationMarkers.length > 0 && (
            <span className="text-sm text-gray-600">
              {validationMarkers.length}개 검증 항목 검토 필요
            </span>
          )}
        </div>
        <CopyButton text={prdContentBeforeMVP} label="PRD 복사" />
      </div>

      {/* PRD Content */}
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
          h2: ({ node, children, ...props }) => {
            const text = children?.toString() || '';
            const isMVPPrompt = text.includes('MVP 생성용 프롬프트');
            
            return (
              <div className="not-prose">
                <div className={`flex items-center justify-between gap-4 ${isMVPPrompt ? 'mb-3 mt-8' : ''}`}>
                  <h2 className="text-2xl font-bold mt-6 mb-3" {...props}>
                    {children}
                  </h2>
                  {isMVPPrompt && mvpPrompt && (
                    <CopyButton text={mvpPrompt} label="프롬프트 복사" className="flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          },
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
