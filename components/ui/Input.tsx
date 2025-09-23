'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    const inputClasses = `
      w-full px-4 py-3 text-base rounded-lg border transition-all duration-200
      placeholder:text-gray-400 min-h-[48px]
      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      ${Icon && iconPosition === 'left' ? 'pl-12' : ''}
      ${Icon && iconPosition === 'right' ? 'pr-12' : ''}
      ${hasError
        ? 'border-red-500 text-red-900 placeholder:text-red-400'
        : 'border-gray-300 text-gray-900 hover:border-gray-400'
      }
      ${className}
    `;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {Icon && (
            <div
              className={`
                absolute top-1/2 -translate-y-1/2 pointer-events-none
                ${iconPosition === 'left' ? 'left-4' : 'right-4'}
                ${hasError ? 'text-red-500' : 'text-gray-400'}
              `}
            >
              <Icon className="w-5 h-5" />
            </div>
          )}
          
          <input
            ref={ref}
            className={inputClasses}
            aria-invalid={hasError}
            aria-describedby={error ? 'error-message' : helperText ? 'helper-text' : undefined}
            {...props}
          />
        </div>
        
        {error && (
          <p id="error-message" className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id="helper-text" className="mt-1.5 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;