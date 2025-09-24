'use client';

import { useState } from 'react';
import { Plus, Minus, AlertCircle } from 'lucide-react';

interface AreaInputProps {
  label: string;
  unit: 'm²' | 'm';
  pricePerUnit: number;
  minPrice: number;
  value: number;
  onChange: (value: number) => void;
  icon?: string;
  helperText?: string;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export default function AreaInput({
  label,
  unit,
  pricePerUnit,
  minPrice,
  value,
  onChange,
  icon,
  helperText,
  max = 1000,
  step = 10,
  disabled = false
}: AreaInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleDecrement = () => {
    const newValue = Math.max(0, value - step);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const numVal = parseFloat(val);
    if (!isNaN(numVal) && numVal >= 0 && numVal <= max) {
      onChange(numVal);
    }
  };

  const handleBlur = () => {
    const numVal = parseFloat(inputValue);
    if (isNaN(numVal) || numVal < 0) {
      setInputValue('0');
      onChange(0);
    } else if (numVal > max) {
      setInputValue(max.toString());
      onChange(max);
    } else {
      setInputValue(numVal.toString());
      onChange(numVal);
    }
  };

  const calculatedPrice = Math.max(value * pricePerUnit, value > 0 ? minPrice : 0);
  const isMinPriceApplied = value > 0 && value * pricePerUnit < minPrice;

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
      value > 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{label}</h4>
            {helperText && (
              <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-green-600">
            {value > 0 ? `${calculatedPrice.toFixed(0)} EUR` : '-'}
          </div>
          <div className="text-xs text-gray-500">
            {value > 0 && `${value} ${unit} × ${pricePerUnit} EUR/${unit}`}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || value <= 0}
            className={`p-2 rounded-lg border transition-all ${
              value > 0 && !disabled
                ? 'border-gray-300 hover:bg-gray-50 cursor-pointer'
                : 'border-gray-200 cursor-not-allowed opacity-40'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              disabled={disabled}
              min="0"
              max={max}
              step={step}
              className="w-24 text-center font-medium border border-gray-300 rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm text-gray-600 font-medium">
              {unit}
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

        {isMinPriceApplied && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              Minimalna cijena od {minPrice} EUR je primijenjena
            </p>
          </div>
        )}

        {/* Quick select buttons for common areas */}
        <div className="flex gap-2 justify-center">
          {[50, 100, 200, 500].map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => {
                onChange(area);
                setInputValue(area.toString());
              }}
              disabled={disabled}
              className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                value === area
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
              } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {area} {unit}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}