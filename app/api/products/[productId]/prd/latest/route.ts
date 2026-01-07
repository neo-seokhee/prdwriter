import { NextRequest, NextResponse } from 'next/server';
import {
  getLatestPRDVersion,
  getValidationMarkersByPRDVersionId,
} from '@/lib/db/queries';
import type { GetPRDVersionResponse, ErrorResponse } from '@/lib/types/api';

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

    // Get latest PRD version
    const latestPRD = await getLatestPRDVersion(productId);

    if (!latestPRD) {
      const errorResponse: ErrorResponse = {
        error: 'PRD를 찾을 수 없습니다',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Get validation markers
    const validationMarkers = await getValidationMarkersByPRDVersionId(latestPRD.id);

    const response: GetPRDVersionResponse = {
      id: latestPRD.id,
      product_id: latestPRD.product_id,
      version_number: latestPRD.version_number,
      content: latestPRD.content,
      validation_markers: validationMarkers,
      created_at: latestPRD.created_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching latest PRD:', error);

    const errorResponse: ErrorResponse = {
      error: 'PRD 조회에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

