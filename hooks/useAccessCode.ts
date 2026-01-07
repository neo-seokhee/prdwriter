'use client';

import { useAccessCodeContext } from '@/context/AccessCodeContext';

export function useAccessCode() {
  const context = useAccessCodeContext();

  return {
    accessCode: context.accessCode,
    userId: context.userId,
    isLoading: context.isLoading,
    setAccessCode: context.setAccessCode,
    clearAccessCode: context.clearAccessCode,
    validateAndSet: context.validateAndSet,
    isAuthenticated: context.accessCode !== null && context.userId !== null,
  };
}
