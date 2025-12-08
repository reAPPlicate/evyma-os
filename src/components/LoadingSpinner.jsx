import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * LoadingSpinner Component
 * Reusable loading indicator
 */
export default function LoadingSpinner({
  size = 'md',
  className = '',
  fullScreen = false,
  text = null
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <>
      <Loader2 className={cn(sizeClasses[size], 'animate-spin text-blue-600', className)} />
      {text && (
        <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {spinner}
      </div>
    );
  }

  return <div className="flex flex-col items-center justify-center">{spinner}</div>;
}

/**
 * Skeleton Component
 * Animated placeholder for loading content
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', className)}
      {...props}
    />
  );
}

/**
 * CardSkeleton Component
 * Skeleton for card content
 */
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
