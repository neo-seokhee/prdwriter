'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ResearchForm } from '@/components/forms/ResearchForm';
import { useAccessCode } from '@/hooks/useAccessCode';

interface Research {
  id: number;
  product_id: number;
  research_content: string;
  sequence_number: number;
  created_at: string;
}

export default function ResearchPage() {
  const params = useParams();
  const { accessCode } = useAccessCode();
  const productId = params.productId as string;

  const [research, setResearch] = useState<Research[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResearch = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/research`);
      const data = await response.json();

      if (response.ok) {
        setResearch(data.research || []);
      } else {
        setError(data.error || '리서치를 불러오는 데 실패했습니다');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResearch();
  }, [productId]);

  const handleResearchAdded = () => {
    fetchResearch();
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Research Form */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">유저 리서치 추가</h1>
              {!isLoading && (
                <Badge variant="info" className="text-base px-3 py-1">
                  리서치 #{research.length + 1}
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mb-4">
              사용자 리서치 결과, 인터뷰, 설문조사 및 인사이트를 문서화하세요
            </p>
            
            {!isLoading && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {research.length === 0 ? (
                  <>
                    <h3 className="font-semibold text-blue-900 mb-2">💡 시작하기</h3>
                    <p className="text-sm text-blue-800">
                      유저 리서치는 AI가 정확한 PRD를 생성하는 데 핵심입니다. 
                      사용자 인터뷰, 설문조사 결과, 페인 포인트, 니즈 등을 추가하면 
                      더욱 실질적이고 사용자 중심의 PRD가 생성됩니다.
                    </p>
                  </>
                ) : research.length < 3 ? (
                  <>
                    <h3 className="font-semibold text-blue-900 mb-2">📝 진행 중</h3>
                    <p className="text-sm text-blue-800">
                      PRD 생성을 위해 최소 3개의 리서치가 필요합니다. 
                      현재 {research.length}개 완료 ({3 - research.length}개 더 필요)
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-green-900 mb-2">✅ 준비 완료</h3>
                    <p className="text-sm text-green-800 mb-3">
                      {research.length}개의 리서치가 준비되었습니다! 
                      추가 리서치를 입력하여 더 풍부한 PRD를 생성할 수 있습니다.
                    </p>
                    <Link href={`/${accessCode}/product/${productId}`}>
                      <Button variant="primary" size="sm" className="w-full">
                        🚀 제품 카드로 돌아가기
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}

            <ResearchForm productId={productId} onSuccess={handleResearchAdded} />
          </Card>
        </div>

        {/* Research History */}
        <div>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">리서치 히스토리</h2>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : research.length === 0 ? (
              <p className="text-sm text-gray-600">아직 추가된 리서치가 없습니다</p>
            ) : (
              <div className="space-y-4">
                {research.map((item) => (
                  <div key={item.id} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="info" size="sm">
                        #{item.sequence_number}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">{item.research_content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Container>
  );
}
