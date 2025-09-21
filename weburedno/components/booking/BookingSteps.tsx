'use client';

import { useState } from 'react';
import { ChevronRight, Check, Home, Calendar, User, FileText, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface BookingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface BookingStepsProps {
  currentStep: number;
  steps: BookingStep[];
  onStepClick?: (stepIndex: number) => void;
  completedSteps: number[];
}

export default function BookingSteps({
  currentStep,
  steps,
  onStepClick,
  completedSteps,
}: BookingStepsProps) {
  return (
    <div className="w-full">
      {/* Mobile View - Horizontal Scrollable */}
      <div className="md:hidden">
        <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
          {steps.map((step, index) => {
            const isActive = currentStep === index;
            const isCompleted = completedSteps.includes(index);
            const isClickable = isCompleted || index < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable || !onStepClick}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap
                  transition-all duration-200 min-h-[48px]
                  ${isActive ? 'bg-green-600 text-white' : ''}
                  ${!isActive && isCompleted ? 'bg-green-100 text-green-700' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-500' : ''}
                  ${isClickable && !isActive ? 'hover:bg-green-50' : ''}
                  ${!isClickable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                `}
              >
                <span className={`
                  flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                  ${isActive ? 'bg-white text-green-600' : ''}
                  ${!isActive && isCompleted ? 'bg-green-600 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-300 text-gray-600' : ''}
                `}>
                  {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                </span>
                <span className="text-sm font-medium">{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Current Step Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Korak {currentStep + 1} od {steps.length}</p>
          <p className="text-sm font-medium text-gray-900">{steps[currentStep].title}</p>
          <p className="text-xs text-gray-600 mt-0.5">{steps[currentStep].description}</p>
        </div>
      </div>

      {/* Desktop View - Vertical with Lines */}
      <div className="hidden md:block">
        <div className="relative">
          {steps.map((step, index) => {
            const isActive = currentStep === index;
            const isCompleted = completedSteps.includes(index);
            const isClickable = isCompleted || index < currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {!isLast && (
                  <div
                    className={`
                      absolute left-6 top-12 w-0.5 h-16
                      ${isCompleted || index < currentStep ? 'bg-green-500' : 'bg-gray-300'}
                    `}
                  />
                )}

                {/* Step Item */}
                <button
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable || !onStepClick}
                  className={`
                    relative flex items-start gap-4 p-4 rounded-lg w-full text-left
                    transition-all duration-200 mb-2
                    ${isActive ? 'bg-green-50 border-2 border-green-500' : ''}
                    ${!isActive && isClickable ? 'hover:bg-gray-50' : ''}
                    ${!isClickable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                  `}
                >
                  {/* Step Number/Icon */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full
                    transition-all duration-200 flex-shrink-0
                    ${isActive ? 'bg-green-600 text-white ring-4 ring-green-100' : ''}
                    ${!isActive && isCompleted ? 'bg-green-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-600' : ''}
                  `}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-1">
                    <h3 className={`
                      text-sm font-semibold mb-0.5
                      ${isActive ? 'text-green-900' : ''}
                      ${!isActive && isCompleted ? 'text-green-700' : ''}
                      ${!isActive && !isCompleted ? 'text-gray-500' : ''}
                    `}>
                      {step.title}
                    </h3>
                    <p className={`
                      text-xs
                      ${isActive ? 'text-green-700' : 'text-gray-500'}
                    `}>
                      {step.description}
                    </p>
                  </div>

                  {/* Status Badge */}
                  {isActive && (
                    <span className="absolute top-4 right-4 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                      Trenutno
                    </span>
                  )}
                  {isCompleted && !isActive && (
                    <ChevronRight className="w-4 h-4 text-green-600 mt-2" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 md:mt-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">Napredak</p>
          <p className="text-xs font-medium text-gray-700">
            {Math.round((completedSteps.length / steps.length) * 100)}%
          </p>
        </div>
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Export common booking steps configuration
export const BOOKING_STEPS: BookingStep[] = [
  {
    id: 'service',
    title: 'Odabir usluge',
    description: 'Odaberite vrstu čišćenja',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'property',
    title: 'Detalji nekretnine',
    description: 'Tip i veličina prostora',
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: 'datetime',
    title: 'Datum i vrijeme',
    description: 'Kada trebate uslugu',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    id: 'contact',
    title: 'Kontakt podaci',
    description: 'Vaši podaci za rezervaciju',
    icon: <User className="w-5 h-5" />,
  },
  {
    id: 'review',
    title: 'Pregled i potvrda',
    description: 'Provjerite sve detalje',
    icon: <CreditCard className="w-5 h-5" />,
  },
];