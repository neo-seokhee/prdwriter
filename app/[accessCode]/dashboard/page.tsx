'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAccessCode } from '@/hooks/useAccessCode';
import type { GetProductResponse } from '@/lib/types/api';

export default function DashboardPage() {
  const router = useRouter();
  const { accessCode } = useAccessCode();
  const [products, setProducts] = useState<GetProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!accessCode) return;

      try {
        const response = await fetch(`/api/products/list?access_code=${accessCode}`);
        const data = await response.json();

        if (response.ok) {
          setProducts(data.products || []);
        } else {
          setError(data.error || '제품 목록을 불러오는 데 실패했습니다');
        }
      } catch (err) {
        setError('네트워크 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [accessCode]);

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 제품</h1>
          <p className="mt-2 text-gray-600">제품 아이디어와 PRD를 관리하세요</p>
        </div>
        <Link href={`/${accessCode}/new`}>
          <Button>+ 새 제품</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 제품이 없습니다</h3>
            <p className="text-gray-600 mb-6">
              첫 번째 제품을 생성하여 AI로 PRD 작성을 시작하세요
            </p>
            <Link href={`/${accessCode}/new`}>
              <Button>첫 제품 만들기</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product.id}
              hover
              className="cursor-pointer"
              onClick={() => router.push(`/${accessCode}/product/${product.id}`)}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {product.product_name || product.one_liner}
                </h3>
                {product.product_name && (
                  <p className="text-sm text-gray-700 mb-2 line-clamp-1">{product.one_liner}</p>
                )}
                <p className="text-sm text-gray-600 line-clamp-3">{product.core_features}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {product.platforms.map((platform) => (
                  <Badge key={platform} variant="info" size="sm">
                    {platform}
                  </Badge>
                ))}
              </div>

              {product.tech_stack && (
                <div className="text-xs text-gray-500 line-clamp-1 mb-3">
                  기술 스택: {product.tech_stack}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center gap-4 text-xs">
                  <span className={`flex items-center gap-1 ${(product.research_count ?? 0) > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    <span>📝</span>
                    <span>{product.research_count ?? 0}개 리서치</span>
                  </span>
                  <span className={`flex items-center gap-1 ${(product.prd_count ?? 0) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    <span>📄</span>
                    <span>{product.prd_count ?? 0}개 PRD</span>
                  </span>
                </div>
                {product.research_count === 0 && (
                  <div className="text-xs text-orange-600 font-medium">
                    ⚠️ 리서치를 추가하세요
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  생성일: {new Date(product.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
