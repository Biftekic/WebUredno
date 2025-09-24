'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Home, Building, MapPin, Phone, Mail,
  User, MessageSquare, AlertCircle
} from 'lucide-react';
import BookingSteps, { BOOKING_STEPS } from '@/components/booking/BookingSteps';
import BookingCalendar from '@/components/booking/BookingCalendar';
import PriceCalculatorEnhanced from '@/components/booking/PriceCalculatorEnhanced';
import QuantitySelector from '@/components/booking/QuantitySelector';
import AreaInput from '@/components/booking/AreaInput';
import RentalServiceSelector from '@/components/booking/RentalServiceSelector';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingState from '@/components/ui/LoadingState';
import { getServices, getServiceBySlug } from '@/lib/db/services';
import { createBooking } from '@/lib/db/bookings';
import type { Service, CreateBookingInput } from '@/types/database';
import {
  PROPERTY_TYPES,
  FREQUENCY_OPTIONS,
  formatDateHr,
  validatePhoneNumber,
  validateEmail,
  generateWhatsAppMessage,
} from '@/lib/booking-utils';
import {
  ServiceTypeEnum,
  PropertyTypeEnum,
  QUANTIFIABLE_EXTRAS,
  LANDSCAPING_SERVICES,
  RENTAL_SERVICES,
  RentalFeatures
} from '@/lib/booking-types-enhanced';

