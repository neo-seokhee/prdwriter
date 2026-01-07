'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAccessCode } from '@/hooks/useAccessCode';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AccessCodeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { validateAndSet, accessCode, isLoading } = useAccessCode();
  const codeFromUrl = params.accessCode as string;

  useEffect(() => {
    const verifyAccess = async () => {
      // If we already have a valid access code, check if it matches the URL
      if (accessCode) {
        if (accessCode !== codeFromUrl) {
          // URL code doesn't match stored code, validate the URL code
          const isValid = await validateAndSet(codeFromUrl);
          if (!isValid) {
            router.push('/');
          }
        }
        // If codes match, we're good
        return;
      }

      // No stored access code, validate the URL code
      const isValid = await validateAndSet(codeFromUrl);
      if (!isValid) {
        router.push('/');
      }
    };

    if (!isLoading && codeFromUrl) {
      verifyAccess();
    }
  }, [codeFromUrl, accessCode, isLoading, validateAndSet, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
