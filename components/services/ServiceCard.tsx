'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Euro,
  CheckCircle,
  Home,
  Sparkles,
  Building,
  Truck,
  Droplets,
  Briefcase,
  Shield,
  Star
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Service } from './ServiceCatalog';
import { WHATSAPP_PHONE } from '@/lib/constants';

interface ServiceCardProps {
  service: Service;
}

// Map categories to icons
const categoryIcons = {
  regular: Home,
  deep: Sparkles,
  construction: Building,
  moving: Truck,
  windows: Droplets,
  office: Briefcase,
  general: Star,
  disinfection: Shield,
};

// Format price for display
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('hr-HR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const Icon = categoryIcons[service.category as keyof typeof categoryIcons] || Home;

  // Limit features shown initially on mobile
  const displayedFeatures = showAllFeatures
    ? service.features
    : service.features.slice(0, 3);

  const hasMoreFeatures = service.features.length > 3;

  // WhatsApp message for this service
  const getWhatsAppMessage = () => {
    const message = `Pozdrav! Zanima me usluga "${service.name}". Molim vas više informacija o cijenama i terminima.`;
    return encodeURIComponent(message);
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${getWhatsAppMessage()}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative h-full"
    >
      {/* Popular badge */}
      {service.popular && (
        <div className="absolute -top-3 left-4 z-10">
          <Badge variant="success" size="sm">
            <Star className="w-3 h-3 mr-1 inline" />
            Najpopularnije
          </Badge>
        </div>
      )}

      <div
        className={`
          bg-white rounded-xl h-full flex flex-col
          ${service.popular
            ? 'ring-2 ring-green-600 shadow-xl'
            : 'border border-gray-200 shadow-lg hover:shadow-xl transition-shadow'
          }
        `}
      >
        {/* Header */}
        <div className="p-5 pb-0">
          <div className="flex items-start justify-between mb-3">
            <div
              className={`
                inline-flex items-center justify-center w-10 h-10 rounded-lg
                ${service.popular ? 'bg-green-100' : 'bg-gray-100'}
              `}
            >
              <Icon className={`w-5 h-5 ${service.popular ? 'text-green-600' : 'text-gray-700'}`} />
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {service.name}
          </h3>

          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {service.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="px-5 pb-4 border-b border-gray-100">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-sm text-gray-500">od</span>
            <span className="text-2xl font-bold text-gray-900">
              €{formatPrice(service.base_price)}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{service.duration_hours}h</span>
            </div>
            {service.price_per_sqm && (
              <div className="flex items-center gap-1">
                <Euro className="w-3 h-3" />
                <span>{service.price_per_sqm}€/m²</span>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="px-5 py-4 flex-grow">
          <ul className="space-y-2">
            {displayedFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          {hasMoreFeatures && !showAllFeatures && (
            <button
              onClick={() => setShowAllFeatures(true)}
              className="mt-3 text-xs text-green-600 hover:text-green-700 font-medium"
            >
              + {service.features.length - 3} više značajki
            </button>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="p-5 pt-0 space-y-2">
          <Button
            href={whatsappUrl}
            variant={service.popular ? 'primary' : 'outline'}
            fullWidth
            size="md"
            external
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Rezerviraj putem WhatsApp
          </Button>

          <Button
            href="/booking"
            variant="ghost"
            fullWidth
            size="sm"
          >
            Saznaj više
          </Button>
        </div>
      </div>
    </motion.div>
  );
}