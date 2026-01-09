'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PRDViewer } from '@/components/prd/PRDViewer';
import { useAccessCode } from '@/hooks/useAccessCode';
import type { GetPRDVersionResponse } from '@/lib/types/api';

export default function PRDPage() {
  const router = useRouter();
  const params = useParams();
  const { accessCode } = useAccessCode();
  const productId = params.productId as string;

  const [prd, setPRD] = useState<GetPRDVersionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchLatestPRD = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/products/${productId}/prd/latest`);
      
      if (response.ok) {
        const data = await response.json();
        setPRD(data);
        return true; // PRD 있음
      } else if (response.status === 404) {
        setError('아직 PRD가 생성되지 않았습니다. "PRD 생성하기" 버튼을 클릭하세요.');
        return false; // PRD 없음
      } else {
        const data = await response.json();
        setError(data.error || 'PRD 조회에 실패했습니다');
        return false;
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestPRD();
    
    // 컴포넌트 언마운트 시 폴링 정리
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [productId]);

  const handleGeneratePRD = async () => {
    setIsGenerating(true);
    setError('');

    // PRD 생성 요청 (백그라운드에서 처리)
    fetch('/api/prd/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: parseInt(productId, 10),
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          // PRD 생성 완료 - 즉시 불러오기
          await fetchLatestPRD();
          setIsGenerating(false);
          // 폴링 정리
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        } else {
          console.error('PRD 생성 실패:', data);
          let errorMessage = data.error || 'PRD 생성에 실패했습니다';
          if (data.details) {
            errorMessage += ` (${data.details})`;
          }
          setError(errorMessage);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        setIsGenerating(false);
      });

    // 5초마다 PRD 생성 완료 여부 확인 (최대 3분)
    let checkCount = 0;
    const maxChecks = 36; // 3분 (5초 * 36)
    
    const interval = setInterval(async () => {
      checkCount++;
      const hasPRD = await fetchLatestPRD();
      
      if (hasPRD) {
        // PRD 생성 완료
        setIsGenerating(false);
        clearInterval(interval);
        setPollingInterval(null);
      } else if (checkCount >= maxChecks) {
        // 타임아웃
        setIsGenerating(false);
        setError('PRD 생성 시간이 초과되었습니다. 페이지를 새로고침하여 확인해주세요.');
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 5000);
    
    setPollingInterval(interval);
  };

  return (
    <Container className="py-12">
      <div className="mb-6">
        <Link
          href={`/${accessCode}/product/${productId}`}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          ← 제품으로 돌아가기
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : !prd ? (
        <Card className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">아직 PRD가 생성되지 않았습니다</h2>
          <p className="text-gray-600 mb-6">
            {error || '제품 정보와 사용자 리서치를 기반으로 PRD를 생성하세요.'}
          </p>
          {error && (error.includes('ANTHROPIC_API_KEY') || error.includes('authentication_error') || error.includes('invalid x-api-key')) && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ API 키 설정 필요</h3>
              <p className="text-sm text-yellow-800 mb-2">
                PRD를 생성하려면 유효한 Anthropic API 키가 필요합니다.
              </p>
              <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1">
                <li><a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Anthropic Console</a>에서 API 키를 발급받으세요</li>
                <li>프로젝트 루트에 <code className="bg-yellow-100 px-1 py-0.5 rounded font-mono">.env.local</code> 파일을 생성하세요</li>
                <li>다음 내용을 추가하세요: <code className="bg-yellow-100 px-1 py-0.5 rounded font-mono">ANTHROPIC_API_KEY=sk-ant-api03-...</code></li>
                <li>개발 서버를 재시작하세요 (터미널에서 Ctrl+C 후 <code className="bg-yellow-100 px-1 py-0.5 rounded font-mono">npm run dev</code>)</li>
              </ol>
              <p className="text-xs text-yellow-700 mt-2">
                💡 참고: API 키는 <code className="bg-yellow-100 px-1 py-0.5 rounded font-mono">sk-ant-api03-</code>로 시작합니다.
              </p>
            </div>
          )}
          <Button onClick={handleGeneratePRD} disabled={isGenerating}>
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                백그라운드에서 생성 중...
              </div>
            ) : (
              'PRD 생성하기'
            )}
          </Button>
          {isGenerating && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">⏳ PRD 생성 중</h3>
              <p className="text-sm text-blue-800 mb-2">
                Claude가 제품 정보와 리서치를 분석하여 종합적인 PRD를 작성하고 있습니다.
              </p>
              <p className="text-sm text-blue-800 mb-2">
                <strong>예상 소요 시간:</strong> 약 30-60초
              </p>
              <p className="text-sm text-blue-700">
                💡 다른 페이지로 이동하셔도 괜찮습니다. PRD 생성이 완료되면 자동으로 업데이트됩니다.
              </p>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card padding="lg">
              <PRDViewer
                content={prd.content}
                validationMarkers={prd.validation_markers}
                versionNumber={prd.version_number}
              />
            </Card>
          </div>

          <div className="space-y-4">
            <Card padding="sm">
              <h3 className="font-semibold text-gray-900 mb-3">작업</h3>
              <div className="space-y-2">
                <Link href={`/${accessCode}/product/${productId}/iterate`}>
                  <Button variant="primary" size="sm" className="w-full">
                    PRD 고도화
                  </Button>
                </Link>
                <Link href={`/${accessCode}/product/${productId}/research`}>
                  <Button variant="outline" size="sm" className="w-full">
                    리서치 더 추가하기
                  </Button>
                </Link>
              </div>
            </Card>

            {prd.validation_markers.length > 0 && (
              <Card padding="sm">
                <h3 className="font-semibold text-gray-900 mb-2">검증 요약</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {prd.validation_markers.length}개 항목이 검증 필요
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  {prd.validation_markers.map((m) => (
                    <div key={m.id}>• {m.feature_name}</div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </Container>
  );
}
