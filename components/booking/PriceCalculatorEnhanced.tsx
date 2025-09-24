'use client';

import { useEffect, useState } from 'react';
import { Calculator, Info, Check, AlertCircle } from 'lucide-react';
import { calculateEnhancedPrice, FREQUENCY_OPTIONS } from '@/lib/booking-utils-enhanced';
import {
  ServiceTypeEnum,
  PropertyTypeEnum,
  EnhancedPriceCalculation,
  RentalFeatures
} from '@/lib/booking-types-enhanced';
import type { Service } from '@/types/database';

interface PriceCalculatorEnhancedProps {
  service: Service | null;
  serviceType: ServiceTypeEnum;
  propertyType: PropertyTypeEnum;
  propertySize: number;
  indoorExtras: Array<{ id: string; name: string; quantity: number; unitPrice: number }>;
  outdoorServices: Array<{ id: string; name: string; area: number; pricePerUnit: number; minPrice: number }>;
  frequency: string;
  distanceKm: number;
  rentalFeatures?: RentalFeatures;
  bookingDate?: Date;
}

interface PriceRowProps {
  label: string;
  amount: number;
  type?: 'base' | 'extra' | 'outdoor' | 'rental' | 'discount' | 'fee' | 'subtotal' | 'total';
  detail?: string;
  size?: 'small' | 'medium' | 'large';
}

function PriceRow({ label, amount, type = 'base', detail, size = 'medium' }: PriceRowProps) {
  const getColorClass = () => {
    switch (type) {
      case 'discount':
        return 'text-green-600';
      case 'fee':
        return 'text-orange-600';
      case 'total':
        return 'text-gray-900 font-bold';
      case 'subtotal':
        return 'text-gray-700 font-semibold';
      default:
        return 'text-gray-600';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-lg';
      default:
        return 'text-sm';
    }
  };

  return (
    <div className={`flex items-center justify-between ${getSizeClass()}`}>
      <div className="flex-1">
        <span className={getColorClass()}>
          {label}
        </span>
        {detail && (
          <span className="text-xs text-gray-400 ml-2">
            ({detail})
          </span>
        )}
      </div>
      <span className={`${getColorClass()} ${size === 'large' ? 'text-xl' : ''}`}>
        {type === 'discount' ? '-' : type === 'fee' || type === 'extra' || type === 'outdoor' || type === 'rental' ? '+' : ''}
        {Math.abs(amount)} EUR
      </span>
    </div>
  );
}

