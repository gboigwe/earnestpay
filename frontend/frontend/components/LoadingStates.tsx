/**
 * Loading State Components
 * Consistent loading indicators across the application
 */

import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';

/**
 * Base loading spinner
 */
export const Spinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={`animate-spin text-green-600 ${sizeClasses[size]} ${className}`} />
  );
};

/**
 * Loading skeleton for text
 */
export const SkeletonText = ({ lines = 1, className = '' }: { lines?: number; className?: string }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-green-100 rounded animate-pulse"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
};

/**
 * Loading skeleton for cards
 */
export const SkeletonCard = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`p-6 bg-white border border-green-200 rounded-lg ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-green-100 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-green-100 rounded animate-pulse w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-green-100 rounded animate-pulse" />
          <div className="h-3 bg-green-100 rounded animate-pulse w-5/6" />
        </div>
      </div>
    </div>
  );
};

/**
 * Full page loading state
 */
export const PageLoader = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <motion.div
          className="inline-block mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full" />
        </motion.div>
        <p className="text-green-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

/**
 * Inline loading state
 */
export const InlineLoader = ({ message }: { message?: string }) => {
  return (
    <div className="flex items-center gap-2 text-green-700">
      <Spinner size="sm" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
};

/**
 * Button loading state
 */
export const ButtonLoader = ({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) => {
  return (
    <>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </>
  );
};

/**
 * Table loading state
 */
export const TableLoader = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3 border-b border-green-100">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <motion.div
              key={colIndex}
              className="h-4 bg-green-100 rounded flex-1 animate-pulse"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: rowIndex * 0.1 + colIndex * 0.05 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Loading overlay for existing content
 */
export const LoadingOverlay = ({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-sm text-green-700 mt-2">Processing...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

/**
 * Progress bar loading
 */
export const ProgressBar = ({ progress, className = '' }: { progress: number; className?: string }) => {
  return (
    <div className={`w-full h-2 bg-green-100 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-green-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};

/**
 * Pulsing dot indicator
 */
export const PulsingDot = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`relative flex h-3 w-3 ${className}`}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
    </div>
  );
};

/**
 * Refresh loading indicator
 */
export const RefreshLoader = ({ isRefreshing }: { isRefreshing: boolean }) => {
  return (
    <motion.div
      animate={{ rotate: isRefreshing ? 360 : 0 }}
      transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'text-green-600' : 'text-gray-500'}`} />
    </motion.div>
  );
};

/**
 * Loading dots animation
 */
export const LoadingDots = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`flex gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-green-600 rounded-full"
          animate={{ y: [-2, 2, -2] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Shimmer loading effect
 */
export const ShimmerBox = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`relative overflow-hidden bg-green-100 ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent"
        animate={{ translateX: ['100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
};
