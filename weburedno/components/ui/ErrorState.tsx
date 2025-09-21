'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  fullScreen?: boolean;
}

export default function ErrorState({
  title = 'Ups! Nešto je pošlo po zlu',
  message = 'Dogodila se neočekivana greška. Molimo pokušajte ponovno.',
  onRetry,
  showHomeButton = false,
  fullScreen = false,
}: ErrorStateProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6"
        >
          <AlertCircle className="w-10 h-10 text-red-600" />
        </motion.div>

        {/* Error Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h2>

        {/* Error Message */}
        <p className="text-gray-600 mb-8">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="primary"
              icon={RefreshCw}
              iconPosition="left"
            >
              Pokušaj ponovno
            </Button>
          )}
          {showHomeButton && (
            <Button
              href="/"
              variant="outline"
              icon={Home}
              iconPosition="left"
            >
              Početna stranica
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}