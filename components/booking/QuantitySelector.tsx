'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
  label: string;
  unit: string;
  unitPrice: number;
  min?: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
  icon?: string;
  helperText?: string;
  disabled?: boolean;
}

export default function QuantitySelector({
  label,
  unit,
  unitPrice,
  min = 0,
  max = 99,
  value,
  onChange,
  icon,
  helperText,
  disabled = false
}: QuantitySelectorProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const totalPrice = value * unitPrice;

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
      value > 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <h4 className="font-medium text-gray-900">{label}</h4>
            {helperText && (
              <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-green-600">
            {totalPrice > 0 ? `${totalPrice} EUR` : '-'}
          </div>
          <div className="text-xs text-gray-500">
            @{unitPrice} EUR/{unit}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={`p-2 rounded-lg border transition-all ${
            value > min && !disabled
              ? 'border-gray-300 hover:bg-gray-50 cursor-pointer'
              : 'border-gray-200 cursor-not-allowed opacity-40'
          }`}
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            min={min}
            max={max}
            className="w-16 text-center font-medium border border-gray-300 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="text-sm text-gray-600 min-w-[60px]">
            {unit}{value !== 1 && unit !== 'sat' ? (unit.endsWith('a') ? '' : 'a') : ''}
          </span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={`p-2 rounded-lg border transition-all ${
            value < max && !disabled
              ? 'border-gray-300 hover:bg-gray-50 cursor-pointer'
              : 'border-gray-200 cursor-not-allowed opacity-40'
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}