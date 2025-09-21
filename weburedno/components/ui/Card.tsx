'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  variant?: 'default' | 'bordered' | 'elevated' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({
  children,
  title,
  description,
  icon: Icon,
  iconColor = 'text-green-600',
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hoverable = false,
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white',
    bordered: 'bg-white border-2 border-gray-200',
    elevated: 'bg-white shadow-lg',
    gradient: 'bg-gradient-to-br from-green-50 to-green-100',
  };

  const baseClasses = `
    rounded-xl overflow-hidden
    ${paddingClasses[padding]}
    ${variantClasses[variant]}
    ${onClick || hoverable ? 'cursor-pointer' : ''}
    ${className}
  `;

  const card = (
    <div className={baseClasses} onClick={onClick}>
      {(Icon || title || description) && (
        <div className="mb-4">
          {Icon && (
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-50 mb-4`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
          )}
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );

  if (hoverable || onClick) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {card}
      </motion.div>
    );
  }

  return card;
}