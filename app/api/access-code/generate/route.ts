import { NextResponse } from 'next/server';
import { createUserWithAccessCode } from '@/lib/utils/access-code';
import type { GenerateAccessCodeResponse, ErrorResponse } from '@/lib/types/api';

export async function POST() {
  try {
    const { user_id, access_code } = await createUserWithAccessCode();

    const response: GenerateAccessCodeResponse = {
      access_code,
      user_id,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error generating access code:', error);

    const errorResponse: ErrorResponse = {
      error: '접근 코드 생성에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
