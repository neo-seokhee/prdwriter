import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface ValidationAnnotationProps {
  featureName: string;
  markerType: 'user_need_verification' | 'additional_research_needed' | 'unclear_problem_solution';
  description: string;
  sectionContext?: string;
}

const markerConfig = {
  user_need_verification: {
    label: '사용자 니즈 검증',
    variant: 'warning' as const,
    icon: '⚠️',
    description: '실제 사용자 니즈 검증 필요',
  },
  additional_research_needed: {
    label: '리서치 갭',
    variant: 'info' as const,
    icon: '🔍',
    description: '추가 리서치 필요',
  },
  unclear_problem_solution: {
    label: '문제-해결책 적합성',
    variant: 'error' as const,
    icon: '❓',
    description: '명시된 문제를 해결하는지 불명확',
  },
};

export function ValidationAnnotation({
  featureName,
  markerType,
  description,
  sectionContext,
}: ValidationAnnotationProps) {
  const config = markerConfig[markerType];

  const borderColors = {
    user_need_verification: 'border-yellow-400 bg-yellow-50',
    additional_research_needed: 'border-blue-400 bg-blue-50',
    unclear_problem_solution: 'border-red-400 bg-red-50',
  };

  return (
    <div className={`my-4 p-4 border-l-4 rounded-r-lg ${borderColors[markerType]}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={config.variant} size="sm">
              {config.label}
            </Badge>
            <span className="text-sm font-semibold text-gray-900">{featureName}</span>
          </div>
          <p className="text-sm text-gray-800 mb-2">{description}</p>
          {sectionContext && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">위치:</span> {sectionContext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
