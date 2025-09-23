'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function LoadingState({
  message = 'Učitavanje...',
  variant = 'spinner',
  size = 'md',
  fullScreen = false,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center p-8';

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div
            className={`${sizeClasses[size]} border-3 border-gray-200 border-t-green-600 rounded-full animate-spin`}
          />
        );

      case 'dots':
        return (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-green-600 rounded-full"
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <Sparkles className={`${sizeClasses[size]} text-green-600`} />
          </motion.div>
        );

      case 'skeleton':
        return (
          <div className="w-full space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={containerClasses}>
      {renderLoader()}
      {message && variant !== 'skeleton' && (
        <p className="mt-4 text-sm text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );
}