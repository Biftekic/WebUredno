import { format, addDays, startOfDay, isSunday, parseISO, isWithinInterval } from 'date-fns';
import { hr } from 'date-fns/locale';

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

// Frequency options
export const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'Jednokratno', description: 'Jednokratno čišćenje' },
  { value: 'weekly', label: 'Tjedno', description: 'Svakih 7 dana', discount: 10 },
  { value: 'biweekly', label: 'Dvotjedno', description: 'Svakih 14 dana', discount: 5 },
  { value: 'monthly', label: 'Mjesečno', description: 'Jednom mjesečno' },
];

// Service extras
export const SERVICE_EXTRAS = [
  { id: 'windows', name: 'Pranje prozora', price: 120, icon: '🪟' },
  { id: 'balcony', name: 'Čišćenje balkona/terase', price: 80, icon: '🏡' },
  { id: 'oven', name: 'Čišćenje pećnice', price: 100, icon: '🔥' },
  { id: 'fridge', name: 'Čišćenje hladnjaka', price: 80, icon: '❄️' },
  { id: 'ironing', name: 'Glačanje (1 sat)', price: 100, icon: '👔' },
  { id: 'organizing', name: 'Organiziranje prostora', price: 150, icon: '📦' },
];

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

// Calculate distance fee
export function calculateDistanceFee(distanceKm: number): number {
  if (distanceKm <= 10) return 0;
  if (distanceKm <= 20) return 50;
  if (distanceKm <= 30) return 100;
  return 150;
}

// Calculate price based on property size and extras
export function calculatePrice(
  basePrice: number,
  pricePerSqm: number | null,
  propertySize: number | null,
  extras: Array<{ price: number; quantity?: number }> = [],
  distanceKm: number = 0,
  frequency?: string
): { base: number; extras: number; distance: number; discount: number; total: number } {
  // Calculate base price
  let base = basePrice;
  if (pricePerSqm && propertySize) {
    base += pricePerSqm * propertySize;
  }

  // Calculate extras
  const extrasTotal = extras.reduce((sum, extra) =>
    sum + (extra.price * (extra.quantity || 1)), 0
  );

  // Calculate distance fee
  const distanceFee = calculateDistanceFee(distanceKm);

  // Apply frequency discount
  let discount = 0;
  if (frequency) {
    const frequencyOption = FREQUENCY_OPTIONS.find(f => f.value === frequency);
    if (frequencyOption?.discount) {
      discount = (base * frequencyOption.discount) / 100;
    }
  }

  const total = base + extrasTotal + distanceFee - discount;

  return {
    base,
    extras: extrasTotal,
    distance: distanceFee,
    discount,
    total,
  };
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
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Add Croatian country code if not present
  if (!cleaned.startsWith('385')) {
    return `385${cleaned.startsWith('0') ? cleaned.slice(1) : cleaned}`;
  }

  return cleaned;
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
    'Hvala što ste odabrali WebUredno! 💙'
  );

  return lines.join('\n');
}

// Validate Croatian phone number
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Croatian mobile numbers: 09X XXX XXXX
  // Croatian landline: various area codes
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
  }

  // Add time based on size
  if (propertySize > 60) baseHours += 1;
  if (propertySize > 100) baseHours += 1;
  if (propertySize > 150) baseHours += 1;

  if (baseHours === 1) return '1 sat';
  if (baseHours < 5) return `${baseHours} sata`;
  return `${baseHours} sati`;
}