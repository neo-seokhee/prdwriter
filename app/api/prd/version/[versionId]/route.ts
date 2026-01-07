import { NextRequest, NextResponse } from 'next/server';
import {
  getPRDVersionById,
  getValidationMarkersByPRDVersionId,
} from '@/lib/db/queries';
import type { GetPRDVersionResponse, ErrorResponse } from '@/lib/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const { versionId: versionIdStr } = await params;
    const versionId = parseInt(versionIdStr, 10);

    if (isNaN(versionId)) {
      const errorResponse: ErrorResponse = {
        error: '유효하지 않은 version_id입니다',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const prdVersion = await getPRDVersionById(versionId);

    if (!prdVersion) {
      const errorResponse: ErrorResponse = {
        error: 'PRD 버전을 찾을 수 없습니다',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const validationMarkers = await getValidationMarkersByPRDVersionId(versionId);

    const response: GetPRDVersionResponse = {
      id: prdVersion.id,
      product_id: prdVersion.product_id,
      version_number: prdVersion.version_number,
      content: prdVersion.content,
      validation_markers: validationMarkers,
      created_at: prdVersion.created_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching PRD version:', error);

    const errorResponse: ErrorResponse = {
      error: 'PRD 버전 조회에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

