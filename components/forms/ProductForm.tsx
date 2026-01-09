'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAccessCode } from '@/hooks/useAccessCode';

interface ProductFormData {
  product_name: string;
  one_liner: string;
  core_features: string;
  tech_stack: string;
  is_action_camp: boolean;
}

export function ProductForm() {
  const router = useRouter();
  const { accessCode } = useAccessCode();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const [formData, setFormData] = useState<ProductFormData>({
    product_name: '',
    one_liner: '',
    core_features: '',
    tech_stack: '',
    is_action_camp: false,
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = '제품 이름을 입력해주세요';
    }
    if (!formData.one_liner.trim()) {
      newErrors.one_liner = '제품 설명을 입력해주세요';
    }
    if (!formData.core_features.trim()) {
      newErrors.core_features = '핵심 기능을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!accessCode) {
      setErrors({ one_liner: '접근 코드를 찾을 수 없습니다' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_code: accessCode,
          product_name: formData.product_name,
          one_liner: formData.one_liner,
          core_features: formData.core_features,
          platforms: ['Web'], // 기본값
          tech_stack: formData.tech_stack || undefined,
          is_action_camp: formData.is_action_camp,
        }),
      });

      const data = await response.json();

      if (response.ok && data.product_id) {
        // 제품 생성 후 바로 제품 상세 페이지로 이동
        router.push(`/${accessCode}/product/${data.product_id}`);
      } else {
        setErrors({ product_name: data.error || '제품 생성에 실패했습니다' });
      }
    } catch (error) {
      setErrors({ product_name: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">신규 제품 추가</h2>
          <p className="text-gray-600 text-sm">
            제품의 기본 정보를 입력하면 PRD 작성을 시작할 수 있습니다.
          </p>

          <Input
            label="제품 이름"
            placeholder="글로벌 경제 뉴스 큐레이션"
            value={formData.product_name}
            onChange={(e) => {
              setFormData({ ...formData, product_name: e.target.value });
              setErrors({ ...errors, product_name: '' });
            }}
            error={errors.product_name}
            helperText="제품의 이름을 입력해주세요"
          />

          <Input
            label="제품 한 줄 설명"
            placeholder="매일 아침 글로벌 주요 경제 뉴스를 AI로 요약해서 제공하는 서비스"
            value={formData.one_liner}
            onChange={(e) => {
              setFormData({ ...formData, one_liner: e.target.value });
              setErrors({ ...errors, one_liner: '' });
            }}
            error={errors.one_liner}
            helperText="제품을 한 문장으로 설명해주세요"
          />

          <Textarea
            label="핵심 기능"
            placeholder={`- 매일 오전 7시 자동으로 글로벌 주요 경제 뉴스 크롤링
- AI를 활용한 뉴스 요약 및 카테고리 분류
- 웹 대시보드로 뉴스 제공
- 이메일 뉴스레터 발송`}
            value={formData.core_features}
            onChange={(e) => {
              setFormData({ ...formData, core_features: e.target.value });
              setErrors({ ...errors, core_features: '' });
            }}
            rows={6}
            error={errors.core_features}
            helperText="제품의 핵심 기능을 나열해주세요"
          />

          <Textarea
            label="기술 스택 (선택)"
            placeholder="React, Next.js, Tailwind CSS..."
            value={formData.tech_stack}
            onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
            rows={3}
            helperText="사용하고 싶은 기술이 있다면 입력해주세요"
          />

          <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <input
              type="checkbox"
              id="is_action_camp"
              checked={formData.is_action_camp}
              onChange={(e) => setFormData({ ...formData, is_action_camp: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
            />
            <label htmlFor="is_action_camp" className="flex-1">
              <div className="font-semibold text-purple-900 mb-1">
                🎓 AI 액션캠프 MVP 전용
              </div>
              <p className="text-sm text-purple-800">
                서버 없이 프론트엔드만으로 동작하는 MVP (Google AI Studio, Replit Agent 사용)
              </p>
            </label>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  생성 중...
                </div>
              ) : (
                '제품 생성하기'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
