'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ResearchFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ResearchForm({ productId, onSuccess }: ResearchFormProps) {
  const [researchContent, setResearchContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!researchContent.trim()) {
      setError('리서치 내용을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/products/${productId}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          research_content: researchContent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResearchContent('');
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || '리서치 추가에 실패했습니다');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        label="유저 리서치 결과"
        placeholder="사용자 인터뷰, 설문조사, 관찰 또는 기타 리서치 방법을 통해 얻은 인사이트를 입력하세요..."
        value={researchContent}
        onChange={(e) => {
          setResearchContent(e.target.value);
          setError('');
        }}
        rows={8}
        error={error}
        helperText="사용자 니즈, 불편사항, 행동 패턴, 피드백 등의 인사이트를 추가하세요"
      />

      <Button type="submit" disabled={isSubmitting || !researchContent.trim()} className="w-full">
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            리서치 추가 중...
          </div>
        ) : (
          '리서치 추가하기'
        )}
      </Button>
    </form>
  );
}
