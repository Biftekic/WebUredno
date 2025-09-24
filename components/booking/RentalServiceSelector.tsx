'use client';

import { useState } from 'react';
import { Check, Clock, Package, Home } from 'lucide-react';
import { RentalFeatures } from '@/lib/booking-types-enhanced';
import { TURNAROUND_TIME_OPTIONS } from '@/lib/booking-types-enhanced';

interface RentalServiceSelectorProps {
  features: RentalFeatures;
  onChange: (features: RentalFeatures) => void;
  serviceType: 'airbnb' | 'daily_rental' | 'vacation_rental';
}

export default function RentalServiceSelector({
  features,
  onChange,
  serviceType
}: RentalServiceSelectorProps) {
  const updateFeature = (key: keyof RentalFeatures, value: any) => {
    onChange({
      ...features,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Turnaround Time Selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-green-600" />
          <label className="text-sm font-medium text-gray-700">
            Vrijeme izvršenja usluge
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TURNAROUND_TIME_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => updateFeature('turnaroundTime', option.value)}
              className={`
                p-3 rounded-lg border-2 text-left transition-all duration-200
                ${features.turnaroundTime === option.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  {option.price_adjustment !== 0 && (
                    <div className={`text-xs mt-0.5 ${
                      option.price_adjustment > 0 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {option.price_adjustment > 0 ? '+' : ''}{option.price_adjustment} EUR
                    </div>
                  )}
                </div>
                {features.turnaroundTime === option.value && (
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Rental Services */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-green-600" />
          <label className="text-sm font-medium text-gray-700">
            Dodatne usluge za najam
          </label>
        </div>

        <div className="space-y-2">
          {/* Laundry Service */}
          <label className={`
            flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer
            transition-all duration-200
            ${features.laundryService
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
            }
          `}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={features.laundryService}
                onChange={(e) => updateFeature('laundryService', e.target.checked)}
                className="sr-only"
              />
              <div className="text-xl">🧺</div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Pranje posteljine
                </div>
                <div className="text-xs text-gray-600">
                  Kompletno pranje i glačanje
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-green-600">
                +20 EUR
              </span>
              {features.laundryService && <Check className="w-5 h-5 text-green-600" />}
            </div>
          </label>

          {/* Supplies Refill */}
          <label className={`
            flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer
            transition-all duration-200
            ${features.suppliesRefill
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
            }
          `}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={features.suppliesRefill}
                onChange={(e) => updateFeature('suppliesRefill', e.target.checked)}
                className="sr-only"
              />
              <div className="text-xl">🧴</div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Dopuna potrepština
                </div>
                <div className="text-xs text-gray-600">
                  Sapun, šampon, toalet papir
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-green-600">
                +15 EUR
              </span>
              {features.suppliesRefill && <Check className="w-5 h-5 text-green-600" />}
            </div>
          </label>

          {/* Inventory Check */}
          <label className={`
            flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer
            transition-all duration-200
            ${features.inventoryCheck
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
            }
          `}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={features.inventoryCheck}
                onChange={(e) => updateFeature('inventoryCheck', e.target.checked)}
                className="sr-only"
              />
              <div className="text-xl">📋</div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Provjera inventara
                </div>
                <div className="text-xs text-gray-600">
                  Kompletna lista i provjera
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-green-600">
                +10 EUR
              </span>
              {features.inventoryCheck && <Check className="w-5 h-5 text-green-600" />}
            </div>
          </label>

          {/* Guest Welcome Setup */}
          {serviceType === 'airbnb' && (
            <label className={`
              flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer
              transition-all duration-200
              ${features.guestWelcomeSetup
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={features.guestWelcomeSetup}
                  onChange={(e) => updateFeature('guestWelcomeSetup', e.target.checked)}
                  className="sr-only"
                />
                <div className="text-xl">🎁</div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Priprema dobrodošlice
                  </div>
                  <div className="text-xs text-gray-600">
                    Cvijeće, voće, lokalne delicije
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-green-600">
                  +10 EUR
                </span>
                {features.guestWelcomeSetup && <Check className="w-5 h-5 text-green-600" />}
              </div>
            </label>
          )}

          {/* 24/7 Emergency Availability */}
          <label className={`
            flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer
            transition-all duration-200
            ${features.emergencyAvailable
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
            }
          `}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={features.emergencyAvailable}
                onChange={(e) => updateFeature('emergencyAvailable', e.target.checked)}
                className="sr-only"
              />
              <div className="text-xl">🚨</div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  24/7 Dostupnost
                </div>
                <div className="text-xs text-gray-600">
                  Hitne intervencije bilo kada
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-green-600">
                +50 EUR/mj
              </span>
              {features.emergencyAvailable && <Check className="w-5 h-5 text-green-600" />}
            </div>
          </label>
        </div>
      </div>

      {/* Included Services Info */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Home className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-2">
              Uključeno u osnovnu cijenu:
            </p>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>✓ Kompletno čišćenje prostora</li>
              <li>✓ Promjena posteljine (vaša posteljina)</li>
              <li>✓ Dezinfekcija svih površina</li>
              <li>✓ Osnovno usisavanje i brisanje</li>
              <li>✓ Čišćenje kuhinje i kupaonice</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}