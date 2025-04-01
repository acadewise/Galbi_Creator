import React from 'react';

interface LoadingStateProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({ text = 'Loading...', size = 'md', className = '' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  const spinnerSize = sizeClasses[size];
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${spinnerSize} animate-spin rounded-full border-4 border-gray-200 border-t-primary`} />
      {text && <p className="mt-3 text-gray-500">{text}</p>}
    </div>
  );
}

export function LoadingDots({ className = '', size = 'sm' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3'
  };
  
  const dotSize = sizeClasses[size];
  
  return (
    <div className={`inline-flex space-x-1 ${className}`}>
      <div className={`${dotSize} rounded-full bg-current animate-bounce`} style={{ animationDelay: '0ms' }}></div>
      <div className={`${dotSize} rounded-full bg-current animate-bounce`} style={{ animationDelay: '150ms' }}></div>
      <div className={`${dotSize} rounded-full bg-current animate-bounce`} style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

export function LoadingButton({ 
  children, 
  loading, 
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading: boolean; className?: string }) {
  return (
    <button
      className={`inline-flex items-center justify-center ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="mr-2">Loading</span>
          <LoadingDots />
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default LoadingState;