function ServiceBadge({ type, children }: { type: ServiceTypeEnum; children: React.ReactNode }) {
  const getBadgeColor = () => {
    switch (type) {
      case 'airbnb':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'daily_rental':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'vacation_rental':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      default:
        return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor()} mb-3`}>
      {children}
    </div>
  );
}

export default function PriceCalculatorEnhanced({
  service,
  serviceType,
  propertyType,
  propertySize,
  indoorExtras,
  outdoorServices,
  frequency,
  distanceKm,
  rentalFeatures,
  bookingDate
}: PriceCalculatorEnhancedProps) {
  const [priceBreakdown, setPriceBreakdown] = useState<EnhancedPriceCalculation | null>(null);

  useEffect(() => {
    if (service) {
      const breakdown = calculateEnhancedPrice(
        serviceType,
        service.base_price,
        service.price_per_sqm || 0,
        propertyType,
        propertySize,
        indoorExtras.map(e => ({ id: e.id, quantity: e.quantity, unitPrice: e.unitPrice })),
        outdoorServices.map(s => ({
          id: s.id,
          area: s.area,
          pricePerUnit: s.pricePerUnit,
          minPrice: s.minPrice
        })),
        frequency,
        distanceKm,
        rentalFeatures,
        bookingDate
      );
      setPriceBreakdown(breakdown);
    }
  }, [service, serviceType, propertyType, propertySize, indoorExtras, outdoorServices, frequency, distanceKm, rentalFeatures, bookingDate]);

  if (!service || !priceBreakdown) {
    return null;
  }

  const frequencyOption = FREQUENCY_OPTIONS.find(f => f.value === frequency);
  const isRentalService = ['airbnb', 'daily_rental', 'vacation_rental'].includes(serviceType);

  return (
    <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Detaljan izračun cijene</h3>
      </div>

      {/* Service Type Badge */}
      {isRentalService && (
        <ServiceBadge type={serviceType}>
          {serviceType === 'airbnb' && '🏠 AirBnB Čišćenje'}
          {serviceType === 'daily_rental' && '🔑 Jednodnevni najam'}
          {serviceType === 'vacation_rental' && '✨ Dubinsko čišćenje najma'}
        </ServiceBadge>
      )}

      <div className="space-y-3">
        {/* Base Service */}
        <PriceRow
          label={`${service.name} (${propertySize}m²)`}
          amount={priceBreakdown.basePrice}
          type="base"
          detail={`${propertySize}m² × ${service.price_per_sqm || 0} EUR/m²`}
        />

        {/* Property Type Multiplier */}
        {priceBreakdown.propertyTypeMultiplier !== 1 && (
          <div className="text-xs text-gray-500 ml-4">
            • {propertyType === 'house' ? 'Kuća' : propertyType === 'office' ? 'Ured' : 'Stan'}
            (+{((priceBreakdown.propertyTypeMultiplier - 1) * 100).toFixed(0)}%)
          </div>
        )}

        {/* Rental-Specific Services */}
        {rentalFeatures && (
          <>
            {rentalFeatures.laundryService && (
              <PriceRow label="Pranje posteljine" amount={20} type="rental" />
            )}
            {rentalFeatures.suppliesRefill && (
              <PriceRow label="Dopuna potrepština" amount={15} type="rental" />
            )}
            {rentalFeatures.inventoryCheck && (
              <PriceRow label="Provjera inventara" amount={10} type="rental" />
            )}
            {rentalFeatures.guestWelcomeSetup && (
              <PriceRow label="Priprema dobrodošlice" amount={10} type="rental" />
            )}
            {rentalFeatures.emergencyAvailable && (
              <PriceRow label="24/7 Hitna dostupnost" amount={50} type="rental" />
            )}
          </>
        )}

        {/* Indoor Extras with Quantities */}
        {indoorExtras.filter(e => e.quantity > 0).length > 0 && (
          <>
            <div className="border-t pt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Dodatne usluge</p>
            </div>
            {indoorExtras.filter(e => e.quantity > 0).map(extra => (
              <PriceRow
                key={extra.id}
                label={`${extra.name} (${extra.quantity}x)`}
                amount={extra.quantity * extra.unitPrice}
                type="extra"
                detail={`${extra.quantity} × ${extra.unitPrice} EUR`}
                size="small"
              />
            ))}
          </>
        )}

        {/* Outdoor Services */}
        {outdoorServices.filter(s => s.area > 0).length > 0 && (
          <>
            <div className="border-t pt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Vanjski radovi</p>
            </div>
            {outdoorServices.filter(s => s.area > 0).map(service => {
              const calculatedPrice = service.area * service.pricePerUnit;
              const finalPrice = Math.max(calculatedPrice, service.minPrice);
              const isMinPriceApplied = calculatedPrice < service.minPrice && service.area > 0;

              return (
                <div key={service.id}>
                  <PriceRow
                    label={`${service.name} (${service.area}m²)`}
                    amount={finalPrice}
                    type="outdoor"
                    detail={`${service.area}m² × ${service.pricePerUnit} EUR/m²`}
                    size="small"
                  />
                  {isMinPriceApplied && (
                    <p className="text-xs text-blue-600 ml-4">
                      • Min. cijena {service.minPrice} EUR primijenjena
                    </p>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Distance Fee */}
        {priceBreakdown.distanceFee > 0 && (
          <PriceRow
            label={`Naknada za udaljenost`}
            amount={priceBreakdown.distanceFee}
            type="fee"
            detail={`${distanceKm}km od centra`}
          />
        )}

        {/* Weekend/Holiday Surcharges */}
        {priceBreakdown.weekendSurcharge && priceBreakdown.weekendSurcharge > 0 && (
          <PriceRow
            label="Vikend nadoplata"
            amount={priceBreakdown.weekendSurcharge}
            type="fee"
            detail="+20%"
          />
        )}

        {priceBreakdown.holidaySurcharge && priceBreakdown.holidaySurcharge > 0 && (
          <PriceRow
            label="Praznik nadoplata"
            amount={priceBreakdown.holidaySurcharge}
            type="fee"
            detail="+30%"
          />
        )}

        {/* Separator */}
        <div className="border-t border-gray-300 my-3" />

        {/* Subtotal */}
        <PriceRow
          label="Međuzbroj"
          amount={priceBreakdown.subtotal}
          type="subtotal"
        />

        {/* Frequency Discount on Total */}
        {priceBreakdown.frequencyDiscount > 0 && frequencyOption && (
          <PriceRow
            label={`Popust za ${frequencyOption.label.toLowerCase()}`}
            amount={priceBreakdown.frequencyDiscount}
            type="discount"
            detail={`-${frequencyOption.discount}%`}
          />
        )}

        {/* Final Total */}
        <div className="border-t-2 border-green-500 pt-3 mt-3">
          <PriceRow
            label="UKUPNO"
            amount={priceBreakdown.total}
            type="total"
            size="large"
          />
          {frequency && frequency !== 'one-time' && (
            <p className="text-xs text-gray-500 text-right mt-1">
              po čišćenju
            </p>
          )}
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900">
            <p>💳 Plaćanje gotovinom ili karticom nakon završene usluge</p>
            {isRentalService && (
              <p className="mt-1">⏱️ Dostupnost: 24/7 za hitne slučajeve</p>
            )}
          </div>
        </div>
      </div>

      {/* Quality Guarantee for Rental Services */}
      {isRentalService && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-green-900">
              <p className="font-medium mb-1">Garancija kvalitete za najam:</p>
              <ul className="space-y-0.5">
                <li>• 5-zvjezdična ocjena čistoće</li>
                <li>• Fleksibilno vrijeme dolaska</li>
                <li>• Profesionalni tim sa iskustvom</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}