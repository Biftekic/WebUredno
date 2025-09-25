'use client';

import { LucideIcon, Plus, Minus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export interface ExtraService {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  icon: LucideIcon;
  popular?: boolean;
  required?: boolean;
  maxQuantity?: number;
  minQuantity?: number;
}

interface ExtrasCardProps {
  title: string;
  subtitle?: string;
  extras: ExtraService[];
  selectedExtras?: { [key: string]: number };
  onExtrasChange?: (extras: { [key: string]: number }) => void;
  variant?: 'default' | 'compact' | 'inline';
  showTotal?: boolean;
  className?: string;
}

export default function ExtrasCard({
  title,
  subtitle,
  extras,
  selectedExtras = {},
  onExtrasChange,
  variant = 'default',
  showTotal = true,
  className = '',
}: ExtrasCardProps) {
  const [localExtras, setLocalExtras] = useState<{ [key: string]: number }>(selectedExtras);
  const [showInfo, setShowInfo] = useState<{ [key: string]: boolean }>({});

  const handleQuantityChange = (extraId: string, quantity: number) => {
    const extra = extras.find(e => e.id === extraId);
    if (!extra) return;

    const maxQty = extra.maxQuantity || 10;
    const minQty = extra.minQuantity || 0;
    const newQuantity = Math.max(minQty, Math.min(maxQty, quantity));

    const newExtras = { ...localExtras };
    if (newQuantity === 0) {
      delete newExtras[extraId];
    } else {
      newExtras[extraId] = newQuantity;
    }

    setLocalExtras(newExtras);
    onExtrasChange?.(newExtras);
  };

  const toggleInfo = (extraId: string) => {
    setShowInfo(prev => ({ ...prev, [extraId]: !prev[extraId] }));
  };

  const totalExtrasCost = extras.reduce((total, extra) => {
    const quantity = localExtras[extra.id] || 0;
    return total + (extra.price * quantity);
  }, 0);

  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';

  if (isInline) {
    return (
      <div className={`space-y-3 ${className}`}>
        {extras.map((extra) => {
          const quantity = localExtras[extra.id] || 0;
          const Icon = extra.icon;

          return (
            <motion.div
              key={extra.id}
              layout
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{extra.name}</span>
                    {extra.popular && <Badge variant="success" size="sm">Popularno</Badge>}
                    {extra.required && <Badge variant="warning" size="sm">Obavezno</Badge>}
                  </div>
                  <span className="text-xs text-gray-500">
                    {extra.price}€{extra.unit && ` / ${extra.unit}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(extra.id, quantity - 1)}
                  disabled={quantity <= (extra.minQuantity || 0)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(extra.id, quantity + 1)}
                  disabled={quantity >= (extra.maxQuantity || 10)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl border border-gray-200 shadow-lg ${className}`}
    >
      {/* Header */}
      <div className={`border-b border-gray-100 ${isCompact ? 'p-4' : 'p-6'}`}>
        <h3 className={`font-bold text-gray-900 ${isCompact ? 'text-lg' : 'text-xl'}`}>
          {title}
        </h3>
        {subtitle && (
          <p className={`text-gray-600 mt-1 ${isCompact ? 'text-sm' : 'text-base'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Extras List */}
      <div className={isCompact ? 'p-4' : 'p-6'}>
        <div className="space-y-4">
          {extras.map((extra) => {
            const quantity = localExtras[extra.id] || 0;
            const Icon = extra.icon;
            const showExtraInfo = showInfo[extra.id];

            return (
              <motion.div
                key={extra.id}
                layout
                className={`
                  border border-gray-200 rounded-lg p-4 transition-all duration-200
                  ${quantity > 0 ? 'bg-green-50 border-green-200' : 'bg-white'}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0">
                      <Icon className={`w-6 h-6 ${quantity > 0 ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{extra.name}</h4>
                        {extra.popular && <Badge variant="success" size="sm">Popularno</Badge>}
                        {extra.required && <Badge variant="warning" size="sm">Obavezno</Badge>}
                        {extra.description && (
                          <button
                            onClick={() => toggleInfo(extra.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">{extra.price}€</span>
                        {extra.unit && <span>/ {extra.unit}</span>}
                      </div>

                      <AnimatePresence>
                        {showExtraInfo && extra.description && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 text-xs text-gray-500"
                          >
                            {extra.description}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(extra.id, quantity - 1)}
                      disabled={quantity <= (extra.minQuantity || 0)}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <span className="w-8 text-center text-sm font-medium bg-white rounded border px-2 py-1">
                      {quantity}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(extra.id, quantity + 1)}
                      disabled={quantity >= (extra.maxQuantity || 10)}
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Total */}
        {showTotal && totalExtrasCost > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-4 border-t border-gray-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900">
                Ukupno dodaci:
              </span>
              <span className="text-xl font-bold text-green-600">
                {totalExtrasCost}€
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}