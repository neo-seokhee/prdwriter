import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', padding = 'md', hover = false, onClick }: CardProps) {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm
        ${paddingStyles[padding]}
        ${hover ? 'transition-all duration-200 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
