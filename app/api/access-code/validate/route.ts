import { NextRequest, NextResponse } from 'next/server';
import { validateAccessCodeFormat, checkAccessCodeExists } from '@/lib/utils/access-code';
import { getUserByAccessCode, updateUserLastAccessed } from '@/lib/db/queries';
import type { ValidateAccessCodeRequest, ValidateAccessCodeResponse, ErrorResponse } from '@/lib/types/api';

export async function POST(request: NextRequest) {
  try {
    const body: ValidateAccessCodeRequest = await request.json();
    const { access_code } = body;

    // Validate format
    if (!validateAccessCodeFormat(access_code)) {
      const response: ValidateAccessCodeResponse = {
        valid: false,
      };
      return NextResponse.json(response, { status: 200 });
    }

    // Check if exists
    const user = await getUserByAccessCode(access_code);

    if (!user) {
      const response: ValidateAccessCodeResponse = {
        valid: false,
      };
      return NextResponse.json(response, { status: 200 });
    }

    // Update last accessed time
    await updateUserLastAccessed(user.id);

    const response: ValidateAccessCodeResponse = {
      valid: true,
      user_id: user.id,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error validating access code:', error);

    const errorResponse: ErrorResponse = {
      error: '접근 코드 검증에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
