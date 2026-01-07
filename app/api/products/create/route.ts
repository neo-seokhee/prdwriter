import { NextRequest, NextResponse } from 'next/server';
import { getUserByAccessCode } from '@/lib/db/queries';
import { createProduct } from '@/lib/db/queries';
import type { CreateProductRequest, CreateProductResponse, ErrorResponse } from '@/lib/types/api';

export async function POST(request: NextRequest) {
  try {
    const body: CreateProductRequest = await request.json();
    const { access_code, product_name, one_liner, core_features, platforms, tech_stack, is_action_camp } = body;

    // Validate required fields
    if (!access_code || !one_liner || !core_features || !platforms || platforms.length === 0) {
      const errorResponse: ErrorResponse = {
        error: '필수 필드가 누락되었습니다',
        details: 'access_code, one_liner, core_features, platforms가 필요합니다',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get user by access code
    const user = await getUserByAccessCode(access_code);
    if (!user) {
      const errorResponse: ErrorResponse = {
        error: '유효하지 않은 접근 코드입니다',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Create product
    const productId = await createProduct({
      user_id: user.id,
      product_name,
      one_liner,
      core_features,
      platforms,
      tech_stack,
      is_action_camp,
    });

    const response: CreateProductResponse = {
      product_id: productId,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);

    const errorResponse: ErrorResponse = {
      error: '제품 생성에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
