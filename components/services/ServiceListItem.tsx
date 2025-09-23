'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
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

interface ServiceListItemProps {
  service: Service;
}

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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('hr-HR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function ServiceListItem({ service }: ServiceListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = categoryIcons[service.category as keyof typeof categoryIcons] || Home;

  const getWhatsAppMessage = () => {
    const message = `Pozdrav! Zanima me usluga "${service.name}". Molim vas više informacija o cijenama i terminima.`;
    return encodeURIComponent(message);
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${getWhatsAppMessage()}`;

  return (
    <div
      className={`
        bg-white rounded-lg border transition-all
        ${service.popular
          ? 'border-green-600 shadow-lg'
          : 'border-gray-200 shadow hover:shadow-md'
        }
      `}
    >
      {/* Main content - always visible */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 cursor-pointer"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`
              flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
              ${service.popular ? 'bg-green-100' : 'bg-gray-100'}
            `}
          >
            <Icon className={`w-5 h-5 ${service.popular ? 'text-green-600' : 'text-gray-700'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {service.name}
                  {service.popular && (
                    <Badge variant="success" size="sm" className="ml-2 inline-flex">
                      <Star className="w-3 h-3" />
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {service.description}
                </p>
              </div>

              {/* Expand button */}
              <button
                className={`
                  flex-shrink-0 p-1 transition-transform
                  ${isExpanded ? 'rotate-180' : ''}
                `}
                aria-label="Expand details"
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Price and duration */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 font-semibold text-gray-900">
                <span>{formatPrice(service.base_price)}</span>
                <span className="text-gray-500">€</span>
                {service.min_price && service.min_price !== service.base_price && (
                  <span className="text-xs text-gray-500">od</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{service.duration_hours}h</span>
              </div>
              {service.price_per_sqm && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Euro className="w-3 h-3" />
                  <span>{service.price_per_sqm}€/m²</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100">
              {/* Features */}
              <div className="pt-3 mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Što uključuje:
                </h4>
                <ul className="space-y-2">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2">
                <Button
                  href={whatsappUrl}
                  variant={service.popular ? 'primary' : 'outline'}
                  fullWidth
                  size="sm"
                  external
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Rezerviraj
                </Button>
                <Button
                  href="/booking"
                  variant="ghost"
                  fullWidth
                  size="sm"
                >
                  Više informacija
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}