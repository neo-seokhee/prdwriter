'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAccessCode } from '@/hooks/useAccessCode';

export default function Home() {
  const router = useRouter();
  const { validateAndSet, accessCode, isLoading: contextLoading } = useAccessCode();
  const [inputCode, setInputCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!contextLoading && accessCode) {
      router.push(`/${accessCode}/dashboard`);
    }
  }, [accessCode, contextLoading, router]);

  const handleGenerateCode = async () => {
    setError('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/access-code/generate', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.access_code) {
        router.push(`/${data.access_code}/dashboard`);
      } else {
        setError('접근 코드 생성에 실패했습니다');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidateCode = async () => {
    if (!inputCode.trim()) {
      setError('접근 코드를 입력해주세요');
      return;
    }

    setError('');
    setIsValidating(true);

    try {
      const isValid = await validateAndSet(inputCode.trim().toUpperCase());

      if (isValid) {
        router.push(`/${inputCode.trim().toUpperCase()}/dashboard`);
      } else {
        setError('유효하지 않은 접근 코드입니다');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsValidating(false);
    }
  };

  if (contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Container size="sm" className="py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          PRD Writer에 오신 것을 환영합니다
        </h1>
        <p className="text-lg text-gray-600">
          AI 기반 제품 요구사항 문서 작성 및 고도화 도구
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Generate New Code */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            새로 시작하기
          </h2>
          <p className="text-gray-600 mb-6">
            새로운 접근 코드를 생성하여 PRD 작성을 시작하세요
          </p>
          <Button
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                생성 중...
              </div>
            ) : (
              '접근 코드 생성하기'
            )}
          </Button>
        </Card>

        {/* Enter Existing Code */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            계속 작업하기
          </h2>
          <p className="text-gray-600 mb-6">
            기존 접근 코드를 입력하여 작업을 이어가세요
          </p>
          <div className="space-y-4">
            <Input
              placeholder="ABC-1234"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleValidateCode();
                }
              }}
              error={error}
              maxLength={8}
            />
            <Button
              onClick={handleValidateCode}
              disabled={isValidating || !inputCode.trim()}
              variant="secondary"
              className="w-full"
            >
              {isValidating ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  확인 중...
                </div>
              ) : (
                '대시보드로 이동'
              )}
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-12 text-center text-sm text-gray-500">
        <p>
          접근 코드는 모든 PRD에 접근하는 열쇠입니다. 안전한 곳에 보관하세요!
        </p>
      </div>
    </Container>
  );
}
