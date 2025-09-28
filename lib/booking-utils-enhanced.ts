import { format, addDays, startOfDay, isSunday, parseISO, isWithinInterval, isWeekend, isDate } from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  ServiceTypeEnum,
  PropertyTypeEnum,
  EnhancedPriceCalculation,
  PROPERTY_TYPE_MULTIPLIERS,
  RentalFeatures,
  TURNAROUND_TIME_OPTIONS,
  WindowsBookingInput,
  WindowsPriceCalculation,
  WINDOWS_SERVICE_CONFIG,
  OfficeBookingInput,
  OfficePriceCalculation,
  OFFICE_SERVICE_CONFIG,
} from './booking-types-enhanced';

// Time slot configuration
export const TIME_SLOTS = [
  { value: '07:00-09:00', label: '07:00 - 09:00', startHour: 7 },
  { value: '09:00-11:00', label: '09:00 - 11:00', startHour: 9 },
  { value: '11:00-13:00', label: '11:00 - 13:00', startHour: 11 },
  { value: '13:00-15:00', label: '13:00 - 15:00', startHour: 13 },
  { value: '15:00-17:00', label: '15:00 - 17:00', startHour: 15 },
  { value: '17:00-19:00', label: '17:00 - 19:00', startHour: 17 },
];

// Property type options
export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Stan', icon: '🏢' },
  { value: 'house', label: 'Kuća', icon: '🏠' },
  { value: 'office', label: 'Ured', icon: '🏢' },
];

// Enhanced frequency options with proper discounts applied to total
export const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'Jednokratno', description: 'Jednokratno čišćenje', discount: 0 },
  { value: 'weekly', label: 'Tjedno', description: 'Svakih 7 dana', discount: 10 },
  { value: 'biweekly', label: 'Dvotjedno', description: 'Svakih 14 dana', discount: 5 },
  { value: 'monthly', label: 'Mjesečno', description: 'Jednom mjesečno', discount: 3 },
];

// Calculate distance fee
export function calculateDistanceFee(distanceKm: number): number {
  if (distanceKm <= 10) return 0;
  if (distanceKm <= 20) return 25;
  if (distanceKm <= 30) return 50;
  return 75;
}

// Check if date is weekend
export function isWeekendDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isWeekend(dateObj);
}

// Check if date is holiday (Croatian holidays)
export function isHoliday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const year = dateObj.getFullYear();

  // Croatian public holidays
  const holidays = [
    `${year}-01-01`, // Nova godina
    `${year}-01-06`, // Sveta tri kralja
    `${year}-05-01`, // Praznik rada
    `${year}-05-30`, // Dan državnosti
    `${year}-06-22`, // Dan antifašističke borbe
    `${year}-08-05`, // Dan pobjede
    `${year}-08-15`, // Velika Gospa
    `${year}-11-01`, // Dan svih svetih
    `${year}-11-18`, // Dan sjećanja
    `${year}-12-25`, // Božić
    `${year}-12-26`, // Sveti Stjepan
  ];

  const dateStr = format(dateObj, 'yyyy-MM-dd');
  return holidays.includes(dateStr);
}

