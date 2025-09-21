'use client';

import { Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'white' | 'dark';
}

export default function Logo({ className = '', showIcon = true, variant = 'default' }: LogoProps) {
  const textColor = {
    default: 'text-gray-900',
    white: 'text-white',
    dark: 'text-gray-900',
  }[variant];

  const iconColor = {
    default: 'text-green-600',
    white: 'text-white',
    dark: 'text-green-600',
  }[variant];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <Sparkles className={`w-6 h-6 ${iconColor}`} />
      )}
      <span className={`font-bold text-xl ${textColor}`}>
        Web<span className={iconColor}>Uredno</span>
      </span>
    </div>
  );
}