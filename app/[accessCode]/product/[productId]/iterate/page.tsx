'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IterationForm } from '@/components/forms/IterationForm';
import { PRDViewer } from '@/components/prd/PRDViewer';
import { useAccessCode } from '@/hooks/useAccessCode';

export default function IteratePRDPage() {
  const router = useRouter();
  const params = useParams();
  const { accessCode } = useAccessCode();
  const productId = params.productId as string;

  const [newPRD, setNewPRD] = useState<any>(null);
  const [changeSummary, setChangeSummary] = useState('');

  const handleIterationSuccess = (data: any) => {
    setNewPRD({
      id: data.prd_version_id,
      product_id: parseInt(productId, 10),
      version_number: data.version_number,
      content: data.content,
      validation_markers: data.validation_markers.map((m: any, idx: number) => ({
        id: idx,
        feature_name: m.feature_name,
        marker_type: m.marker_type,
        description: m.description,
        section_context: m.section_context,
        created_at: new Date().toISOString(),
      })),
      created_at: new Date().toISOString(),
    });
    setChangeSummary(data.change_summary || '');
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

      {!newPRD ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">PRD 고도화</h1>
              <p className="text-gray-600 mb-6">
                새로운 인사이트, 리서치 결과 또는 변경된 요구사항을 추가하여 PRD의 업데이트된 버전을 생성하세요
              </p>

              <IterationForm productId={productId} onSuccess={handleIterationSuccess} />
            </Card>
          </div>

          <div>
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">작동 방식</h2>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>새로운 리서치 또는 인사이트 입력</li>
                <li>Claude가 변경사항 분석</li>
                <li>업데이트된 PRD 생성</li>
                <li>버전 히스토리 보존</li>
              </ol>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>💡 팁:</strong> 최상의 결과를 위해 구체적인 사용자 피드백, 시장 변화 또는 기술적 제약사항을 인사이트에 포함하세요.
                </p>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {changeSummary && (
            <Card>
              <div className="flex items-start gap-3">
                <Badge variant="success">업데이트됨</Badge>
                <div>
                  <h2 className="font-semibold text-gray-900 mb-1">변경 요약</h2>
                  <p className="text-gray-700">{changeSummary}</p>
                </div>
              </div>
            </Card>
          )}

          <Card padding="lg">
            <PRDViewer
              content={newPRD.content}
              validationMarkers={newPRD.validation_markers}
              versionNumber={newPRD.version_number}
            />
          </Card>

          <div className="flex justify-center gap-4">
            <Link href={`/${accessCode}/product/${productId}/prd`}>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                PRD 히스토리 보기
              </button>
            </Link>
            <button
              onClick={() => {
                setNewPRD(null);
                setChangeSummary('');
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              다시 고도화하기
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}
