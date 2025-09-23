'use client';

import { useEffect, useState } from 'react';
import { Calculator, Info } from 'lucide-react';
import { calculatePrice, FREQUENCY_OPTIONS } from '@/lib/booking-utils';
import type { Service } from '@/types/database';

interface PriceCalculatorProps {
  service: Service | null;
  propertySize: number | null;
  extras: Array<{ name: string; price: number; quantity?: number }>;
  frequency: string | null;
  distanceKm: number;
}

export default function PriceCalculator({
  service,
  propertySize,
  extras,
  frequency,
  distanceKm,
}: PriceCalculatorProps) {
  const [priceBreakdown, setPriceBreakdown] = useState({
    base: 0,
    extras: 0,
    distance: 0,
    discount: 0,
    total: 0,
  });

  useEffect(() => {
    if (service) {
      const breakdown = calculatePrice(
        service.base_price,
        service.price_per_sqm || null,
        propertySize,
        extras,
        distanceKm,
        frequency || undefined
      );
      setPriceBreakdown(breakdown);
    }
  }, [service, propertySize, extras, frequency, distanceKm]);

  if (!service) {
    return null;
  }

  const frequencyOption = FREQUENCY_OPTIONS.find(f => f.value === frequency);

  return (
    <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Izračun cijene</h3>
      </div>

      <div className="space-y-3">
        {/* Base Price */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Osnovna cijena ({service.name})
          </span>
          <span className="text-sm font-medium text-gray-900">
            {priceBreakdown.base} EUR
          </span>
        </div>

        {/* Property Size Addition */}
        {service.price_per_sqm && propertySize && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="ml-4">
              • {propertySize} m² × {service.price_per_sqm} EUR/m²
            </span>
            <span>
              +{(propertySize * service.price_per_sqm).toFixed(0)} EUR
            </span>
          </div>
        )}

        {/* Extras */}
        {extras.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dodatne usluge</span>
              <span className="text-sm font-medium text-gray-900">
                +{priceBreakdown.extras} EUR
              </span>
            </div>
            {extras.map((extra, index) => (
              <div key={`extra-${index}`} className="flex items-center justify-between text-xs text-gray-500">
                <span className="ml-4">
                  • {extra.name} {extra.quantity && extra.quantity > 1 && `(${extra.quantity}x)`}
                </span>
                <span>
                  +{extra.price * (extra.quantity || 1)} EUR
                </span>
              </div>
            ))}
          </>
        )}

        {/* Distance Fee */}
        {priceBreakdown.distance > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">Udaljenost ({distanceKm} km)</span>
              <div className="group relative">
                <Info className="w-3 h-3 text-gray-400" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                  <div className="bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap">
                    Naplaćuje se za udaljenost &gt;10km od centra Zagreba
                  </div>
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              +{priceBreakdown.distance} EUR
            </span>
          </div>
        )}

        {/* Frequency Discount */}
        {priceBreakdown.discount > 0 && frequencyOption && (
          <div className="flex items-center justify-between text-green-600">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">
                {frequencyOption.label} popust (-{frequencyOption.discount}%)
              </span>
            </div>
            <span className="text-sm font-medium">
              -{priceBreakdown.discount.toFixed(0)} EUR
            </span>
          </div>
        )}

        {/* Separator */}
        <div className="border-t border-gray-200 pt-3">
          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-900">
              Ukupna cijena
            </span>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600">
                {priceBreakdown.total} EUR
              </span>
              {frequency && frequency !== 'one-time' && (
                <span className="block text-xs text-gray-500 mt-0.5">
                  po čišćenju
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-900">
          💳 Plaćanje gotovinom ili karticom nakon završene usluge
        </p>
      </div>
    </div>
  );
}