'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface WhatsAppButtonProps {
  variant?: 'primary' | 'secondary' | 'white' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  phoneNumber?: string;
  message?: string;
}

export default function WhatsAppButton({
  variant = 'primary',
  size = 'md',
  className = '',
  phoneNumber = '385912345678',
  message = 'Pozdrav! Zanima me vaša usluga čišćenja.',
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-green-600 text-white hover:bg-green-700 shadow-lg',
    secondary: 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50',
    white: 'bg-white text-green-600 hover:bg-gray-50 shadow-md',
    floating: 'fixed bottom-24 right-4 lg:bottom-8 lg:right-8 bg-green-600 text-white hover:bg-green-700 shadow-xl z-40',
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-full
    transition-all duration-200 transform hover:scale-105 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
  `;

  if (variant === 'floating') {
    return (
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${variantClasses[variant]} w-14 h-14 lg:w-16 lg:h-16 ${className}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Kontaktirajte nas putem WhatsApp-a"
      >
        <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7" />
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-green-600 animate-ping opacity-20" />
      </motion.a>
    );
  }

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="w-5 h-5" />
      <span>WhatsApp</span>
    </motion.a>
  );
}