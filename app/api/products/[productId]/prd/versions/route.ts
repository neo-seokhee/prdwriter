import { NextRequest, NextResponse } from 'next/server';
import { getPRDVersionsByProductId } from '@/lib/db/queries';
import type { ErrorResponse } from '@/lib/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId: productIdStr } = await params;
    const productId = parseInt(productIdStr, 10);

    if (isNaN(productId)) {
      const errorResponse: ErrorResponse = {
        error: '유효하지 않은 product_id입니다',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const versions = await getPRDVersionsByProductId(productId);

    return NextResponse.json({
      versions: versions.map((v) => ({
        id: v.id,
        version_number: v.version_number,
        created_at: v.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching PRD versions:', error);

    const errorResponse: ErrorResponse = {
      error: 'PRD 버전 목록 조회에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

