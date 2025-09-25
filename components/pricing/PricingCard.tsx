'use client';

import { LucideIcon, Clock, Euro, CheckCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export interface PricingCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  price: number | string;
  originalPrice?: number | string;
  duration?: string;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  discount?: string;
  href?: string;
  onSelect?: () => void;
  showPerHour?: boolean;
  buttonText?: string;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export default function PricingCard({
  title,
  description,
  icon: Icon,
  price,
  originalPrice,
  duration,
  features,
  popular = false,
  recommended = false,
  discount,
  href = '/kontakt',
  onSelect,
  showPerHour = true,
  buttonText = 'Rezerviraj odmah',
  variant = 'default',
  className = '',
}: PricingCardProps) {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative h-full ${className}`}
    >
      {/* Popular/Recommended Badge */}
      {(popular || recommended) && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge
            variant={popular ? "success" : "primary"}
            size="sm"
            icon={recommended ? Star : undefined}
          >
            {popular ? 'Najpopularnije' : 'Preporučujemo'}
          </Badge>
        </div>
      )}

      {/* Discount Badge */}
      {discount && !popular && !recommended && (
        <div className="absolute -top-3 right-4 z-10">
          <Badge variant="warning" size="sm">
            {discount}
          </Badge>
        </div>
      )}

      <div
        className={`
          bg-white rounded-xl overflow-hidden h-full transition-all duration-300
          ${popular ? 'ring-2 ring-green-600 shadow-xl' : 'border border-gray-200 shadow-lg hover:shadow-xl'}
          ${recommended ? 'ring-2 ring-blue-500 shadow-xl' : ''}
        `}
      >
        {/* Header */}
        <div className={`${isCompact ? 'p-4 pb-0' : 'p-6 pb-0'}`}>
          <div className="flex items-start justify-between mb-4">
            <div
              className={`
                inline-flex items-center justify-center rounded-lg
                ${isCompact ? 'w-10 h-10' : 'w-12 h-12'}
                ${popular ? 'bg-green-100' : recommended ? 'bg-blue-100' : 'bg-gray-100'}
              `}
            >
              <Icon
                className={`
                  ${isCompact ? 'w-5 h-5' : 'w-6 h-6'}
                  ${popular ? 'text-green-600' : recommended ? 'text-blue-600' : 'text-gray-700'}
                `}
              />
            </div>
          </div>

          <h3 className={`font-bold text-gray-900 mb-2 ${isCompact ? 'text-lg' : 'text-xl'}`}>
            {title}
          </h3>

          <p className={`text-gray-600 mb-4 ${isCompact ? 'text-xs' : 'text-sm'}`}>
            {description}
          </p>
        </div>

        {/* Pricing */}
        <div className={`border-b border-gray-100 ${isCompact ? 'px-4 pb-4' : 'px-6 pb-6'}`}>
          <div className="flex items-baseline gap-1 mb-2">
            <span className={`text-gray-500 ${isCompact ? 'text-xs' : 'text-sm'}`}>od</span>

            {originalPrice && (
              <span className={`line-through text-gray-400 ${isCompact ? 'text-lg' : 'text-xl'}`}>
                {originalPrice} €
              </span>
            )}

            <span className={`font-bold text-gray-900 ${isCompact ? 'text-2xl' : 'text-3xl'}`}>
              {price} €
            </span>
          </div>

          {(duration || showPerHour) && (
            <div className={`flex items-center gap-4 text-gray-500 ${isCompact ? 'text-xs' : 'text-sm'}`}>
              {duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{duration}</span>
                </div>
              )}
              {showPerHour && (
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  <span>po satu</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <div className={isCompact ? 'p-4' : 'p-6'}>
          <ul className={`space-y-3 ${isDetailed ? 'mb-8' : 'mb-6'}`}>
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className={`text-gray-700 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Button
            href={href}
            onClick={onSelect}
            variant={popular ? 'primary' : recommended ? 'secondary' : 'outline'}
            fullWidth
            size={isCompact ? 'md' : 'lg'}
            className="transition-all duration-200 hover:transform hover:scale-105"
          >
            {buttonText}
          </Button>

          {isDetailed && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              Bez ugovorne obaveze • Plaćanje po završetku
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}