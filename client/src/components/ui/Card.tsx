import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function Card({ children, className = '', onClick, selected }: CardProps) {
  const clickableStyles = onClick 
    ? 'cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200' 
    : '';
  
  const selectedStyles = selected 
    ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50' 
    : 'border-gray-200';

  return (
    <div
      className={`bg-white rounded-xl border p-6 shadow-sm ${clickableStyles} ${selectedStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
