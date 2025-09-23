export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Uredno.eu';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Contact Information
export const PHONE_NUMBER = '+385924502265';
export const PHONE_NUMBER_FORMATTED = '+385 92 450 2265';
export const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '385924502265';
export const VIBER_PHONE = '385924502265';
export const EMAIL = 'kontakt@uredno.eu';

export const SERVICES = {
  REGULAR_CLEANING: 'regular_cleaning',
  DEEP_CLEANING: 'deep_cleaning',
  MOVE_IN_OUT: 'move_in_out',
  POST_CONSTRUCTION: 'post_construction',
  OFFICE_CLEANING: 'office_cleaning',
  WINDOW_CLEANING: 'window_cleaning',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PRICING = {
  BASE_HOURLY_RATE: 15, // EUR per hour
  MINIMUM_HOURS: 2,
  DEEP_CLEANING_MULTIPLIER: 1.5,
  WEEKEND_SURCHARGE: 1.2,
} as const;