function BookingContentEnhanced() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  // Service Selection
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceType, setServiceType] = useState<ServiceTypeEnum>('regular');

  // Property Details
  const [propertyType, setPropertyType] = useState<PropertyTypeEnum>('apartment');
  const [propertySize, setPropertySize] = useState<number>(60);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(1);

  // Date & Time
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Frequency & Distance
  const [frequency, setFrequency] = useState<string>('one-time');
  const [distanceKm] = useState(5);

  // Enhanced Extras
  const [indoorExtras, setIndoorExtras] = useState<{ [key: string]: number }>({
    windows: 0,
    oven: 0,
    fridge: 0,
    balcony: 0,
    ironing: 0,
    cabinet_interior: 0,
  });

  // Outdoor Services
  const [outdoorServices, setOutdoorServices] = useState<{ [key: string]: number }>({
    lawn_mowing: 0,
    garden_maintenance: 0,
    leaf_removal: 0,
    hedge_trimming: 0,
  });

  // Rental Features
  const [rentalFeatures, setRentalFeatures] = useState<RentalFeatures>({
    turnaroundTime: '4-6h',
    laundryService: false,
    suppliesRefill: false,
    inventoryCheck: false,
    guestWelcomeSetup: false,
    emergencyAvailable: false,
  });

  // Customer Data
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    const serviceSlug = searchParams.get('service');
    if (serviceSlug && services.length > 0) {
      const service = services.find(s => s.slug === serviceSlug);
      if (service) {
        setSelectedService(service);

        // Map service category to enhanced service type
        if (service.slug === 'jednodnevni-najam') {
          setServiceType('daily_rental');
        } else if (service.slug === 'dubinsko-ciscenje-najma') {
          setServiceType('vacation_rental');
        } else if (service.category === 'deep') {
          setServiceType('deep');
        } else if (service.category === 'standard') {
          setServiceType('standard');
        } else if (service.category === 'post-renovation') {
          setServiceType('post-renovation');
        } else if (service.category === 'move-in-out') {
          setServiceType('move-in-out');
        } else {
          setServiceType('regular');
        }

        setCompletedSteps([0]);
        setCurrentStep(1);
      }
    }
  }, [searchParams, services]);

  const loadServices = async () => {
    try {
      const data = await getServices();

      // Merge with rental services
      const enhancedServices = [
        ...data,
        ...RENTAL_SERVICES.map(rs => ({
          id: rs.id,
          name: rs.name,
          slug: rs.id.replace('_', '-'),
          category: rs.id as any,
          base_price: rs.base_price,
          price_per_sqm: rs.price_per_sqm,
          min_price: rs.min_price,
          duration_hours: 3,
          description: rs.description,
          features: rs.includes,
          popular: rs.id === 'daily_rental',
          active: true,
          display_order: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      ];

      setServices(enhancedServices);
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
      case 0:
        if (!selectedService) {
          errors.service = 'Molimo odaberite uslugu';
        }
        break;
      case 1:
        if (propertySize < 20 || propertySize > 500) {
          errors.propertySize = 'Površina mora biti između 20 i 500 m²';
        }
        break;
      case 2:
        if (!selectedDate) {
          errors.date = 'Molimo odaberite datum';
        }
        if (!selectedTimeSlot) {
          errors.time = 'Molimo odaberite vrijeme';
        }
        break;
      case 3:
        if (!customerData.first_name) errors.first_name = 'Ime je obavezno';
        if (!customerData.last_name) errors.last_name = 'Prezime je obavezno';
        if (!customerData.email || !validateEmail(customerData.email)) {
          errors.email = 'Unesite važeću email adresu';
        }
        if (!customerData.phone || !validatePhoneNumber(customerData.phone)) {
          errors.phone = 'Unesite važeći broj telefona';
        }
        if (!customerData.address) errors.address = 'Adresa je obavezna';
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

  const updateIndoorExtra = (id: string, quantity: number) => {
    setIndoorExtras(prev => ({ ...prev, [id]: quantity }));
  };

  const updateOutdoorService = (id: string, area: number) => {
    setOutdoorServices(prev => ({ ...prev, [id]: area }));
  };

  const getIndoorExtrasForCalculation = () => {
    return QUANTIFIABLE_EXTRAS
      .filter(extra => indoorExtras[extra.id] > 0)
      .map(extra => ({
        id: extra.id,
        name: extra.name,
        quantity: indoorExtras[extra.id],
        unitPrice: extra.price_per_unit
      }));
  };

  const getOutdoorServicesForCalculation = () => {
    return LANDSCAPING_SERVICES
      .filter(service => outdoorServices[service.id] > 0)
      .map(service => ({
        id: service.id,
        name: service.name,
        area: outdoorServices[service.id],
        pricePerUnit: service.price_per_unit,
        minPrice: service.min_price
      }));
  };

  const handleSubmitBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) {
      setError('Molimo popunite sve obavezne podatke');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare extras for database
      const bookingExtras = [
        ...getIndoorExtrasForCalculation().map(e => ({
          name: e.name,
          price: e.unitPrice * e.quantity,
          quantity: e.quantity
        })),
        ...getOutdoorServicesForCalculation().map(s => ({
          name: s.name,
          price: Math.max(s.area * s.pricePerUnit, s.minPrice),
          quantity: 1
        }))
      ];

      const bookingInput: CreateBookingInput = {
        customer: customerData,
        service_id: selectedService.id,
        booking_date: selectedDate.toISOString().split('T')[0],
        time_slot: selectedTimeSlot,
        service_type: serviceType,
        frequency: frequency as any,
        property_type: propertyType,
        property_size: propertySize,
        bedrooms,
        bathrooms,
        extras: bookingExtras,
        special_requests: specialRequests,
      };

      const booking = await createBooking(bookingInput);

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

      router.push(`/booking/confirmation?id=${booking.id}&whatsapp=${encodeURIComponent(message)}`);
    } catch (error: any) {
      console.error('Booking error:', error);
      setError(error.message || 'Greška pri slanju rezervacije.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Enhanced Service Selection
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Odaberite vrstu čišćenja
            </h2>

            {/* Service Type Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setServiceType('regular')}
                  className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                    serviceType === 'regular'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Redovno
                </button>
                <button
                  onClick={() => setServiceType('deep')}
                  className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                    serviceType === 'deep'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Dubinsko
                </button>
                <button
                  onClick={() => setServiceType('daily_rental')}
                  className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                    serviceType === 'daily_rental'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🔑 Jednodnevni najam
                  <span className="px-2 py-0.5 bg-yellow-400 text-black text-xs rounded-full">
                    NOVO
                  </span>
                </button>
                <button
                  onClick={() => setServiceType('vacation_rental')}
                  className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                    serviceType === 'vacation_rental'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ✨ Dubinsko najma
                </button>
              </div>
            </div>

            {validationErrors.service && (
              <div className="p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                {validationErrors.service}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {services
                .filter(service => {
                  if (serviceType === 'daily_rental') return service.slug === 'jednodnevni-najam';
                  if (serviceType === 'vacation_rental') return service.slug === 'vacation-rental-deep';
                  if (serviceType === 'deep') return service.category === 'deep';
                  return service.category === 'regular';
                })
                .map(service => (
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

      case 1: // Enhanced Property Details
        const isRentalService = ['airbnb', 'daily_rental', 'vacation_rental'].includes(serviceType);

        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Detalji o nekretnini i dodatne usluge
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
                    onClick={() => setPropertyType(type.value as PropertyTypeEnum)}
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
                  <ArrowLeft className="w-5 h-5" />
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
                  <ArrowRight className="w-5 h-5" />
                </button>
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
                      {option.discount && option.discount > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          -{option.discount}%
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rental-Specific Options */}
            {isRentalService && (
              <RentalServiceSelector
                features={rentalFeatures}
                onChange={setRentalFeatures}
                serviceType={serviceType as 'airbnb' | 'daily_rental' | 'vacation_rental'}
              />
            )}

            {/* Indoor Extras with Quantities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dodatne usluge u zatvorenom (opcionalno)
              </label>
              <div className="space-y-3">
                {QUANTIFIABLE_EXTRAS.map(extra => (
                  <QuantitySelector
                    key={extra.id}
                    label={extra.name}
                    unit={extra.unit}
                    unitPrice={extra.price_per_unit}
                    min={extra.min_quantity || 0}
                    max={extra.max_quantity}
                    value={indoorExtras[extra.id]}
                    onChange={(value) => updateIndoorExtra(extra.id, value)}
                    icon={extra.icon}
                    helperText={`${extra.price_per_unit} EUR po ${extra.unit}`}
                  />
                ))}
              </div>
            </div>

            {/* Outdoor Services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Vanjski radovi (opcionalno)
              </label>
              <div className="space-y-3">
                {LANDSCAPING_SERVICES.map(service => (
                  <AreaInput
                    key={service.id}
                    label={service.name}
                    unit={service.unit}
                    pricePerUnit={service.price_per_unit}
                    minPrice={service.min_price}
                    value={outdoorServices[service.id]}
                    onChange={(value) => updateOutdoorService(service.id, value)}
                    icon={service.icon}
                    helperText={service.description}
                    max={1000}
                    step={service.unit === 'm' ? 5 : 10}
                  />
                ))}
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

            {/* Extras Summary */}
            {(getIndoorExtrasForCalculation().length > 0 || getOutdoorServicesForCalculation().length > 0) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Dodatne usluge</h3>
                <div className="space-y-2 text-sm">
                  {getIndoorExtrasForCalculation().map(extra => (
                    <div key={extra.id} className="flex justify-between">
                      <span className="text-gray-600">{extra.name} ({extra.quantity}x)</span>
                      <span className="font-medium">+{extra.quantity * extra.unitPrice} EUR</span>
                    </div>
                  ))}
                  {getOutdoorServicesForCalculation().map(service => (
                    <div key={service.id} className="flex justify-between">
                      <span className="text-gray-600">{service.name} ({service.area}m²)</span>
                      <span className="font-medium">
                        +{Math.max(service.area * service.pricePerUnit, service.minPrice)} EUR
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
          <h1 className="text-3xl font-bold text-gray-900">Napredna rezervacija čišćenja</h1>
          <p className="text-gray-600 mt-2">Prilagodite uslugu vašim potrebama</p>
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
                <PriceCalculatorEnhanced
                  service={selectedService}
                  serviceType={serviceType}
                  propertyType={propertyType}
                  propertySize={propertySize}
                  indoorExtras={getIndoorExtrasForCalculation()}
                  outdoorServices={getOutdoorServicesForCalculation()}
                  frequency={frequency}
                  distanceKm={distanceKm}
                  rentalFeatures={['airbnb', 'daily_rental', 'vacation_rental'].includes(serviceType) ? rentalFeatures : undefined}
                  bookingDate={selectedDate || undefined}
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
                <PriceCalculatorEnhanced
                  service={selectedService}
                  serviceType={serviceType}
                  propertyType={propertyType}
                  propertySize={propertySize}
                  indoorExtras={getIndoorExtrasForCalculation()}
                  outdoorServices={getOutdoorServicesForCalculation()}
                  frequency={frequency}
                  distanceKm={distanceKm}
                  rentalFeatures={['airbnb', 'daily_rental', 'vacation_rental'].includes(serviceType) ? rentalFeatures : undefined}
                  bookingDate={selectedDate || undefined}
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
export default function EnhancedBookingPage() {
  return (
    <Suspense fallback={<LoadingState message="Učitavanje napredne rezervacije..." />}>
      <BookingContentEnhanced />
    </Suspense>
  );
}