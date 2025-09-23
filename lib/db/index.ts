// Database helper functions export
export * from './services';
export * from './inquiries';
export * from './reviews';

// Export bookings functions (includes availability functions)
export * from './bookings';

// Export unique availability functions
export {
  getAvailabilityRange,
  getAvailableDates,
  reserveTimeSlot,
  releaseTimeSlot,
  getTimeSlotOptions,
  isDateFullyBooked
} from './availability';

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