// Enhanced price calculation with all improvements
export function calculateEnhancedPrice(
  serviceType: ServiceTypeEnum,
  basePrice: number, // Will be ignored in calculation, kept for compatibility
  pricePerSqm: number,
  propertyType: PropertyTypeEnum,
  propertySize: number,
  indoorExtras: Array<{ id: string; quantity: number; unitPrice: number }>,
  outdoorServices: Array<{ id: string; area: number; pricePerUnit: number; minPrice: number }>,
  frequency: string,
  distanceKm: number,
  rentalFeatures?: RentalFeatures,
  bookingDate?: Date | string,
  lastCleanedMultiplier?: number,
  windowsInput?: WindowsBookingInput,
  officeInput?: OfficeBookingInput
): EnhancedPriceCalculation {
  // Special handling for Windows service
  if (serviceType === 'windows' && windowsInput) {
    return calculateWindowsPrice(windowsInput);
  }

  // Special handling for Office service
  if (serviceType === 'office' && officeInput) {
    return calculateOfficePrice(officeInput);
  }
  // Property type multiplier
  const propertyTypeMultiplier = PROPERTY_TYPE_MULTIPLIERS[propertyType];

  // Adjust price per sqm for daily rental based on monthly frequency
  let adjustedPricePerSqm = pricePerSqm;
  if (serviceType === 'daily_rental') {
    // Daily rental pricing based on monthly frequency:
    // 15+ times per month = 0.5 €/m²
    // 5-14 times per month = 0.8 €/m²
    // Less than 5 times per month = 1.0 €/m²
    switch (frequency) {
      case 'very-frequent': // 15+ times per month
        adjustedPricePerSqm = 0.5;
        break;
      case 'frequent': // 5-14 times per month
        adjustedPricePerSqm = 0.8;
        break;
      case 'occasional': // Less than 5 times per month
      default:
        adjustedPricePerSqm = 1.0;
        break;
    }
  }

  // Calculate base price: propertySize × pricePerSqm × propertyTypeMultiplier
  // No base price added anymore
  const effectiveArea = propertySize * propertyTypeMultiplier;
  let adjustedBase = effectiveArea * adjustedPricePerSqm;

  // Apply minimum price: 30€ for regular cleaning, 40€ for everything else
  const minPrice = serviceType === 'regular' ? 30 : 40;
  adjustedBase = Math.max(adjustedBase, minPrice);

  // Apply last cleaned multiplier (for standard and deep cleaning only)
  if (lastCleanedMultiplier && (serviceType === 'standard' || serviceType === 'deep')) {
    adjustedBase = adjustedBase * lastCleanedMultiplier;
  }

  // Calculate indoor extras
  const indoorExtrasObj: EnhancedPriceCalculation['indoorExtras'] = {};
  let indoorExtrasTotal = 0;

  indoorExtras.forEach(extra => {
    if (extra.quantity > 0) {
      const total = extra.quantity * extra.unitPrice;
      indoorExtrasObj[extra.id] = {
        quantity: extra.quantity,
        unitPrice: extra.unitPrice,
        total
      };
      indoorExtrasTotal += total;
    }
  });

  // Calculate outdoor services
  const outdoorServicesObj: EnhancedPriceCalculation['outdoorServices'] = {};
  let outdoorServicesTotal = 0;

  outdoorServices.forEach(service => {
    if (service.area > 0) {
      const calculatedPrice = service.area * service.pricePerUnit;
      const total = Math.max(calculatedPrice, service.minPrice);
      outdoorServicesObj[service.id] = {
        area: service.area,
        pricePerUnit: service.pricePerUnit,
        total
      };
      outdoorServicesTotal += total;
    }
  });

  // Calculate rental-specific adjustments
  let rentalAdjustment = 0;
  if (rentalFeatures) {
    // Turnaround time adjustment
    const turnaroundOption = TURNAROUND_TIME_OPTIONS.find(
      opt => opt.value === rentalFeatures.turnaroundTime
    );
    if (turnaroundOption) {
      rentalAdjustment += turnaroundOption.price_adjustment;
    }

    // Rental extras
    if (rentalFeatures.laundryService) rentalAdjustment += 20;
    if (rentalFeatures.suppliesRefill) rentalAdjustment += 15;
    if (rentalFeatures.inventoryCheck) rentalAdjustment += 10;
    if (rentalFeatures.guestWelcomeSetup) rentalAdjustment += 10;
    if (rentalFeatures.emergencyAvailable) rentalAdjustment += 50;
  }

  // Calculate distance fee
  const distanceFee = calculateDistanceFee(distanceKm);

  // Calculate subtotal before discounts and surcharges
  const subtotal = adjustedBase + indoorExtrasTotal + outdoorServicesTotal + rentalAdjustment + distanceFee;

  // Weekend and holiday surcharges for rental services
  let weekendSurcharge = 0;
  let holidaySurcharge = 0;

  if (serviceType === 'daily_rental' && bookingDate) {
    if (isWeekendDate(bookingDate)) {
      weekendSurcharge = subtotal * 0.20; // 20% weekend surcharge
    }
    if (isHoliday(bookingDate)) {
      holidaySurcharge = subtotal * 0.30; // 30% holiday surcharge
    }
  }

  // Apply frequency discount on the TOTAL (including extras)
  let frequencyDiscount = 0;
  const frequencyOption = FREQUENCY_OPTIONS.find(f => f.value === frequency);
  if (frequencyOption && frequencyOption.discount > 0) {
    frequencyDiscount = (subtotal * frequencyOption.discount) / 100;
  }

  // Calculate gross total (price with VAT included)
  const grossTotal = subtotal + weekendSurcharge + holidaySurcharge - frequencyDiscount;

  // Calculate VAT from gross (VAT = gross × 0.20, which equals gross/1.25*0.25)
  const vatAmount = grossTotal * 0.20;

  // Calculate net (gross - VAT)
  const netTotal = grossTotal - vatAmount;

  // Total is the gross amount
  const total = grossTotal;

  return {
    serviceType,
    basePrice: adjustedBase,
    sizeMultiplier: propertySize,
    propertyTypeMultiplier,
    effectiveArea, // Add effective area for display
    lastCleanedMultiplier,
    rentalFeatures,
    indoorExtras: indoorExtrasObj,
    outdoorServices: outdoorServicesObj,
    distanceFee,
    frequencyDiscount,
    weekendSurcharge,
    holidaySurcharge,
    subtotal: grossTotal,  // This is now the gross amount (with VAT)
    netAmount: Math.round(netTotal), // Net amount (without VAT)
    vatAmount: Math.round(vatAmount),
    discount: frequencyDiscount,
    total: Math.round(total)
  };
}

