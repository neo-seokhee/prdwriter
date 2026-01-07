'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface IterationFormProps {
  productId: string;
  onSuccess?: (data: any) => void;
}

export function IterationForm({ productId, onSuccess }: IterationFormProps) {
  const [newInsights, setNewInsights] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newInsights.trim()) {
      setError('새로운 인사이트 또는 리서치 내용을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/prd/iterate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: parseInt(productId, 10),
          new_insights: newInsights,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewInsights('');
        if (onSuccess) onSuccess(data);
      } else {
        setError(data.error || 'PRD 고도화에 실패했습니다');
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
        label="새로운 인사이트 및 리서치"
        placeholder="PRD에 반영되어야 할 새로운 유저 리서치, 인사이트, 변경사항을 입력하세요..."
        value={newInsights}
        onChange={(e) => {
          setNewInsights(e.target.value);
          setError('');
        }}
        rows={8}
        error={error}
        helperText="새로운 발견사항, 변경된 요구사항, 추가 인사이트를 설명해주세요"
      />

      <Button type="submit" disabled={isSubmitting || !newInsights.trim()} className="w-full">
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            PRD 고도화 중... (30-60초 소요)
          </div>
        ) : (
          '개선된 PRD 생성하기'
        )}
      </Button>

      {isSubmitting && (
        <p className="text-sm text-gray-500 text-center">
          Claude가 새로운 인사이트를 분석하고 PRD를 업데이트하고 있습니다...
        </p>
      )}
    </form>
  );
}
