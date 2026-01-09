'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PRDViewer } from '@/components/prd/PRDViewer';
import { useAccessCode } from '@/hooks/useAccessCode';
import type { GetProductResponse, GetPRDVersionResponse } from '@/lib/types/api';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { accessCode } = useAccessCode();
  const productId = params.productId as string;

  const [product, setProduct] = useState<GetProductResponse | null>(null);
  const [latestPRD, setLatestPRD] = useState<GetPRDVersionResponse | null>(null);
  const [prdVersions, setPRDVersions] = useState<Array<{ id: number; version_number: number; created_at: string }>>([]);
  const [selectedVersion, setSelectedVersion] = useState<GetPRDVersionResponse | null>(null);
  const [researchList, setResearchList] = useState<Array<{ id: number; sequence_number: number; research_content: string; created_at: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchLatestPRD = async () => {
    try {
      const prdRes = await fetch(`/api/products/${productId}/prd/latest`);
      if (prdRes.ok) {
        const prdData = await prdRes.json();
        setLatestPRD(prdData);
        setSelectedVersion(prdData);

        // Fetch PRD versions
        const versionsRes = await fetch(`/api/products/${productId}/prd/versions`);
        if (versionsRes.ok) {
          const versionsData = await versionsRes.json();
          setPRDVersions(versionsData.versions);
        }
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product
        const productRes = await fetch(`/api/products/${productId}`);
        const productData = await productRes.json();

        if (!productRes.ok) {
          setError(productData.error || '제품을 불러오는 데 실패했습니다');
          setIsLoading(false);
          return;
        }

        setProduct(productData);

        // Fetch latest PRD
        await fetchLatestPRD();

        // Fetch research
        const researchRes = await fetch(`/api/products/${productId}/research`);
        if (researchRes.ok) {
          const researchData = await researchRes.json();
          setResearchList(researchData.research);
        }
      } catch (err) {
        setError('네트워크 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: parseInt(productId, 10) }),
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

  const handleSelectVersion = async (versionId: number) => {
    try {
      const response = await fetch(`/api/prd/version/${versionId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedVersion(data);
      }
    } catch (err) {
      console.error('버전 로드 실패:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('이 제품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push(`/${accessCode}/dashboard`);
      } else {
        const data = await response.json();
        alert(data.error || '제품 삭제에 실패했습니다');
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다');
    }
  };

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-12">
        <Card className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">오류</h2>
          <p className="text-gray-600 mb-6">{error || '제품을 찾을 수 없습니다'}</p>
          <Link href={`/${accessCode}/dashboard`}>
            <Button>대시보드로 돌아가기</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-6">
        <Link
          href={`/${accessCode}/dashboard`}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          ← 대시보드로 돌아가기
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Product Info */}
          <Card>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {product.product_name || product.one_liner}
            </h1>
            {product.product_name && (
              <p className="text-gray-600 mb-4">{product.one_liner}</p>
            )}

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">핵심 기능</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{product.core_features}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {product.platforms.map((platform) => (
                <Badge key={platform} variant="info">
                  {platform}
                </Badge>
              ))}
            </div>

            {product.tech_stack && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">기술 스택</h3>
                <p className="text-gray-600">{product.tech_stack}</p>
              </div>
            )}
          </Card>

          {/* PRD Section */}
          {latestPRD && selectedVersion ? (
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  PRD v{selectedVersion.version_number}
                  {selectedVersion.id === latestPRD.id && (
                    <Badge variant="success" className="ml-2">최신</Badge>
                  )}
                </h2>
              </div>
              <PRDViewer
                content={selectedVersion.content}
                validationMarkers={selectedVersion.validation_markers}
                versionNumber={selectedVersion.version_number}
              />
            </Card>
          ) : (
            <Card className="text-center py-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                아직 PRD가 생성되지 않았습니다
              </h2>
              {researchList.length < 3 ? (
                <>
                  <p className="text-gray-600 mb-2">
                    PRD 생성을 위해 최소 <strong className="text-blue-600">3개의 유저 리서치</strong>가 필요합니다
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    현재 {researchList.length}개 / 3개 완료
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href={`/${accessCode}/product/${productId}/research`}>
                      <Button variant="primary">
                        📝 리서치 추가하기 ({3 - researchList.length}개 더 필요)
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {!isGenerating ? (
                    <>
                      <p className="text-gray-600 mb-2">
                        ✅ 유저 리서치 {researchList.length}개가 준비되었습니다
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        이제 PRD를 생성할 수 있습니다
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Link href={`/${accessCode}/product/${productId}/research`}>
                          <Button variant="outline">
                            📝 리서치 더 추가하기
                          </Button>
                        </Link>
                        <Button onClick={handleGeneratePRD} disabled={isGenerating}>
                          📄 PRD 생성하기
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <LoadingSpinner size="md" />
                        <span className="text-lg font-semibold text-gray-900">PRD 생성 중</span>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-md mx-auto">
                        <h3 className="font-semibold text-blue-900 mb-2">⏳ 백그라운드에서 생성 중</h3>
                        <p className="text-sm text-blue-800 mb-2">
                          Claude가 제품 정보와 리서치를 분석하여 종합적인 PRD를 작성하고 있습니다.
                        </p>
                        <p className="text-sm text-blue-800 mb-2">
                          <strong>예상 소요 시간:</strong> 약 30-60초
                        </p>
                        <p className="text-sm text-blue-700">
                          💡 이 페이지에 머물러 주세요. PRD 생성이 완료되면 자동으로 업데이트됩니다.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
            </Card>
          )}

          {/* Product Info - Moved Below PRD */}
          <Card padding="sm">
            <h3 className="font-semibold text-gray-900 mb-3">제품 정보</h3>
            <div className="space-y-2 text-sm mb-4">
              <div>
                <span className="text-gray-600">생성일:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(product.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">수정일:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(product.updated_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">ID:</span>
                <span className="ml-2 text-gray-900">{product.id}</span>
              </div>
            </div>
            
            {/* Product Delete Button */}
            <div className="pt-3 border-t border-gray-200">
              <Button variant="danger" size="sm" onClick={handleDelete} className="w-full">
                제품 삭제
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          {/* PRD Version History */}
          {prdVersions.length > 0 && (
            <Card padding="sm">
              <h3 className="font-semibold text-gray-900 mb-3">PRD 버전 히스토리</h3>
              <div className="space-y-2">
                {prdVersions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => handleSelectVersion(version.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedVersion?.id === version.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>v{version.version_number}</span>
                      {version.id === latestPRD?.id && (
                        <Badge variant="success" className="text-xs">최신</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(version.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-5">
            {/* PRD Iterate Button */}
            {latestPRD && (
              <Link href={`/${accessCode}/product/${productId}/iterate`} className="block">
                <Button variant="primary" className="w-full h-12 text-base">
                  🔄 PRD 고도화
                </Button>
              </Link>
            )}

            {/* Research Add Button */}
            <Link href={`/${accessCode}/product/${productId}/research`} className="block">
              <Button variant="outline" className="w-full h-12 text-base">
                📝 리서치 추가
              </Button>
            </Link>
          </div>

          {/* Validation Markers */}
          {selectedVersion && selectedVersion.validation_markers.length > 0 && (
            <Card padding="sm">
              <h3 className="font-semibold text-gray-900 mb-3">검증 필요</h3>
              <p className="text-sm text-gray-600 mb-4">
                다음 기능 또는 가정은 사용자 리서치를 통한 검증이 필요합니다:
              </p>
              <div className="space-y-3">
                {selectedVersion.validation_markers.map((marker) => (
                  <div 
                    key={marker.id} 
                    className={`p-3 rounded-lg border-l-4 ${
                      marker.marker_type === 'user_need_verification' 
                        ? 'bg-red-50 border-red-400'
                        : marker.marker_type === 'additional_research_needed'
                        ? 'bg-blue-50 border-blue-400'
                        : 'bg-yellow-50 border-yellow-400'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">
                        {marker.marker_type === 'user_need_verification' ? '?' : 
                         marker.marker_type === 'additional_research_needed' ? '🔍' : '⚠️'}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 mb-1">
                          {marker.marker_type === 'user_need_verification' ? '문제-해결책 적합성' :
                           marker.marker_type === 'additional_research_needed' ? '리서치 갭' : 
                           '사용자 니즈 검증'}
                        </div>
                        <div className="text-sm font-medium text-gray-800 mb-1">
                          {marker.feature_name}
                        </div>
                        {marker.description && (
                          <div className="text-xs text-gray-600">
                            {marker.description}
                          </div>
                        )}
                        {marker.section_context && (
                          <div className="text-xs text-gray-500 mt-1">
                            위치: {marker.section_context}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Research History */}
          {researchList.length > 0 && (
            <Card padding="sm">
              <h3 className="font-semibold text-gray-900 mb-3">리서치 히스토리</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {researchList.map((research) => (
                  <div 
                    key={research.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-blue-600">
                        리서치 #{research.sequence_number}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(research.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {research.research_content}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
}