// Generate available dates for next 30 days (excluding Sundays)
export function generateAvailableDates(daysAhead = 30): Date[] {
  const dates: Date[] = [];
  const today = startOfDay(new Date());

  for (let i = 1; i <= daysAhead; i++) {
    const date = addDays(today, i);
    if (!isSunday(date)) {
      dates.push(date);
    }
  }

  return dates;
}

// Format date for display in Croatian
export function formatDateHr(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'EEEE, d. MMMM yyyy.', { locale: hr });
}

// Format short date for calendar
export function formatShortDateHr(date: Date): string {
  return format(date, 'd. MMM', { locale: hr });
}

// Generate booking number
export function generateBookingNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WU${year}${month}${random}`;
}

// Check if time slot is in the past
export function isTimeSlotPast(date: Date, slotValue: string): boolean {
  const now = new Date();
  const [startTime] = slotValue.split('-');
  const [hours] = startTime.split(':').map(Number);

  const slotDateTime = new Date(date);
  slotDateTime.setHours(hours, 0, 0, 0);

  return slotDateTime < now;
}

// Format phone number for WhatsApp
export function formatPhoneForWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('385')) {
    return `385${cleaned.startsWith('0') ? cleaned.slice(1) : cleaned}`;
  }
  return cleaned;
}

// ==================== WINDOWS SERVICE CALCULATION ====================

export function calculateWindowsPrice(input: WindowsBookingInput): WindowsPriceCalculation {
  const config = WINDOWS_SERVICE_CONFIG;

  // Service type multiplier
  const serviceMultiplier = config.serviceTypeMultipliers[input.serviceType];

  // Floor surcharge
  const floorSurcharge = config.floorSurcharges[input.floorLevel];

  // Price per window
  const pricePerWindow = config.basePerWindow * serviceMultiplier + floorSurcharge;

  // Calculate windows cost
  const windowsBase = input.windowCount * pricePerWindow;

  // Balcony doors (count as 2 windows)
  const balconyDoorsTotal = input.balconyDoors * config.balconyDoorMultiplier * pricePerWindow;

  // Skylights (harder access, +50%)
  const skylightsTotal = input.skylights * (config.basePerWindow * config.skylightMultiplier * serviceMultiplier + floorSurcharge * config.skylightMultiplier);

  // Optional extras
  const framesTotal = input.framesCleaning ? input.windowCount * config.framesCostPerWindow : 0;
  const sillsTotal = input.sillsCleaning ? input.windowCount * config.sillsCostPerWindow : 0;

  // Subtotal before minimum
  const subtotalBeforeMin = windowsBase + balconyDoorsTotal + skylightsTotal + framesTotal + sillsTotal;

  // Apply minimum price
  const basePrice = Math.max(subtotalBeforeMin, config.minPrice);

  // Distance fee
  const distanceFee = calculateDistanceFee(input.distanceKm);

  // Frequency discount
  const frequencyOption = FREQUENCY_OPTIONS.find(f => f.value === input.frequency);
  const frequencyDiscountRate = frequencyOption ? frequencyOption.discount / 100 : 0;
  const frequencyDiscount = Math.round(basePrice * frequencyDiscountRate);

  // Subtotal (gross with VAT)
  const subtotal = basePrice + distanceFee - frequencyDiscount;

  // VAT calculation (VAT already included in gross)
  const vatAmount = Math.round(subtotal * 0.20 / 1.20);
  const netAmount = subtotal - vatAmount;

  // Final total
  const total = subtotal;

  return {
    serviceType: 'windows',
    basePrice,
    sizeMultiplier: 1,
    propertyTypeMultiplier: 1,
    effectiveArea: input.windowCount,
    indoorExtras: {},
    outdoorServices: {},
    distanceFee,
    frequencyDiscount,
    subtotal,
    netAmount,
    vatAmount,
    discount: frequencyDiscount,
    total,
    // Windows-specific
    windowsBase,
    balconyDoorsTotal,
    skylightsTotal,
    framesTotal,
    sillsTotal,
    pricePerWindow,
  };
}

// ==================== OFFICE SERVICE CALCULATION ====================

export function calculateOfficePrice(input: OfficeBookingInput): OfficePriceCalculation {
  const config = OFFICE_SERVICE_CONFIG;

  // Office type multiplier
  const officeTypeMultiplier = config.officeTypeMultipliers[input.officeType];

  // Time slot surcharge
  const timeMultiplier = config.timeSlotMultipliers[input.cleaningTime];

  // Multi-floor multiplier
  const floorMultiplier = input.floorCount > 1
    ? 1 + ((input.floorCount - 1) * config.floorMultiplierPerFloor)
    : 1.0;

  // No elevator penalty
  const elevatorPenalty = !input.elevatorAccess && input.floorCount > 1
    ? config.noElevatorPenalty
    : 1.0;

  // Calculate base price
  const officeBasePrice = Math.round(
    input.propertySize *
    config.basePricePerSqm *
    officeTypeMultiplier *
    timeMultiplier *
    floorMultiplier *
    elevatorPenalty
  );

  // Private offices extra care
  const privateOfficesExtra = input.privateOffices * config.privateOfficeExtra;

  // Common areas extra
  const commonAreasExtra = input.commonAreas ? config.commonAreasExtra : 0;

  // Bathroom cleaning (per bathroom)
  const bathroomsExtra = input.bathrooms * config.bathroomExtra;

  // Kitchenette cleaning
  const kitchenetteExtra = input.kitchenette ? config.kitchenetteExtra : 0;

  // Supply provision
  const suppliesExtra = input.supplies === 'we_provide' ? config.suppliesExtra : 0;

  // Trash & recycling
  const trashExtra = input.trashRemoval ? config.trashExtra : 0;
  const recyclingExtra = input.recyclingManagement ? config.recyclingExtra : 0;

  // Subtotal before minimum
  const subtotalBeforeMin = officeBasePrice +
    privateOfficesExtra +
    commonAreasExtra +
    bathroomsExtra +
    kitchenetteExtra +
    suppliesExtra +
    trashExtra +
    recyclingExtra;

  // Apply minimum price
  const basePrice = Math.max(subtotalBeforeMin, config.minPrice);

  // Distance fee
  const distanceFee = calculateDistanceFee(input.distanceKm);

  // Commercial frequency discounts (more generous for recurring)
  const frequencyDiscountRate = config.commercialFrequencyDiscounts[input.frequency as keyof typeof config.commercialFrequencyDiscounts] || 0;
  const frequencyDiscount = Math.round(basePrice * frequencyDiscountRate);

  // Subtotal (gross with VAT)
  const subtotal = basePrice + distanceFee - frequencyDiscount;

  // VAT calculation (VAT already included in gross)
  const vatAmount = Math.round(subtotal * 0.20 / 1.20);
  const netAmount = subtotal - vatAmount;

  // Final total
  const total = subtotal;

  return {
    serviceType: 'office',
    basePrice,
    sizeMultiplier: 1,
    propertyTypeMultiplier: 1,
    effectiveArea: input.propertySize,
    indoorExtras: {},
    outdoorServices: {},
    distanceFee,
    frequencyDiscount,
    subtotal,
    netAmount,
    vatAmount,
    discount: frequencyDiscount,
    total,
    // Office-specific
    officeBasePrice,
    privateOfficesExtra,
    commonAreasExtra,
    bathroomsExtra,
    kitchenetteExtra,
    suppliesExtra,
    trashExtra,
    recyclingExtra,
    timeMultiplier,
    officeTypeMultiplier,
  };
}

// Generate WhatsApp message
export function generateWhatsAppMessage(booking: {
  bookingNumber: string;
  service: string;
  date: string;
  timeSlot: string;
  propertyType?: string;
  propertySize?: number;
  address?: string;
  totalPrice: number;
  specialRequests?: string;
}): string {
  const lines = [
    `🧹 *Nova Rezervacija - ${booking.bookingNumber}*`,
    '',
    `📅 Datum: ${formatDateHr(booking.date)}`,
    `⏰ Vrijeme: ${booking.timeSlot}`,
    `🏠 Usluga: ${booking.service}`,
  ];

  if (booking.propertyType) {
    lines.push(`🏡 Tip nekretnine: ${booking.propertyType}`);
  }

  if (booking.propertySize) {
    lines.push(`📏 Površina: ${booking.propertySize} m²`);
  }

  if (booking.address) {
    lines.push(`📍 Adresa: ${booking.address}`);
  }

  lines.push(
    '',
    `💰 Ukupna cijena: ${booking.totalPrice} EUR`,
  );

  if (booking.specialRequests) {
    lines.push(
      '',
      `📝 Posebne napomene:`,
      booking.specialRequests,
    );
  }

  lines.push(
    '',
    'Molimo potvrdite rezervaciju ili nas kontaktirajte za izmjene.',
    '',
    'Hvala što ste odabrali Uredno.eu! 💙'
  );

  return lines.join('\n');
}

// Validate Croatian phone number
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  const mobilePattern = /^(0?9[1-9]\d{6,7}|385?9[1-9]\d{6,7})$/;
  const landlinePattern = /^(0?[1-9]\d{6,7}|385?[1-9]\d{6,7})$/;

  return mobilePattern.test(cleaned) || landlinePattern.test(cleaned);
}

// Validate email
export function validateEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

// Get property size category
export function getPropertySizeCategory(size: number): string {
  if (size <= 40) return 'Studio/Garsonijera';
  if (size <= 60) return 'Jednosoban stan';
  if (size <= 80) return 'Dvosoban stan';
  if (size <= 100) return 'Trosoban stan';
  if (size <= 150) return 'Četverosoban stan';
  return 'Velika nekretnina';
}

// Get estimated cleaning duration
export function getEstimatedDuration(propertySize: number, serviceType: string): string {
  let baseHours = 2;

  if (serviceType === 'deep') {
    baseHours = 4;
  } else if (serviceType === 'construction') {
    baseHours = 6;
  } else if (serviceType === 'daily_rental') {
    baseHours = 3;
  }

  // Add time based on size
  if (propertySize > 60) baseHours += 1;
  if (propertySize > 100) baseHours += 1;
  if (propertySize > 150) baseHours += 1;

  if (baseHours === 1) return '1 sat';
  if (baseHours < 5) return `${baseHours} sata`;
  return `${baseHours} sati`;
}