'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Home, Building, MapPin, Phone, Mail,
  User, MessageSquare, Plus, Minus, Check, AlertCircle
} from 'lucide-react';
import BookingSteps, { BOOKING_STEPS } from '@/components/booking/BookingSteps';
import BookingCalendar from '@/components/booking/BookingCalendar';
import PriceCalculator from '@/components/booking/PriceCalculator';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingState from '@/components/ui/LoadingState';
import { getServices, getServiceBySlug } from '@/lib/db/services';
import { createBooking } from '@/lib/db/bookings';
import type { Service, CreateBookingInput, BookingExtra } from '@/types/database';
import {
  PROPERTY_TYPES,
  FREQUENCY_OPTIONS,
  SERVICE_EXTRAS,
  formatDateHr,
  validatePhoneNumber,
  validateEmail,
  generateWhatsAppMessage,
  formatPhoneForWhatsApp,
} from '@/lib/booking-utils';

// Wrap the main component to handle search params
function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  // Booking Data
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [propertyType, setPropertyType] = useState<'apartment' | 'house' | 'office'>('apartment');
  const [propertySize, setPropertySize] = useState<number>(60);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<string>('one-time');
  const [selectedExtras, setSelectedExtras] = useState<BookingExtra[]>([]);
  const [customerData, setCustomerData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Zagreb',
    postal_code: '',
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [distanceKm] = useState(5); // Simplified for now
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    // Check if service is preselected via URL param
    const serviceSlug = searchParams.get('service');
    if (serviceSlug && services.length > 0) {
      const service = services.find(s => s.slug === serviceSlug);
      if (service) {
        setSelectedService(service);
        setCompletedSteps([0]);
        setCurrentStep(1);
      }
    }
  }, [searchParams, services]);

  const loadServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Greška pri učitavanju usluga');
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex) || stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    const errors: Record<string, string> = {};

    switch (stepIndex) {
      case 0: // Service selection
        if (!selectedService) {
          errors.service = 'Molimo odaberite uslugu';
        }
        break;
      case 1: // Property details
        if (propertySize < 20 || propertySize > 500) {
          errors.propertySize = 'Površina mora biti između 20 i 500 m²';
        }
        break;
      case 2: // Date and time
        if (!selectedDate) {
          errors.date = 'Molimo odaberite datum';
        }
        if (!selectedTimeSlot) {
          errors.time = 'Molimo odaberite vrijeme';
        }
        break;
      case 3: // Contact info
        if (!customerData.first_name) {
          errors.first_name = 'Ime je obavezno';
        }
        if (!customerData.last_name) {
          errors.last_name = 'Prezime je obavezno';
        }
        if (!customerData.email || !validateEmail(customerData.email)) {
          errors.email = 'Unesite važeću email adresu';
        }
        if (!customerData.phone || !validatePhoneNumber(customerData.phone)) {
          errors.phone = 'Unesite važeći broj telefona';
        }
        if (!customerData.address) {
          errors.address = 'Adresa je obavezna';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    const newCompletedSteps = [...completedSteps];
    if (!newCompletedSteps.includes(currentStep)) {
      newCompletedSteps.push(currentStep);
      setCompletedSteps(newCompletedSteps);
    }

    if (currentStep < BOOKING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setValidationErrors({});
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setValidationErrors({});
    }
  };

  const toggleExtra = (extra: typeof SERVICE_EXTRAS[0]) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.name === extra.name);
      if (exists) {
        return prev.filter(e => e.name !== extra.name);
      }
      return [...prev, { name: extra.name, price: extra.price, quantity: 1 }];
    });
  };

  const handleSubmitBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) {
      setError('Molimo popunite sve obavezne podatke');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookingInput: CreateBookingInput = {
        customer: customerData,
        service_id: selectedService.id,
        booking_date: selectedDate.toISOString().split('T')[0],
        time_slot: selectedTimeSlot,
        service_type: selectedService.category,
        frequency: frequency as any,
        property_type: propertyType,
        property_size: propertySize,
        bedrooms,
        bathrooms,
        extras: selectedExtras,
        special_requests: specialRequests,
      };

      const booking = await createBooking(bookingInput);

      // Generate WhatsApp message
      const message = generateWhatsAppMessage({
        bookingNumber: booking.booking_number,
        service: selectedService.name,
        date: booking.booking_date,
        timeSlot: booking.time_slot,
        propertyType,
        propertySize,
        address: customerData.address,
        totalPrice: booking.total_price,
        specialRequests,
      });

      // Redirect to confirmation page
      router.push(`/booking/confirmation?id=${booking.id}&whatsapp=${encodeURIComponent(message)}`);
    } catch (error: any) {
      console.error('Booking error:', error);
      setError(error.message || 'Greška pri slanju rezervacije. Molimo pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Service Selection
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Odaberite vrstu čišćenja
            </h2>
            {validationErrors.service && (
              <div className="p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                {validationErrors.service}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${selectedService?.id === service.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    {service.popular && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Popularno
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-green-600">
                      od {service.base_price} EUR
                    </span>
                    <span className="text-xs text-gray-500">
                      ~{service.duration_hours}h
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 1: // Property Details
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Detalji o nekretnini
            </h2>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tip nekretnine
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PROPERTY_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setPropertyType(type.value as any)}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200
                      ${propertyType === type.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Property Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Površina nekretnine (m²)
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPropertySize(Math.max(20, propertySize - 10))}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <Input
                  type="number"
                  value={propertySize}
                  onChange={(e) => setPropertySize(Number(e.target.value))}
                  min="20"
                  max="500"
                  className="text-center w-24"
                  error={validationErrors.propertySize}
                />
                <button
                  onClick={() => setPropertySize(Math.min(500, propertySize + 10))}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {validationErrors.propertySize && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.propertySize}</p>
              )}
            </div>

            {/* Rooms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Broj spavaćih soba
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{bedrooms}</span>
                  <button
                    onClick={() => setBedrooms(Math.min(10, bedrooms + 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Broj kupaonica
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{bathrooms}</span>
                  <button
                    onClick={() => setBathrooms(Math.min(5, bathrooms + 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Učestalost čišćenja
              </label>
              <div className="grid grid-cols-2 gap-3">
                {FREQUENCY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFrequency(option.value)}
                    className={`
                      p-3 rounded-lg border-2 text-left transition-all duration-200
                      ${frequency === option.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{option.description}</div>
                      </div>
                      {option.discount && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          -{option.discount}%
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dodatne usluge (opcionalno)
              </label>
              <div className="space-y-2">
                {SERVICE_EXTRAS.map(extra => {
                  const isSelected = selectedExtras.some(e => e.name === extra.name);
                  return (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra)}
                      className={`
                        w-full p-3 rounded-lg border-2 text-left transition-all duration-200
                        ${isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{extra.icon}</span>
                          <span className="text-sm font-medium">{extra.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-green-600">
                            +{extra.price} EUR
                          </span>
                          {isSelected && <Check className="w-5 h-5 text-green-600" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2: // Date and Time
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Odaberite datum i vrijeme
            </h2>
            {(validationErrors.date || validationErrors.time) && (
              <div className="p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                {validationErrors.date || validationErrors.time}
              </div>
            )}
            <BookingCalendar
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot}
              onDateTimeSelect={(date, timeSlot) => {
                setSelectedDate(date);
                setSelectedTimeSlot(timeSlot);
              }}
            />
          </div>
        );

      case 3: // Contact Information
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Kontakt podaci
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ime"
                required
                value={customerData.first_name}
                onChange={(e) => setCustomerData({ ...customerData, first_name: e.target.value })}
                error={validationErrors.first_name}
                icon={User}
              />
              <Input
                label="Prezime"
                required
                value={customerData.last_name}
                onChange={(e) => setCustomerData({ ...customerData, last_name: e.target.value })}
                error={validationErrors.last_name}
                icon={User}
              />
            </div>

            <Input
              label="Email adresa"
              type="email"
              required
              value={customerData.email}
              onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
              error={validationErrors.email}
              icon={Mail}
            />

            <Input
              label="Broj telefona"
              type="tel"
              required
              placeholder="099 123 4567"
              value={customerData.phone}
              onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
              error={validationErrors.phone}
              icon={Phone}
            />

            <Input
              label="Adresa"
              required
              placeholder="Ulica i broj"
              value={customerData.address}
              onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
              error={validationErrors.address}
              icon={MapPin}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Grad"
                required
                value={customerData.city}
                onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                icon={Building}
              />
              <Input
                label="Poštanski broj"
                placeholder="10000"
                value={customerData.postal_code}
                onChange={(e) => setCustomerData({ ...customerData, postal_code: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Posebne napomene (opcionalno)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Dodatne informacije, posebni zahtjevi..."
              />
            </div>
          </div>
        );

      case 4: // Review and Confirm
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pregled rezervacije
            </h2>

            {error && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Service Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Usluga</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vrsta čišćenja:</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Učestalost:</span>
                  <span className="font-medium">
                    {FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Nekretnina</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tip:</span>
                  <span className="font-medium">
                    {PROPERTY_TYPES.find(t => t.value === propertyType)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Površina:</span>
                  <span className="font-medium">{propertySize} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sobe:</span>
                  <span className="font-medium">{bedrooms} spavaćih, {bathrooms} kupaonica</span>
                </div>
              </div>
            </div>

            {/* Date & Time Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Termin</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Datum:</span>
                  <span className="font-medium">
                    {selectedDate && formatDateHr(selectedDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vrijeme:</span>
                  <span className="font-medium">{selectedTimeSlot}</span>
                </div>
              </div>
            </div>

            {/* Contact Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Kontakt</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ime:</span>
                  <span className="font-medium">
                    {customerData.first_name} {customerData.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{customerData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefon:</span>
                  <span className="font-medium">{customerData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Adresa:</span>
                  <span className="font-medium">
                    {customerData.address}, {customerData.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Extras Summary */}
            {selectedExtras.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Dodatne usluge</h3>
                <div className="space-y-2 text-sm">
                  {selectedExtras.map(extra => (
                    <div key={extra.name} className="flex justify-between">
                      <span className="text-gray-600">{extra.name}</span>
                      <span className="font-medium">+{extra.price} EUR</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Requests */}
            {specialRequests && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Posebne napomene</h3>
                <p className="text-sm text-gray-700">{specialRequests}</p>
              </div>
            )}

            {/* Terms */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-900 leading-relaxed">
                Klikom na "Potvrdi rezervaciju" slažete se s našim uvjetima korištenja.
                Rezervaciju možete otkazati najkasnije 24 sata prije termina.
                Plaćanje se vrši nakon završene usluge.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Natrag</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Rezervacija čišćenja</h1>
          <p className="text-gray-600 mt-2">Rezervirajte svoj termin u nekoliko jednostavnih koraka</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Steps */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <BookingSteps
                currentStep={currentStep}
                steps={BOOKING_STEPS}
                onStepClick={handleStepClick}
                completedSteps={completedSteps}
              />
            </div>

            {/* Price Calculator - Desktop Only */}
            {selectedService && (
              <div className="hidden lg:block mt-6">
                <PriceCalculator
                  service={selectedService}
                  propertySize={propertySize}
                  extras={selectedExtras}
                  frequency={frequency}
                  distanceKm={distanceKm}
                />
              </div>
            )}
          </div>

          {/* Right Column - Form Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className={currentStep === 0 ? 'invisible' : ''}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Natrag
                </Button>

                {currentStep < BOOKING_STEPS.length - 1 ? (
                  <Button onClick={handleNextStep}>
                    Dalje
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitBooking}
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? 'Šaljemo rezervaciju...' : 'Potvrdi rezervaciju'}
                  </Button>
                )}
              </div>
            </div>

            {/* Price Calculator - Mobile Only */}
            {selectedService && (
              <div className="lg:hidden mt-6">
                <PriceCalculator
                  service={selectedService}
                  propertySize={propertySize}
                  extras={selectedExtras}
                  frequency={frequency}
                  distanceKm={distanceKm}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function BookingPage() {
  return (
    <Suspense fallback={<LoadingState message="Učitavanje rezervacije..." />}>
      <BookingContent />
    </Suspense>
  );
}