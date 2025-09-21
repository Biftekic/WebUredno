'use client';

import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestimonialCardProps {
  name: string;
  role?: string;
  content: string;
  rating: number;
  date?: string;
  image?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export default function TestimonialCard({
  name,
  role,
  content,
  rating,
  date,
  image,
  variant = 'default',
}: TestimonialCardProps) {
  const renderStars = () => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-lg p-4 shadow-md"
      >
        <div className="flex items-center gap-3 mb-3">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-semibold">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className="font-medium text-gray-900 text-sm">{name}</div>
            {renderStars()}
          </div>
        </div>
        <p className="text-gray-600 text-sm line-clamp-3">{content}</p>
      </motion.div>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 relative"
      >
        <Quote className="absolute top-6 right-6 w-12 h-12 text-green-200" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                <span className="text-gray-600 font-bold text-xl">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="font-bold text-gray-900 text-lg">{name}</div>
              {role && <div className="text-gray-600">{role}</div>}
              <div className="mt-1">{renderStars()}</div>
            </div>
          </div>
          
          <blockquote className="text-gray-700 text-lg italic leading-relaxed mb-4">
            “{content}”
          </blockquote>
          
          {date && (
            <div className="text-sm text-gray-500">{date}</div>
          )}
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-start gap-4 mb-4">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-semibold">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{name}</div>
          {role && <div className="text-sm text-gray-600">{role}</div>}
          <div className="mt-1">{renderStars()}</div>
        </div>
      </div>
      
      <p className="text-gray-700 mb-3">{content}</p>
      
      {date && (
        <div className="text-sm text-gray-500">{date}</div>
      )}
    </motion.div>
  );
}