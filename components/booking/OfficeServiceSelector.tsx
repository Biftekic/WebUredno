'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Building2 } from 'lucide-react';
import {
  OfficeBookingInput,
  OfficeType,
  CleaningTime,
  SuppliesOption,
  OFFICE_TYPE_OPTIONS,
  CLEANING_TIME_OPTIONS,
  SUPPLIES_OPTIONS,
} from '@/lib/booking-types-enhanced';

interface OfficeServiceSelectorProps {
  onInputChange: (input: OfficeBookingInput) => void;
  initialInput?: Partial<OfficeBookingInput>;
}

export default function OfficeServiceSelector({
  onInputChange,
  initialInput,
}: OfficeServiceSelectorProps) {
  const [input, setInput] = useState<OfficeBookingInput>({
    propertySize: initialInput?.propertySize || 50,
    officeType: initialInput?.officeType || 'single',
    privateOffices: initialInput?.privateOffices || 0,
    commonAreas: initialInput?.commonAreas ?? false,
    bathrooms: initialInput?.bathrooms || 1,
    kitchenette: initialInput?.kitchenette ?? false,
    cleaningTime: initialInput?.cleaningTime || 'business_hours',
    frequency: initialInput?.frequency || 'weekly',
    floorCount: initialInput?.floorCount || 1,
    elevatorAccess: initialInput?.elevatorAccess ?? true,
    supplies: initialInput?.supplies || 'client_provided',
    trashRemoval: initialInput?.trashRemoval ?? true,
    recyclingManagement: initialInput?.recyclingManagement ?? false,
    distanceKm: initialInput?.distanceKm || 0,
  });

  const [showAreas, setShowAreas] = useState(false);
  const [showServices, setShowServices] = useState(false);

  const updateInput = (updates: Partial<OfficeBookingInput>) => {
    const newInput = { ...input, ...updates };
    setInput(newInput);
    onInputChange(newInput);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Office Size Slider */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block mb-3">
          <span className="text-sm font-semibold text-gray-900">Površina ureda</span>
          <span className="ml-2 text-lg font-bold text-green-600">{input.propertySize}m²</span>
        </label>
        <input
          type="range"
          min="20"
          max="500"
          step="10"
          value={input.propertySize}
          onChange={(e) => updateInput({ propertySize: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          style={{ minHeight: '44px' }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>20m²</span>
          <span>250m²</span>
          <span>500m²</span>
        </div>
      </div>

      {/* Office Type Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block mb-3 text-sm font-semibold text-gray-900">
          Tip uredskog prostora
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {OFFICE_TYPE_OPTIONS.map((option) => {
            const isSelected = input.officeType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateInput({ officeType: option.value as OfficeType })}
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

      {/* Cleaning Time Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block mb-3 text-sm font-semibold text-gray-900">
          Vrijeme čišćenja
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CLEANING_TIME_OPTIONS.map((option) => {
            const isSelected = input.cleaningTime === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateInput({ cleaningTime: option.value as CleaningTime })}
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

      {/* Supplies Option */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block mb-3 text-sm font-semibold text-gray-900">
          Proizvodi za čišćenje
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SUPPLIES_OPTIONS.map((option) => {
            const isSelected = input.supplies === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateInput({ supplies: option.value as SuppliesOption })}
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

      {/* Floor Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block mb-3 text-sm font-semibold text-gray-900">
          Broj katova
        </label>
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() =>
              updateInput({ floorCount: Math.max(1, input.floorCount - 1) })
            }
            className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-700 transition-colors"
            disabled={input.floorCount === 1}
          >
            −
          </button>
          <span className="flex-1 text-center text-lg font-semibold text-gray-900">
            {input.floorCount} {input.floorCount === 1 ? 'kat' : 'kata'}
          </span>
          <button
            type="button"
            onClick={() => updateInput({ floorCount: input.floorCount + 1 })}
            className="w-12 h-12 flex items-center justify-center bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold text-white transition-colors"
          >
            +
          </button>
        </div>

        {/* Elevator Access Toggle */}
        {input.floorCount > 1 && (
          <label className="flex items-center justify-between min-h-[48px] cursor-pointer">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">Pristup liftom</span>
              <span className="block text-xs text-gray-500">
                {input.elevatorAccess ? 'Dostupno' : 'Samo stepenice (+10%)'}
              </span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={input.elevatorAccess}
                onChange={(e) => updateInput({ elevatorAccess: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-colors" />
              <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
            </div>
          </label>
        )}
      </div>

      {/* Collapsible Areas Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setShowAreas(!showAreas)}
          className="w-full flex items-center justify-between p-4 text-left min-h-[56px]"
        >
          <span className="text-sm font-semibold text-gray-900">
            Dodatni prostori
          </span>
          {showAreas ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showAreas && (
          <div className="p-4 pt-0 space-y-4 border-t">
            {/* Private Offices Counter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Zasebni uredi
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateInput({ privateOffices: Math.max(0, input.privateOffices - 1) })
                  }
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-700 transition-colors"
                  disabled={input.privateOffices === 0}
                >
                  −
                </button>
                <span className="flex-1 text-center text-lg font-semibold text-gray-900">
                  {input.privateOffices}
                </span>
                <button
                  type="button"
                  onClick={() => updateInput({ privateOffices: input.privateOffices + 1 })}
                  className="w-12 h-12 flex items-center justify-center bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold text-white transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500">+5€ po uredu</p>
            </div>

            {/* Common Areas Toggle */}
            <label className="flex items-center justify-between min-h-[48px] cursor-pointer">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Zajednički prostori</span>
                <span className="block text-xs text-gray-500">Hodnici, čekaonica (+15€)</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={input.commonAreas}
                  onChange={(e) => updateInput({ commonAreas: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-colors" />
                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
              </div>
            </label>

            {/* Bathrooms Counter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Sanitarni čvorovi
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateInput({ bathrooms: Math.max(1, input.bathrooms - 1) })
                  }
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-700 transition-colors"
                  disabled={input.bathrooms === 1}
                >
                  −
                </button>
                <span className="flex-1 text-center text-lg font-semibold text-gray-900">
                  {input.bathrooms}
                </span>
                <button
                  type="button"
                  onClick={() => updateInput({ bathrooms: input.bathrooms + 1 })}
                  className="w-12 h-12 flex items-center justify-center bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold text-white transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500">+10€ po sanitarnom čvoru</p>
            </div>

            {/* Kitchenette Toggle */}
            <label className="flex items-center justify-between min-h-[48px] cursor-pointer">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Čajna kuhinja</span>
                <span className="block text-xs text-gray-500">+15€</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={input.kitchenette}
                  onChange={(e) => updateInput({ kitchenette: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-colors" />
                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Collapsible Additional Services */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setShowServices(!showServices)}
          className="w-full flex items-center justify-between p-4 text-left min-h-[56px]"
        >
          <span className="text-sm font-semibold text-gray-900">
            Dodatne usluge
          </span>
          {showServices ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showServices && (
          <div className="p-4 pt-0 space-y-4 border-t">
            {/* Trash Removal Toggle */}
            <label className="flex items-center justify-between min-h-[48px] cursor-pointer">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Iznošenje smeća</span>
                <span className="block text-xs text-gray-500">+5€</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={input.trashRemoval}
                  onChange={(e) => updateInput({ trashRemoval: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-colors" />
                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
              </div>
            </label>

            {/* Recycling Management Toggle */}
            <label className="flex items-center justify-between min-h-[48px] cursor-pointer">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Upravljanje reciklažom</span>
                <span className="block text-xs text-gray-500">+5€</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={input.recyclingManagement}
                  onChange={(e) => updateInput({ recyclingManagement: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-colors" />
                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Što je uključeno u osnovnoj usluzi:</p>
            <ul className="space-y-1 text-xs">
              <li>• Usisavanje svih prostora</li>
              <li>• Brisanje prašine s površina</li>
              <li>• Čišćenje i dezinfekcija sanitarija</li>
              <li>• Brisanje podova</li>
              <li>• Pražnjenje kanti za smeće</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Commercial Discount Info */}
      {input.frequency !== 'one-time' && (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-900">
              <p className="font-medium mb-1">Komercijalni popusti:</p>
              <ul className="space-y-1 text-xs">
                <li>• Dnevno čišćenje: -20%</li>
                <li>• Tjedno čišćenje: -15%</li>
                <li>• Dvotjedno čišćenje: -10%</li>
                <li>• Mjesečno čišćenje: -5%</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}