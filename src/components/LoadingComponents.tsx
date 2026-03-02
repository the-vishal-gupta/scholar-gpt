import { memo } from 'react';

export const PaperCardSkeleton = memo(() => (
  <div className="glass-card p-6 mb-4 animate-pulse">
    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      
      <div className="flex lg:flex-col gap-2 lg:items-end">
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-gray-200 rounded"></div>
          <div className="h-9 w-9 bg-gray-200 rounded"></div>
        </div>
        <div className="h-9 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
));

export const AuthorCardSkeleton = memo(() => (
  <div className="glass-card p-6 mb-4 animate-pulse">
    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-200"></div>
          <div className="flex-1 min-w-0">
            <div className="h-6 bg-gray-200 rounded mb-2 w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="w-4 h-4 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
));

export const MetricsCardSkeleton = memo(() => (
  <div className="glass-card p-6 animate-pulse">
    <div className="flex items-center gap-2 mb-6">
      <div className="w-5 h-5 bg-gray-200 rounded"></div>
      <div className="h-6 bg-gray-200 rounded w-32"></div>
    </div>
    
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg p-4 text-center">
          <div className="w-5 h-5 bg-gray-200 rounded mx-auto mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
        </div>
      ))}
    </div>

    <div className="space-y-4">
      <div className="h-5 bg-gray-200 rounded w-40"></div>
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

export const LoadingSpinner = memo(({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
  );
});