'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import {
  WindowsBookingInput,
  WindowsServiceType,
  WindowsFloorLevel,
  WINDOWS_SERVICE_TYPE_OPTIONS,
  WINDOWS_FLOOR_LEVEL_OPTIONS,
} from '@/lib/booking-types-enhanced';

interface WindowsServiceSelectorProps {
  onInputChange: (input: WindowsBookingInput) => void;
  initialInput?: Partial<WindowsBookingInput>;
}

export default function WindowsServiceSelector({
  onInputChange,
  initialInput,
}: WindowsServiceSelectorProps) {
  const [input, setInput] = useState<WindowsBookingInput>({
    windowCount: initialInput?.windowCount || 5,
    serviceType: initialInput?.serviceType || 'both',
    floorLevel: initialInput?.floorLevel || 'ground',
    framesCleaning: initialInput?.framesCleaning ?? true,
    sillsCleaning: initialInput?.sillsCleaning ?? true,
    balconyDoors: initialInput?.balconyDoors || 0,
    skylights: initialInput?.skylights || 0,
    distanceKm: initialInput?.distanceKm || 0,
    frequency: initialInput?.frequency || 'one-time',
  });

  const [showExtras, setShowExtras] = useState(false);

  const updateInput = (updates: Partial<WindowsBookingInput>) => {
    const newInput = { ...input, ...updates };
    setInput(newInput);
    onInputChange(newInput);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Window Count Slider */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block mb-3">
          <span className="text-sm font-semibold text-gray-900">Broj prozora</span>
          <span className="ml-2 text-lg font-bold text-green-600">{input.windowCount}</span>
        </label>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={input.windowCount}
          onChange={(e) => updateInput({ windowCount: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          style={{ minHeight: '44px' }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>25</span>
          <span>50</span>
        </div>
      </div>

      {/* Service Type Selector - Mobile-First Large Buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block mb-3 text-sm font-semibold text-gray-900">
          Način čišćenja
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {WINDOWS_SERVICE_TYPE_OPTIONS.map((option) => {
            const isSelected = input.serviceType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateInput({ serviceType: option.value as WindowsServiceType })}
                className={`
                  min-h-[72px] p-4 rounded-lg border-2 transition-all duration-200
                  flex flex-col items-center justify-center gap-2 text-center
                  ${
                    isSelected
                      ? 'border-green-600 bg-green-50 text-green-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                  }
                `}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-gray-500">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floor Level Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block mb-3 text-sm font-semibold text-gray-900">
          Kat
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {WINDOWS_FLOOR_LEVEL_OPTIONS.map((option) => {
            const isSelected = input.floorLevel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateInput({ floorLevel: option.value as WindowsFloorLevel })}
                className={`
                  min-h-[64px] p-4 rounded-lg border-2 transition-all duration-200
                  flex flex-col items-center justify-center gap-1
                  ${
                    isSelected
                      ? 'border-green-600 bg-green-50 text-green-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                  }
                `}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {option.surcharge > 0 && (
                  <span className="text-xs text-orange-600 font-medium">
                    {option.description}
                  </span>
                )}
                {option.surcharge === 0 && (
                  <span className="text-xs text-gray-500">{option.description}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Extras Section - Mobile-Optimized */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setShowExtras(!showExtras)}
          className="w-full flex items-center justify-between p-4 text-left min-h-[56px]"
        >
          <span className="text-sm font-semibold text-gray-900">
            Dodatne opcije
          </span>
          {showExtras ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showExtras && (
          <div className="p-4 pt-0 space-y-4 border-t">
            {/* Frames Cleaning Toggle */}
            <label className="flex items-center justify-between min-h-[48px] cursor-pointer">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Čišćenje okvira</span>
                <span className="block text-xs text-gray-500">+1.5€ po prozoru</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={input.framesCleaning}
                  onChange={(e) => updateInput({ framesCleaning: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-colors" />
                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
              </div>
            </label>

            {/* Sills Cleaning Toggle */}
            <label className="flex items-center justify-between min-h-[48px] cursor-pointer">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Čišćenje prozorskih dasaka</span>
                <span className="block text-xs text-gray-500">+1€ po prozoru</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={input.sillsCleaning}
                  onChange={(e) => updateInput({ sillsCleaning: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-colors" />
                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
              </div>
            </label>

            {/* Balcony Doors Counter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Balkonska vrata
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateInput({ balconyDoors: Math.max(0, input.balconyDoors - 1) })
                  }
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-700 transition-colors"
                  disabled={input.balconyDoors === 0}
                >
                  −
                </button>
                <span className="flex-1 text-center text-lg font-semibold text-gray-900">
                  {input.balconyDoors}
                </span>
                <button
                  type="button"
                  onClick={() => updateInput({ balconyDoors: input.balconyDoors + 1 })}
                  className="w-12 h-12 flex items-center justify-center bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold text-white transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500">2x cijena običnog prozora</p>
            </div>

            {/* Skylights Counter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Krovni prozori
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateInput({ skylights: Math.max(0, input.skylights - 1) })
                  }
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-700 transition-colors"
                  disabled={input.skylights === 0}
                >
                  −
                </button>
                <span className="flex-1 text-center text-lg font-semibold text-gray-900">
                  {input.skylights}
                </span>
                <button
                  type="button"
                  onClick={() => updateInput({ skylights: input.skylights + 1 })}
                  className="w-12 h-12 flex items-center justify-center bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold text-white transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500">1.5x cijena + nadoplata za kat</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Što je uključeno:</p>
            <ul className="space-y-1 text-xs">
              <li>• Čišćenje stakla s obje strane (ako je odabrano)</li>
              <li>• Profesionalni proizvodi za staklo</li>
              <li>• Brisanje bez tragova</li>
              <li>• Dezinfekcija okvira i dasaka (ako je odabrano)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}