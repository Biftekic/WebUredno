'use client';

import { LucideIcon, Clock, Euro, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from './Badge';
import Button from './Button';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  price: string;
  duration: string;
  features: string[];
  popular?: boolean;
  href?: string;
  onSelect?: () => void;
}

export default function ServiceCard({
  title,
  description,
  icon: Icon,
  price,
  duration,
  features,
  popular = false,
  href = '/kontakt',
  onSelect,
}: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative"
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge variant="success" size="sm">
            Najpopularnije
          </Badge>
        </div>
      )}

      <div
        className={`
          bg-white rounded-xl overflow-hidden h-full
          ${popular ? 'ring-2 ring-green-600 shadow-xl' : 'border border-gray-200 shadow-lg'}
        `}
      >
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`
                inline-flex items-center justify-center w-12 h-12 rounded-lg
                ${popular ? 'bg-green-100' : 'bg-gray-100'}
              `}
            >
              <Icon className={`w-6 h-6 ${popular ? 'text-green-600' : 'text-gray-700'}`} />
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4">
            {description}
          </p>
        </div>

        {/* Pricing */}
        <div className="px-6 pb-6 border-b border-gray-100">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl font-bold text-gray-900">{price}</span>
            <span className="text-gray-500">€</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Euro className="w-4 h-4" />
              <span>po satu</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Button
            href={href}
            onClick={onSelect}
            variant={popular ? 'primary' : 'outline'}
            fullWidth
            size="lg"
          >
            Rezerviraj odmah
          </Button>
        </div>
      </div>
    </motion.div>
  );
}