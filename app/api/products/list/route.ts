import { NextRequest, NextResponse } from 'next/server';
import { getUserByAccessCode, getProductsByUserId } from '@/lib/db/queries';
import type { ListProductsResponse, ErrorResponse } from '@/lib/types/api';

export async function GET(request: NextRequest) {
  try {
    const accessCode = request.nextUrl.searchParams.get('access_code');

    if (!accessCode) {
      const errorResponse: ErrorResponse = {
        error: 'access_code 파라미터가 누락되었습니다',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get user by access code
    const user = await getUserByAccessCode(accessCode);
    if (!user) {
      const errorResponse: ErrorResponse = {
        error: '유효하지 않은 접근 코드입니다',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Get all products for user
    const products = await getProductsByUserId(user.id);

    const response: ListProductsResponse = {
      products,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error listing products:', error);

    const errorResponse: ErrorResponse = {
      error: '제품 목록 조회에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
