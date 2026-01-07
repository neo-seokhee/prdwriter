'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessCodeContextType {
  accessCode: string | null;
  userId: number | null;
  isLoading: boolean;
  setAccessCode: (code: string, userId: number) => void;
  clearAccessCode: () => void;
  validateAndSet: (code: string) => Promise<boolean>;
}

const AccessCodeContext = createContext<AccessCodeContextType | undefined>(undefined);

const STORAGE_KEY = 'prdwriter_access_code';
const USER_ID_KEY = 'prdwriter_user_id';

export function AccessCodeProvider({ children }: { children: ReactNode }) {
  const [accessCode, setAccessCodeState] = useState<string | null>(null);
  const [userId, setUserIdState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCode = sessionStorage.getItem(STORAGE_KEY);
      const storedUserId = sessionStorage.getItem(USER_ID_KEY);

      if (storedCode && storedUserId) {
        setAccessCodeState(storedCode);
        setUserIdState(parseInt(storedUserId, 10));
      }

      setIsLoading(false);
    }
  }, []);

  const setAccessCode = (code: string, userId: number) => {
    setAccessCodeState(code);
    setUserIdState(userId);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, code);
      sessionStorage.setItem(USER_ID_KEY, userId.toString());
    }
  };

  const clearAccessCode = () => {
    setAccessCodeState(null);
    setUserIdState(null);

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(USER_ID_KEY);
    }
  };

  const validateAndSet = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/access-code/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_code: code }),
      });

      const data = await response.json();

      if (data.valid && data.user_id) {
        setAccessCode(code, data.user_id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error validating access code:', error);
      return false;
    }
  };

  return (
    <AccessCodeContext.Provider
      value={{
        accessCode,
        userId,
        isLoading,
        setAccessCode,
        clearAccessCode,
        validateAndSet,
      }}
    >
      {children}
    </AccessCodeContext.Provider>
  );
}

export function useAccessCodeContext() {
  const context = useContext(AccessCodeContext);

  if (context === undefined) {
    throw new Error('useAccessCodeContext must be used within AccessCodeProvider');
  }

  return context;
}
