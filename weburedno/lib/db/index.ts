// Database helper functions export
export * from './services';
export * from './availability';
export * from './bookings';
export * from './inquiries';
export * from './reviews';

// Re-export common types
export type {
  Service,
  Customer,
  Booking,
  Availability,
  PricingRule,
  Review,
  Inquiry,
  CreateBookingInput,
  CreateInquiryInput,
  AvailabilitySlot,
  TimeSlot,
  PriceCalculation,
  BookingStats
} from '@/types/database';