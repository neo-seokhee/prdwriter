import { NextRequest, NextResponse } from 'next/server';
import {
  getProductById,
  getResearchByProductId,
  createResearch,
  getNextResearchSequence,
} from '@/lib/db/queries';
import type { AddResearchRequest, AddResearchResponse, ListResearchResponse, ErrorResponse } from '@/lib/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId: productIdStr } = await params;
    const productId = parseInt(productIdStr, 10);

    if (isNaN(productId)) {
      const errorResponse: ErrorResponse = {
        error: '유효하지 않은 제품 ID입니다',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check if product exists
    const product = await getProductById(productId);
    if (!product) {
      const errorResponse: ErrorResponse = {
        error: '제품을 찾을 수 없습니다',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Get all research for this product
    const research = await getResearchByProductId(productId);

    const response: ListResearchResponse = {
      research,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error listing research:', error);

    const errorResponse: ErrorResponse = {
      error: '리서치 목록 조회에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId: productIdStr } = await params;
    const productId = parseInt(productIdStr, 10);

    if (isNaN(productId)) {
      const errorResponse: ErrorResponse = {
        error: '유효하지 않은 제품 ID입니다',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const body: AddResearchRequest = await request.json();
    const { research_content } = body;

    if (!research_content || !research_content.trim()) {
      const errorResponse: ErrorResponse = {
        error: '리서치 내용이 필요합니다',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check if product exists
    const product = await getProductById(productId);
    if (!product) {
      const errorResponse: ErrorResponse = {
        error: '제품을 찾을 수 없습니다',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Get next sequence number
    const sequenceNumber = await getNextResearchSequence(productId);

    // Create research
    const researchId = await createResearch({
      product_id: productId,
      research_content,
      sequence_number: sequenceNumber,
    });

    const response: AddResearchResponse = {
      research_id: researchId,
      sequence_number: sequenceNumber,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error adding research:', error);

    const errorResponse: ErrorResponse = {
      error: '리서치 추가에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
