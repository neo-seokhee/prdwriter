'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAccessCode } from '@/hooks/useAccessCode';
import { Badge } from '@/components/ui/Badge';

export function Header() {
  const router = useRouter();
  const { accessCode, clearAccessCode, isAuthenticated } = useAccessCode();

  const handleLogout = () => {
    // 세션 스토리지 완전 초기화
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('prdwriter_access_code');
      sessionStorage.removeItem('prdwriter_user_id');
    }

    // Context 상태 초기화
    clearAccessCode();

    // 홈으로 리다이렉트 (강제 새로고침)
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                PRD Writer
              </span>
            </h1>
          </div>

          {isAuthenticated && accessCode && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">접근 코드:</span>
                <Badge variant="info" size="md">
                  {accessCode}
                </Badge>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
